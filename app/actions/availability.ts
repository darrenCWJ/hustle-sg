"use server";

import { createClient } from "@/lib/supabase/server";

export async function loadAvailability(): Promise<number[][] | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_availability")
    .select("slots")
    .eq("user_id", user.id)
    .maybeSingle();

  return data?.slots ?? null;
}

export async function saveAvailability(slots: number[][]): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("user_availability")
    .upsert({ user_id: user.id, slots }, { onConflict: "user_id" });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function loadBookedSlots(): Promise<Array<{ col: number; row: number }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Find all hired applications with a start/schedule — for now we return empty
  // as the gig scheduling feature is future work. The calendar renders these as value=2.
  return [];
}
