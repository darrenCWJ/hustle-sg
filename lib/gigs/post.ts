import { createClient, createServiceClient } from "@/lib/supabase/server";
import { regenerateGigEmbedding } from "@/lib/ai/match";
import { notifyMatchedFreelancers } from "@/lib/push/notify";
import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";

export interface PostGigInput {
  title: string;
  description: string;
  skills: string[];
  location?: string | null;
  category?: string | null;
  budgetCents: number;
  budgetKind: "fixed" | "hourly";
  requiresEmployerApproval?: boolean;
  isInstant?: boolean;
  instantUrgency?: "now" | "today" | "weekend" | null;
  headcount?: number;
  applicationsCloseAt?: string | null; // ISO, pre-validated by the caller
  startsAt?: string | null;
  endsAt?: string | null;
  durationLabel?: string | null;
  hoursRequired?: number | null;
  recurrenceCadence?: string | null;
  milestones?: unknown[];
  startTime?: string | null;
  endTime?: string | null;
  daysOfWeek?: number[];
  questions?: string[];
  rehireWorkerIds?: string[];
}

export type PostGigResult =
  | { ok: true; gigId: string }
  | { ok: false; error: string };

/**
 * Single source of truth for posting a gig (Phase 4.1). The desktop and
 * mobile actions parse their own forms and redirect to their own surfaces;
 * everything else — auth, role, rate limit, insert, interview questions,
 * embedding, push fan-out, rehire offers — lives here. The previous mobile
 * implementation had drifted: no skills, no questions, no rate limit, and
 * errors swallowed without logging.
 */
export async function postGigCore(input: PostGigInput): Promise<PostGigResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Log in as an employer first." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role === "freelancer") {
    // Posting from a freelancer account upgrades it to both-sided below —
    // but only via the explicit posting flows, which set this expectation.
  }

  // Posting triggers a paid embedding call + push fan-out; throttle per user.
  const allowed = await checkRateLimit(
    `gig-post:${user.id}`,
    RATE_LIMITS.gigPost.limit,
    RATE_LIMITS.gigPost.windowSeconds,
  );
  if (!allowed) {
    return { ok: false, error: "You're posting too quickly. Please try again later." };
  }

  // Ensure employer role
  await supabase
    .from("profiles")
    .update({ role: "both" })
    .eq("id", user.id)
    .eq("role", "freelancer");

  const isInstant = Boolean(input.isInstant);
  const { data: gig, error } = await supabase
    .from("gigs")
    .insert({
      employer_id: user.id,
      title: input.title,
      description: input.description,
      skills_required: input.skills.map((s) => s.trim().toLowerCase()).filter(Boolean).slice(0, 12),
      location: input.location ?? null,
      category: input.category ?? null,
      budget_cents: input.budgetCents,
      budget_kind: input.budgetKind,
      status: "open",
      requires_employer_approval: input.requiresEmployerApproval ?? true,
      is_instant: isInstant,
      instant_urgency: isInstant ? (input.instantUrgency ?? "today") : null,
      headcount: input.headcount ?? 1,
      applications_close_at: input.applicationsCloseAt ?? null,
      starts_at: input.startsAt ?? null,
      ends_at: input.endsAt ?? null,
      duration_label: input.durationLabel ?? null,
      hours_required: input.hoursRequired ?? null,
      recurrence_cadence: input.recurrenceCadence ?? null,
      milestones: (input.milestones ?? []) as never,
      start_time: input.startTime ?? null,
      end_time: input.endTime ?? null,
      days_of_week: input.daysOfWeek ?? [],
    })
    .select("id, title")
    .single();

  if (error || !gig) {
    console.error("[gigs] postGigCore insert", error);
    return { ok: false, error: error?.message ?? "Failed to post." };
  }

  const questions = (input.questions ?? []).map((q) => q.trim()).filter(Boolean).slice(0, 3);
  if (questions.length > 0) {
    const { error: qErr } = await supabase.from("interview_questions").insert(
      questions.map((prompt, i) => ({
        gig_id: gig.id,
        prompt,
        max_duration_sec: 90,
        display_order: i,
      })),
    );
    if (qErr) console.error("[gigs] postGigCore questions", qErr);
  }

  // Await embedding so match_users_for_gig sees the vector before notifying.
  await regenerateGigEmbedding(gig.id).catch((err) =>
    console.error("[gigs] postGigCore embed", err),
  );
  notifyMatchedFreelancers(gig.id).catch((err) =>
    console.error("[gigs] postGigCore notify", err),
  );

  // Send direct offers to any selected previous hires.
  const rehireIds = (input.rehireWorkerIds ?? []).filter(Boolean);
  if (rehireIds.length > 0) {
    const service = createServiceClient();
    const { data: employer } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    const employerName = employer?.display_name ?? "An employer";
    await Promise.all(
      rehireIds.map(async (workerId) => {
        const { data: app, error: offerErr } = await service
          .from("applications")
          .insert({ gig_id: gig.id, applicant_id: workerId, status: "offered" })
          .select("id")
          .single();
        if (!offerErr && app) {
          await service.from("notifications").insert({
            user_id: workerId,
            kind: "direct_offer",
            title: `${employerName} sent you a direct offer for "${gig.title}"`,
            body: "Review and accept or decline the offer.",
            link: "/applications",
            data: { application_id: app.id, gig_id: gig.id },
          });
        }
      }),
    );
  }

  return { ok: true, gigId: gig.id };
}
