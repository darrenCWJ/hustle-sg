import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { matchGigsForUser } from "@/lib/ai/match";
import { GigCard } from "@/components/gig/GigCard";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // middleware redirects

  const matches = await matchGigsForUser(user.id, 18);
  const top = matches[0];

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-widest text-accent-ink">For you</p>
        <h1 className="font-display text-display-lg mt-2 leading-[0.95]">
          Gigs ranked for <span className="italic">your</span> hustle.
        </h1>
        <p className="mt-4 max-w-xl text-ink-soft">
          Matched by embedding similarity across your portfolio, certifications,
          and bio. Hover a score to see why it matched.
        </p>
      </header>

      {matches.length === 0 ? (
        <div className="rounded-card border border-dashed border-line p-10 text-center">
          <p className="font-semibold">No matches yet.</p>
          <p className="text-ink-soft text-sm mt-2">
            Upload a portfolio video and a credential so we can embed your profile.
          </p>
          <Link
            href="/profile/edit"
            className="inline-block mt-5 rounded-pill bg-ink text-surface px-5 py-2 text-sm font-semibold"
          >
            Finish your profile →
          </Link>
        </div>
      ) : (
        <>
          {top && (
            <div className="mb-6">
              <GigCard
                featured
                gig={{
                  id: top.gig_id,
                  title: top.title,
                  description: top.description,
                  skills_required: top.skills_required,
                  budget_cents: top.budget_cents,
                  budget_kind: "fixed",
                  location: null,
                  category: null,
                  created_at: new Date().toISOString(),
                }}
                matchScore={top.score}
                overlap={top.overlap_skills}
                employerName={top.employer_display_name}
              />
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            {matches.slice(1).map((m) => (
              <GigCard
                key={m.gig_id}
                gig={{
                  id: m.gig_id,
                  title: m.title,
                  description: m.description,
                  skills_required: m.skills_required,
                  budget_cents: m.budget_cents,
                  budget_kind: "fixed",
                  location: null,
                  category: null,
                  created_at: new Date().toISOString(),
                }}
                matchScore={m.score}
                overlap={m.overlap_skills}
                employerName={m.employer_display_name}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
