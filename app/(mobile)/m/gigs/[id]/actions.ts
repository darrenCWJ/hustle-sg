"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";

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
