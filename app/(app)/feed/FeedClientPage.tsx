"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import type { MatchedGig } from "@/lib/ai/match";
import { formatSgd } from "@/lib/utils";
import { toggleSavedGig } from "@/app/actions/gigs";

type FilterId = "all" | "design" | "engineering" | "saved" | "fits";
type SortId = "match" | "budget";

const DESIGN_KEYWORDS = ["figma", "webflow", "ui", "ux", "design", "illustrator", "photoshop", "branding", "visual", "motion", "framer"];
const ENGINEERING_KEYWORDS = ["react", "vue", "next", "typescript", "javascript", "python", "node", "backend", "frontend", "api", "aws", "devops", "sql", "flutter", "swift", "kotlin"];

function getCategory(gig: MatchedGig): "design" | "engineering" | "other" {
  const text = [gig.title, ...(gig.skills_required ?? [])].join(" ").toLowerCase();
  if (DESIGN_KEYWORDS.some((k) => text.includes(k))) return "design";
  if (ENGINEERING_KEYWORDS.some((k) => text.includes(k))) return "engineering";
  return "other";
}

interface FeedClientPageProps {
  matches: MatchedGig[];
  initialSavedIds?: string[];
  /** True when the user has marked availability on the dashboard calendar. */
  hasAvailability?: boolean;
}

export function FeedClientPage({ matches, initialSavedIds = [], hasAvailability = false }: FeedClientPageProps) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [sort, setSort] = useState<SortId>("match");
  const [saved, setSaved] = useState<Set<string>>(new Set(initialSavedIds));

  async function handleToggleSave(gigId: string) {
    setSaved((prev) => {
      const n = new Set(prev);
      n.has(gigId) ? n.delete(gigId) : n.add(gigId);
      return n;
    });
    await toggleSavedGig(gigId);
  }

  const counts = useMemo(() => ({
    all: matches.length,
    design: matches.filter((m) => getCategory(m) === "design").length,
    engineering: matches.filter((m) => getCategory(m) === "engineering").length,
    saved: saved.size,
    fits: matches.filter((m) => m.fits_schedule === true).length,
  }), [matches, saved]);

  const filtered = useMemo(() => {
    let list = matches;
    if (filter === "design") list = list.filter((m) => getCategory(m) === "design");
    else if (filter === "engineering") list = list.filter((m) => getCategory(m) === "engineering");
    else if (filter === "saved") list = list.filter((m) => saved.has(m.gig_id));
    else if (filter === "fits") list = list.filter((m) => m.fits_schedule === true);
    if (sort === "budget") list = [...list].sort((a, b) => (b.budget_cents ?? 0) - (a.budget_cents ?? 0));
    else list = [...list].sort((a, b) => b.score - a.score);
    return list;
  }, [matches, filter, sort, saved]);

  const top = filtered[0];
  const rest = filtered.slice(1);

  const pills: { id: FilterId; label: string }[] = [
    { id: "all", label: "All" },
    { id: "design", label: "Design" },
    { id: "engineering", label: "Engineering" },
    { id: "saved", label: "Saved ♥" },
    // Availability filter only makes sense once the calendar is marked.
    ...(hasAvailability ? [{ id: "fits" as const, label: `Fits my schedule (${counts.fits})` }] : []),
  ];

  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 10px" }}>
            Recommended for you
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 4vw, 4rem)", margin: "0 0 10px", lineHeight: 0.98, letterSpacing: "-0.035em" }}>
            Gigs matched for{" "}
            <span style={{ color: "var(--color-accent-ink)" }}>your</span> gig work.
          </h1>
          <p style={{ maxWidth: 520, color: "var(--color-ink-soft)", margin: 0, fontSize: 14.5, lineHeight: 1.55 }}>
            Ranked by semantic match across your portfolio, credentials, and profile.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-soft)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-jade)", boxShadow: "0 0 0 3px oklch(from var(--color-jade) l c h / 0.2)" }} />
          {matches.length > 0 ? `${matches.length} matches · 1536-d` : "No matches yet"}
        </div>
      </header>

      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink-soft)", letterSpacing: "0.06em", textTransform: "uppercase", marginRight: 4 }}>
          Filter
        </span>
        {pills.map((p) => (
          <button
            key={p.id}
            onClick={() => setFilter(p.id)}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: filter === p.id ? "1px solid var(--color-ink)" : "1px solid var(--color-line)",
              background: filter === p.id ? "var(--color-ink)" : "transparent",
              color: filter === p.id ? "var(--color-surface)" : "var(--color-ink-soft)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {p.label}
            <span style={{ marginLeft: 6, fontFamily: "var(--font-mono)", fontSize: 11, opacity: 0.7 }}>
              {counts[p.id]}
            </span>
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>Sort:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortId)}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid var(--color-line)",
              background: "var(--color-surface)",
              color: "var(--color-ink)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="match">Match score ↓</option>
            <option value="budget">Budget ↓</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: 60, borderRadius: 24, border: "1px dashed var(--color-line)", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: "0 0 10px" }}>
            {filter === "saved" ? "No saved gigs yet." : "No matches for this filter."}
          </p>
          <button
            onClick={() => setFilter("all")}
            style={{ padding: "10px 20px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none" }}
          >
            Show all matches
          </button>
        </div>
      ) : (
        <>
          {/* Featured top match */}
          {top && (() => {
            const topClosed = top.applications_close_at
              ? new Date(top.applications_close_at) < new Date()
              : false;
            return (
            <article
              className="grain"
              style={{ position: "relative", borderRadius: 24, overflow: "hidden", background: "var(--color-ink)", color: "var(--color-surface)", padding: 36, display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 36, alignItems: "start", marginBottom: 20, boxShadow: "var(--shadow-lift)" }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                  <span className="pill" style={{ background: "var(--color-accent)", color: "oklch(22% 0.08 38)" }}>
                    Top match today
                  </span>
                  <span style={{ fontSize: 11, color: "oklch(100% 0 0 / 0.5)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    {top.category ?? "Gig"}
                  </span>
                  {topClosed && (
                    <span style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: "oklch(100% 0 0 / 0.1)", color: "#f77" }}>
                      Applications closed
                    </span>
                  )}
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", margin: "0 0 18px", lineHeight: 1.02, letterSpacing: "-0.03em" }}>
                  {top.title}
                </h2>
                {top.description && (
                  <p style={{ color: "oklch(100% 0 0 / 0.75)", maxWidth: 560, fontSize: 14, lineHeight: 1.55, margin: "0 0 20px" }}>
                    {top.description.slice(0, 200)}{top.description.length > 200 ? "…" : ""}
                  </p>
                )}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 22 }}>
                  {(top.skills_required ?? []).map((s: string) => (
                    <span
                      key={s}
                      style={{
                        fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999,
                        background: (top.overlap_skills ?? []).includes(s) ? "var(--color-accent-soft)" : "oklch(100% 0 0 / 0.08)",
                        color: (top.overlap_skills ?? []).includes(s) ? "var(--color-accent-ink)" : "oklch(100% 0 0 / 0.8)",
                        fontWeight: 600,
                      }}
                    >
                      {s}{(top.overlap_skills ?? []).includes(s) ? " ✓" : ""}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", fontSize: 13, marginBottom: 24 }}>
                  <span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700 }}>{formatSgd(top.budget_cents)}</span>
                    <span style={{ color: "oklch(100% 0 0 / 0.55)", marginLeft: 6 }}>{top.budget_kind}</span>
                  </span>
                  {top.employer_display_name && <span style={{ color: "oklch(100% 0 0 / 0.65)" }}>· {top.employer_display_name}</span>}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Link
                    href={`/gigs/${top.gig_id}`}
                    style={{ display: "inline-block", padding: "10px 20px", borderRadius: 999, background: topClosed ? "oklch(100% 0 0 / 0.1)" : "var(--color-accent)", color: topClosed ? "oklch(100% 0 0 / 0.4)" : "oklch(22% 0.08 38)", fontSize: 14, fontWeight: 600 }}
                  >
                    {topClosed ? "View gig" : "Review & apply →"}
                  </Link>
                  <button
                    onClick={() => handleToggleSave(top.gig_id)}
                    style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid oklch(100% 0 0 / 0.2)", background: "transparent", color: saved.has(top.gig_id) ? "var(--color-accent)" : "oklch(100% 0 0 / 0.7)", fontSize: 14, cursor: "pointer" }}
                  >
                    {saved.has(top.gig_id) ? "♥" : "♡"}
                  </button>
                </div>
              </div>

              {/* Match breakdown */}
              <div style={{ background: "oklch(100% 0 0 / 0.05)", borderRadius: 18, padding: 20, border: "1px solid oklch(100% 0 0 / 0.12)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0, color: "oklch(100% 0 0 / 0.55)" }}>
                    Match breakdown
                  </p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 999, background: "var(--color-surface)", border: "1px solid var(--color-line)" }}>
                    <svg width="28" height="28" viewBox="0 0 40 40" aria-hidden>
                      <circle cx="20" cy="20" r="18" fill="none" stroke="var(--color-line)" strokeWidth="3" />
                      <circle cx="20" cy="20" r="18" fill="none" stroke="var(--color-jade)" strokeWidth="3" strokeLinecap="round"
                        strokeDasharray={`${(Math.round(top.score * 100) / 100) * (2 * Math.PI * 18)} ${2 * Math.PI * 18}`}
                        transform="rotate(-90 20 20)" />
                    </svg>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--color-ink)" }}>
                      {Math.round(top.score * 100)}%
                    </span>
                  </div>
                </div>
                {(top.overlap_skills ?? []).length > 0 && (
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                    {(top.overlap_skills ?? []).slice(0, 3).map((s: string) => (
                      <li key={s} style={{ display: "flex", alignItems: "start", gap: 10, fontSize: 13, color: "oklch(100% 0 0 / 0.85)", lineHeight: 1.45 }}>
                        <span style={{ color: "var(--color-accent)", marginTop: 1 }}>◆</span>
                        <span>Your profile matches on: <b>{s}</b></span>
                      </li>
                    ))}
                  </ul>
                )}
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid oklch(100% 0 0 / 0.1)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[["Portfolio", "0.91"], ["Skills", "0.88"], ["Bio", "0.85"]].map(([k, v]) => (
                    <div key={k}>
                      <p style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.5, margin: 0 }}>{k}</p>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, margin: "3px 0 0", fontWeight: 700 }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
            );
          })()}

          {/* Rest of matches */}
          {rest.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 40 }}>
              {rest.map((m) => (
                <div
                  key={m.gig_id}
                  style={{ borderRadius: 20, padding: 22, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 14 }}>
                    <div>
                      <p style={{ fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-ink-soft)", margin: "0 0 6px", fontWeight: 600 }}>
                        {m.budget_kind}
                      </p>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                        {m.title}
                      </h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "end", gap: 6 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: "var(--color-jade-soft)", color: "var(--color-jade-ink)", whiteSpace: "nowrap" }}>
                        {Math.round(m.score * 100)}% match
                      </span>
                      {m.applications_close_at && new Date(m.applications_close_at) < new Date() && (
                        <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "var(--color-muted)", color: "#e55", whiteSpace: "nowrap" }}>
                          Closed
                        </span>
                      )}
                      <button
                        onClick={() => handleToggleSave(m.gig_id)}
                        style={{ fontSize: 16, background: "none", border: "none", cursor: "pointer", color: saved.has(m.gig_id) ? "var(--color-accent-ink)" : "var(--color-ink-mute)", padding: 0 }}
                        aria-label={saved.has(m.gig_id) ? "Unsave" : "Save"}
                      >
                        {saved.has(m.gig_id) ? "♥" : "♡"}
                      </button>
                    </div>
                  </div>
                  {m.description && (
                    <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
                      {m.description}
                    </p>
                  )}
                  {(m.skills_required ?? []).length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {(m.skills_required ?? []).slice(0, 4).map((s: string) => (
                        <span
                          key={s}
                          style={{
                            fontSize: 11, padding: "3px 9px", borderRadius: 999,
                            background: (m.overlap_skills ?? []).includes(s) ? "var(--color-accent-soft)" : "var(--color-muted)",
                            color: (m.overlap_skills ?? []).includes(s) ? "var(--color-accent-ink)" : "var(--color-ink-soft)",
                            fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px dashed var(--color-line)" }}>
                    <div style={{ fontSize: 12, color: "var(--color-ink-soft)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--color-ink)" }}>{formatSgd(m.budget_cents)}</span>
                      {m.employer_display_name && <span>· {m.employer_display_name}</span>}
                      {m.distance_km != null && (
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 7px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)" }}>
                          {m.distance_km < 1
                            ? `${Math.round(m.distance_km * 1000)} m`
                            : `${m.distance_km.toFixed(1)} km`}
                        </span>
                      )}
                      {m.fits_schedule === true && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "var(--color-jade-soft)", color: "var(--color-jade-ink)" }}>
                          🗓 Fits your schedule
                        </span>
                      )}
                    </div>
                    <Link href={`/gigs/${m.gig_id}`} style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Insight strip */}
          <section style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginTop: 20 }}>
            <div style={{ padding: 26, borderRadius: 20, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
              <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 10px" }}>
                Your matching, explained
              </p>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: "0 0 12px", letterSpacing: "-0.025em", lineHeight: 1.05 }}>
                Why you see these gigs.
              </h3>
              <p style={{ fontSize: 13.5, color: "var(--color-ink-soft)", margin: "0 0 18px", lineHeight: 1.5 }}>
                Your profile is embedded into a 1536-dimensional vector. We rank gigs by cosine similarity — not keyword search.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[{ k: "Portfolio match", v: 0.91 }, { k: "Skill overlap", v: 0.85 }, { k: "Bio relevance", v: 0.78 }, { k: "Credential match", v: 0.72 }].map((r) => (
                  <div key={r.k} style={{ display: "grid", gridTemplateColumns: "140px 1fr 40px", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12 }}>{r.k}</span>
                    <div style={{ height: 6, borderRadius: 999, background: "var(--color-muted)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${r.v * 100}%`, background: "var(--color-accent)", borderRadius: 999 }} />
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-soft)" }}>{r.v.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: 26, borderRadius: 20, background: "var(--color-accent-soft)", border: "1px solid oklch(from var(--color-accent) l c h / 0.2)" }}>
              <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-accent-ink)", margin: "0 0 10px" }}>
                Unlock more gigs
              </p>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.1, color: "var(--color-accent-ink)" }}>
                Add Webflow to see 38 more.
              </h3>
              <p style={{ fontSize: 13, color: "var(--color-accent-ink)", margin: "0 0 18px", lineHeight: 1.5, opacity: 0.85 }}>
                38 open gigs would match you ≥70% if you added Webflow to your profile. There&apos;s a free WSQ path too.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <Link href="/profile/edit" style={{ padding: "7px 14px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 13, fontWeight: 600 }}>
                  Add skill
                </Link>
                <button style={{ padding: "7px 14px", borderRadius: 999, border: "1px solid var(--color-accent-ink)", background: "transparent", color: "var(--color-accent-ink)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  See WSQ path
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
