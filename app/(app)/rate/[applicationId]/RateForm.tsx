"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitRating } from "../actions";

interface Props {
  applicationId: string;
  rateeName: string;
  rateeHandle?: string;
  isEmployer: boolean;
}

const LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

export function RateForm({ applicationId, rateeName, isEmployer }: Props) {
  const router = useRouter();
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (stars === 0 || !review.trim() || pending) return;
    setPending(true);
    setError("");
    const result = await submitRating(applicationId, stars, review.trim());
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div style={{ padding: "48px 32px", borderRadius: 20, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: "0 0 8px", letterSpacing: "-0.025em" }}>
          Review submitted!
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: "0 0 24px" }}>
          Your review for {rateeName} has been saved.
        </p>
        <button
          onClick={() => router.push(isEmployer ? "/applicants" : "/applications")}
          style={{ padding: "12px 28px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Ratee chip */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 999, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", marginBottom: 28 }}>
        <span style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-muted)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>
          {rateeName.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
        </span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{rateeName}</span>
      </div>

      {/* Stars */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 10px", fontWeight: 600 }}>
          Your rating
        </p>
        <div role="radiogroup" aria-label="Your rating" style={{ display: "flex", gap: 4 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={stars === n}
              aria-label={`${n} ${n === 1 ? "star" : "stars"} — ${LABELS[n]}`}
              tabIndex={stars === n || (stars === 0 && n === 1) ? 0 : -1}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setStars(n)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                  e.preventDefault();
                  setStars(Math.min(5, (stars || 0) + 1));
                } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                  e.preventDefault();
                  setStars(Math.max(1, (stars || 1) - 1));
                }
              }}
              style={{ fontSize: 38, background: "none", border: "none", cursor: "pointer", padding: "0 2px", color: n <= (hovered || stars) ? "#f59e0b" : "var(--color-line)", transition: "color 0.1s", lineHeight: 1 }}
            >
              ★
            </button>
          ))}
        </div>
        {stars > 0 && (
          <p style={{ fontSize: 12, color: "var(--color-ink-mute)", margin: "6px 0 0" }}>{LABELS[stars]}</p>
        )}
      </div>

      {/* Review text */}
      <div style={{ marginBottom: 28 }}>
        <label htmlFor="review-text" style={{ display: "block", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 8px", fontWeight: 600 }}>
          Written review
        </label>
        <textarea
          id="review-text"
          value={review}
          onChange={(e) => setReview(e.target.value.slice(0, 300))}
          placeholder={
            isEmployer
              ? "Quality of work, communication, reliability…"
              : "Clarity of instructions, payment timeliness, communication…"
          }
          rows={4}
          style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--color-line)", background: "var(--color-surface)", fontSize: 14, lineHeight: 1.55, color: "var(--color-ink)", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
        />
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "4px 0 0", textAlign: "right" }}>
          {review.length} / 300
        </p>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: "#dc2626", margin: "0 0 16px" }}>{error}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={stars === 0 || !review.trim() || pending}
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 999,
          border: "none",
          background: stars > 0 && review.trim() && !pending ? "var(--color-ink)" : "var(--color-muted)",
          color: stars > 0 && review.trim() && !pending ? "var(--color-surface)" : "var(--color-ink-mute)",
          fontWeight: 700,
          fontSize: 15,
          cursor: stars > 0 && review.trim() && !pending ? "pointer" : "default",
        }}
      >
        {pending ? "Submitting…" : "Submit review"}
      </button>
    </div>
  );
}
