import { describe, expect, test } from "vitest";
import {
  gigRowRange,
  gigDayCols,
  gigDurationMinutes,
  gigFitsAvailability,
  hasAnyAvailability,
  hasScheduleSignal,
  GRID_ROWS,
} from "@/lib/availability/fit";

// Grid: 7 days (0=Mon…6=Sun) × 24 half-hour rows covering 08:00–20:00.

const emptyWeek = (): number[][] => Array.from({ length: 7 }, () => Array(GRID_ROWS).fill(0));

function weekWith(col: number, fromRow: number, toRow: number): number[][] {
  const slots = emptyWeek();
  for (let r = fromRow; r <= toRow; r++) slots[col][r] = 1;
  return slots;
}

// A Wednesday, for deterministic "today"-based tests.
const WEDNESDAY = new Date("2026-07-15T10:00:00+08:00");

describe("gigRowRange", () => {
  test("maps a window inside the grid to half-hour rows", () => {
    // 09:00–11:00 → rows 2..5 (08:00 is row 0)
    expect(gigRowRange({ start_time: "09:00", end_time: "11:00" })).toEqual([2, 3, 4, 5]);
  });

  test("accepts Postgres time format with seconds", () => {
    expect(gigRowRange({ start_time: "08:00:00", end_time: "08:30:00" })).toEqual([0]);
  });

  test("clamps windows that spill past the grid edges", () => {
    // 06:00–09:00 clamps to 08:00–09:00 → rows 0..1
    expect(gigRowRange({ start_time: "06:00", end_time: "09:00" })).toEqual([0, 1]);
    // 19:00–23:00 clamps to 19:00–20:00 → rows 22..23
    expect(gigRowRange({ start_time: "19:00", end_time: "23:00" })).toEqual([22, 23]);
  });

  test("returns null for unknown, inverted, or fully off-grid windows", () => {
    expect(gigRowRange({})).toBeNull();
    expect(gigRowRange({ start_time: "14:00", end_time: "12:00" })).toBeNull();
    expect(gigRowRange({ start_time: "21:00", end_time: "23:00" })).toBeNull(); // night gig
  });
});

describe("gigDayCols", () => {
  test("uses explicit recurrence days", () => {
    expect(gigDayCols({ days_of_week: [0, 2, 4] }, WEDNESDAY)).toEqual([0, 2, 4]);
  });

  test("instant now/today → today's column; weekend → Sat+Sun", () => {
    expect(gigDayCols({ is_instant: true, instant_urgency: "today" }, WEDNESDAY)).toEqual([2]);
    expect(gigDayCols({ is_instant: true, instant_urgency: "weekend" }, WEDNESDAY)).toEqual([5, 6]);
  });

  test("falls back to the start date's weekday, else null (day-agnostic)", () => {
    expect(gigDayCols({ starts_at: "2026-07-18T09:00:00+08:00" }, WEDNESDAY)).toEqual([5]); // Sat
    expect(gigDayCols({}, WEDNESDAY)).toBeNull();
  });
});

describe("gigFitsAvailability", () => {
  test("fits when the whole window is free on a candidate day", () => {
    const slots = weekWith(2, 2, 5); // Wed 09:00–11:00 free
    const gig = { days_of_week: [2], start_time: "09:00", end_time: "11:00" };
    expect(gigFitsAvailability(slots, gig, WEDNESDAY)).toBe(true);
  });

  test("does not fit when the window is only partially free", () => {
    const slots = weekWith(2, 2, 3); // Wed free 09:00–10:00 only
    const gig = { days_of_week: [2], start_time: "09:00", end_time: "11:00" };
    expect(gigFitsAvailability(slots, gig, WEDNESDAY)).toBe(false);
  });

  test("one fitting day among several candidates is enough", () => {
    const slots = weekWith(4, 0, GRID_ROWS - 1); // Friday fully free
    const gig = { days_of_week: [2, 4], start_time: "14:00", end_time: "16:00" };
    expect(gigFitsAvailability(slots, gig, WEDNESDAY)).toBe(true);
  });

  test("unknown window falls back to any availability on the day", () => {
    const slots = weekWith(5, 10, 10); // one Saturday half-hour
    expect(gigFitsAvailability(slots, { days_of_week: [5] }, WEDNESDAY)).toBe(true);
    expect(gigFitsAvailability(slots, { days_of_week: [3] }, WEDNESDAY)).toBe(false);
  });

  test("day-agnostic gig fits if any availability exists anywhere", () => {
    const slots = weekWith(6, 0, 0);
    expect(gigFitsAvailability(slots, {}, WEDNESDAY)).toBe(true);
    expect(gigFitsAvailability(emptyWeek(), {}, WEDNESDAY)).toBe(false);
  });
});

describe("gigDurationMinutes", () => {
  test("hours_required wins and converts to minutes", () => {
    expect(gigDurationMinutes({ hours_required: 2 })).toBe(120);
  });

  test("parses free-text labels: minutes, decimal hours, combos", () => {
    expect(gigDurationMinutes({ duration_label: "45 min" })).toBe(45);
    expect(gigDurationMinutes({ duration_label: "15mins" })).toBe(15);
    expect(gigDurationMinutes({ duration_label: "1.5 hours" })).toBe(90);
    expect(gigDurationMinutes({ duration_label: "2h" })).toBe(120);
    expect(gigDurationMinutes({ duration_label: "1h 30m" })).toBe(90);
  });

  test("unknown or unparseable → null", () => {
    expect(gigDurationMinutes({})).toBeNull();
    expect(gigDurationMinutes({ duration_label: "flexible" })).toBeNull();
  });
});

describe("gigFitsAvailability — flexible durations (timing not fixed)", () => {
  test("a 45-min task fits any free 60-min stretch (rounds up to grid slots)", () => {
    const slots = weekWith(2, 4, 5); // Wed: one free hour, 10:00–11:00
    const gig = { days_of_week: [2], duration_label: "45 min" };
    expect(gigFitsAvailability(slots, gig, WEDNESDAY)).toBe(true);
  });

  test("a 15-min task fits a single free half-hour slot", () => {
    const slots = weekWith(2, 4, 4); // Wed: 10:00–10:30 only
    const gig = { days_of_week: [2], duration_label: "15 mins" };
    expect(gigFitsAvailability(slots, gig, WEDNESDAY)).toBe(true);
  });

  test("fragmented availability shorter than the duration does not fit", () => {
    // Wed: two separate free half-hours with a gap — no contiguous 2h run.
    const slots = emptyWeek();
    slots[2][2] = 1;
    slots[2][6] = 1;
    const gig = { days_of_week: [2], hours_required: 2 };
    expect(gigFitsAvailability(slots, gig, WEDNESDAY)).toBe(false);
  });

  test("contiguous run long enough fits a multi-hour flexible gig", () => {
    const slots = weekWith(2, 4, 9); // Wed: 10:00–13:00 free (3h)
    const gig = { days_of_week: [2], hours_required: 3 };
    expect(gigFitsAvailability(slots, gig, WEDNESDAY)).toBe(true);
  });

  test("a fixed window still takes precedence over the duration", () => {
    // Free 10:00–13:00, but the gig's fixed window is 14:00–15:00 → no fit,
    // even though a 1h contiguous run exists elsewhere in the day.
    const slots = weekWith(2, 4, 9);
    const gig = {
      days_of_week: [2],
      start_time: "14:00",
      end_time: "15:00",
      hours_required: 1,
    };
    expect(gigFitsAvailability(slots, gig, WEDNESDAY)).toBe(false);
  });
});

describe("hasScheduleSignal", () => {
  test("project/milestone deliver-by-deadline gigs have no schedule signal", () => {
    expect(hasScheduleSignal({})).toBe(false);
    expect(hasScheduleSignal({ duration_label: "flexible" })).toBe(false);
  });

  test("window, days, start date, duration or instant all count as signal", () => {
    expect(hasScheduleSignal({ start_time: "09:00", end_time: "11:00" })).toBe(true);
    expect(hasScheduleSignal({ days_of_week: [1] })).toBe(true);
    expect(hasScheduleSignal({ starts_at: "2026-07-18T09:00:00+08:00" })).toBe(true);
    expect(hasScheduleSignal({ duration_label: "45 min" })).toBe(true);
    expect(hasScheduleSignal({ is_instant: true, instant_urgency: "today" })).toBe(true);
  });
});

describe("hasAnyAvailability", () => {
  test("detects empty, null and marked grids", () => {
    expect(hasAnyAvailability(null)).toBe(false);
    expect(hasAnyAvailability(emptyWeek())).toBe(false);
    expect(hasAnyAvailability(weekWith(0, 0, 0))).toBe(true);
  });
});
