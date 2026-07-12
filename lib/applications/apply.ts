import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isBlockedBetween } from "@/lib/safety/blocks";
import { logMatchEvent } from "@/lib/analytics/match-events";

export interface ApplyResult {
  ok: boolean;
  error?: string;
  alreadyApplied?: boolean;
  applicationId?: string;
  hasQuestions?: boolean;
}

/**
 * Single source of truth for "apply to a gig" (Phase 4.1). The desktop and
 * mobile server actions are thin adapters over this — the two independent
 * implementations had already drifted (different guards, silent failures).
 *
 * Guards: signed in, gig open, deadline not passed, no block between the
 * parties, not already applied. Side effects: insert application, notify the
 * employer, report whether interview questions exist so the caller can route
 * to the recording flow.
 */
export async function applyToGigCore(
  gigId: string,
  coverNote?: string,
): Promise<ApplyResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: gigMeta } = await supabase
    .from("gigs")
    .select("status, applications_close_at, employer_id, title")
    .eq("id", gigId)
    .single();
  if (!gigMeta) return { ok: false, error: "Gig not found." };
  if (gigMeta.status !== "open") return { ok: false, error: "This gig is no longer open." };
  if (
    gigMeta.applications_close_at &&
    new Date(gigMeta.applications_close_at) < new Date()
  ) {
    return { ok: false, error: "Applications for this gig have closed." };
  }

  // Blocked pairs can't enter each other's hiring pipeline (Phase 2.3).
  if (await isBlockedBetween(user.id, gigMeta.employer_id)) {
    return { ok: false, error: "You can't apply to this gig." };
  }

  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("gig_id", gigId)
    .eq("applicant_id", user.id)
    .maybeSingle();
  if (existing) return { ok: true, alreadyApplied: true, applicationId: existing.id };

  const { data: app, error } = await supabase
    .from("applications")
    .insert({
      gig_id: gigId,
      applicant_id: user.id,
      cover_note: coverNote?.trim().slice(0, 2000) || null,
      status: "applied",
    })
    .select("id")
    .single();
  if (error || !app) {
    console.error("[applications] applyToGigCore", error);
    return { ok: false, error: error?.message ?? "Failed to apply." };
  }

  // Notify the employer (service client: writing another user's notifications).
  const service = createServiceClient();
  const { data: applicantProfile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();
  const applicantName = applicantProfile?.display_name ?? "Someone";
  await service.from("notifications").insert({
    user_id: gigMeta.employer_id,
    kind: "application_received",
    title: `${applicantName} applied for "${gigMeta.title}"`,
    body: "Review their profile and async video responses.",
    link: `/interviews/${app.id}`,
    data: { application_id: app.id, gig_id: gigId },
  });

  const { data: qs } = await supabase
    .from("interview_questions")
    .select("id")
    .eq("gig_id", gigId)
    .limit(1);

  logMatchEvent({ gigId, userId: user.id, event: "apply" });

  return {
    ok: true,
    applicationId: app.id,
    hasQuestions: Boolean(qs && qs.length > 0),
  };
}
