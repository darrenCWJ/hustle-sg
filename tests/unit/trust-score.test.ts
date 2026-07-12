import { describe, expect, test } from "vitest";
import { computeTrustScore } from "@/lib/trust/score";

// The trust score is a user-facing ranking signal shown on profiles — its
// weights (base 20 + singpass 30 + certs 8×≤32 + portfolio 4×≤16 + track 2×≤12)
// are product decisions, so drift should fail a test, not ship silently.

describe("computeTrustScore", () => {
  test("base score for a brand-new unverified user", () => {
    const r = computeTrustScore({
      singpassVerified: false,
      verifiedCertCount: 0,
      portfolioItemCount: 0,
      hiredCount: 0,
    });
    expect(r.score).toBe(20);
    expect(r.percentile).toBe("verify to increase");
  });

  test("singpass verification adds 30 points", () => {
    const r = computeTrustScore({
      singpassVerified: true,
      verifiedCertCount: 0,
      portfolioItemCount: 0,
      hiredCount: 0,
    });
    expect(r.score).toBe(50);
  });

  test("each component is capped at its max", () => {
    const r = computeTrustScore({
      singpassVerified: false,
      verifiedCertCount: 100, // capped at 32
      portfolioItemCount: 100, // capped at 16
      hiredCount: 100, // capped at 12
    });
    expect(r.score).toBe(20 + 32 + 16 + 12);
  });

  test("total is capped at 100", () => {
    const r = computeTrustScore({
      singpassVerified: true,
      verifiedCertCount: 100,
      portfolioItemCount: 100,
      hiredCount: 100,
    });
    expect(r.score).toBe(100);
    expect(r.percentile).toBe("top 2%");
  });

  test("breakdown always sums to at least the score components", () => {
    const r = computeTrustScore({
      singpassVerified: true,
      verifiedCertCount: 2,
      portfolioItemCount: 3,
      hiredCount: 1,
    });
    const sum = r.breakdown.reduce((s, b) => s + b.points, 0);
    expect(sum).toBe(r.score); // 20 + 30 + 16 + 12 + 2 = 80, under the cap
    expect(r.breakdown.every((b) => b.points <= b.max)).toBe(true);
  });
});
