"use client";

import Link from "next/link";
import { useDemo } from "../DemoProvider";

const CATEGORY_COLORS: Record<string, string> = {
  tech: "#3b82f6",
  design: "#a855f7",
  events: "#f59e0b",
  marketing: "#ec4899",
  content: "#6366f1",
  tuition: "#10b981",
};

export default function DemoFeedPage() {
  const { activeAccount, getGigsForAccount, applications } = useDemo();
  const gigs = getGigsForAccount();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          padding: "10px 16px 8px",
          borderBottom: "1px solid var(--color-line)",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-ink-mute)",
            margin: "0 0 4px",
            fontWeight: 600,
          }}
        >
          {activeAccount.specialization ?? "All categories"}
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            margin: 0,
            letterSpacing: "-0.025em",
            color: "var(--color-ink)",
          }}
        >
          Available Gigs
        </h1>
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "3px 0 0" }}>
          {gigs.length} open positions
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {gigs.map((g) => {
            const catColor = CATEGORY_COLORS[g.category] ?? "var(--color-ink-mute)";
            const hasApplied = applications.some(
              (a) => a.gigId === g.id && a.freelancerId === activeAccount.id,
            );
            return (
              <Link
                key={g.id}
                href={`/quick-demo/gig/${g.id}`}
                style={{
                  display: "block",
                  borderRadius: 14,
                  background: "var(--color-surface-raised)",
                  border: "1px solid var(--color-line)",
                  boxShadow: "var(--shadow-soft)",
                  padding: "12px 14px",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: catColor,
                    }}
                  >
                    {g.category}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {(g.headcount ?? 1) > 1 && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 999,
                          background: "var(--color-accent-soft, #ede9fe)",
                          color: "var(--color-accent-ink, #5b21b6)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {g.headcount} needed
                      </span>
                    )}
                    {hasApplied && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 999,
                          background: "var(--color-jade-soft, #dcfce7)",
                          color: "var(--color-jade-ink, #166534)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Applied
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--color-ink-mute)",
                      }}
                    >
                      {g.postedAgo}
                    </span>
                  </div>
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 15,
                    margin: "0 0 3px",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.15,
                    color: "var(--color-ink)",
                  }}
                >
                  {g.title}
                </h3>

                <p
                  style={{
                    fontSize: 12,
                    color: "var(--color-ink-soft)",
                    margin: "0 0 8px",
                  }}
                >
                  Darren Loh
                  <span
                    style={{
                      marginLeft: 5,
                      fontSize: 10,
                      color: "var(--color-jade, #16a34a)",
                      fontWeight: 700,
                    }}
                  >
                    ✓ Verified
                  </span>{" "}
                  · {g.location}
                </p>

                {g.skills.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                    {g.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        style={{
                          fontSize: 10,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "var(--color-muted)",
                          color: "var(--color-ink-mute)",
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--color-ink)",
                    }}
                  >
                    {g.budget}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--color-ink-soft)",
                      fontWeight: 500,
                    }}
                  >
                    View →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
