"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/server";

export async function startDisputeReview(
  disputeId: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Not authorised" };
  if (!z.string().uuid().safeParse(disputeId).success) return { ok: false, error: "Invalid id" };

  const service = createServiceClient();
  const { error } = await service
    .from("disputes")
    .update({ status: "under_review" })
    .eq("id", disputeId)
    .eq("status", "open");

  if (error) {
    console.error("[admin] startDisputeReview", error);
    return { ok: false, error: "Update failed" };
  }
  revalidatePath("/admin/disputes");
  revalidatePath("/admin");
  return { ok: true };
}

export async function resolveDispute(
  disputeId: string,
  resolutionNote: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Not authorised" };
  if (!z.string().uuid().safeParse(disputeId).success) return { ok: false, error: "Invalid id" };

  const note = resolutionNote.trim().slice(0, 2000);
  if (note.length < 5) return { ok: false, error: "Write a short resolution note first." };

  const service = createServiceClient();
  const { data: dispute, error } = await service
    .from("disputes")
    .update({
      status: "resolved",
      resolution_note: note,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", disputeId)
    .neq("status", "resolved")
    .select("application_id, opened_by")
    .single();

  if (error || !dispute) {
    console.error("[admin] resolveDispute", error);
    return { ok: false, error: "Resolve failed (already resolved?)" };
  }

  // Notify both parties of the outcome.
  const { data: app } = await service
    .from("applications")
    .select("applicant_id, gigs(employer_id, title)")
    .eq("id", dispute.application_id)
    .single();
  if (app) {
    const gig = app.gigs as unknown as { employer_id: string; title: string } | null;
    const recipients = [app.applicant_id, gig?.employer_id].filter(
      (id): id is string => Boolean(id),
    );
    await service.from("notifications").insert(
      recipients.map((userId) => ({
        user_id: userId,
        kind: "application_status_changed",
        title: `Dispute resolved — "${gig?.title ?? "Gig"}"`,
        body: note,
        link: `/disputes/${dispute.application_id}`,
        data: { application_id: dispute.application_id, kind: "dispute_resolved" },
      })),
    );
  }

  revalidatePath("/admin/disputes");
  revalidatePath("/admin");
  return { ok: true };
}
