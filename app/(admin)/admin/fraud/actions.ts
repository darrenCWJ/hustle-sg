"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/server";
import { saveFraudSettings } from "@/lib/fraud/settings";
import type { PairSignals } from "@/lib/fraud/scoring";

export async function recordFraudVerdict(input: {
  employerId: string;
  workerId: string;
  verdict: "confirmed" | "legitimate";
  score: number;
  signals: PairSignals;
}): Promise<{ ok: boolean; error?: string }> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Not authorised" };

  const valid =
    z.string().uuid().safeParse(input.employerId).success &&
    z.string().uuid().safeParse(input.workerId).success &&
    ["confirmed", "legitimate"].includes(input.verdict);
  if (!valid) return { ok: false, error: "Invalid input" };

  const service = createServiceClient();
  const { error } = await service.from("fraud_reviews").upsert(
    {
      employer_id: input.employerId,
      worker_id: input.workerId,
      verdict: input.verdict,
      score_at_review: Math.round(input.score),
      signals: input.signals as unknown as import("@/lib/supabase/types").Json,
      reviewed_by: admin.id,
      created_at: new Date().toISOString(),
    },
    { onConflict: "employer_id,worker_id" },
  );
  if (error) {
    console.error("[admin] recordFraudVerdict", error);
    return { ok: false, error: "Could not save the verdict" };
  }

  // Transparency: confirming has real consequences (ratings excluded, pair
  // suspended from matching each other) — both parties are told, with an
  // appeal path. Marking legitimate lifts everything, so no notice needed.
  if (input.verdict === "confirmed") {
    await service.from("notifications").insert(
      [input.employerId, input.workerId].map((userId) => ({
        user_id: userId,
        kind: "application_status_changed",
        title: "A review found unusual activity on your account",
        body:
          "Ratings between you and one counterparty no longer count toward public scores, and you won't be matched with each other. If you believe this is a mistake, use the Report button on your own profile with reason 'Something else' and an admin will re-review.",
        link: "/dashboard",
        data: { kind: "fraud_confirmed" },
      })),
    );
  }

  revalidatePath("/admin/fraud");
  return { ok: true };
}

const settingsSchema = z.object({
  threshold: z.coerce.number().int().min(1).max(20),
  mutualFiveStar: z.coerce.number().int().min(0).max(20),
  silentCompletion: z.coerce.number().int().min(0).max(20),
  fastRated: z.coerce.number().int().min(0).max(20),
  pairVolume: z.coerce.number().int().min(0).max(20),
  pairVolumeMin: z.coerce.number().int().min(2).max(10),
});

export async function updateFraudSettings(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Not authorised" };

  const parsed = settingsSchema.safeParse({
    threshold: formData.get("threshold"),
    mutualFiveStar: formData.get("mutualFiveStar"),
    silentCompletion: formData.get("silentCompletion"),
    fastRated: formData.get("fastRated"),
    pairVolume: formData.get("pairVolume"),
    pairVolumeMin: formData.get("pairVolumeMin"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid settings" };
  }

  await saveFraudSettings({
    threshold: parsed.data.threshold,
    weights: {
      mutualFiveStar: parsed.data.mutualFiveStar,
      silentCompletion: parsed.data.silentCompletion,
      fastRated: parsed.data.fastRated,
      pairVolume: parsed.data.pairVolume,
      pairVolumeMin: parsed.data.pairVolumeMin,
    },
  });

  revalidatePath("/admin/fraud");
  return { ok: true };
}
