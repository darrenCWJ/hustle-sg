"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const disputeSchema = z.object({
  applicationId: z.string().uuid(),
  reason: z.enum(["non_payment", "work_quality", "no_show", "scope_change", "conduct", "other"]),
  details: z.string().trim().min(20, "Please describe what happened (at least 20 characters).").max(4000),
});

export type DisputeInput = z.infer<typeof disputeSchema>;

export async function openDispute(
  input: DisputeInput,
): Promise<{ ok: boolean; error?: string; alreadyOpen?: boolean }> {
  const parsed = disputeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid dispute" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };

  // Disputes attach to work that actually started: hired or completed only.
  const { data: app } = await supabase
    .from("applications")
    .select("id, status, applicant_id, gigs(employer_id, title)")
    .eq("id", parsed.data.applicationId)
    .single();
  if (!app) return { ok: false, error: "Application not found." };
  if (app.status !== "hired" && app.status !== "completed") {
    return { ok: false, error: "Disputes can only be opened on hired or completed gigs." };
  }

  const gig = app.gigs as unknown as { employer_id: string; title: string } | null;
  const isApplicant = app.applicant_id === user.id;
  const isEmployer = gig?.employer_id === user.id;
  if (!isApplicant && !isEmployer) return { ok: false, error: "Not your gig." };

  const { error } = await supabase.from("disputes").insert({
    application_id: parsed.data.applicationId,
    opened_by: user.id,
    reason: parsed.data.reason,
    details: parsed.data.details,
  });

  if (error) {
    if (error.code === "23505") return { ok: true, alreadyOpen: true };
    console.error("[disputes] openDispute", error);
    return { ok: false, error: "Could not open the dispute. Try again." };
  }

  // Tell the other party a dispute exists on this gig.
  const otherPartyId = isEmployer ? app.applicant_id : gig!.employer_id;
  const service = createServiceClient();
  await service.from("notifications").insert({
    user_id: otherPartyId,
    kind: "application_status_changed",
    title: `A dispute was opened on "${gig?.title ?? "a gig"}"`,
    body: "Our team will review it and may contact both sides. You can view the status any time.",
    link: `/disputes/${parsed.data.applicationId}`,
    data: { application_id: parsed.data.applicationId, kind: "dispute_opened" },
  });

  revalidatePath(`/disputes/${parsed.data.applicationId}`);
  return { ok: true };
}
