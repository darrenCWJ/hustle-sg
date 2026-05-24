"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "../DemoProvider";
import { useViewMode } from "../ViewModeContext";
import { DemoSwipeCardDeck } from "./DemoSwipeCardDeck";

type FeedFilter = "all" | "foryou" | "urgent";

const FILTER_TABS: { key: FeedFilter; label: string }[] = [
  { key: "all",    label: "All"             },
  { key: "foryou", label: "✨ For You"      },
  { key: "urgent", label: "⚡ Urgent nearby" },
];

export default function DemoFeedPage() {
  const { activeAccount, getGigsForAccount, applications } = useDemo();
  const { viewMode } = useViewMode();
  const router = useRouter();
  const [filter, setFilter] = useState<FeedFilter>("all");

  const appliedGigIds = new Set(
    applications.filter(a => a.freelancerId === activeAccount.id).map(a => a.gigId)
  );

  const baseGigs = getGigsForAccount().filter(g => !appliedGigIds.has(g.id));

  const gigs = (() => {
    if (filter === "foryou") {
      return baseGigs.filter(g => activeAccount.categories.includes(g.category));
    }
    if (filter === "urgent") {
      return [...baseGigs.filter(g => g.urgent === true)]
        .sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
    }
    return baseGigs;
  })();

  useEffect(() => {
    if (viewMode === "desktop") {
      router.replace("/quick-demo/dashboard");
    }
  }, [viewMode, router]);

  if (viewMode === "desktop") return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "10px 16px 0", flexShrink: 0 }}>
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
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 8px", letterSpacing: "-0.025em", color: "var(--color-ink)" }}>
          {filter === "foryou" ? activeAccount.specialization ?? "Matched for You"
            : filter === "urgent" ? "Urgent Nearby"
            : activeAccount.specialization ?? "Instant Gigs"}
        </h1>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
          {FILTER_TABS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  flexShrink: 0,
                  padding: "5px 12px",
                  borderRadius: 999,
                  border: active ? "none" : "1px solid var(--color-line)",
                  background: active ? "var(--color-ink)" : "var(--color-surface)",
                  color: active ? "var(--color-surface)" : "var(--color-ink-mute)",
                  fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                  transition: "all 0.12s",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "0 0 6px" }}>
          {filter === "foryou"
            ? `Matched to your skills · ${gigs.length} gig${gigs.length !== 1 ? "s" : ""}`
            : filter === "urgent"
            ? "Sorted by distance · urgent requests first"
            : "Swipe right to apply · left to skip"}
        </p>
      </div>

      {/* Swipe deck */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <DemoSwipeCardDeck key={`${activeAccount.id}-${filter}`} gigs={gigs} />
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}
