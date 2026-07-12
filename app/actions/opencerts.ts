"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { verifyOpenCertDocument } from "@/lib/certs/opencerts";
import { regenerateUserEmbedding } from "@/lib/ai/match";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { captureServerError } from "@/lib/observability/errors";

const MAX_FILE_BYTES = 2 * 1024 * 1024; // .opencert files are small JSON

function guessKind(issuer: string): "wsq" | "university" | "accreditation" | "other" {
  const lower = issuer.toLowerCase();
  if (/(university|polytechnic|nus|ntu|smu|sutd|sit|suss)/.test(lower)) return "university";
  if (/(wsq|skillsfuture)/.test(lower)) return "wsq";
  return "other";
}

/**
 * Phase 2.1, registry option: upload an OpenCerts (.opencert/.json) file and,
 * if the document's integrity + issuance status + issuer identity all verify,
 * the certification is created ALREADY VERIFIED (method 'opencerts') — no
 * manual review needed, because the document itself is the evidence.
 */
export async function verifyOpenCertUpload(
  formData: FormData,
): Promise<{ ok: boolean; error?: string; title?: string; issuer?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };

  // Verification hits DNS + Ethereum endpoints; throttle per user.
  const allowed = await checkRateLimit(`opencert:${user.id}`, 5, 3600);
  if (!allowed) {
    return { ok: false, error: "Too many verification attempts — try again in an hour." };
  }

  const file = formData.get("opencert");
  if (!(file instanceof File)) return { ok: false, error: "Attach a .opencert or .json file." };
  if (file.size === 0 || file.size > MAX_FILE_BYTES) {
    return { ok: false, error: "File must be a non-empty JSON document under 2 MB." };
  }

  let document: unknown;
  try {
    document = JSON.parse(await file.text());
  } catch {
    return { ok: false, error: "That file isn't valid JSON — export the .opencert file as issued." };
  }

  const result = await verifyOpenCertDocument(document);

  const service = createServiceClient();

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const { summary } = result;
  const { data: cert, error } = await service
    .from("certifications")
    .insert({
      user_id: user.id,
      issuer: summary.issuer,
      title: summary.title,
      kind: guessKind(summary.issuer),
      issued_at: summary.issuedOn,
      verified: true,
      verification_status: "verified",
      verification_method: "opencerts",
      verified_at: new Date().toISOString(),
      extracted_skills: [],
    })
    .select("id")
    .single();

  if (error || !cert) {
    await captureServerError("opencerts.insert", error ?? new Error("no cert row"), {
      userId: user.id,
    });
    return { ok: false, error: "Verified, but saving the certification failed. Try again." };
  }

  await service.from("cert_verification_log").insert({
    certification_id: cert.id,
    method: "opencerts",
    success: true,
    raw_response: {
      checks: summary.checks,
      recipient: summary.recipientName,
      issued_on: summary.issuedOn,
    },
  });

  // Verified certs feed the ranking embedding.
  regenerateUserEmbedding(user.id).catch((err) =>
    captureServerError("opencerts.re-embed", err, { userId: user.id }),
  );

  revalidatePath("/profile/edit");
  return { ok: true, title: summary.title, issuer: summary.issuer };
}
