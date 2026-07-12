"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { postGigCore } from "@/lib/gigs/post";
import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";

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
  headcount: z.coerce.number().int().min(1).max(50).optional(),
});

export async function postGig(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Log in as an employer first." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role === "freelancer") return { ok: false as const, error: "Switch your role to Employer to post assignments." };

  // Rate limiting lives in postGigCore — one hit per post across surfaces.
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
    headcount: (formData.get("headcount") as string) || undefined,
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

  // Shared domain function (Phase 4.1) — mobile posting wraps the same core.
  const result = await postGigCore({
    title: parsed.data.title,
    description: parsed.data.description,
    skills: parsed.data.skills_required.split(","),
    location: parsed.data.location ?? null,
    category: parsed.data.category ?? null,
    budgetCents: Math.round(parsed.data.budget_sgd * 100),
    budgetKind: parsed.data.budget_kind,
    requiresEmployerApproval: parsed.data.requires_employer_approval === "true",
    isInstant: parsed.data.is_instant === "true",
    instantUrgency:
      parsed.data.is_instant === "true" &&
      (["now", "today", "weekend"] as const).includes(parsed.data.instant_urgency as never)
        ? (parsed.data.instant_urgency as "now" | "today" | "weekend")
        : null,
    headcount: parsed.data.headcount ?? 1,
    applicationsCloseAt: closeAt?.toISOString() ?? null,
    startsAt: parsed.data.starts_at || null,
    endsAt: parsed.data.ends_at || null,
    durationLabel: parsed.data.duration_label || null,
    hoursRequired: parsed.data.hours_required ?? null,
    recurrenceCadence: parsed.data.recurrence_cadence || null,
    milestones: parsed.data.milestones_json
      ? (() => { try { return JSON.parse(parsed.data.milestones_json!); } catch { return []; } })()
      : [],
    startTime: parsed.data.start_time || null,
    endTime: parsed.data.end_time || null,
    daysOfWeek: parsed.data.days_of_week
      ? parsed.data.days_of_week.split(",").map(Number).filter(n => !isNaN(n) && n >= 0 && n <= 6)
      : [],
    questions: String(parsed.data.questions ?? "").split("\n"),
    rehireWorkerIds: formData.getAll("rehire_worker_ids").map(String),
  });

  if (!result.ok) return { ok: false as const, error: result.error };
  redirect(`/gigs/${result.gigId}`);
}

export async function suggestSkills(
  title: string,
  description: string,
): Promise<string[]> {
  if (!title.trim() && !description.trim()) return [];

  // Requires auth + throttle: this hits a paid Claude endpoint (finding M4).
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const allowed = await checkRateLimit(
    `skill-suggest:${user.id}`,
    RATE_LIMITS.skillSuggest.limit,
    RATE_LIMITS.skillSuggest.windowSeconds,
  );
  if (!allowed) return [];

  if (!process.env.ANTHROPIC_API_KEY) return [];
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic();
  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `Suggest 6-8 specific, concise skills for a freelance gig with this title and description. Return ONLY a JSON array of short skill strings (2–4 words max each), nothing else.

Title: ${title.slice(0, 200)}
Description: ${description.slice(0, 800)}`,
      },
    ],
  });
  const text = ((msg.content[0] as { type: string; text: string }).text ?? "").trim();
  const match = text.match(/\[[\s\S]*?\]/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === "string").slice(0, 10);
  } catch {
    return [];
  }
}
