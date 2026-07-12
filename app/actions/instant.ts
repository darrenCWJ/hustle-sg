"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyInstantGigPosted } from "@/lib/push/notify";
import { buildGigEmbeddingText, generateEmbedding } from "@/lib/ai/embeddings";
import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";

const instantGigSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(4000),
  skills: z.array(z.string().trim().min(1)).max(20),
  urgency: z.enum(["now", "today", "weekend"]),
  location: z.string().trim().max(200),
  lat: z.number().min(-90).max(90).nullable(),
  lon: z.number().min(-180).max(180).nullable(),
  budgetCents: z.number().int().min(0).max(100_000_000),
  budgetKind: z.enum(["fixed", "hourly"]),
  category: z.string().trim().max(60),
});

export interface InstantGigRow {
  id: string;
  title: string;
  description: string;
  location: string;
  lat: number | null;
  lon: number | null;
  budget_cents: number;
  budget_kind: "fixed" | "hourly";
  instant_urgency: "now" | "today" | "weekend";
  skills_required: string[];
  duration_label: string | null;
  hours_required: number | null;
  start_time: string | null;
  end_time: string | null;
  employerName: string;
  score: number;
}

function sgtStartOfDayUTC(): Date {
  const SGT = 8 * 3600000;
  const now = new Date();
  const sgtNow = new Date(now.getTime() + SGT);
  return new Date(
    Date.UTC(sgtNow.getUTCFullYear(), sgtNow.getUTCMonth(), sgtNow.getUTCDate()) - SGT
  );
}

export async function fetchTodayInstantGigs(userId?: string): Promise<InstantGigRow[]> {
  const service = createServiceClient();

  const sgtMidnight = sgtStartOfDayUTC();
  const sgtEndOfDay = new Date(sgtMidnight.getTime() + 24 * 3600000);

  const { data: gigs, error } = await service
    .from("gigs")
    .select("id, title, description, location, lat, lon, budget_cents, budget_kind, instant_urgency, skills_required, duration_label, hours_required, start_time, end_time, employer_id")
    .eq("is_instant", true)
    .eq("status", "open")
    .or(
      `start_at.is.null,and(start_at.gte.${sgtMidnight.toISOString()},start_at.lt.${sgtEndOfDay.toISOString()})`,
    )
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("[instant] fetchTodayInstantGigs", error);
    return [];
  }

  // Fetch employer display names
  const employerIds = [...new Set(gigs.map((g) => g.employer_id))];
  const { data: profiles } = await service
    .from("profiles")
    .select("id, display_name")
    .in("id", employerIds);

  const nameMap: Record<string, string> = {};
  for (const p of profiles ?? []) {
    nameMap[p.id] = p.display_name;
  }

  const scoreMap: Record<string, number> = {};
  if (userId) {
    const { data: matches } = await service.rpc("match_instant_gigs_for_user", {
      p_user_id: userId,
      p_day_start: sgtMidnight.toISOString(),
      p_day_end: sgtEndOfDay.toISOString(),
      p_limit: 50,
    });
    for (const m of (matches ?? []) as Array<{ gig_id: string; score: number }>) {
      scoreMap[m.gig_id] = m.score;
    }
  }

  const rows = gigs.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description ?? "",
    location: g.location ?? "",
    lat: g.lat,
    lon: g.lon,
    budget_cents: g.budget_cents ?? 0,
    budget_kind: (g.budget_kind === "hourly" ? "hourly" : "fixed") as "fixed" | "hourly",
    instant_urgency: (g.instant_urgency === "now" || g.instant_urgency === "weekend"
      ? g.instant_urgency
      : "today") as "now" | "today" | "weekend",
    skills_required: g.skills_required ?? [],
    duration_label: g.duration_label ?? null,
    hours_required: g.hours_required ?? null,
    start_time: g.start_time ?? null,
    end_time: g.end_time ?? null,
    employerName: nameMap[g.employer_id] ?? "Employer",
    score: scoreMap[g.id] ?? 0.5,
  }));

  if (userId) {
    rows.sort((a, b) => b.score - a.score);
  }

  return rows;
}

export async function createInstantGig(formData: FormData): Promise<{ ok: boolean; error?: string; gigId?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to post gigs." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "employer" && profile.role !== "both")) {
    return { ok: false, error: "Only employers can post instant gigs." };
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

  const skillsRaw = String(formData.get("skills") ?? "");
  const latRaw = formData.get("lat");
  const lonRaw = formData.get("lon");

  const parsed = instantGigSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    skills: skillsRaw.split(",").map((s) => s.trim()).filter(Boolean),
    urgency: formData.get("urgency") ?? "today",
    location: String(formData.get("location") ?? ""),
    lat: latRaw ? Number(latRaw) : null,
    lon: lonRaw ? Number(lonRaw) : null,
    budgetCents: Math.round(Number(formData.get("budget_cents") ?? 0)),
    budgetKind: formData.get("budget_kind") ?? "fixed",
    category: String(formData.get("category") ?? "other"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const {
    title, description, skills, urgency, location, lat, lon, budgetCents, budgetKind, category,
  } = parsed.data;

  const startOffset = urgency === "now" ? 0 : urgency === "today" ? 4 : 48;
  const startAt = new Date(Date.now() + startOffset * 3600000).toISOString();

  const embeddingText = buildGigEmbeddingText({ title, description, skills, category });
  const embedding = await generateEmbedding(embeddingText);

  const service = createServiceClient();
  const { data: gig, error } = await service
    .from("gigs")
    .insert({
      employer_id: user.id,
      title,
      description,
      skills_required: skills,
      category,
      location,
      lat,
      lon,
      budget_cents: budgetCents,
      budget_kind: budgetKind,
      status: "open",
      is_instant: true,
      requires_employer_approval: false,
      instant_urgency: urgency,
      start_at: startAt,
      embedding: JSON.stringify(embedding),
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  // Notify matched freelancers asynchronously (don't block UI)
  notifyInstantGigPosted(gig.id).catch((err) => {
    console.error("[instant] notifyInstantGigPosted", err);
  });

  return { ok: true, gigId: gig.id };
}
