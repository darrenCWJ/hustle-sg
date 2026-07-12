// Availability fit: does a gig's schedule sit inside the freelancer's weekly
// availability grid? The grid (user_availability.slots, edited on the worker
// dashboard calendar) is 7 columns (0=Mon … 6=Sun) × 24 rows of 30-minute
// slots covering 08:00–20:00 SGT; a cell value of 1 means available.

export interface GigTiming {
  days_of_week?: number[] | null; // 0=Mon … 6=Sun (same convention as the grid)
  start_time?: string | null; // "HH:MM" or "HH:MM:SS" (Postgres time)
  end_time?: string | null;
  starts_at?: string | null; // ISO timestamp
  is_instant?: boolean | null;
  instant_urgency?: string | null; // now | today | weekend
  hours_required?: number | null; // whole hours
  duration_label?: string | null; // free text, e.g. "45 min", "1.5 hours"
}

const GRID_START_MIN = 8 * 60; // 08:00
const GRID_END_MIN = 20 * 60; // 20:00
const SLOT_MIN = 30;
export const GRID_ROWS = (GRID_END_MIN - GRID_START_MIN) / SLOT_MIN; // 24
export const GRID_COLS = 7;

function parseTimeToMinutes(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!m) return null;
  const minutes = Number(m[1]) * 60 + Number(m[2]);
  return Number.isFinite(minutes) ? minutes : null;
}

/**
 * The half-hour row indices a gig's working window occupies, or null when the
 * window is unknown/unusable (missing, inverted, or entirely outside the
 * 8am–8pm grid) — callers fall back to day-level matching for null.
 */
export function gigRowRange(timing: GigTiming): number[] | null {
  if (!timing.start_time || !timing.end_time) return null;
  const start = parseTimeToMinutes(timing.start_time);
  const end = parseTimeToMinutes(timing.end_time);
  if (start === null || end === null || end <= start) return null;

  const clampedStart = Math.max(start, GRID_START_MIN);
  const clampedEnd = Math.min(end, GRID_END_MIN);
  if (clampedEnd <= clampedStart) return null; // entirely outside the grid

  const firstRow = Math.floor((clampedStart - GRID_START_MIN) / SLOT_MIN);
  const lastRow = Math.ceil((clampedEnd - GRID_START_MIN) / SLOT_MIN) - 1;
  const rows: number[] = [];
  for (let r = firstRow; r <= lastRow && r < GRID_ROWS; r++) rows.push(r);
  return rows.length > 0 ? rows : null;
}

/**
 * How long the gig needs, in minutes, when it has no fixed clock window —
 * e.g. "45 min sometime Tuesday". Reads hours_required first, then parses the
 * free-text duration_label ("45 min", "1.5 hours", "2h", "1h 30m"). Null when
 * the duration is unknown.
 */
export function gigDurationMinutes(timing: GigTiming): number | null {
  if (timing.hours_required && timing.hours_required > 0) {
    return timing.hours_required * 60;
  }
  const label = timing.duration_label?.toLowerCase() ?? "";
  if (!label) return null;

  let minutes = 0;
  const hours = /(\d+(?:\.\d+)?)\s*(?:h\b|hr|hour)/.exec(label);
  if (hours) minutes += Math.round(Number(hours[1]) * 60);
  const mins = /(\d+)\s*(?:m\b|min)/.exec(label);
  if (mins) minutes += Number(mins[1]);

  return minutes > 0 ? minutes : null;
}

function hasContiguousRun(day: number[], length: number): boolean {
  let run = 0;
  for (const v of day) {
    run = v === 1 ? run + 1 : 0;
    if (run >= length) return true;
  }
  return false;
}

function todayCol(now: Date): number {
  return (now.getDay() + 6) % 7; // JS Sunday=0 → grid Monday=0
}

/**
 * The grid columns (days) a gig can happen on, or null when the gig is
 * day-agnostic (no recurrence, no start date, not instant).
 */
export function gigDayCols(timing: GigTiming, now: Date = new Date()): number[] | null {
  if (timing.is_instant) {
    if (timing.instant_urgency === "now" || timing.instant_urgency === "today") {
      return [todayCol(now)];
    }
    if (timing.instant_urgency === "weekend") return [5, 6];
  }
  if (timing.days_of_week && timing.days_of_week.length > 0) {
    return timing.days_of_week.filter((d) => d >= 0 && d < GRID_COLS);
  }
  if (timing.starts_at) {
    const start = new Date(timing.starts_at);
    if (!isNaN(start.getTime())) return [todayCol(start)];
  }
  return null;
}

/**
 * True when the gig fits the freelancer's availability, on at least one of
 * the gig's candidate days:
 * - fixed window (start/end times) → EVERY half-hour slot of the window is free;
 * - flexible timing with a known duration ("45 min", 2 hours) → a contiguous
 *   free stretch at least that long exists (sub-30-min durations round up to
 *   one 30-min slot — the grid's resolution; conservative, never overpromises);
 * - unknown duration → any availability on a candidate day;
 * - unknown day too → any availability at all.
 */
export function gigFitsAvailability(
  slots: number[][],
  timing: GigTiming,
  now: Date = new Date(),
): boolean {
  const cols = gigDayCols(timing, now) ?? Array.from({ length: GRID_COLS }, (_, i) => i);
  const rows = gigRowRange(timing);
  const durationMin = rows === null ? gigDurationMinutes(timing) : null;
  const runLength = durationMin !== null ? Math.max(1, Math.ceil(durationMin / SLOT_MIN)) : null;

  return cols.some((col) => {
    const day = slots[col];
    if (!day) return false;
    if (rows !== null) return rows.every((r) => day[r] === 1);
    if (runLength !== null) return hasContiguousRun(day, runLength);
    return day.some((v) => v === 1);
  });
}

/** True when the user has marked any availability at all. */
export function hasAnyAvailability(slots: number[][] | null | undefined): boolean {
  return Boolean(slots && slots.some((day) => day.some((v) => v === 1)));
}

/**
 * Whether schedule fit is even meaningful for this gig. Project- and
 * milestone-basis work often has no working window, days, or duration —
 * deliver-by-deadline engagements. For those, a "fits your schedule" claim
 * would be noise, so callers should skip the fit computation entirely.
 */
export function hasScheduleSignal(timing: GigTiming): boolean {
  return Boolean(
    timing.is_instant ||
      (timing.days_of_week && timing.days_of_week.length > 0) ||
      (timing.start_time && timing.end_time) ||
      timing.starts_at ||
      gigDurationMinutes(timing) !== null,
  );
}
