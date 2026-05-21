"use client";

import { useDemo } from "../DemoProvider";
import { DemoSwipeCardDeck } from "./DemoSwipeCardDeck";

export default function DemoFeedPage() {
  const { activeAccount, getGigsForAccount } = useDemo();
  const gigs = getGigsForAccount();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "10px 16px 8px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 10px",
            borderRadius: 999,
            background: "#dc2626",
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "pulse 1.4s ease-in-out infinite" }} />
            Live
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-mute)" }}>
            {gigs.length} available
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 2px", letterSpacing: "-0.025em", color: "var(--color-ink)" }}>
          {activeAccount.specialization ?? "Instant Gigs"}
        </h1>
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: 0 }}>
          Swipe right to apply · left to skip
        </p>
      </div>

      {/* Swipe deck */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <DemoSwipeCardDeck gigs={gigs} />
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}
