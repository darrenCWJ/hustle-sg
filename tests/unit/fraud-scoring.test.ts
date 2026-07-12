import { describe, expect, test } from "vitest";
import {
  scorePair,
  evaluateModel,
  modelHealth,
  DEFAULT_WEIGHTS,
  MIN_LABELS_FOR_EVAL,
} from "@/lib/fraud/scoring";

describe("scorePair", () => {
  test("weights each signal and applies the volume bonus once", () => {
    const score = scorePair(
      { gigs_between: 3, mutual_five_star: 2, silent_completions: 1, fast_rated: 1 },
      DEFAULT_WEIGHTS,
    );
    // 2*2 + 1 + 1 + 2 (volume ≥3) = 8
    expect(score).toBe(8);
  });

  test("clean pair scores zero", () => {
    expect(
      scorePair(
        { gigs_between: 1, mutual_five_star: 0, silent_completions: 0, fast_rated: 0 },
        DEFAULT_WEIGHTS,
      ),
    ).toBe(0);
  });

  test("custom weights change the score (admin tuning)", () => {
    const heavy = { ...DEFAULT_WEIGHTS, mutualFiveStar: 5 };
    expect(
      scorePair(
        { gigs_between: 1, mutual_five_star: 2, silent_completions: 0, fast_rated: 0 },
        heavy,
      ),
    ).toBe(10);
  });
});

describe("evaluateModel (precision / recall / F1)", () => {
  test("perfect model → F1 = 1", () => {
    const e = evaluateModel(
      [
        { score: 5, verdict: "confirmed" },
        { score: 6, verdict: "confirmed" },
        { score: 0, verdict: "legitimate" },
      ],
      2,
    );
    expect(e.precision).toBe(1);
    expect(e.recall).toBe(1);
    expect(e.f1).toBe(1);
  });

  test("false positives cut precision; misses cut recall", () => {
    const e = evaluateModel(
      [
        { score: 5, verdict: "confirmed" }, // TP
        { score: 5, verdict: "legitimate" }, // FP
        { score: 0, verdict: "confirmed" }, // FN (model missed it)
        { score: 0, verdict: "legitimate" }, // TN
      ],
      2,
    );
    expect(e.precision).toBe(0.5);
    expect(e.recall).toBe(0.5);
    expect(e.f1).toBe(0.5);
    expect(e.truePositives).toBe(1);
    expect(e.falsePositives).toBe(1);
    expect(e.falseNegatives).toBe(1);
    expect(e.trueNegatives).toBe(1);
  });

  test("no labels → metrics are null, not zero", () => {
    const e = evaluateModel([], 2);
    expect(e.precision).toBeNull();
    expect(e.recall).toBeNull();
    expect(e.f1).toBeNull();
  });

  test("threshold moves predictions", () => {
    const labels = [
      { score: 3, verdict: "confirmed" as const },
      { score: 3, verdict: "legitimate" as const },
    ];
    expect(evaluateModel(labels, 2).falsePositives).toBe(1);
    expect(evaluateModel(labels, 4).falsePositives).toBe(0);
    expect(evaluateModel(labels, 4).falseNegatives).toBe(1);
  });
});

describe("modelHealth", () => {
  test("too few labels → insufficient", () => {
    const e = evaluateModel([{ score: 5, verdict: "confirmed" }], 2);
    expect(modelHealth(e).status).toBe("insufficient");
  });

  test("low F1 with enough labels → retune", () => {
    const labels = [
      ...Array.from({ length: MIN_LABELS_FOR_EVAL - 2 }, () => ({
        score: 5,
        verdict: "legitimate" as const, // lots of false positives
      })),
      { score: 5, verdict: "confirmed" as const },
      { score: 0, verdict: "confirmed" as const },
    ];
    const health = modelHealth(evaluateModel(labels, 2));
    expect(health.status).toBe("retune");
  });

  test("good agreement with enough labels → healthy", () => {
    const labels = [
      ...Array.from({ length: 6 }, () => ({ score: 6, verdict: "confirmed" as const })),
      ...Array.from({ length: 6 }, () => ({ score: 0, verdict: "legitimate" as const })),
    ];
    expect(modelHealth(evaluateModel(labels, 2)).status).toBe("healthy");
  });
});
