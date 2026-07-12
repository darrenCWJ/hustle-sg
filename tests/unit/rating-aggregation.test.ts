import { describe, expect, test } from "vitest";
import { aggregateRatings } from "@/lib/trust/ratings";

describe("aggregateRatings (collusion-resistant)", () => {
  test("empty → null average", () => {
    expect(aggregateRatings([])).toEqual({ average: null, uniqueRaters: 0, totalRatings: 0 });
  });

  test("independent raters average normally", () => {
    const r = aggregateRatings([
      { from_id: "a", stars: 5 },
      { from_id: "b", stars: 3 },
    ]);
    expect(r.average).toBe(4);
    expect(r.uniqueRaters).toBe(2);
    expect(r.totalRatings).toBe(2);
  });

  test("a rating ring counts as ONE voice, not ten", () => {
    // One honest 2★ client + a colluder spamming ten 5★ reviews.
    const ring = Array.from({ length: 10 }, () => ({ from_id: "colluder", stars: 5 }));
    const r = aggregateRatings([...ring, { from_id: "honest", stars: 2 }]);
    // Naive average would be (50+2)/11 ≈ 4.7; pair-aware is (5+2)/2 = 3.5.
    expect(r.average).toBe(3.5);
    expect(r.uniqueRaters).toBe(2);
    expect(r.totalRatings).toBe(11);
  });

  test("a repeat rater's own ratings are averaged before counting", () => {
    const r = aggregateRatings([
      { from_id: "a", stars: 5 },
      { from_id: "a", stars: 1 },
      { from_id: "b", stars: 4 },
    ]);
    // a → 3, b → 4 → average 3.5
    expect(r.average).toBe(3.5);
  });
});
