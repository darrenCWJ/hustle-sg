import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatSgd, timeAgo } from "@/lib/utils";
import { applyToGig } from "./actions";

export default async function GigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: gig } = await supabase
    .from("gigs")
    .select(
      "*, employer:profiles!gigs_employer_id_fkey(handle, display_name, headline, singpass_verified_at)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!gig) notFound();

  const { data: questions } = await supabase
    .from("interview_questions")
    .select("*")
    .eq("gig_id", id)
    .order("display_order");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let existingApp: any = null;
  if (user) {
    const { data } = await supabase
      .from("applications")
      .select("id, status")
      .eq("gig_id", id)
      .eq("applicant_id", user.id)
      .maybeSingle();
    existingApp = data;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/gigs" className="text-xs text-ink-soft uppercase tracking-widest hover:text-ink">
        ← All gigs
      </Link>

      <header className="mt-6 mb-10">
        <p className="text-xs uppercase tracking-widest text-ink-soft">
          {gig.category ?? "Gig"} · {gig.location ?? "Remote"} · {timeAgo(gig.created_at)}
        </p>
        <h1 className="font-display text-display-lg mt-3 leading-[0.95]">{gig.title}</h1>
        <p className="mt-4 flex items-center gap-3">
          <span className="font-semibold">{formatSgd(gig.budget_cents)}</span>
          <span className="text-xs text-ink-soft uppercase tracking-widest">
            · {gig.budget_kind}
          </span>
        </p>
      </header>

      <div className="grid md:grid-cols-[1.6fr_1fr] gap-10">
        <article className="prose prose-sm max-w-none">
          <h2 className="font-display text-2xl">About this gig</h2>
          <p className="whitespace-pre-wrap">{gig.description}</p>

          {gig.skills_required.length > 0 && (
            <>
              <h3 className="font-display text-xl mt-8">Skills required</h3>
              <ul className="mt-3 flex flex-wrap gap-2 text-sm list-none p-0">
                {gig.skills_required.map((s: string) => (
                  <li
                    key={s}
                    className="rounded-pill border border-line px-3 py-1 text-ink-soft"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </>
          )}

          {questions && questions.length > 0 && (
            <>
              <h3 className="font-display text-xl mt-8">Async interview</h3>
              <p className="text-ink-soft">
                If shortlisted, you&apos;ll record {questions.length} short video
                answer{questions.length > 1 ? "s" : ""}.
              </p>
              <ol className="mt-3 space-y-2 pl-0 list-none">
                {questions.map((q: any, i: number) => (
                  <li key={q.id} className="rounded-card border border-line p-4">
                    <p className="text-[10px] uppercase tracking-widest text-ink-soft">
                      Q{i + 1} · {q.max_duration_sec}s
                    </p>
                    <p className="mt-1 font-medium">{q.prompt}</p>
                  </li>
                ))}
              </ol>
            </>
          )}
        </article>

        <aside className="rounded-card bg-ink text-surface p-6 sticky top-24">
          <p className="text-[10px] uppercase tracking-widest text-accent">Posted by</p>
          <p className="mt-2 font-display text-xl">{gig.employer?.display_name}</p>
          {gig.employer?.headline && (
            <p className="text-sm text-surface/70 mt-1">{gig.employer.headline}</p>
          )}

          <div className="mt-6">
            {existingApp ? (
              <div className="rounded-xl bg-surface/10 p-3 text-sm">
                Applied · <span className="uppercase tracking-widest text-xs text-accent">{existingApp.status}</span>
                {questions && questions.length > 0 && (
                  <Link
                    href={`/interviews/${existingApp.id}`}
                    className="block mt-3 rounded-pill bg-accent text-ink px-4 py-2 font-semibold text-center"
                  >
                    Record interview →
                  </Link>
                )}
              </div>
            ) : user ? (
              <form action={applyToGig.bind(null, gig.id)} className="space-y-3">
                <textarea
                  name="cover_note"
                  rows={3}
                  placeholder="Short cover note (optional)"
                  className="w-full rounded-xl bg-surface text-ink px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="w-full rounded-pill bg-accent text-ink py-2 font-semibold"
                >
                  Apply →
                </button>
              </form>
            ) : (
              <Link
                href={`/singpass?next=/gigs/${gig.id}`}
                className="block rounded-pill bg-accent text-ink py-2 font-semibold text-center"
              >
                Log in to apply
              </Link>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
