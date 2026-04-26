"use client";

import { useState } from "react";
import { AcceptButton } from "./AcceptButton";
import { acceptInstantGig } from "@/app/actions/gigs";

interface InstantGig {
  id: string;
  title: string;
  employer: string;
  location: string;
  distanceKm: number;
  urgency: "now" | "today" | "weekend";
  payRate: number;
  payKind: "hourly" | "fixed";
  skills: string[];
  aiRank: number;
  aiReason: string;
  aiLocked: boolean;
}

const INSTANT_GIGS: InstantGig[] = [
  { id: "ig1", title: "Barista — Morning Shift", employer: "Kopitiam Toa Payoh", location: "Toa Payoh", distanceKm: 0.8, urgency: "now", payRate: 12, payKind: "hourly", skills: ["F&B", "Customer service"], aiRank: 94, aiReason: "2 verified F&B stints, within 1km, open calendar slot 8–12pm", aiLocked: false },
  { id: "ig2", title: "Retail Assistant — Event Pop-up", employer: "Muezza Studio", location: "Bugis", distanceKm: 2.1, urgency: "today", payRate: 320, payKind: "fixed", skills: ["Retail", "Mandarin"], aiRank: 88, aiReason: "Retail background matches, bilingual profile", aiLocked: false },
  { id: "ig3", title: "Graphic Designer (3h brief)", employer: "Tampines CC", location: "Tampines", distanceKm: 12, urgency: "today", payRate: 180, payKind: "fixed", skills: ["Figma", "Print design"], aiRank: 71, aiReason: "Design skills match but distance penalises rank", aiLocked: false },
  { id: "ig4", title: "Videographer — Corporate Event", employer: "Confidential", location: "Marina Bay", distanceKm: 4.5, urgency: "today", payRate: 600, payKind: "fixed", skills: ["Videography", "DaVinci Resolve"], aiRank: 0, aiReason: "No verified videography credentials in your profile", aiLocked: true },
  { id: "ig5", title: "Social Media Shoot", employer: "Haymarket Studio", location: "Dhoby Ghaut", distanceKm: 3.2, urgency: "weekend", payRate: 220, payKind: "fixed", skills: ["Photography", "Instagram"], aiRank: 0, aiReason: "Photography credential required — add to unlock", aiLocked: true },
  { id: "ig6", title: "Event Logistics Helper", employer: "NTUC FairPrice", location: "Jurong East", distanceKm: 8.9, urgency: "weekend", payRate: 10, payKind: "hourly", skills: ["Physical", "Teamwork"], aiRank: 62, aiReason: "Physical work tag matches gig history", aiLocked: false },
];

const AI_RANK_FACTORS = [
  { label: "Distance", pct: 28 },
  { label: "Skill match", pct: 24 },
  { label: "Trust score", pct: 18 },
  { label: "Response speed", pct: 14 },
  { label: "Repeat rate", pct: 10 },
  { label: "Calendar fit", pct: 6 },
];

const URGENCY_CONFIG = {
  now: { label: "Need now", bg: "oklch(52% 0.22 25)", fg: "#fff" },
  today: { label: "Today", bg: "var(--color-accent)", fg: "oklch(22% 0.08 38)" },
  weekend: { label: "Weekend", bg: "var(--color-jade-soft)", fg: "var(--color-jade-ink)" },
};

function DistanceDots({ km }: { km: number }) {
  const filled = km < 2 ? 5 : km < 5 ? 4 : km < 9 ? 3 : km < 15 ? 2 : 1;
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 6, height: 6, borderRadius: "50%",
            background: i < filled ? "var(--color-jade)" : "var(--color-muted)",
          }}
        />
      ))}
    </span>
  );
}

export default function InstantPage() {
  const [kmMax, setKmMax] = useState(15);
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "now" | "today" | "weekend">("all");

  const visible = INSTANT_GIGS.filter(
    (g) => g.distanceKm <= kmMax && (urgencyFilter === "all" || g.urgency === urgencyFilter)
  );

  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
      {/* Header */}
      <header style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 999,
              background: "oklch(52% 0.22 25)", color: "#fff",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", animation: "pulse 1.4s ease-in-out infinite" }} />
            Live
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-soft)" }}>
            {visible.length} gigs near you right now
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 4vw, 4rem)", margin: "0 0 10px", lineHeight: 0.98, letterSpacing: "-0.035em" }}>
          Same-day gig work,{" "}
          <span style={{ color: "oklch(52% 0.22 25)" }}>instant</span>.
        </h1>
        <p style={{ maxWidth: 520, color: "var(--color-ink-soft)", margin: 0, fontSize: 14.5, lineHeight: 1.55 }}>
          AI-ranked urgent gigs within your radius. Accept in one tap, show up, get paid same week.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 28, alignItems: "start" }}>
        {/* Left: AI Rank panel */}
        <aside>
          <div
            className="grain"
            style={{ padding: 22, borderRadius: 20, background: "var(--color-ink)", color: "var(--color-surface)", marginBottom: 16 }}
          >
            <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 600, margin: "0 0 8px" }}>
              AI Rank factors
            </p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
              Why you&apos;re ranked.
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {AI_RANK_FACTORS.map((f) => (
                <div key={f.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "oklch(100% 0 0 / 0.75)" }}>{f.label}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-accent)" }}>{f.pct}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 999, background: "oklch(100% 0 0 / 0.1)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${f.pct * 3.57}%`, background: "var(--color-accent)", borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div style={{ padding: 18, borderRadius: 20, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 12px" }}>
              Filters
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {(["all", "now", "today", "weekend"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUrgencyFilter(u)}
                  style={{
                    padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    border: urgencyFilter === u ? "1px solid var(--color-ink)" : "1px solid var(--color-line)",
                    background: urgencyFilter === u ? "var(--color-ink)" : "transparent",
                    color: urgencyFilter === u ? "var(--color-surface)" : "var(--color-ink-soft)",
                  }}
                >
                  {u === "all" ? "All" : URGENCY_CONFIG[u].label}
                </button>
              ))}
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>Max distance</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>{kmMax} km</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                value={kmMax}
                onChange={(e) => setKmMax(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--color-ink)" }}
              />
            </label>
          </div>
        </aside>

        {/* Right: gig grid */}
        <div>
          {visible.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", borderRadius: 20, border: "1px dashed var(--color-line)" }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: "0 0 8px" }}>No gigs in this range.</p>
              <p style={{ color: "var(--color-ink-soft)" }}>Try expanding your radius or changing the urgency filter.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {visible.map((g) => {
                const uc = URGENCY_CONFIG[g.urgency];
                return (
                  <article
                    key={g.id}
                    style={{
                      borderRadius: 20,
                      border: "1px solid var(--color-line)",
                      background: g.aiLocked ? "var(--color-muted)" : "var(--color-surface-raised)",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                      opacity: g.aiLocked ? 0.75 : 1,
                    }}
                  >
                    <div style={{ padding: "18px 18px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{ padding: "3px 10px", borderRadius: 999, background: uc.bg, color: uc.fg, fontSize: 11, fontWeight: 700 }}>
                          {uc.label}
                        </span>
                        <DistanceDots km={g.distanceKm} />
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-soft)", marginLeft: "auto" }}>
                          {g.distanceKm} km
                        </span>
                      </div>

                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, margin: "0 0 4px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                        {g.title}
                      </h3>
                      <p style={{ fontSize: 12.5, color: "var(--color-ink-soft)", margin: "0 0 10px" }}>
                        {g.employer} · {g.location}
                      </p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                        {g.skills.map((s) => (
                          <span key={s} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* AI reason card */}
                      <div
                        style={{
                          padding: "10px 12px",
                          borderRadius: 12,
                          background: g.aiLocked ? "oklch(70% 0.12 38 / 0.12)" : "var(--color-jade-soft)",
                          border: `1px solid ${g.aiLocked ? "oklch(70% 0.12 38 / 0.25)" : "oklch(from var(--color-jade) l c h / 0.3)"}`,
                          marginBottom: 14,
                        }}
                      >
                        <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: g.aiLocked ? "oklch(50% 0.12 38)" : "var(--color-jade-ink)", margin: "0 0 4px" }}>
                          {g.aiLocked ? "Why locked" : "Why you rank high"}
                        </p>
                        <p style={{ fontSize: 12, color: g.aiLocked ? "oklch(40% 0.08 38)" : "var(--color-jade-ink)", margin: 0, lineHeight: 1.4 }}>
                          {g.aiReason}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div
                      style={{
                        padding: "12px 18px",
                        borderTop: "1px solid var(--color-line)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "var(--color-surface)",
                        gap: 10,
                      }}
                    >
                      <div>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700 }}>
                          S${g.payRate}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--color-ink-soft)", marginLeft: 4 }}>
                          {g.payKind === "hourly" ? "/hr" : " fixed"}
                        </span>
                        {!g.aiLocked && (
                          <span style={{ marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "var(--color-jade-soft)", color: "var(--color-jade-ink)", fontWeight: 700 }}>
                            #{g.aiRank}
                          </span>
                        )}
                      </div>
                      {g.aiLocked ? (
                        <button style={{ padding: "7px 14px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", fontSize: 12, fontWeight: 600, color: "var(--color-ink-soft)", cursor: "pointer" }}>
                          Add credential →
                        </button>
                      ) : (
                        <AcceptButton gigId={g.id} onAccept={acceptInstantGig} />
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </main>
  );
}
