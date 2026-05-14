"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { regenerateGigEmbedding } from "@/lib/ai/match";
import { notifyMatchedFreelancers } from "@/lib/push/notify";

const gigSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(20).max(4000),
  skills_required: z.string(),
  location: z.string().max(80).optional(),
  category: z.string().max(40).optional(),
  budget_sgd: z.coerce.number().positive().max(100_000),
  budget_kind: z.enum(["fixed", "hourly"]),
  questions: z.string().optional(),
  requires_employer_approval: z.string().optional(),
  is_instant: z.string().optional(),
  instant_urgency: z.string().optional(),
  applications_close_at: z.string().optional(),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  duration_label: z.string().optional(),
  hours_required: z.coerce.number().int().min(1).max(23).optional(),
  recurrence_cadence: z.string().max(40).optional(),
  milestones_json: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  days_of_week: z.string().optional(),
});

export async function postGig(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Log in as an employer first." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role === "freelancer") return { ok: false as const, error: "Switch your role to Employer to post assignments." };

  const parsed = gigSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    skills_required: formData.get("skills_required") ?? "",
    location: formData.get("location") ?? undefined,
    category: formData.get("category") ?? undefined,
    budget_sgd: formData.get("budget_sgd") ?? 0,
    budget_kind: formData.get("budget_kind"),
    questions: formData.get("questions") ?? "",
    requires_employer_approval: (formData.get("requires_employer_approval") as string) ?? undefined,
    is_instant: (formData.get("is_instant") as string) ?? undefined,
    instant_urgency: (formData.get("instant_urgency") as string) ?? undefined,
    applications_close_at: (formData.get("applications_close_at") as string) || undefined,
    starts_at: (formData.get("starts_at") as string) || undefined,
    ends_at: (formData.get("ends_at") as string) || undefined,
    duration_label: (formData.get("duration_label") as string) || undefined,
    hours_required: (formData.get("hours_required") as string) || undefined,
    recurrence_cadence: (formData.get("recurrence_cadence") as string) || undefined,
    milestones_json: (formData.get("milestones_json") as string) || undefined,
    start_time: (formData.get("start_time") as string) || undefined,
    end_time: (formData.get("end_time") as string) || undefined,
    days_of_week: (formData.get("days_of_week") as string) || undefined,
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }

  // Parse deadline — datetime-local has no tz; platform is SGT (UTC+8, no DST).
  let closeAt: Date | null = null;
  if (parsed.data.is_instant !== "true" && parsed.data.applications_close_at) {
    closeAt = new Date(`${parsed.data.applications_close_at}:00+08:00`);
    const now = new Date();
    const maxFuture = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    if (isNaN(closeAt.getTime()) || closeAt <= now || closeAt > maxFuture) {
      return { ok: false as const, error: "Deadline must be between now and 90 days from today." };
    }
  }

  const skills = parsed.data.skills_required
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 12);

  // Ensure employer role
  await supabase
    .from("profiles")
    .update({ role: "both" })
    .eq("id", user.id)
    .eq("role", "freelancer");

  const { data: gig, error } = await supabase
    .from("gigs")
    .insert({
      employer_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      skills_required: skills,
      location: parsed.data.location ?? null,
      category: parsed.data.category ?? null,
      budget_cents: Math.round(parsed.data.budget_sgd * 100),
      budget_kind: parsed.data.budget_kind,
      status: "open",
      requires_employer_approval: parsed.data.requires_employer_approval === "true",
      is_instant: parsed.data.is_instant === "true",
      instant_urgency: parsed.data.is_instant === "true" && parsed.data.instant_urgency
        ? parsed.data.instant_urgency
        : null,
      applications_close_at: closeAt?.toISOString() ?? null,
      starts_at: parsed.data.starts_at || null,
      ends_at: parsed.data.ends_at || null,
      duration_label: parsed.data.duration_label || null,
      hours_required: parsed.data.hours_required ?? null,
      recurrence_cadence: parsed.data.recurrence_cadence || null,
      milestones: parsed.data.milestones_json
        ? (() => { try { return JSON.parse(parsed.data.milestones_json!); } catch { return []; } })()
        : [],
      start_time: parsed.data.start_time || null,
      end_time: parsed.data.end_time || null,
      days_of_week: parsed.data.days_of_week
        ? parsed.data.days_of_week.split(",").map(Number).filter(n => !isNaN(n) && n >= 0 && n <= 6)
        : [],
    })
    .select()
    .single();

  if (error || !gig) return { ok: false as const, error: error?.message ?? "Failed" };

  const questions = String(parsed.data.questions ?? "")
    .split("\n")
    .map((q) => q.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (questions.length > 0) {
    await supabase.from("interview_questions").insert(
      questions.map((prompt, i) => ({
        gig_id: gig.id,
        prompt,
        max_duration_sec: 90,
        display_order: i,
      })),
    );
  }

  // Await embedding so match_users_for_gig sees the vector before notifying.
  await regenerateGigEmbedding(gig.id).catch(() => {});
  notifyMatchedFreelancers(gig.id).catch(() => {});

  // Send direct offers to any selected previous hires.
  const rehireIds = formData.getAll("rehire_worker_ids").map(String).filter(Boolean);
  if (rehireIds.length > 0) {
    const service = createServiceClient();
    const { data: employer } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
    const employerName = employer?.display_name ?? "An employer";
    await Promise.all(
      rehireIds.map(async (workerId) => {
        const { data: app, error } = await service
          .from("applications")
          .insert({ gig_id: gig.id, applicant_id: workerId, status: "offered" })
          .select("id")
          .single();
        if (!error && app) {
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

  redirect(`/gigs/${gig.id}`);
}
