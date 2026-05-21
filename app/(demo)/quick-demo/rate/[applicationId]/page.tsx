"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDemo } from "../../DemoProvider";
import { PROFILES, GIGS } from "../../data";

const AVATAR_HUES = [250, 165, 340, 38, 260, 200, 78, 310];

function getAvatar(name: string) {
  const hue = AVATAR_HUES[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_HUES.length];
  const initials = name.split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase();
  return { hue, initials };
}

export default function DemoRatePage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;

  const { activeAccount, applications, ratings, rateUser, hasRated } = useDemo();

  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const app = applications.find((a) => a.id === applicationId);

  if (!app) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-mute)" }}>
        Application not found.
      </div>
    );
  }

  if (app.status !== "completed") {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-mute)" }}>
        Ratings are only available after the gig is completed.
      </div>
    );
  }

  // Determine who the rater is rating
  const isEmployer = activeAccount.role === "employer";
  const rateeId = isEmployer ? app.freelancerId : "requestor";
  const ratee = PROFILES.find((p) => p.id === rateeId);

  // The gig info from ratings context (look it up from any existing rating or app)
  const existingRating = (ratings ?? []).find(
    (r) => r.applicationId === applicationId && r.fromId === activeAccount.id,
  );
  const alreadyRated = hasRated(applicationId, activeAccount.id);

  const gig = GIGS.find((g) => g.id === app.gigId);
  const gigTitle = gig?.title ?? existingRating?.gigTitle ?? `Gig #${app.gigId}`;

  function handleSubmit() {
    if (stars === 0 || !review.trim()) return;
    rateUser({
      applicationId,
      gigId: app!.gigId,
      fromId: activeAccount.id,
      toId: rateeId,
      stars,
      review: review.trim(),
      gigTitle,
    });
    setSubmitted(true);
  }

  const name = ratee?.name ?? "User";
  const { hue, initials } = getAvatar(name);

  if (submitted || alreadyRated) {
    const ratingToShow = alreadyRated
      ? (ratings ?? []).find(
          (r) => r.applicationId === applicationId && r.fromId === activeAccount.id,
        )
      : null;

    return (
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "60px 28px" }}>
        <div style={{ textAlign: "center", padding: "48px 32px", borderRadius: 20, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: "0 0 8px", letterSpacing: "-0.025em" }}>
            {submitted ? "Review submitted!" : "Already reviewed"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: "0 0 20px" }}>
            {submitted
              ? `Your review for ${name} has been saved.`
              : `You already left a review for ${name}.`}
          </p>
          {ratingToShow && (
            <div style={{ background: "var(--color-muted)", borderRadius: 12, padding: "14px 20px", marginBottom: 20, textAlign: "left" }}>
              <div style={{ color: "#f59e0b", fontSize: 20, marginBottom: 6 }}>
                {"★".repeat(ratingToShow.stars)}{"☆".repeat(5 - ratingToShow.stars)}
              </div>
              <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.55 }}>{ratingToShow.review}</p>
            </div>
          )}
          <button
            onClick={() => router.push("/quick-demo/dashboard")}
            style={{ padding: "12px 28px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}
          >
            Back to dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "50px 28px 80px" }}>
      <button
        onClick={() => router.push("/quick-demo/dashboard")}
        style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 28, fontWeight: 600 }}
      >
        ← Dashboard
      </button>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", margin: "0 0 6px", letterSpacing: "-0.025em" }}>
        Leave a review
      </h1>
      <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: "0 0 32px" }}>
        {isEmployer ? "How did the freelancer do?" : "How was working with this employer?"}
      </p>

      {/* Ratee card */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", borderRadius: 16, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", marginBottom: 28 }}>
        <span style={{ width: 48, height: 48, borderRadius: "50%", background: `oklch(78% 0.08 ${hue})`, color: `oklch(22% 0.08 ${hue})`, display: "grid", placeItems: "center", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
          {initials}
        </span>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>{name}</p>
          {ratee?.headline && (
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--color-ink-soft)" }}>{ratee.headline}</p>
          )}
        </div>
      </div>

      {/* Star picker */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 10px", fontWeight: 600 }}>
          Your rating
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setStars(n)}
              style={{
                fontSize: 36,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0 2px",
                color: n <= (hovered || stars) ? "#f59e0b" : "var(--color-line)",
                transition: "color 0.12s",
                lineHeight: 1,
              }}
            >
              ★
            </button>
          ))}
        </div>
        {stars > 0 && (
          <p style={{ fontSize: 12, color: "var(--color-ink-mute)", margin: "6px 0 0" }}>
            {["", "Poor", "Fair", "Good", "Great", "Excellent"][stars]}
          </p>
        )}
      </div>

      {/* Review text */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 8px", fontWeight: 600 }}>
          Written review
        </p>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder={isEmployer
            ? "Describe the quality of work, communication, reliability…"
            : "Describe the clarity of instructions, payment timeliness, communication…"}
          rows={4}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid var(--color-line)",
            background: "var(--color-surface)",
            fontSize: 14,
            lineHeight: 1.55,
            color: "var(--color-ink)",
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "4px 0 0", textAlign: "right" }}>
          {review.length} / 300
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={stars === 0 || !review.trim()}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 999,
          border: "none",
          background: stars > 0 && review.trim() ? "var(--color-ink)" : "var(--color-muted)",
          color: stars > 0 && review.trim() ? "var(--color-surface)" : "var(--color-ink-mute)",
          fontWeight: 700,
          fontSize: 15,
          cursor: stars > 0 && review.trim() ? "pointer" : "default",
          transition: "background 0.2s",
        }}
      >
        Submit review
      </button>
    </main>
  );
}
