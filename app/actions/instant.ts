"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyInstantGigPosted } from "@/lib/push/notify";
import { buildGigEmbeddingText, generateEmbedding } from "@/lib/ai/embeddings";

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

  if (error) return [];

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
    location: g.location,
    lat: g.lat,
    lon: g.lon,
    budget_cents: g.budget_cents,
    budget_kind: g.budget_kind,
    instant_urgency: g.instant_urgency,
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

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const skillsRaw = formData.get("skills") as string;
  const urgency = formData.get("urgency") as "now" | "today" | "weekend";
  const location = formData.get("location") as string;
  const lat = formData.get("lat") ? Number(formData.get("lat")) : null;
  const lon = formData.get("lon") ? Number(formData.get("lon")) : null;
  const budgetCents = Math.round(Number(formData.get("budget_cents") ?? 0));
  const budgetKind = (formData.get("budget_kind") ?? "fixed") as "fixed" | "hourly";
  const category = (formData.get("category") ?? "other") as string;

  if (!title?.trim() || !description?.trim()) {
    return { ok: false, error: "Title and description are required." };
  }

  const skills = skillsRaw
    ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

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
  notifyInstantGigPosted(gig.id).catch(() => {});

  return { ok: true, gigId: gig.id };
}
