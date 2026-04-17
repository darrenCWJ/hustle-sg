import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { InterviewRecorder } from "./InterviewRecorder";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/singpass?next=/interviews/${id}`);

  const { data: app } = await supabase
    .from("applications")
    .select("id, applicant_id, gig_id, status, gigs(title, employer_id)")
    .eq("id", id)
    .maybeSingle();
  if (!app) notFound();

  const isApplicant = app.applicant_id === user.id;
  const gig = (app.gigs ?? {}) as any;
  const isEmployer = gig.employer_id === user.id;
  if (!isApplicant && !isEmployer) notFound();

  const { data: questions } = await supabase
    .from("interview_questions")
    .select("*")
    .eq("gig_id", app.gig_id)
    .order("display_order");

  const { data: responses } = await supabase
    .from("interview_responses")
    .select("*")
    .eq("application_id", id);

  const answered: Record<string, any> = {};
  for (const r of responses ?? []) answered[r.question_id] = r;

  // Sign URLs for employer playback
  const admin = createServiceClient();
  const signedMap: Record<string, string> = {};
  if (isEmployer || isApplicant) {
    for (const r of responses ?? []) {
      const { data } = await admin.storage
        .from("interview-responses")
        .createSignedUrl(r.video_url, 3600);
      if (data?.signedUrl) signedMap[r.question_id] = data.signedUrl;
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/dashboard" className="text-xs uppercase tracking-widest text-ink-soft hover:text-ink">
        ← Dashboard
      </Link>
      <header className="mt-6 mb-10">
        <p className="text-xs uppercase tracking-widest text-ink-soft">
          Interview for
        </p>
        <h1 className="font-display text-display-md mt-1">{gig.title}</h1>
      </header>

      {isApplicant ? (
        <InterviewRecorder
          applicationId={id}
          questions={(questions ?? []) as any}
          answered={answered}
        />
      ) : (
        <div className="space-y-6">
          {(questions ?? []).map((q: any, i: number) => (
            <div key={q.id} className="rounded-card border border-line p-5 bg-surface-raised">
              <p className="text-[10px] uppercase tracking-widest text-ink-soft">
                Q{i + 1}
              </p>
              <p className="font-semibold mt-1">{q.prompt}</p>
              {signedMap[q.id] ? (
                <video
                  src={signedMap[q.id]}
                  controls
                  className="mt-4 w-full rounded-xl bg-ink"
                />
              ) : (
                <p className="mt-3 text-sm text-ink-soft">No response yet.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
