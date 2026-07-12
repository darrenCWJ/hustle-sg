"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const reportSchema = z.object({
  targetKind: z.enum(["user", "gig", "rating"]),
  targetId: z.string().uuid(),
  reason: z.enum(["scam", "harassment", "fake_listing", "inappropriate", "spam", "other"]),
  details: z.string().trim().max(2000),
});

export type ReportInput = z.infer<typeof reportSchema>;

export async function submitReport(
  input: ReportInput,
): Promise<{ ok: boolean; error?: string; alreadyReported?: boolean }> {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid report" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to report." };

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_kind: parsed.data.targetKind,
    target_id: parsed.data.targetId,
    reason: parsed.data.reason,
    details: parsed.data.details,
  });

  if (error) {
    // Unique violation: this reporter already reported this target — treat as
    // success so the UI reads "received" instead of leaking constraint noise.
    if (error.code === "23505") return { ok: true, alreadyReported: true };
    console.error("[safety] submitReport", error);
    return { ok: false, error: "Could not submit the report. Try again." };
  }
  return { ok: true };
}

export async function blockUser(blockedId: string): Promise<{ ok: boolean; error?: string }> {
  if (!z.string().uuid().safeParse(blockedId).success) {
    return { ok: false, error: "Invalid user" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };
  if (user.id === blockedId) return { ok: false, error: "You can't block yourself." };

  const { error } = await supabase
    .from("blocks")
    .upsert({ blocker_id: user.id, blocked_id: blockedId });
  if (error) {
    console.error("[safety] blockUser", error);
    return { ok: false, error: "Could not block this user. Try again." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function unblockUser(blockedId: string): Promise<{ ok: boolean; error?: string }> {
  if (!z.string().uuid().safeParse(blockedId).success) {
    return { ok: false, error: "Invalid user" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };

  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", blockedId);
  if (error) {
    console.error("[safety] unblockUser", error);
    return { ok: false, error: "Could not unblock this user. Try again." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
