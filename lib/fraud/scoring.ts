// Fraud-model scoring + evaluation, kept pure so it's unit-testable and so
// the weights can live in admin-tunable settings rather than code.

export interface PairSignals {
  gigs_between: number;
  mutual_five_star: number;
  silent_completions: number;
  fast_rated: number;
}

export interface FraudWeights {
  mutualFiveStar: number;
  silentCompletion: number;
  fastRated: number;
  pairVolume: number; // applied once when gigs_between >= pairVolumeMin
  pairVolumeMin: number;
}

export const DEFAULT_WEIGHTS: FraudWeights = {
  mutualFiveStar: 2,
  silentCompletion: 1,
  fastRated: 1,
  pairVolume: 2,
  pairVolumeMin: 3,
};

export const DEFAULT_THRESHOLD = 2;

/** Transparent weighted score — the "model". Weights come from app_settings. */
export function scorePair(signals: PairSignals, weights: FraudWeights): number {
  return (
    weights.mutualFiveStar * signals.mutual_five_star +
    weights.silentCompletion * signals.silent_completions +
    weights.fastRated * signals.fast_rated +
    (signals.gigs_between >= weights.pairVolumeMin ? weights.pairVolume : 0)
  );
}

export interface LabeledPair {
  score: number;
  verdict: "confirmed" | "legitimate";
}

export interface ModelEvaluation {
  labeled: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  trueNegatives: number;
  precision: number | null;
  recall: number | null;
  f1: number | null;
}

/**
 * Confusion matrix + precision/recall/F1 over admin-labeled pairs, treating
 * `score >= threshold` as the model's positive prediction. Nulls mean "not
 * computable yet" (no positive predictions / no confirmed fraud among
 * labels) — the UI renders those as "needs more labels", never as 0.
 */
export function evaluateModel(labeled: LabeledPair[], threshold: number): ModelEvaluation {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;
  for (const pair of labeled) {
    const predicted = pair.score >= threshold;
    const actual = pair.verdict === "confirmed";
    if (predicted && actual) tp++;
    else if (predicted && !actual) fp++;
    else if (!predicted && actual) fn++;
    else tn++;
  }

  const precision = tp + fp > 0 ? tp / (tp + fp) : null;
  const recall = tp + fn > 0 ? tp / (tp + fn) : null;
  const f1 =
    precision !== null && recall !== null && precision + recall > 0
      ? (2 * precision * recall) / (precision + recall)
      : null;

  return {
    labeled: labeled.length,
    truePositives: tp,
    falsePositives: fp,
    falseNegatives: fn,
    trueNegatives: tn,
    precision,
    recall,
    f1,
  };
}

export const MIN_LABELS_FOR_EVAL = 10;
export const F1_RETUNE_FLOOR = 0.6;

/** Plain-language health verdict for the admin panel. */
export function modelHealth(evaluation: ModelEvaluation): {
  status: "insufficient" | "healthy" | "retune";
  message: string;
} {
  if (evaluation.labeled < MIN_LABELS_FOR_EVAL) {
    return {
      status: "insufficient",
      message: `Record ${MIN_LABELS_FOR_EVAL - evaluation.labeled} more verdict${
        MIN_LABELS_FOR_EVAL - evaluation.labeled !== 1 ? "s" : ""
      } to evaluate the model reliably.`,
    };
  }
  if (evaluation.f1 !== null && evaluation.f1 < F1_RETUNE_FLOOR) {
    return {
      status: "retune",
      message: `F1 is ${evaluation.f1.toFixed(2)} — below the ${F1_RETUNE_FLOOR} floor. Adjust the weights or threshold below; if tuning can't recover it, the model needs a rebuild (see ROADMAP.md).`,
    };
  }
  return {
    status: "healthy",
    message: "The model's flags are agreeing with your verdicts. No action needed.",
  };
}
