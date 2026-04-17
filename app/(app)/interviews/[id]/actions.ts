"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

  revalidatePath(`/interviews/${applicationId}`);
  return { ok: true as const };
}
