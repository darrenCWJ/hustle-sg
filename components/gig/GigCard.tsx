import Link from "next/link";
import { formatSgd, timeAgo } from "@/lib/utils";
import type { Gig } from "@/lib/supabase/types";
import { MatchScoreBadge } from "./MatchScoreBadge";

interface Props {
  gig: Pick<Gig, "id" | "title" | "description" | "skills_required" | "budget_cents" | "budget_kind" | "location" | "category" | "created_at">;
  matchScore?: number;
  overlap?: string[];
  employerName?: string | null;
  featured?: boolean;
}

export function GigCard({ gig, matchScore, overlap, employerName, featured }: Props) {
  return (
    <Link
      href={`/gigs/${gig.id}`}
      className={`group rounded-card border p-6 block transition hover:-translate-y-0.5 ${
        featured
          ? "bg-ink text-surface border-ink shadow-lift"
          : "bg-surface-raised border-line hover:border-ink"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p
            className={`text-[10px] uppercase tracking-widest ${
              featured ? "text-accent" : "text-ink-soft"
            }`}
          >
            {gig.category ?? "Gig"} · {gig.location ?? "Remote"}
          </p>
          <h3 className="font-display text-xl mt-2 leading-tight">{gig.title}</h3>
        </div>
        {matchScore != null && <MatchScoreBadge score={matchScore} overlap={overlap ?? []} />}
      </div>
      <p
        className={`text-sm line-clamp-2 ${featured ? "text-surface/80" : "text-ink-soft"}`}
      >
        {gig.description}
      </p>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className={featured ? "text-surface/70" : "text-ink-soft"}>
          {employerName ?? "Employer"} · {timeAgo(gig.created_at)}
        </span>
        <span className="font-semibold">
          {formatSgd(gig.budget_cents)}{" "}
          <span className={`text-[10px] ${featured ? "text-accent" : "text-ink-soft"}`}>
            / {gig.budget_kind}
          </span>
        </span>
      </div>
      {gig.skills_required.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-widest">
          {gig.skills_required.slice(0, 5).map((s) => (
            <li
              key={s}
              className={`rounded-pill px-2 py-0.5 ${
                featured ? "bg-surface/10 text-surface/80" : "bg-surface text-ink-soft"
              }`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}
