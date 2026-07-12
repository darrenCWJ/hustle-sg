import { createServiceClient } from "@/lib/supabase/server";
import { captureServerError } from "@/lib/observability/errors";
import type { Json } from "@/lib/supabase/types";
import {
  DEFAULT_THRESHOLD,
  DEFAULT_WEIGHTS,
  type FraudWeights,
} from "./scoring";

const SETTINGS_KEY = "fraud_model";

export interface FraudSettings {
  weights: FraudWeights;
  threshold: number;
}

function clampInt(value: unknown, fallback: number, min = 0, max = 20): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
}

/** Admin-tunable fraud model settings, with safe defaults and clamping. */
export async function getFraudSettings(): Promise<FraudSettings> {
  try {
    const service = createServiceClient();
    const { data } = await service
      .from("app_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();
    const v = (data?.value ?? {}) as Record<string, unknown>;
    const w = (v.weights ?? {}) as Record<string, unknown>;
    return {
      threshold: clampInt(v.threshold, DEFAULT_THRESHOLD, 1),
      weights: {
        mutualFiveStar: clampInt(w.mutualFiveStar, DEFAULT_WEIGHTS.mutualFiveStar),
        silentCompletion: clampInt(w.silentCompletion, DEFAULT_WEIGHTS.silentCompletion),
        fastRated: clampInt(w.fastRated, DEFAULT_WEIGHTS.fastRated),
        pairVolume: clampInt(w.pairVolume, DEFAULT_WEIGHTS.pairVolume),
        pairVolumeMin: clampInt(w.pairVolumeMin, DEFAULT_WEIGHTS.pairVolumeMin, 2, 10),
      },
    };
  } catch (err) {
    await captureServerError("fraud.getSettings", err);
    return { threshold: DEFAULT_THRESHOLD, weights: DEFAULT_WEIGHTS };
  }
}

export async function saveFraudSettings(settings: FraudSettings): Promise<void> {
  const service = createServiceClient();
  const { error } = await service.from("app_settings").upsert({
    key: SETTINGS_KEY,
    value: settings as unknown as Json,
    updated_at: new Date().toISOString(),
  });
  if (error) await captureServerError("fraud.saveSettings", error);
}
