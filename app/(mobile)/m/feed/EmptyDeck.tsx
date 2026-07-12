"use client";

import Link from "next/link";

interface Props {
  hadGigs: boolean;
  isLoggedIn: boolean;
}

// Shown when the swipe queue is empty — either every card was swiped
// (hadGigs) or nothing was posted today.
export function EmptyDeck({ hadGigs, isLoggedIn }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: 14,
        padding: "32px 28px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 48 }}>{hadGigs ? "🎉" : "🔍"}</div>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 26,
          color: "var(--color-ink)",
          margin: 0,
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
        }}
      >
        {hadGigs ? "You've seen them all!" : "No instant gigs today"}
      </p>
      <p style={{ color: "var(--color-ink-soft)", fontSize: 13.5, margin: 0, lineHeight: 1.55, maxWidth: 280 }}>
        {hadGigs
          ? "New instant gigs appear as employers post them. Check back later or browse regular assignments."
          : "No instant gigs have been posted for today yet. Pull down to refresh or browse all open assignments."}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300, marginTop: 8 }}>
        <Link
          href="/m/browse"
          style={{
            padding: "13px 28px",
            borderRadius: 999,
            background: "var(--color-ink)",
            color: "var(--color-surface)",
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          Browse all gigs →
        </Link>
        {!isLoggedIn && (
          <Link
            href="/m/singpass"
            style={{
              padding: "13px 28px",
              borderRadius: 999,
              border: "1px solid var(--color-line)",
              background: "var(--color-surface-raised)",
              color: "var(--color-ink)",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Sign in to get matched →
          </Link>
        )}
      </div>
    </div>
  );
}
