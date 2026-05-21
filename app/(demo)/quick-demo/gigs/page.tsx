"use client";

import { useState } from "react";
import Link from "next/link";
import { useDemo } from "../DemoProvider";
import { GIGS } from "../data";
import { useViewMode } from "../ViewModeContext";

const CATEGORY_COLORS: Record<string, string> = {
  tech: "#3b82f6",
  design: "#a855f7",
  events: "#f59e0b",
  marketing: "#ec4899",
  content: "#6366f1",
  tuition: "#10b981",
};

const CATEGORIES = Array.from(new Set(GIGS.map((g) => g.category)));

export default function DemoGigsPage() {
  const { applications, activeAccount, getGigsForAccount } = useDemo();
  const { viewMode } = useViewMode();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const allGigs = getGigsForAccount();
  const gigs = selectedCat ? allGigs.filter((g) => g.category === selectedCat) : allGigs;

  if (viewMode === "desktop") {
    return (
      <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
        <header style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 8px" }}>
            All open gigs
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 4vw, 4rem)", margin: 0, lineHeight: 0.98, letterSpacing: "-0.035em" }}>
            Browse <span style={{ color: "var(--color-accent-ink)" }}>open</span> assignments.
          </h1>
        </header>

        {/* Category filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedCat(null)}
            style={{
              padding: "7px 16px",
              borderRadius: 999,
              border: "1px solid",
              borderColor: selectedCat === null ? "var(--color-ink)" : "var(--color-line)",
              background: selectedCat === null ? "var(--color-ink)" : "transparent",
              color: selectedCat === null ? "var(--color-surface)" : "var(--color-ink-soft)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(selectedCat === cat ? null : cat)}
              style={{
                padding: "7px 16px",
                borderRadius: 999,
                border: "1px solid",
                borderColor: selectedCat === cat ? (CATEGORY_COLORS[cat] ?? "var(--color-ink)") : "var(--color-line)",
                background: selectedCat === cat ? (CATEGORY_COLORS[cat] ?? "var(--color-ink)") : "transparent",
                color: selectedCat === cat ? "#fff" : "var(--color-ink-soft)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gig list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {gigs.map((g) => {
            const catColor = CATEGORY_COLORS[g.category] ?? "var(--color-ink-mute)";
            const hasApplied = applications.some(
              (a: any) => a.gigId === g.id && a.freelancerId === activeAccount.id,
            );
            return (
              <Link
                key={g.id}
                href={`/quick-demo/gig/${g.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 160px",
                  gap: 20,
                  alignItems: "start",
                  padding: 22,
                  borderRadius: 18,
                  background: "var(--color-surface-raised)",
                  border: "1px solid var(--color-line)",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--color-ink)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-lift)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--color-line)";
                  (e.currentTarget as HTMLElement).style.transform = "none";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: catColor }}>
                      {g.category}
                    </span>
                    {hasApplied && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 999, background: "var(--color-jade-soft, #dcfce7)", color: "var(--color-jade-ink, #166534)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Applied
                      </span>
                    )}
                    {(g.headcount ?? 1) > 1 && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 999, background: "var(--color-accent-soft)", color: "var(--color-accent-ink)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {g.headcount} slots
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, margin: "0 0 4px", letterSpacing: "-0.02em", color: "var(--color-ink)" }}>
                    {g.title}
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: "0 0 10px" }}>
                    Darren Loh{" "}
                    <span style={{ fontSize: 10, color: "var(--color-jade, #16a34a)", fontWeight: 700 }}>✓ Verified</span>
                    {" "}· {g.location}
                  </p>
                  {g.skills.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {g.skills.slice(0, 5).map((s) => (
                        <span key={s} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-mute)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 800, color: "var(--color-ink)", margin: "0 0 4px" }}>
                    {g.budget}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "0 0 12px" }}>
                    {g.location}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: 0 }}>
                    {g.postedAgo}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    );
  }

  // Mobile layout
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid var(--color-line)", flexShrink: 0 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 4px", fontWeight: 600 }}>
          All open gigs
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, letterSpacing: "-0.025em", color: "var(--color-ink)" }}>
          Browse Gigs
        </h1>
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "3px 0 0" }}>
          {gigs.length} open positions
        </p>
      </div>

      {/* Category chips */}
      <div style={{ display: "flex", gap: 6, padding: "8px 12px", overflowX: "auto", flexShrink: 0, scrollbarWidth: "none" }}>
        <button
          onClick={() => setSelectedCat(null)}
          style={{ fontSize: 11, fontWeight: selectedCat === null ? 700 : 500, padding: "5px 12px", borderRadius: 999, border: "1px solid", borderColor: selectedCat === null ? "var(--color-ink)" : "var(--color-line)", background: selectedCat === null ? "var(--color-ink)" : "transparent", color: selectedCat === null ? "var(--color-surface)" : "var(--color-ink-soft)", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          All
        </button>
        {CATEGORIES.map((cat) => {
          const active = selectedCat === cat;
          const color = CATEGORY_COLORS[cat] ?? "var(--color-ink)";
          return (
            <button
              key={cat}
              onClick={() => setSelectedCat(active ? null : cat)}
              style={{ fontSize: 11, fontWeight: active ? 700 : 500, padding: "5px 12px", borderRadius: 999, border: "1px solid", borderColor: active ? color : "var(--color-line)", background: active ? color : "transparent", color: active ? "#fff" : "var(--color-ink-soft)", cursor: "pointer", whiteSpace: "nowrap", textTransform: "capitalize" }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 12px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {gigs.map((g) => {
            const catColor = CATEGORY_COLORS[g.category] ?? "var(--color-ink-mute)";
            const hasApplied = applications.some(
              (a: any) => a.gigId === g.id && a.freelancerId === activeAccount.id,
            );
            return (
              <Link
                key={g.id}
                href={`/quick-demo/gig/${g.id}`}
                style={{ display: "block", borderRadius: 14, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", boxShadow: "var(--shadow-soft)", padding: "12px 14px", textDecoration: "none", color: "inherit" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: catColor }}>
                    {g.category}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {hasApplied && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 999, background: "var(--color-jade-soft, #dcfce7)", color: "var(--color-jade-ink, #166534)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Applied
                      </span>
                    )}
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-ink-mute)" }}>
                      {g.postedAgo}
                    </span>
                  </div>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, margin: "0 0 3px", letterSpacing: "-0.02em", lineHeight: 1.15, color: "var(--color-ink)" }}>
                  {g.title}
                </h3>
                <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: "0 0 8px" }}>
                  Darren Loh{" "}
                  <span style={{ marginLeft: 4, fontSize: 10, color: "var(--color-jade, #16a34a)", fontWeight: 700 }}>✓ Verified</span>
                  {" "}· {g.location}
                </p>
                {g.skills.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                    {g.skills.slice(0, 4).map((s) => (
                      <span key={s} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-mute)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "var(--color-ink)" }}>
                    {g.budget}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--color-ink-soft)", fontWeight: 500 }}>View →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
