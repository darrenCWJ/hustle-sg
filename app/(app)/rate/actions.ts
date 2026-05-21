"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitRating(
  applicationId: string,
  stars: number,
  review: string,
): Promise<{ error?: string }> {
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

  // Only the employer can mark as completed
  const { data: app } = await supabase
    .from("applications")
    .select("id, gig_id, gigs(employer_id)")
    .eq("id", applicationId)
    .eq("status", "hired")
    .single();

  if (!app) return;
  const gig = app.gigs as any;
  if (gig?.employer_id !== user.id) return;

  await supabase
    .from("applications")
    .update({ status: "completed" })
    .eq("id", applicationId);

  revalidatePath("/applicants");
}
