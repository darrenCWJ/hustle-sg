"use client";

import Link from "next/link";
import { useState } from "react";
import { sendDirectOffer } from "../../applicants/actions";

interface Candidate {
  user_id: string;
  handle: string | null;
  display_name: string;
  headline: string | null;
  score: number;
}

interface Props {
  candidates: Candidate[];
  gigId: string;
  existingApplicantIds: string[];
}

export function RecommendedCandidates({ candidates, gigId, existingApplicantIds }: Props) {
  const [statuses, setStatuses] = useState<Record<string, "idle" | "sending" | "sent" | "error">>({});
  const existingSet = new Set(existingApplicantIds);

  const visible = candidates.filter((c) => !existingSet.has(c.user_id));
  if (visible.length === 0) return null;

  async function handleOffer(userId: string) {
    setStatuses((prev) => ({ ...prev, [userId]: "sending" }));
    const result = await sendDirectOffer(userId, gigId);
    setStatuses((prev) => ({ ...prev, [userId]: result.ok ? "sent" : "error" }));
  }

  return (
    <section style={{ marginTop: 48, paddingTop: 40, borderTop: "1px solid var(--color-line)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            margin: 0,
            letterSpacing: "-0.025em",
          }}
        >
          Recommended candidates
        </h2>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            background: "var(--color-accent-soft)",
            color: "var(--color-accent-ink)",
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          AI matched
        </span>
      </div>
      <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: "0 0 24px" }}>
        Top freelancers ranked by profile similarity to this gig. Send direct offers instantly.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 14,
        }}
      >
        {visible.map((c) => {
          const status = statuses[c.user_id] ?? "idle";
          const pct = Math.round(c.score * 100);
          const highMatch = pct >= 70;
          return (
            <div
              key={c.user_id}
              style={{
                padding: 18,
                borderRadius: 16,
                background: "var(--color-surface-raised)",
                border: "1px solid var(--color-line)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 17,
                      margin: "0 0 2px",
                      letterSpacing: "-0.02em",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {c.display_name}
                  </p>
                  {c.handle && (
                    <p
                      style={{
                        fontSize: 11.5,
                        color: "var(--color-ink-mute)",
                        margin: 0,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      @{c.handle}
                    </p>
                  )}
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    padding: "3px 9px",
                    borderRadius: 999,
                    background: highMatch ? "var(--color-jade-soft)" : "var(--color-muted)",
                    color: highMatch ? "var(--color-jade-ink)" : "var(--color-ink-soft)",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {pct}%
                </span>
              </div>

              <div
                style={{
                  height: 3,
                  borderRadius: 999,
                  background: "var(--color-muted)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 999,
                    background: highMatch ? "var(--color-jade)" : "var(--color-accent)",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>

              {c.headline && (
                <p
                  style={{
                    fontSize: 12.5,
                    color: "var(--color-ink-soft)",
                    margin: 0,
                    lineHeight: 1.45,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {c.headline}
                </p>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 4 }}>
                {c.handle && (
                  <Link
                    href={`/profile/${c.handle}`}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 999,
                      border: "1px solid var(--color-line)",
                      fontSize: 12,
                      fontWeight: 600,
                      flexShrink: 0,
                      color: "var(--color-ink)",
                      textDecoration: "none",
                    }}
                  >
                    View
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => handleOffer(c.user_id)}
                  disabled={status !== "idle"}
                  style={{
                    flex: 1,
                    padding: "6px 14px",
                    borderRadius: 999,
                    border: "none",
                    background:
                      status === "sent"
                        ? "var(--color-jade-soft)"
                        : status === "error"
                          ? "#fee2e2"
                          : "var(--color-ink)",
                    color:
                      status === "sent"
                        ? "var(--color-jade-ink)"
                        : status === "error"
                          ? "#dc2626"
                          : "var(--color-surface)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: status === "idle" ? "pointer" : "default",
                    transition: "background 0.15s",
                  }}
                >
                  {status === "sending"
                    ? "Sending…"
                    : status === "sent"
                      ? "✓ Offer sent"
                      : status === "error"
                        ? "Already applied"
                        : "Send offer →"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
