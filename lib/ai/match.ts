import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { MatchGigRow } from "@/lib/supabase/types";
import {
  buildGigEmbeddingText,
  buildProfileEmbeddingText,
  generateEmbedding,
} from "./embeddings";

export interface MatchedGig extends MatchGigRow {
  overlap_skills: string[];
  employer_display_name?: string | null;
}

export async function matchGigsForUser(
  userId: string,
  limit = 20,
): Promise<MatchedGig[]> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("embedding")
    .eq("id", userId)
    .single();

  const profileSkills = await collectUserSkills(userId);

  const { data, error } = await supabase.rpc("match_gigs_for_user", {
    p_user_id: userId,
    p_limit: limit,
  });
  if (error) throw error;
  if (!data || !profile) return [];

  const rows = data as MatchGigRow[];
  const employerIds = Array.from(new Set(rows.map((r) => r.employer_id)));
  const { data: employers } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", employerIds);

  const employerMap = new Map((employers ?? []).map((e) => [e.id, e.display_name]));

  return rows.map((r) => {
    const overlap = (r.skills_required ?? []).filter((s) =>
      profileSkills.has(s.toLowerCase()),
    );
    return {
      ...r,
      overlap_skills: overlap,
      employer_display_name: employerMap.get(r.employer_id) ?? null,
    };
  });
}

async function collectUserSkills(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const [{ data: certs }, { data: items }] = await Promise.all([
    supabase.from("certifications").select("extracted_skills").eq("user_id", userId),
    supabase.from("portfolio_items").select("tags").eq("user_id", userId),
  ]);

  const out = new Set<string>();
  for (const c of certs ?? []) {
    for (const s of c.extracted_skills ?? []) out.add(s.toLowerCase());
  }
  for (const p of items ?? []) {
    for (const t of p.tags ?? []) out.add(t.toLowerCase());
  }
  return out;
}

export async function regenerateUserEmbedding(userId: string): Promise<void> {
  const admin = createServiceClient();

  // Only verified certs are used — unverified ones and portfolio items can be
  // freely typed by anyone and would let users game their position in vector space.
  const [{ data: profile }, { data: certs }] = await Promise.all([
    admin.from("profiles").select("headline, bio").eq("id", userId).single(),
    admin
      .from("certifications")
      .select("title, extracted_skills")
      .eq("user_id", userId)
      .eq("verified", true),
  ]);

  const text = buildProfileEmbeddingText({
    headline: profile?.headline,
    bio: profile?.bio,
    certTitles: (certs ?? []).map((c: any) => c.title),
    extractedSkills: (certs ?? []).flatMap((c: any) => c.extracted_skills ?? []),
  });

  const vector = await generateEmbedding(text || " ");
  await admin.from("profiles").update({ embedding: vector as any }).eq("id", userId);
}

export async function regenerateGigEmbedding(gigId: string): Promise<void> {
  const admin = createServiceClient();

  const { data: gig } = await admin
    .from("gigs")
    .select("title, description, skills_required, category")
    .eq("id", gigId)
    .single();

  if (!gig) return;

  const text = buildGigEmbeddingText({
    title: gig.title,
    description: gig.description,
    skills: gig.skills_required ?? [],
    category: gig.category,
  });

  const vector = await generateEmbedding(text);
  await admin.from("gigs").update({ embedding: vector as any }).eq("id", gigId);
}
