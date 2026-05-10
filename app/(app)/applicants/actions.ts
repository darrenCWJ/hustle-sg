"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function sendDirectOffer(
  workerId: string,
  gigId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  // Verify caller owns this gig and it's open
  const { data: gig } = await supabase
    .from("gigs")
    .select(
      `id, title, status,
       employer:profiles!gigs_employer_id_fkey(display_name)`,
    )
    .eq("id", gigId)
    .eq("employer_id", user.id)
    .single();

  if (!gig || gig.status !== "open") {
    return { ok: false, error: "Gig not found or not open." };
  }

  const service = createServiceClient();

  const { data: app, error } = await service
    .from("applications")
    .insert({ gig_id: gigId, applicant_id: workerId, status: "offered" })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Worker already has an application for this gig." };
    }
    return { ok: false, error: error.message };
  }

  const employerName = (gig.employer as any)?.display_name ?? "An employer";
  await service.from("notifications").insert({
    user_id: workerId,
    kind: "direct_offer",
    title: `${employerName} sent you a direct offer for "${gig.title}"`,
    body: "Review and accept or decline the offer.",
    link: "/applications",
    data: { application_id: app.id, gig_id: gigId },
  });

  return { ok: true };
}
