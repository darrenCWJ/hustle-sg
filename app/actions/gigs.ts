"use server";

import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function acceptInstantGig(gigId: string): Promise<{ ok: boolean; error?: string; applicationId?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to accept gigs." };

  // Demo data: hardcoded gigs have non-UUID ids — simulate success
  if (!UUID_RE.test(gigId)) {
    return { ok: true };
  }

  const { data, error } = await supabase.rpc("accept_instant_gig", {
    p_gig_id:  gigId,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true, applicationId: (data as any)?.application_id };
}

export async function toggleSavedGig(gigId: string): Promise<{ saved: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { saved: false, error: "Sign in to save gigs." };

  const { data: existing } = await supabase
    .from("saved_gigs")
    .select("id")
    .eq("user_id", user.id)
    .eq("gig_id", gigId)
    .maybeSingle();

  if (existing) {
    await supabase.from("saved_gigs").delete().eq("id", existing.id);
    return { saved: false };
  }

  await supabase.from("saved_gigs").insert({ user_id: user.id, gig_id: gigId });
  return { saved: true };
}

export async function loadSavedGigIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("saved_gigs")
    .select("gig_id")
    .eq("user_id", user.id);

  return (data ?? []).map((r: any) => r.gig_id);
}
