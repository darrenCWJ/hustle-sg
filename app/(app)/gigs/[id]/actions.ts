"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { applyToGigCore } from "@/lib/applications/apply";
import { regenerateGigEmbedding } from "@/lib/ai/match";
import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";
import { logMatchEvent, type MatchEvent } from "@/lib/analytics/match-events";

export async function applyToGig(gigId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/singpass?next=/gigs/${gigId}`);

  // Thin adapter over the shared domain function (Phase 4.1) — the mobile
  // action wraps the same core, so the two surfaces can't drift.
  const cover = String(formData.get("cover_note") ?? "");
  const result = await applyToGigCore(gigId, cover);
  if (!result.ok) return;

  if (result.hasQuestions && result.applicationId && !result.alreadyApplied) {
    redirect(`/interviews/${result.applicationId}`);
  }
  redirect(`/gigs/${gigId}`);
}

export async function closeGig(gigId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };

  // Verify caller is the gig's employer
  const { data: gig } = await supabase
    .from("gigs")
    .select("employer_id, status, title")
    .eq("id", gigId)
    .single();
  if (!gig || gig.employer_id !== user.id) return { ok: false as const, error: "Not authorised" };
  if (gig.status !== "open") return { ok: false as const, error: "Gig is already closed" };

  const service = createServiceClient();

  // Honest outcome (IMPROVEMENT_PLAN.md Phase 3.4): a close with hires is
  // "filled"; a close with none is "closed" (cancelled) — and the rejection
  // notice must not claim the employer "moved forward with other candidates"
  // when nobody was hired.
  const { count: hiredCount } = await service
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("gig_id", gigId)
    .in("status", ["hired", "completed"]);
  const wasFilled = (hiredCount ?? 0) > 0;

  await service
    .from("gigs")
    .update({ status: wasFilled ? "filled" : "closed" })
    .eq("id", gigId);

  // Reject still-pending applications and tell those applicants what happened.
  const { data: pending } = await service
    .from("applications")
    .select("id, applicant_id")
    .eq("gig_id", gigId)
    .in("status", ["applied", "interviewing", "shortlisted", "offered"]);

  if (pending && pending.length > 0) {
    await service
      .from("applications")
      .update({ status: "rejected" })
      .in("id", pending.map((p) => p.id));

    await service.from("notifications").insert(
      pending.map((p) => ({
        user_id: p.applicant_id,
        kind: "application_status_changed",
        title: "Application update",
        body: wasFilled
          ? `"${gig.title}" has been filled — the employer went with other candidates.`
          : `The employer closed "${gig.title}" without hiring. Nothing you did wrong — the gig was cancelled.`,
        link: `/gigs/${gigId}`,
        data: { gig_id: gigId, status: "rejected" },
      })),
    );
  }

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/applicants");
  revalidatePath(`/gigs/${gigId}`);

  return { ok: true as const };
}

const APPLICATION_STATUSES = [
  "interviewing",
  "shortlisted",
  "offered",
  "hired",
  "rejected",
] as const;

export async function updateApplicationStatus(
  applicationId: string,
  status: "interviewing" | "shortlisted" | "offered" | "hired" | "rejected",
) {
  // Server Action params are network-exposed; the TS union is erased at runtime.
  if (!APPLICATION_STATUSES.includes(status)) {
    return { ok: false as const, error: "Invalid status" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };

  // Only the gig's employer may change application status.
  const { data: app } = await supabase
    .from("applications")
    .select("id, gigs!inner(employer_id)")
    .eq("id", applicationId)
    .single();

  const employerId = (app?.gigs as any)?.employer_id;
  if (!app || employerId !== user.id) return { ok: false as const, error: "Not authorised" };

  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId);

  if (error) return { ok: false as const, error: error.message };

  // Auto-close gig when all slots filled
  if (status === "hired") {
    const { data: appWithGig } = await supabase
      .from("applications")
      .select("gig_id, gigs!inner(id, headcount, status)")
      .eq("id", applicationId)
      .single();
    const gigId = (appWithGig?.gigs as any)?.id;
    const headcount = (appWithGig?.gigs as any)?.headcount ?? 1;
    const gigStatus = (appWithGig?.gigs as any)?.status;
    if (gigId && gigStatus === "open") {
      const { count: hiredCount } = await supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("gig_id", gigId)
        .eq("status", "hired");
      if (hiredCount !== null && hiredCount >= headcount) {
        const service = createServiceClient();
        await service.from("gigs").update({ status: "filled" }).eq("id", gigId);
        await service
          .from("applications")
          .update({ status: "rejected" })
          .eq("gig_id", gigId)
          .in("status", ["applied", "interviewing", "offered"]);
      }
    }
  }

  // Notify the applicant of the status change.
  const statusMessages: Record<string, { title: string; body: string }> = {
    interviewing: {
      title: "You've been shortlisted!",
      body: "The employer wants to see your async interview responses.",
    },
    shortlisted: {
      title: "You've been shortlisted!",
      body: "Great news — you've made it to the next round.",
    },
    offered: {
      title: "You received an offer!",
      body: "The employer has sent you a direct offer. Check your application.",
    },
    hired: {
      title: "You got the gig!",
      body: "Congratulations — the employer has confirmed you for this role.",
    },
    rejected: {
      title: "Application update",
      body: "The employer has moved forward with other candidates.",
    },
  };

  const msg = statusMessages[status];
  if (msg) {
    const service = createServiceClient();

    // Fetch the applicant_id and gig title in one query.
    const { data: appRow } = await service
      .from("applications")
      .select("applicant_id, gigs(id, title)")
      .eq("id", applicationId)
      .single();

    if (appRow?.applicant_id) {
      const gigTitle = (appRow.gigs as any)?.title ?? "your gig";
      const gigId = (appRow.gigs as any)?.id;
      await service.from("notifications").insert({
        user_id: appRow.applicant_id,
        kind: "application_status_changed",
        title: msg.title,
        body: `${msg.body} — "${gigTitle}"`,
        link: gigId ? `/gigs/${gigId}` : "/applications",
        data: { application_id: applicationId, status },
      });

      // Phase 6 instrumentation: status transitions are match outcomes.
      const eventByStatus: Partial<Record<string, MatchEvent>> = {
        shortlisted: "shortlist",
        offered: "offer",
        hired: "hire",
        rejected: "reject",
      };
      const event = eventByStatus[status];
      if (event && gigId) {
        logMatchEvent({ gigId, userId: appRow.applicant_id, event });
      }
    }
  }

  return { ok: true as const };
}

const gigEditSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(8000),
  skills_required: z.string().max(600),
  location: z.string().trim().max(200).optional(),
  category: z.string().trim().max(60).optional(),
  budget_sgd: z.coerce.number().min(0).max(1_000_000),
  budget_kind: z.enum(["fixed", "hourly", "project", "milestone"]),
  applications_close_at: z.string().optional(),
});

// Phase 3.4: employers can fix a live posting instead of closing it (which
// rejects every applicant) and re-posting from scratch.
export async function updateGig(gigId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };

  const { data: gig } = await supabase
    .from("gigs")
    .select("employer_id, status")
    .eq("id", gigId)
    .single();
  if (!gig || gig.employer_id !== user.id) return { ok: false as const, error: "Not authorised" };
  if (gig.status !== "open") return { ok: false as const, error: "Only open gigs can be edited" };

  const parsed = gigEditSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    skills_required: String(formData.get("skills_required") ?? ""),
    location: String(formData.get("location") ?? "") || undefined,
    category: String(formData.get("category") ?? "") || undefined,
    budget_sgd: formData.get("budget_sgd") ?? 0,
    budget_kind: formData.get("budget_kind") ?? "fixed",
    applications_close_at: String(formData.get("applications_close_at") ?? "") || undefined,
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Same deadline rules as posting: SGT wall time, now..+90 days.
  let closeAt: string | null = null;
  if (parsed.data.applications_close_at) {
    const d = new Date(`${parsed.data.applications_close_at}:00+08:00`);
    const now = new Date();
    const maxFuture = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    if (isNaN(d.getTime()) || d <= now || d > maxFuture) {
      return { ok: false as const, error: "Deadline must be between now and 90 days from today." };
    }
    closeAt = d.toISOString();
  }

  const skills = parsed.data.skills_required
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 12);

  const { error } = await supabase
    .from("gigs")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      skills_required: skills,
      location: parsed.data.location ?? null,
      category: parsed.data.category ?? null,
      budget_cents: Math.round(parsed.data.budget_sgd * 100),
      budget_kind: parsed.data.budget_kind,
      applications_close_at: closeAt,
    })
    .eq("id", gigId);
  if (error) return { ok: false as const, error: error.message };

  // Edits change the match text; refresh the embedding (paid call, throttled
  // by the same per-user budget as posting).
  const allowed = await checkRateLimit(
    `gig-post:${user.id}`,
    RATE_LIMITS.gigPost.limit,
    RATE_LIMITS.gigPost.windowSeconds,
  );
  if (allowed) {
    regenerateGigEmbedding(gigId).catch((err) =>
      console.error("[gigs] re-embed after edit", err),
    );
  }

  const { revalidatePath } = await import("next/cache");
  revalidatePath(`/gigs/${gigId}`);
  redirect(`/gigs/${gigId}`);
}

// Deleting is only allowed while nobody has applied — after that, applicants
// have skin in the game and the gig must be closed (with notifications) instead.
export async function deleteGig(gigId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };

  const { data: gig } = await supabase
    .from("gigs")
    .select("employer_id")
    .eq("id", gigId)
    .single();
  if (!gig || gig.employer_id !== user.id) return { ok: false as const, error: "Not authorised" };

  const { count } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("gig_id", gigId);
  if ((count ?? 0) > 0) {
    return {
      ok: false as const,
      error: "This gig already has applicants — close it instead so they're notified.",
    };
  }

  const { error } = await supabase.from("gigs").delete().eq("id", gigId);
  if (error) return { ok: false as const, error: error.message };

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/gigs");
  revalidatePath("/applicants");
  redirect("/applicants");
}
