"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveRole(role: "freelancer" | "employer" | "both") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const };

  await supabase
    .from("profiles")
    .update({ role })
    .eq("id", user.id);

  return { ok: true as const };
}
