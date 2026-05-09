"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function applyToGig(gigId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/singpass?next=/gigs/${gigId}`);

  const cover = String(formData.get("cover_note") ?? "").slice(0, 2000);

  const { data: app, error } = await supabase
    .from("applications")
    .insert({
      gig_id: gigId,
      applicant_id: user.id,
      cover_note: cover || null,
      status: "applied",
    })
    .select("id")
    .single();
  if (error || !app) return;

  // Notify employer via service client (bypasses RLS)
  const service = createServiceClient();
  const { data: gig } = await service
    .from("gigs")
    .select("employer_id, title, profiles!gigs_employer_id_fkey(display_name)")
    .eq("id", gigId)
    .single();
  const applicantProfile = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();
  const applicantName = applicantProfile.data?.display_name ?? "Someone";
  if (gig?.employer_id) {
    await service.from("notifications").insert({
      user_id: gig.employer_id,
      kind: "application_received",
      title: `${applicantName} applied for "${gig.title}"`,
      body: "Review their profile and async video responses.",
      link: `/interviews/${app.id}`,
      data: { application_id: app.id, gig_id: gigId },
    });
  }

  // Check if interviews exist → route to record flow
  const { data: qs } = await supabase
    .from("interview_questions")
    .select("id")
    .eq("gig_id", gigId)
    .limit(1);

  if (qs && qs.length > 0) {
    redirect(`/interviews/${app.id}`);
  }
  redirect(`/gigs/${gigId}`);
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "interviewing" | "hired" | "rejected",
) {
  const supabase = await createClient();
  await supabase.from("applications").update({ status }).eq("id", applicationId);
}
