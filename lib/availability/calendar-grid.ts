import { gigFitsAvailability } from "@/lib/availability/fit";

// Pure grid math for the availability calendar. The grid is 7 day columns
// (0 = Monday … 6 = Sunday, matching days_of_week everywhere) by 24
// half-hour rows covering 08:00–20:00 SGT. Slot values: 0 = busy, 1 = free,
// 2 = booked gig (locked). No React, no browser APIs — unit-testable.

export interface RecommendedGig {
  id: string;
  title: string;
  category: string | null;
  budget_cents: number | null;
  budget_kind: string;
  location: string | null;
  is_instant: boolean;
  instant_urgency: string | null;
  starts_at: string | null;
  duration_label: string | null;
  overlap_skills?: string[];
  start_time?: string | null;
  end_time?: string | null;
  days_of_week?: number[] | null;
}

export interface BookedGig {
  id: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  days_of_week: number[] | null;
}

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAYS_FULL = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const DEFAULT_SLOTS: number[][] = [
  [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1],
  [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// 25 time boundary points: 8:00am → 8:00pm in 30-min steps
export const HALF_HOURS = Array.from({ length: 25 }, (_, i) => {
  const total = 8 * 60 + i * 30;
  const h = Math.floor(total / 60);
  const m = total % 60;
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h > 12 ? h - 12 : h;
  return { label: `${h12}:${m.toString().padStart(2, "0")}${ampm}`, slot: i };
});

export const TIME_BLOCKS = [
  { label: "Morning",   sub: "8am–12pm", from: 0,  to: 8  },
  { label: "Afternoon", sub: "12pm–6pm", from: 8,  to: 20 },
  { label: "Evening",   sub: "6pm–8pm",  from: 20, to: 24 },
  { label: "All day",   sub: "8am–8pm",  from: 0,  to: 24 },
];

export function getTodayCol(): number {
  return (new Date().getDay() + 6) % 7;
}

export function getGigDayCol(gig: RecommendedGig): number | null {
  if (gig.is_instant) {
    const today = getTodayCol();
    if (gig.instant_urgency === "now" || gig.instant_urgency === "today") return today;
    if (gig.instant_urgency === "weekend") return 5;
  }
  if (gig.starts_at) {
    const start = new Date(gig.starts_at);
    const today = new Date();
    const todayCol = getTodayCol();
    const monday = new Date(today);
    monday.setDate(today.getDate() - todayCol);
    monday.setHours(0, 0, 0, 0);
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    if (start >= monday && start < nextMonday) {
      return (start.getDay() + 6) % 7;
    }
  }
  return null;
}

export function gigMatchesSchedule(gig: RecommendedGig, slots: number[][]): boolean {
  // Shared hour/duration-aware fit (lib/availability/fit.ts) — the same logic
  // the feed badge and push targeting use, so all three surfaces agree.
  // The grid stores 2 for booked slots; the fit helper expects 1 = free.
  const freeOnly = slots.map((day) => day.map((v) => (v === 1 ? 1 : 0)));
  return gigFitsAvailability(freeOnly, gig);
}

export function formatBudget(cents: number | null, kind: string): string {
  if (!cents) return "Negotiable";
  const sgd = Math.round(cents / 100);
  return `S$${sgd.toLocaleString()}${kind === "hourly" ? "/hr" : ""}`;
}

export function gigDateLabel(gig: RecommendedGig): string {
  if (gig.is_instant) {
    if (gig.instant_urgency === "now") return "Needed NOW";
    if (gig.instant_urgency === "today") return "Today";
    if (gig.instant_urgency === "weekend") return "This weekend";
    return "Instant";
  }
  if (gig.starts_at) {
    return new Date(gig.starts_at).toLocaleDateString("en-SG", { day: "numeric", month: "short" });
  }
  return "ASAP";
}

export function timeLabel(si: number): string {
  const h = Math.floor(8 + si / 2);
  const m = si % 2 === 1 ? "30" : "";
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h > 12 ? h - 12 : h;
  return `${h12}${m ? `:${m}` : ""}${ampm}`;
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function slotFromTime(t: string): number {
  return Math.max(0, Math.floor((timeToMinutes(t) - 480) / 30));
}

export function slotFromTimeEnd(t: string): number {
  return Math.min(24, Math.ceil((timeToMinutes(t) - 480) / 30));
}

export type PresetKey = "weekdays9to5" | "weekends" | "all" | "clear";

export function applyPreset(
  preset: PresetKey,
  current: number[][],
  bookedMask: boolean[][],
): number[][] {
  const next = current.map((d) => [...d]);
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row < 24; row++) {
      if (bookedMask[col][row]) continue;
      if (preset === "clear") {
        next[col][row] = 0;
      } else if (preset === "all") {
        next[col][row] = 1;
      } else if (preset === "weekdays9to5") {
        next[col][row] = col < 5 && row >= 2 && row <= 18 ? 1 : 0;
      } else if (preset === "weekends") {
        next[col][row] = col >= 5 ? 1 : 0;
      }
    }
  }
  return next;
}

export function applyRangeToDay(
  col: number,
  from: number,
  to: number,
  current: number[][],
  booked: boolean[][],
): number[][] {
  const next = current.map((d) => [...d]);
  for (let row = from; row < Math.min(to, 24); row++) {
    if (!booked[col][row]) next[col][row] = 1;
  }
  return next;
}

export function clearDaySlots(col: number, current: number[][], booked: boolean[][]): number[][] {
  const next = current.map((d) => [...d]);
  for (let row = 0; row < 24; row++) {
    if (!booked[col][row]) next[col][row] = 0;
  }
  return next;
}

// Which calendar cells a gig would occupy (for hover preview)
export interface GigHighlight {
  cols: number[]; // which day columns (a gig may recur on multiple days)
  fromSlot: number;
  toSlot: number;
  hasTime: boolean; // false = only day known, not exact hours
}

export function computeGigHighlight(gig: RecommendedGig): GigHighlight | null {
  let cols: number[] = [];

  if (gig.days_of_week && gig.days_of_week.length > 0) {
    cols = gig.days_of_week.filter((d) => d >= 0 && d <= 6);
  } else {
    const col = getGigDayCol(gig);
    if (col !== null) cols = [col];
  }

  if (cols.length === 0) return null;

  const hasTime = !!(gig.start_time && gig.end_time);
  const fromSlot = gig.start_time ? slotFromTime(gig.start_time) : 0;
  const toSlot = gig.end_time ? slotFromTimeEnd(gig.end_time) : 24;

  return { cols, fromSlot, toSlot, hasTime };
}

export function buildBookedMask(bookedGigs: BookedGig[]): boolean[][] {
  const mask: boolean[][] = Array.from({ length: 7 }, () => Array(24).fill(false));
  for (const gig of bookedGigs) {
    if (!gig.start_time || !gig.end_time || !gig.days_of_week?.length) continue;
    const startMin = timeToMinutes(gig.start_time);
    const endMin = timeToMinutes(gig.end_time);
    const startSlot = Math.max(0, Math.floor((startMin - 480) / 30));
    const endSlot = Math.min(23, Math.ceil((endMin - 480) / 30) - 1);
    for (const day of gig.days_of_week) {
      if (day < 0 || day > 6) continue;
      for (let s = startSlot; s <= endSlot; s++) mask[day][s] = true;
    }
  }
  return mask;
}
