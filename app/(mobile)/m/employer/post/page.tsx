"use client";

import { useState, useRef } from "react";
import { redirect } from "next/navigation";
import { postGigMobile } from "./actions";

const CATEGORIES = [
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "finance", label: "Finance" },
  { value: "operations", label: "Operations" },
  { value: "pet-care", label: "Pet Care" },
  { value: "errands", label: "Errands" },
  { value: "home-help", label: "Home Help" },
  { value: "care", label: "Care" },
];

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: 10,
  border: "1px solid var(--color-line)",
  background: "var(--color-surface)",
  color: "var(--color-ink)",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
};

export default function MobilePostGigPage() {
  const [category, setCategory] = useState("");
  const [budgetKind, setBudgetKind] = useState<"fixed" | "hourly">("fixed");
  const [isInstant, setIsInstant] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fd = new FormData(formRef.current!);
      const res = await postGigMobile(fd);
      if (res && !res.ok) {
        setError(res.error ?? "Something went wrong.");
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
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
          Employer
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
          Post a Gig
        </h1>
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink-soft)" }}>
              Title <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              name="title"
              required
              placeholder="e.g. Weekend event helper"
              style={INPUT_STYLE}
            />
          </div>

          {/* Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink-soft)" }}>
              Description <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="What does the gig involve? What skills are needed?"
              style={{ ...INPUT_STYLE, resize: "none" }}
            />
          </div>

          {/* Category */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink-soft)" }}>Category</label>
            <input type="hidden" name="category" value={category} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(category === c.value ? "" : c.value)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 999,
                    border: "1px solid",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    WebkitTapHighlightColor: "transparent",
                    borderColor: category === c.value ? "var(--color-ink)" : "var(--color-line)",
                    background: category === c.value ? "var(--color-ink)" : "transparent",
                    color: category === c.value ? "var(--color-surface)" : "var(--color-ink-soft)",
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink-soft)" }}>
              Budget (SGD) <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 14,
                    color: "var(--color-ink-mute)",
                    pointerEvents: "none",
                  }}
                >
                  S$
                </span>
                <input
                  name="budget_dollars"
                  type="number"
                  required
                  min={1}
                  placeholder="0"
                  style={{ ...INPUT_STYLE, paddingLeft: 34 }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  background: "var(--color-muted)",
                  borderRadius: 10,
                  padding: 3,
                  gap: 2,
                }}
              >
                <input type="hidden" name="budget_kind" value={budgetKind} />
                {(["fixed", "hourly"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setBudgetKind(k)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "none",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      WebkitTapHighlightColor: "transparent",
                      background: budgetKind === k ? "var(--color-ink)" : "transparent",
                      color: budgetKind === k ? "var(--color-surface)" : "var(--color-ink-mute)",
                    }}
                  >
                    {k === "fixed" ? "Fixed" : "/hr"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink-soft)" }}>
              Location <span style={{ fontSize: 11, color: "var(--color-ink-mute)" }}>(optional)</span>
            </label>
            <input
              name="location"
              placeholder="e.g. Orchard, Singapore"
              style={INPUT_STYLE}
            />
          </div>

          {/* Instant toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid var(--color-line)",
              background: "var(--color-surface-raised)",
            }}
          >
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--color-ink)", margin: "0 0 2px" }}>
                ⚡ Instant hire
              </p>
              <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: 0 }}>
                Workers can accept immediately
              </p>
            </div>
            <input type="hidden" name="is_instant" value={isInstant ? "true" : "false"} />
            <button
              type="button"
              onClick={() => setIsInstant(!isInstant)}
              style={{
                width: 44,
                height: 26,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                position: "relative",
                WebkitTapHighlightColor: "transparent",
                background: isInstant ? "var(--color-accent)" : "var(--color-line)",
                transition: "background 0.2s",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: isInstant ? 21 : 3,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </button>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: "#dc2626", margin: 0, textAlign: "center" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "15px",
              borderRadius: 14,
              border: "none",
              background: loading ? "var(--color-accent-soft)" : "var(--color-accent)",
              color: loading ? "var(--color-accent-ink)" : "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {loading ? "Posting…" : "Post gig →"}
          </button>
        </form>
      </div>
    </div>
  );
}
