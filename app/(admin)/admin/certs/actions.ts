"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/server";
import { regenerateUserEmbedding } from "@/lib/ai/match";

export async function approveCertification(
  certId: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Not authorised" };
  if (!z.string().uuid().safeParse(certId).success) return { ok: false, error: "Invalid id" };

  const service = createServiceClient();
  const { data: cert, error } = await service
    .from("certifications")
    .update({
      verified: true,
      verification_status: "verified",
      verification_method: "manual",
      verified_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq("id", certId)
    .eq("verification_status", "pending")
    .select("user_id")
    .single();

  if (error || !cert) {
    console.error("[admin] approveCertification", error);
    return { ok: false, error: "Approve failed (already reviewed?)" };
  }

  await service.from("cert_verification_log").insert({
    certification_id: certId,
    method: "manual",
    success: true,
    raw_response: { admin_id: admin.id, action: "approved" },
  });

  // Verified certs feed the ranking embedding — refresh it so the badge counts.
  regenerateUserEmbedding(cert.user_id).catch((err) =>
    console.error("[admin] re-embed after approve", err),
  );

  revalidatePath("/admin/certs");
  revalidatePath("/admin");
  return { ok: true };
}

export async function rejectCertification(
  certId: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Not authorised" };
  if (!z.string().uuid().safeParse(certId).success) return { ok: false, error: "Invalid id" };

  const trimmedReason = reason.trim().slice(0, 500) || "Could not verify with the stated issuer.";

  const service = createServiceClient();
  const { error } = await service
    .from("certifications")
    .update({
      verified: false,
      verification_status: "rejected",
      verification_method: "manual",
      verified_at: null,
      rejection_reason: trimmedReason,
    })
    .eq("id", certId)
    .eq("verification_status", "pending");

  if (error) {
    console.error("[admin] rejectCertification", error);
    return { ok: false, error: "Reject failed" };
  }

  await service.from("cert_verification_log").insert({
    certification_id: certId,
    method: "manual",
    success: false,
    raw_response: { admin_id: admin.id, action: "rejected", reason: trimmedReason },
  });

  revalidatePath("/admin/certs");
  revalidatePath("/admin");
  return { ok: true };
}
