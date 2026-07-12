import { describe, expect, test } from "vitest";
import {
  applyPreset,
  applyRangeToDay,
  buildBookedMask,
  clearDaySlots,
  computeGigHighlight,
  formatBudget,
  slotFromTime,
  slotFromTimeEnd,
  timeLabel,
  timeToMinutes,
  type RecommendedGig,
} from "@/lib/availability/calendar-grid";

const emptyGrid = () => Array.from({ length: 7 }, () => Array(24).fill(0));
const noBooked = () => Array.from({ length: 7 }, () => Array(24).fill(false));

function makeGig(overrides: Partial<RecommendedGig> = {}): RecommendedGig {
  return {
    id: "g1",
    title: "Test gig",
    category: null,
    budget_cents: 10_000,
    budget_kind: "fixed",
    location: null,
    is_instant: false,
    instant_urgency: null,
    starts_at: null,
    duration_label: null,
    ...overrides,
  };
}

describe("time ↔ slot conversion", () => {
  test("timeToMinutes parses HH:MM", () => {
    expect(timeToMinutes("08:00")).toBe(480);
    expect(timeToMinutes("13:30")).toBe(810);
  });

  test("slotFromTime floors to the containing slot, clamped at 0", () => {
    expect(slotFromTime("08:00")).toBe(0);
    expect(slotFromTime("09:15")).toBe(2); // 9:00–9:30 slot
    expect(slotFromTime("06:00")).toBe(0); // before grid start
  });

  test("slotFromTimeEnd ceils and clamps at 24", () => {
    expect(slotFromTimeEnd("09:15")).toBe(3); // covers up to 9:30
    expect(slotFromTimeEnd("20:00")).toBe(24);
    expect(slotFromTimeEnd("23:00")).toBe(24); // past grid end
  });

  test("timeLabel renders 12-hour labels", () => {
    expect(timeLabel(0)).toBe("8am");
    expect(timeLabel(1)).toBe("8:30am");
    expect(timeLabel(8)).toBe("12pm");
    expect(timeLabel(9)).toBe("12:30pm");
    expect(timeLabel(23)).toBe("7:30pm");
  });
});

describe("applyPreset", () => {
  test("'all' marks every slot free; 'clear' empties everything", () => {
    const all = applyPreset("all", emptyGrid(), noBooked());
    expect(all.flat().every((v) => v === 1)).toBe(true);
    const cleared = applyPreset("clear", all, noBooked());
    expect(cleared.flat().every((v) => v === 0)).toBe(true);
  });

  test("'weekdays9to5' frees Mon–Fri 9:00–17:30 only", () => {
    const grid = applyPreset("weekdays9to5", emptyGrid(), noBooked());
    expect(grid[0][2]).toBe(1); // Mon 9:00
    expect(grid[0][18]).toBe(1); // Mon 17:00
    expect(grid[0][1]).toBe(0); // Mon 8:30
    expect(grid[0][19]).toBe(0); // Mon 17:30
    expect(grid[5].every((v) => v === 0)).toBe(true); // Sat untouched
  });

  test("'weekends' frees Sat–Sun only", () => {
    const grid = applyPreset("weekends", emptyGrid(), noBooked());
    expect(grid[5].every((v) => v === 1)).toBe(true);
    expect(grid[6].every((v) => v === 1)).toBe(true);
    expect(grid[0].every((v) => v === 0)).toBe(true);
  });

  test("booked slots are never touched and input is not mutated", () => {
    const booked = noBooked();
    booked[0][5] = true;
    const input = emptyGrid();
    const grid = applyPreset("all", input, booked);
    expect(grid[0][5]).toBe(0); // booked slot skipped
    expect(input[0][0]).toBe(0); // original untouched
  });
});

describe("applyRangeToDay / clearDaySlots", () => {
  test("applyRangeToDay frees only the requested range on one day", () => {
    const grid = applyRangeToDay(2, 4, 8, emptyGrid(), noBooked());
    expect(grid[2].slice(4, 8).every((v) => v === 1)).toBe(true);
    expect(grid[2][3]).toBe(0);
    expect(grid[2][8]).toBe(0);
    expect(grid[1].every((v) => v === 0)).toBe(true);
  });

  test("clearDaySlots empties one day, respecting booked slots", () => {
    const full = applyPreset("all", emptyGrid(), noBooked());
    const booked = noBooked();
    booked[3][10] = true;
    const grid = clearDaySlots(3, full, booked);
    expect(grid[3][10]).toBe(1); // booked slot preserved
    expect(grid[3].filter((v) => v === 1)).toHaveLength(1);
    expect(grid[2].every((v) => v === 1)).toBe(true); // other days untouched
  });
});

describe("computeGigHighlight", () => {
  test("uses days_of_week and start/end times when present", () => {
    const h = computeGigHighlight(
      makeGig({ days_of_week: [1, 3], start_time: "09:00", end_time: "12:00" }),
    );
    expect(h).toEqual({ cols: [1, 3], fromSlot: 2, toSlot: 8, hasTime: true });
  });

  test("falls back to full-day range when times are missing", () => {
    const h = computeGigHighlight(makeGig({ days_of_week: [5] }));
    expect(h).toEqual({ cols: [5], fromSlot: 0, toSlot: 24, hasTime: false });
  });

  test("returns null when no day can be determined", () => {
    expect(computeGigHighlight(makeGig())).toBeNull();
  });

  test("instant weekend gigs land on Saturday", () => {
    const h = computeGigHighlight(makeGig({ is_instant: true, instant_urgency: "weekend" }));
    expect(h?.cols).toEqual([5]);
  });
});

describe("buildBookedMask", () => {
  test("marks recurring gig hours as booked across its days", () => {
    const mask = buildBookedMask([
      { id: "b1", title: "Booked", start_time: "10:00", end_time: "12:00", days_of_week: [0, 4] },
    ]);
    expect(mask[0][4]).toBe(true); // Mon 10:00
    expect(mask[0][7]).toBe(true); // Mon 11:30
    expect(mask[0][8]).toBe(false); // Mon 12:00 is free again
    expect(mask[4][4]).toBe(true); // Fri 10:00
    expect(mask[1][4]).toBe(false); // Tue untouched
  });

  test("skips gigs without complete schedule info", () => {
    const mask = buildBookedMask([
      { id: "b2", title: "No time", start_time: null, end_time: null, days_of_week: [2] },
    ]);
    expect(mask.flat().every((v) => v === false)).toBe(true);
  });
});

describe("formatBudget", () => {
  test("formats fixed and hourly budgets, with a negotiable fallback", () => {
    expect(formatBudget(80_000, "fixed")).toBe("S$800");
    expect(formatBudget(2_500, "hourly")).toBe("S$25/hr");
    expect(formatBudget(null, "fixed")).toBe("Negotiable");
  });
});
