"use client";

import Link from "next/link";
import { budgetKindLabel } from "@/lib/utils";
import { SWIPE_THRESHOLD, URGENCY, type MobileGig } from "./deck-utils";

interface Props {
  gig: MobileGig;
  km: number | null;
  cardX: number;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
}

// The draggable top card: urgency chip, gig details, accept/skip overlays.
// All swipe state lives in SwipeCardDeck — this just renders at cardX.
export function GigCard({ gig, km, cardX, isDragging, onPointerDown, onPointerMove, onPointerUp }: Props) {
  const cardRotation = cardX * 0.055;
  const acceptPct = Math.min(1, Math.max(0, cardX / SWIPE_THRESHOLD));
  const skipPct = Math.min(1, Math.max(0, -cardX / SWIPE_THRESHOLD));
  const uc = URGENCY[gig.instant_urgency];

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 22,
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-line)",
        boxShadow: "var(--shadow-soft)",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
        transform: `translateX(${cardX}px) rotate(${cardRotation}deg)`,
        transition:
          isDragging ? "none" : "transform 0.34s cubic-bezier(0.34,1.56,0.64,1)",
        userSelect: "none",
        touchAction: "none",
        zIndex: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Skip overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(239,68,68,0.14)",
          opacity: skipPct,
          pointerEvents: "none",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 28px",
        }}
      >
        <span
          style={{
            fontSize: 34,
            fontWeight: 900,
            color: "#ef4444",
            letterSpacing: "0.05em",
            transform: `scale(${0.65 + skipPct * 0.35})`,
          }}
        >
          SKIP
        </span>
      </div>

      {/* Accept overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(22,163,74,0.14)",
          opacity: acceptPct,
          pointerEvents: "none",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "0 28px",
        }}
      >
        <span
          style={{
            fontSize: 34,
            fontWeight: 900,
            color: "#22c55e",
            letterSpacing: "0.05em",
            transform: `scale(${0.65 + acceptPct * 0.35})`,
          }}
        >
          ACCEPT
        </span>
      </div>

      {/* Card content */}
      <div style={{ padding: "16px 18px 0", flex: 1, overflowY: "hidden" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                background: uc.bg,
                color: uc.text,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {uc.label}
            </span>
            {gig.score !== undefined && (
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "rgba(22,163,74,0.12)",
                  color: "#16a34a",
                  fontSize: 11,
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {Math.round(gig.score * 100)}% match
              </span>
            )}
          </div>
          <span
            style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-mute)" }}
          >
            {km !== null ? `${km} km` : "Remote"}
          </span>
        </div>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            margin: "0 0 4px",
            letterSpacing: "-0.025em",
            lineHeight: 1.06,
            color: "var(--color-ink)",
          }}
        >
          {gig.title}
        </h2>

        <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: "0 0 10px" }}>
          {gig.employerName} · {gig.location}
        </p>

        {gig.description && (
          <p
            style={{
              fontSize: 14,
              color: "var(--color-ink-soft)",
              lineHeight: 1.55,
              margin: "0 0 14px",
              display: "-webkit-box",
              WebkitLineClamp: 5,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            } as React.CSSProperties}
          >
            {gig.description}
          </p>
        )}

        {gig.skills_required.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {gig.skills_required.slice(0, 5).map((s) => (
              <span
                key={s}
                style={{
                  fontSize: 10.5,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "var(--color-muted)",
                  color: "var(--color-ink-mute)",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card footer */}
      <div
        style={{
          padding: "10px 18px 14px",
          borderTop: "1px solid var(--color-line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 800, color: "var(--color-ink)" }}>
            S${(gig.budget_cents / 100).toFixed(0)}
          </span>
          <span style={{ fontSize: 12, color: "var(--color-ink-mute)", marginLeft: 6 }}>
            {budgetKindLabel(gig.budget_kind)}
          </span>
        </div>
        <Link
          href={`/m/gigs/${gig.id}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: 12,
            color: "var(--color-ink-soft)",
            padding: "6px 14px",
            border: "1px solid var(--color-line)",
            borderRadius: 999,
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Details
        </Link>
      </div>
    </div>
  );
}
