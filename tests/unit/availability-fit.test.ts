import { describe, expect, test } from "vitest";
import {
  gigRowRange,
  gigDayCols,
  gigFitsAvailability,
  hasAnyAvailability,
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

describe("hasAnyAvailability", () => {
  test("detects empty, null and marked grids", () => {
    expect(hasAnyAvailability(null)).toBe(false);
    expect(hasAnyAvailability(emptyWeek())).toBe(false);
    expect(hasAnyAvailability(weekWith(0, 0, 0))).toBe(true);
  });
});
