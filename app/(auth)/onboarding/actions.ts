"use server";

import { createClient } from "@/lib/supabase/server";
import { regenerateUserEmbedding } from "@/lib/ai/match";

export async function saveRole(role: "freelancer" | "employer" | "both") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const };

  await supabase
    .from("profiles")
    .update({ role })
    .eq("id", user.id);

  // Generate embedding now so the user appears on the vector map immediately.
  // Fire-and-forget — don't block the onboarding UI.
  regenerateUserEmbedding(user.id).catch(() => {});

  return { ok: true as const };
}
