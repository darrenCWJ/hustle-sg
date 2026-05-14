"use client";

import { useState } from "react";
import { SOLE_PROP, PTE_LTD } from "@/lib/entrepreneur/entities";

export function ComparisonSection() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mb-16">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          background: open ? "var(--color-ink)" : "var(--color-surface-raised)",
          border: "1px solid var(--color-line)",
          borderRadius: open ? "16px 16px 0 0" : 16,
          padding: "18px 22px",
          cursor: "pointer",
          marginBottom: open ? 0 : 0,
          textAlign: "left",
          transition: "background 0.2s ease",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: open ? "oklch(100% 0 0 / 0.45)" : "var(--color-ink-mute)",
              fontWeight: 600,
              margin: "0 0 4px",
            }}
          >
            Pick your structure
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.2rem, 2vw, 1.5rem)",
              margin: 0,
              letterSpacing: "-0.02em",
              color: open ? "oklch(97% 0.012 85)" : "var(--color-ink)",
            }}
          >
            Determine the benefits of Sole Proprietorship vs Private Limited
          </h2>
        </div>
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: open ? "oklch(100% 0 0 / 0.12)" : "var(--color-ink)",
            color: open ? "oklch(97% 0.012 85)" : "var(--color-surface)",
            fontSize: 14,
            fontWeight: 700,
            flexShrink: 0,
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
          aria-hidden
        >
          ↓
        </span>
      </button>

      {open && (
        <div
          style={{
            border: "1px solid var(--color-line)",
            borderTop: "none",
            borderRadius: "0 0 16px 16px",
            padding: "24px",
            background: "var(--color-surface)",
          }}
        >
          <div className="grid md:grid-cols-2 gap-5 mb-6">
            {[SOLE_PROP, PTE_LTD].map((e) => (
              <div
                key={e.type}
                style={{
                  borderRadius: 20,
                  border: "1px solid var(--color-line)",
                  background: "var(--color-surface-raised)",
                  overflow: "hidden",
                }}
              >
                {/* Card header */}
                <div
                  style={{
                    padding: "22px 24px 18px",
                    borderBottom: "1px solid var(--color-line)",
                    background: e.type === "pte_ltd" ? "var(--color-ink)" : undefined,
                    color: e.type === "pte_ltd" ? "oklch(97% 0.012 85)" : undefined,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      opacity: 0.55,
                      fontWeight: 600,
                    }}
                  >
                    {e.type === "sole_prop" ? "Simple · Low cost" : "Serious · Scalable"}
                  </span>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 22,
                      margin: "6px 0 4px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {e.label}
                  </h3>
                  <p style={{ fontSize: 13, opacity: 0.65, margin: "0 0 12px" }}>{e.tagline}</p>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: e.type === "pte_ltd" ? "oklch(100% 0 0 / 0.12)" : "var(--color-muted)",
                      color: e.type === "pte_ltd" ? "oklch(97% 0.012 85)" : "var(--color-ink-soft)",
                    }}
                  >
                    {e.cost}
                  </span>
                </div>

                {/* Comparison rows */}
                <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "Liability", value: e.liability },
                    { label: "Tax", value: e.tax },
                    { label: "Investors", value: e.investors },
                    { label: "CPF", value: e.cpf },
                    { label: "Paperwork", value: e.paper_trail },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "var(--color-ink-mute)",
                          fontWeight: 600,
                          margin: "0 0 3px",
                        }}
                      >
                        {label}
                      </p>
                      <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.45 }}>
                        {value}
                      </p>
                    </div>
                  ))}

                  {/* Best for chips */}
                  <div>
                    <p
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--color-ink-mute)",
                        fontWeight: 600,
                        margin: "0 0 8px",
                      }}
                    >
                      Best for
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {e.bestFor.map((b) => (
                        <span
                          key={b}
                          style={{
                            fontSize: 11,
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: "var(--color-muted)",
                            color: "var(--color-ink-soft)",
                            fontWeight: 500,
                          }}
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                    {e.notes.map((n) => (
                      <li key={n} style={{ fontSize: 12, color: "var(--color-ink-mute)", lineHeight: 1.5 }}>
                        — {n}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendation callout */}
          <div
            style={{
              borderRadius: 14,
              border: "1px solid var(--color-line)",
              background: "var(--color-jade-soft)",
              padding: "16px 20px",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
            <p style={{ fontSize: 13, color: "var(--color-jade-ink)", margin: 0, lineHeight: 1.55 }}>
              <strong>Not sure?</strong> Start with a Sole Proprietorship to test the market — it takes minutes and costs S$115.
              You can convert to a Pte Ltd later without losing your business name or history.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
