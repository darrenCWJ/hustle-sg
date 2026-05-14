"use server";

import { createClient } from "@/lib/supabase/server";
import { SF_CATALOG } from "@/lib/skillsfuture/catalog";
import { regenerateUserEmbedding } from "@/lib/ai/match";

export async function importSkillsFutureCert(certId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };

  const cert = SF_CATALOG.find((c) => c.id === certId);
  if (!cert) return { ok: false as const, error: "Certificate not found" };

  // Prevent duplicates
  const { data: existing } = await supabase
    .from("certifications")
    .select("id")
    .eq("user_id", user.id)
    .eq("title", cert.title)
    .eq("issuer", cert.issuer)
    .maybeSingle();

  if (existing) return { ok: false as const, error: "Already imported" };

  const { error } = await supabase.from("certifications").insert({
    user_id: user.id,
    kind: cert.kind,
    issuer: cert.issuer,
    title: cert.title,
    issued_at: cert.issued_at,
    verified: true,
    verification_status: "verified",
    verification_method: "singpass",
    verified_at: new Date().toISOString(),
    extracted_skills: cert.skills,
  });
  if (error) return { ok: false as const, error: error.message };

  regenerateUserEmbedding(user.id).catch(() => {});
  return { ok: true as const };
}
