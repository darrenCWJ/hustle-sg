"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function decideApplication(
  applicationId: string,
  decision: "hired" | "shortlisted" | "offered" | "rejected",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data, error } = await supabase.rpc("decide_application", {
    p_app_id:   applicationId,
    p_decision: decision,
    p_actor_id: user.id,
  });

  if (error) return { error: error.message };
  revalidatePath(`/interviews/${applicationId}`);
  return { ok: true, data };
}

export async function recordInterviewResponse({
  applicationId,
  questionId,
  videoPath,
  durationSec,
}: {
  applicationId: string;
  questionId: string;
  videoPath: string;
  durationSec: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };

  // Upsert — one response per question per app
  await supabase
    .from("interview_responses")
    .delete()
    .eq("application_id", applicationId)
    .eq("question_id", questionId);

  const { error } = await supabase.from("interview_responses").insert({
    application_id: applicationId,
    question_id: questionId,
    video_url: videoPath,
    duration_sec: Math.round(durationSec),
  });
  if (error) return { ok: false as const, error: error.message };

  await supabase
    .from("applications")
    .update({ status: "interviewing" })
    .eq("id", applicationId)
    .eq("applicant_id", user.id);

  // Check if all questions have responses — if so, notify employer
  const service = createServiceClient();
  const { data: app } = await service
    .from("applications")
    .select("gig_id, gigs!inner(employer_id, title, interview_questions(id))")
    .eq("id", applicationId)
    .single();
  const totalQuestions = (app?.gigs as any)?.interview_questions?.length ?? 0;
  const { count: responseCount } = await service
    .from("interview_responses")
    .select("id", { count: "exact", head: true })
    .eq("application_id", applicationId);

  if (totalQuestions > 0 && responseCount === totalQuestions) {
    const applicantProfile = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    const name = applicantProfile.data?.display_name ?? "A candidate";
    const employerId = (app?.gigs as any)?.employer_id;
    const gigTitle = (app?.gigs as any)?.title ?? "your gig";
    if (employerId) {
      await service.from("notifications").insert({
        user_id: employerId,
        kind: "interview_submitted",
        title: `${name} submitted all video answers`,
        body: `All ${totalQuestions} responses are ready to review for "${gigTitle}".`,
        link: `/interviews/${applicationId}`,
        data: { application_id: applicationId },
      });
    }
  }

  revalidatePath(`/interviews/${applicationId}`);
  return { ok: true as const };
}
