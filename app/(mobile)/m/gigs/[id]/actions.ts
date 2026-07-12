"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isBlockedBetween } from "@/lib/safety/blocks";

export async function mobileApplyToGig(
  gigId: string,
): Promise<{ ok: boolean; error?: string; alreadyApplied?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // Check for existing application
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("gig_id", gigId)
    .eq("applicant_id", user.id)
    .maybeSingle();
  if (existing) return { ok: true, alreadyApplied: true };

  // Blocked pairs can't enter each other's hiring pipeline (Phase 2.3).
  const { data: gigOwner } = await supabase
    .from("gigs")
    .select("employer_id")
    .eq("id", gigId)
    .single();
  if (!gigOwner) return { ok: false, error: "Gig not found." };
  if (await isBlockedBetween(user.id, gigOwner.employer_id)) {
    return { ok: false, error: "You can't apply to this gig." };
  }

  const { data: app, error } = await supabase
    .from("applications")
    .insert({ gig_id: gigId, applicant_id: user.id, status: "applied" })
    .select("id")
    .single();
  if (error || !app) return { ok: false, error: error?.message ?? "Failed to apply." };

  // Notify employer
  const service = createServiceClient();
  const [gigRes, profileRes] = await Promise.all([
    service
      .from("gigs")
      .select("employer_id, title")
      .eq("id", gigId)
      .single(),
    supabase.from("profiles").select("display_name").eq("id", user.id).single(),
  ]);

  if (gigRes.data?.employer_id) {
    const name = profileRes.data?.display_name ?? "Someone";
    await service.from("notifications").insert({
      user_id: gigRes.data.employer_id,
      kind: "application_received",
      title: `${name} applied for "${gigRes.data.title}"`,
      body: "Review their profile and async video responses.",
      link: `/interviews/${app.id}`,
      data: { application_id: app.id, gig_id: gigId },
    });
  }

  return { ok: true };
}
