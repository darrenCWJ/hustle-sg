import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GigCard } from "@/components/gig/GigCard";

export default async function GigsPage() {
  const supabase = await createClient();

  const { data: gigs } = await supabase
    .from("gigs")
    .select("*, employer:profiles!gigs_employer_id_fkey(display_name)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(60);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex items-end justify-between mb-10 gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-soft">Browse</p>
          <h1 className="font-display text-display-lg mt-2">Open gigs</h1>
        </div>
        <Link
          href="/gigs/new"
          className="rounded-pill bg-ink text-surface px-5 py-2 text-sm font-semibold"
        >
          + Post a gig
        </Link>
      </div>

      {gigs && gigs.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {gigs.map((g: any) => (
            <GigCard
              key={g.id}
              gig={g}
              employerName={g.employer?.display_name}
            />
          ))}
        </div>
      ) : (
        <p className="text-ink-soft">No gigs posted yet. Seed the DB or post one.</p>
      )}
    </main>
  );
}
