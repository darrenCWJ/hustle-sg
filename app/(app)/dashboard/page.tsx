import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/singpass?next=/dashboard");

  const [myApps, myPostedGigs, appsOnMyGigs] = await Promise.all([
    supabase
      .from("applications")
      .select("id, status, created_at, gigs(id, title, employer_id)")
      .eq("applicant_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("gigs")
      .select("id, title, status, created_at")
      .eq("employer_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("applications")
      .select("id, status, created_at, applicant:profiles!applications_applicant_id_fkey(handle, display_name, headline), gigs!inner(id, title, employer_id)")
      .eq("gigs.employer_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-widest text-ink-soft">Dashboard</p>
        <h1 className="font-display text-display-lg mt-2">Your hustle, tracked.</h1>
      </header>

      <div className="grid md:grid-cols-2 gap-10">
        <section>
          <h2 className="font-display text-display-md mb-4">Your applications</h2>
          {myApps.data && myApps.data.length > 0 ? (
            <ul className="space-y-3">
              {myApps.data.map((a: any) => (
                <li key={a.id} className="rounded-card border border-line p-4 bg-surface-raised">
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/gigs/${a.gigs?.id}`} className="font-semibold hover:text-accent-ink">
                      {a.gigs?.title}
                    </Link>
                    <span className="text-xs uppercase tracking-widest text-ink-soft">
                      {a.status}
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft mt-1">Applied {timeAgo(a.created_at)}</p>
                  <div className="mt-3 flex gap-3 text-xs">
                    <Link
                      href={`/interviews/${a.id}`}
                      className="underline text-accent-ink"
                    >
                      View interview
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-soft">No applications yet.</p>
          )}
        </section>

        <section>
          <h2 className="font-display text-display-md mb-4">Gigs you&apos;ve posted</h2>
          {myPostedGigs.data && myPostedGigs.data.length > 0 ? (
            <ul className="space-y-3">
              {myPostedGigs.data.map((g: any) => (
                <li key={g.id} className="rounded-card border border-line p-4 bg-surface-raised">
                  <Link href={`/gigs/${g.id}`} className="font-semibold hover:text-accent-ink">
                    {g.title}
                  </Link>
                  <p className="text-xs text-ink-soft mt-1">{g.status} · {timeAgo(g.created_at)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-soft">You haven&apos;t posted any gigs.</p>
          )}
          <Link
            href="/gigs/new"
            className="mt-4 inline-block rounded-pill bg-ink text-surface px-5 py-2 text-sm font-semibold"
          >
            + Post a gig
          </Link>
        </section>

        {appsOnMyGigs.data && appsOnMyGigs.data.length > 0 && (
          <section className="md:col-span-2">
            <h2 className="font-display text-display-md mb-4">Applications on your gigs</h2>
            <ul className="space-y-3">
              {appsOnMyGigs.data.map((a: any) => (
                <li key={a.id} className="rounded-card border border-line p-4 bg-surface-raised">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {a.applicant?.display_name ?? "Applicant"}
                        <span className="text-xs text-ink-soft font-normal ml-2">
                          applied to {a.gigs?.title}
                        </span>
                      </p>
                      {a.applicant?.headline && (
                        <p className="text-xs text-ink-soft">{a.applicant.headline}</p>
                      )}
                    </div>
                    <Link
                      href={`/interviews/${a.id}`}
                      className="rounded-pill border border-line px-4 py-1.5 text-xs font-semibold"
                    >
                      Review →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
