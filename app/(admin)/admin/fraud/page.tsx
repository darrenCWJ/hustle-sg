import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

interface PairRow {
  employer_id: string;
  worker_id: string;
  gigs_between: number;
  completed_between: number;
  mutual_five_star: number;
  ratings_between: number;
  silent_completions: number;
  fast_rated: number;
  suspicion_score: number;
}

export default async function AdminFraudPage() {
  const service = createServiceClient();

  const { data: pairs } = await service.rpc("collusion_pairs", { p_min_score: 2 });
  const rows: PairRow[] = pairs ?? [];

  // Resolve handles for both sides of each pair.
  const ids = [...new Set(rows.flatMap((p) => [p.employer_id, p.worker_id]))];
  const { data: profiles } = ids.length
    ? await service.from("profiles").select("id, handle, display_name, created_at").in("id", ids)
    : { data: [] as Array<{ id: string; handle: string; display_name: string; created_at: string }> };
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  const signalChips = (p: PairRow) =>
    [
      p.mutual_five_star > 0 && `${p.mutual_five_star}× mutual 5★`,
      p.silent_completions > 0 && `${p.silent_completions}× completed with zero messages`,
      p.fast_rated > 0 && `${p.fast_rated}× rated within an hour of applying`,
      p.gigs_between >= 3 && `${p.gigs_between} gigs between the same pair`,
    ].filter(Boolean) as string[];

  return (
    <>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, margin: "0 0 6px", letterSpacing: "-0.03em" }}>
        Fraud signals
      </h1>
      <p style={{ margin: "0 0 8px", fontSize: 13.5, color: "var(--color-ink-soft)", maxWidth: 680 }}>
        Employer↔worker pairs whose behaviour looks like a rating ring: repeat
        gigs, mutual five-stars, completions with no conversation, ratings
        filed minutes after applying. Signals, not verdicts — investigate
        before acting.
      </p>
      <p style={{ margin: "0 0 24px", fontSize: 12, color: "var(--color-ink-mute)", maxWidth: 680 }}>
        Note: the public rating average already counts each rater once, and
        repeat hires from one employer count once toward trust — so a ring
        gains little even before triage. The score is a transparent weighted
        sum; <code style={{ fontFamily: "var(--font-mono)" }}>match_events</code> accumulates
        the outcome data a trained model can use to replace the weights later.
      </p>

      {rows.length === 0 && (
        <p style={{ fontSize: 14, color: "var(--color-ink-mute)", padding: "40px 0" }}>
          No suspicious pairs above the threshold. Quiet is good.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map((p) => {
          const employer = profileById.get(p.employer_id);
          const worker = profileById.get(p.worker_id);
          return (
            <div
              key={`${p.employer_id}-${p.worker_id}`}
              style={{ border: "1px solid var(--color-line)", borderRadius: 14, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    fontWeight: 700,
                    padding: "3px 12px",
                    borderRadius: 999,
                    background: p.suspicion_score >= 5 ? "#fee2e2" : "#fef9c3",
                    color: p.suspicion_score >= 5 ? "#991b1b" : "#854d0e",
                  }}
                >
                  score {p.suspicion_score}
                </span>
                <span style={{ fontSize: 14 }}>
                  <Link href={`/profile/${employer?.handle ?? ""}`} style={{ fontWeight: 700, color: "var(--color-ink)" }}>
                    @{employer?.handle ?? p.employer_id.slice(0, 8)}
                  </Link>
                  <span style={{ color: "var(--color-ink-mute)" }}> (employer) ↔ </span>
                  <Link href={`/profile/${worker?.handle ?? ""}`} style={{ fontWeight: 700, color: "var(--color-ink)" }}>
                    @{worker?.handle ?? p.worker_id.slice(0, 8)}
                  </Link>
                  <span style={{ color: "var(--color-ink-mute)" }}> (worker)</span>
                </span>
                <span style={{ fontSize: 11.5, color: "var(--color-ink-mute)", marginLeft: "auto", fontFamily: "var(--font-mono)" }}>
                  {p.gigs_between} gigs · {p.completed_between} completed · {p.ratings_between} ratings
                </span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {signalChips(p).map((chip) => (
                  <span
                    key={chip}
                    style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)" }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
