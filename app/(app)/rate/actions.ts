"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const ratingSchema = z.object({
  applicationId: z.string().uuid(),
  stars: z.number().int().min(1).max(5),
  review: z.string().max(1000),
});

export async function submitRating(
  applicationId: string,
  stars: number,
  review: string,
): Promise<{ error?: string }> {
  const parsed = ratingSchema.safeParse({ applicationId, stars, review });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid rating" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Fetch the application — caller must be applicant or employer of this gig
  const { data: app } = await supabase
    .from("applications")
    .select("id, gig_id, applicant_id, status, gigs(employer_id, title)")
    .eq("id", applicationId)
    .eq("status", "completed")
    .single();

  if (!app) return { error: "Application not found or not yet completed" };

  const gig = app.gigs as any;
  const isApplicant = app.applicant_id === user.id;
  const isEmployer = gig?.employer_id === user.id;
  if (!isApplicant && !isEmployer) return { error: "Not authorized" };

  const toId = isEmployer ? app.applicant_id : gig.employer_id;

  const { error } = await supabase.from("ratings").insert({
    application_id: applicationId,
    gig_id: app.gig_id,
    from_id: user.id,
    to_id: toId,
    stars,
    review,
  });

  if (error?.code === "23505") return { error: "Already rated" };
  if (error) return { error: error.message };

  revalidatePath("/applications");
  revalidatePath("/applicants");
  return {};
}

export async function markCompleted(applicationId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Either party can close out a hired gig (Phase 2.2): completion — and the
  // review loop it unlocks — must not be unilaterally gated by the employer.
  const { data: app } = await supabase
    .from("applications")
    .select("id, gig_id, applicant_id, gigs(employer_id, title)")
    .eq("id", applicationId)
    .eq("status", "hired")
    .single();

  if (!app) return;
  const gig = app.gigs as any;
  const isApplicant = app.applicant_id === user.id;
  const isEmployer = gig?.employer_id === user.id;
  if (!isApplicant && !isEmployer) return;

  const { error } = await supabase
    .from("applications")
    .update({ status: "completed" })
    .eq("id", applicationId)
    .eq("status", "hired");
  if (error) {
    console.error("[rate] markCompleted", error);
    return;
  }

  // Prompt the other party to leave their (double-blind) review.
  const otherPartyId = isEmployer ? app.applicant_id : gig.employer_id;
  const service = createServiceClient();
  await service.from("notifications").insert({
    user_id: otherPartyId,
    kind: "application_status_changed",
    title: `"${gig?.title ?? "Gig"}" marked completed`,
    body: "Leave your review — reviews stay hidden until both sides submit, or 14 days pass.",
    link: `/rate/${applicationId}`,
    data: { application_id: applicationId, status: "completed" },
  });

  revalidatePath("/applicants");
  revalidatePath("/applications");
}
