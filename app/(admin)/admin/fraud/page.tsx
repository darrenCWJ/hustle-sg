import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { getFraudSettings } from "@/lib/fraud/settings";
import {
  scorePair,
  evaluateModel,
  modelHealth,
  type PairSignals,
} from "@/lib/fraud/scoring";
import { recordFraudVerdict, updateFraudSettings } from "./actions";

interface RawPair extends PairSignals {
  employer_id: string;
  worker_id: string;
  completed_between: number;
  ratings_between: number;
}

const numberInput: React.CSSProperties = {
  width: 64,
  padding: "7px 10px",
  borderRadius: 10,
  border: "1px solid var(--color-line)",
  background: "var(--color-surface)",
  color: "var(--color-ink)",
  fontSize: 13,
  fontFamily: "var(--font-mono)",
};

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ padding: "16px 18px", borderRadius: 14, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)" }}>
      <p style={{ margin: 0, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-soft)", fontWeight: 600 }}>
        {label}
      </p>
      <p style={{ margin: "6px 0 0", fontFamily: "var(--font-display)", fontSize: 30, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--color-ink-mute)", fontFamily: "var(--font-mono)" }}>{sub}</p>}
    </div>
  );
}

export default async function AdminFraudPage() {
  const service = createServiceClient();
  const settings = await getFraudSettings();

  // Raw behavioural signals for every pair (scoring happens here, with the
  // admin-tuned weights — the SQL function's internal score is ignored).
  const [{ data: rawPairs }, { data: reviews }] = await Promise.all([
    service.rpc("collusion_pairs", { p_min_score: 0 }),
    service
      .from("fraud_reviews")
      .select("employer_id, worker_id, verdict, score_at_review, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const pairs = (rawPairs ?? []) as RawPair[];
  const verdictByPair = new Map(
    (reviews ?? []).map((r) => [`${r.employer_id}:${r.worker_id}`, r.verdict as "confirmed" | "legitimate"]),
  );

  const scored = pairs
    .map((p) => ({ ...p, score: scorePair(p, settings.weights) }))
    .filter((p) => p.score >= settings.threshold || verdictByPair.has(`${p.employer_id}:${p.worker_id}`))
    .sort((a, b) => b.score - a.score);

  // Evaluation: labeled pairs scored with the CURRENT weights, so tuning is
  // immediately reflected in the metrics.
  const scoreByPair = new Map(
    pairs.map((p) => [`${p.employer_id}:${p.worker_id}`, scorePair(p, settings.weights)]),
  );
  const labeled = (reviews ?? []).map((r) => ({
    score: scoreByPair.get(`${r.employer_id}:${r.worker_id}`) ?? r.score_at_review,
    verdict: r.verdict as "confirmed" | "legitimate",
  }));
  const evaluation = evaluateModel(labeled, settings.threshold);
  const health = modelHealth(evaluation);
  const fmt = (v: number | null) => (v === null ? "—" : v.toFixed(2));

  // Resolve handles.
  const ids = [...new Set(scored.flatMap((p) => [p.employer_id, p.worker_id]))];
  const { data: profiles } = ids.length
    ? await service.from("profiles").select("id, handle").in("id", ids)
    : { data: [] as Array<{ id: string; handle: string }> };
  const handleById = new Map((profiles ?? []).map((p) => [p.id, p.handle]));

  const signalChips = (p: RawPair) =>
    [
      p.mutual_five_star > 0 && `${p.mutual_five_star}× mutual 5★`,
      p.silent_completions > 0 && `${p.silent_completions}× zero-message completion`,
      p.fast_rated > 0 && `${p.fast_rated}× rated within an hour`,
      p.gigs_between >= settings.weights.pairVolumeMin && `${p.gigs_between} gigs, same pair`,
    ].filter(Boolean) as string[];

  return (
    <>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, margin: "0 0 6px", letterSpacing: "-0.03em" }}>
        Fraud model
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "var(--color-ink-soft)", maxWidth: 680 }}>
        The model flags employer↔worker pairs that look like rating rings. Your
        verdicts below are the ground truth: they score the model (precision /
        recall / F1), tell you when to retune it, and stop confirmed pairs&apos;
        ratings from counting anywhere on the platform.
      </p>

      {/* ── Model health ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 12 }}>
          <MetricCard label="Precision" value={fmt(evaluation.precision)} sub="flagged → confirmed" />
          <MetricCard label="Recall" value={fmt(evaluation.recall)} sub="fraud → caught" />
          <MetricCard label="F1" value={fmt(evaluation.f1)} sub="balance of both" />
          <MetricCard
            label="Verdicts recorded"
            value={String(evaluation.labeled)}
            sub={`${evaluation.truePositives}TP ${evaluation.falsePositives}FP ${evaluation.falseNegatives}FN ${evaluation.trueNegatives}TN`}
          />
        </div>
        <p
          style={{
            margin: 0,
            padding: "10px 16px",
            borderRadius: 12,
            fontSize: 13,
            lineHeight: 1.5,
            background:
              health.status === "retune" ? "#fee2e2" : health.status === "healthy" ? "var(--color-jade-soft)" : "var(--color-muted)",
            color:
              health.status === "retune" ? "#991b1b" : health.status === "healthy" ? "var(--color-jade-ink)" : "var(--color-ink-soft)",
          }}
        >
          {health.status === "retune" ? "⚠ " : health.status === "healthy" ? "✓ " : "ℹ "}
          {health.message}
        </p>
      </section>

      {/* ── Tuning (no code needed) ── */}
      <details style={{ marginBottom: 28, border: "1px solid var(--color-line)", borderRadius: 14, padding: "14px 18px" }}>
        <summary style={{ cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
          Tune the model — weights &amp; alert threshold
        </summary>
        <form
          action={async (formData: FormData) => {
            "use server";
            await updateFraudSettings(formData);
          }}
          style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "end" }}
        >
          {(
            [
              ["threshold", "Alert threshold", settings.threshold, "flag pairs at or above this score"],
              ["mutualFiveStar", "Mutual 5★ weight", settings.weights.mutualFiveStar, "per mutual five-star exchange"],
              ["silentCompletion", "Silent completion weight", settings.weights.silentCompletion, "per completion with no messages"],
              ["fastRated", "Instant rating weight", settings.weights.fastRated, "per rating within an hour"],
              ["pairVolume", "Repeat-pair bonus", settings.weights.pairVolume, "added once at the gig minimum"],
              ["pairVolumeMin", "Repeat-pair minimum", settings.weights.pairVolumeMin, "gigs between the pair to trigger"],
            ] as const
          ).map(([name, label, value, hint]) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label htmlFor={`fraud-${name}`} style={{ fontSize: 11, fontWeight: 700, color: "var(--color-ink-soft)" }}>
                {label}
              </label>
              <input id={`fraud-${name}`} name={name} type="number" defaultValue={value} min={name === "pairVolumeMin" ? 2 : name === "threshold" ? 1 : 0} max={20} style={numberInput} />
              <span style={{ fontSize: 10.5, color: "var(--color-ink-mute)", maxWidth: 150 }}>{hint}</span>
            </div>
          ))}
          <button
            type="submit"
            className="text-xs px-4 py-2 rounded-pill bg-ink text-surface font-semibold hover:bg-accent-ink transition"
          >
            Save &amp; re-score
          </button>
        </form>
      </details>

      {/* ── Flagged pairs ── */}
      {scored.length === 0 && (
        <p style={{ fontSize: 14, color: "var(--color-ink-mute)", padding: "40px 0" }}>
          No pairs at or above the threshold. Quiet is good.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {scored.map((p) => {
          const key = `${p.employer_id}:${p.worker_id}`;
          const verdict = verdictByPair.get(key);
          const signals: PairSignals = {
            gigs_between: p.gigs_between,
            mutual_five_star: p.mutual_five_star,
            silent_completions: p.silent_completions,
            fast_rated: p.fast_rated,
          };
          return (
            <div key={key} style={{ border: "1px solid var(--color-line)", borderRadius: 14, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    fontWeight: 700,
                    padding: "3px 12px",
                    borderRadius: 999,
                    background: p.score >= settings.threshold + 3 ? "#fee2e2" : "#fef9c3",
                    color: p.score >= settings.threshold + 3 ? "#991b1b" : "#854d0e",
                  }}
                >
                  score {p.score}
                </span>
                <span style={{ fontSize: 14 }}>
                  <Link href={`/profile/${handleById.get(p.employer_id) ?? ""}`} style={{ fontWeight: 700, color: "var(--color-ink)" }}>
                    @{handleById.get(p.employer_id) ?? p.employer_id.slice(0, 8)}
                  </Link>
                  <span style={{ color: "var(--color-ink-mute)" }}> (employer) ↔ </span>
                  <Link href={`/profile/${handleById.get(p.worker_id) ?? ""}`} style={{ fontWeight: 700, color: "var(--color-ink)" }}>
                    @{handleById.get(p.worker_id) ?? p.worker_id.slice(0, 8)}
                  </Link>
                </span>
                {verdict && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 10px",
                      borderRadius: 999,
                      background: verdict === "confirmed" ? "#fee2e2" : "var(--color-jade-soft)",
                      color: verdict === "confirmed" ? "#991b1b" : "var(--color-jade-ink)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {verdict === "confirmed" ? "confirmed fraud" : "marked legitimate"}
                  </span>
                )}
                <span style={{ fontSize: 11.5, color: "var(--color-ink-mute)", marginLeft: "auto", fontFamily: "var(--font-mono)" }}>
                  {p.gigs_between} gigs · {p.completed_between} completed · {p.ratings_between} ratings
                </span>
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {signalChips(p).map((chip) => (
                  <span key={chip} style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)" }}>
                    {chip}
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <form
                  action={async () => {
                    "use server";
                    await recordFraudVerdict({
                      employerId: p.employer_id,
                      workerId: p.worker_id,
                      verdict: "confirmed",
                      score: p.score,
                      signals,
                    });
                  }}
                  style={{ margin: 0 }}
                >
                  <button type="submit" className="text-xs px-3 py-1.5 rounded-pill bg-ink text-surface font-semibold hover:bg-accent-ink transition">
                    Confirm fraud
                  </button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await recordFraudVerdict({
                      employerId: p.employer_id,
                      workerId: p.worker_id,
                      verdict: "legitimate",
                      score: p.score,
                      signals,
                    });
                  }}
                  style={{ margin: 0 }}
                >
                  <button type="submit" className="text-xs px-3 py-1.5 rounded-pill border border-line text-ink-soft hover:border-ink hover:text-ink transition">
                    Mark legitimate
                  </button>
                </form>
                <span style={{ fontSize: 11, color: "var(--color-ink-mute)" }}>
                  Confirming removes this pair&apos;s mutual ratings from public averages.
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
