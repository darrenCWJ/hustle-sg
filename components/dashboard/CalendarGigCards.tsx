"use client";

import Link from "next/link";
import {
  DAYS,
  computeGigHighlight,
  formatBudget,
  gigDateLabel,
  gigMatchesSchedule,
  slotFromTime,
  slotFromTimeEnd,
  timeLabel,
  type RecommendedGig,
} from "@/lib/availability/calendar-grid";

// Amber preview color (warm, distinct from jade/accent) — shared with the
// calendar grid so hovering a card and its highlighted cells match.
export const PREVIEW_COLOR = "oklch(72% 0.18 55)";
export const PREVIEW_COLOR_SOFT = "oklch(92% 0.07 55)";
export const PREVIEW_COLOR_INK = "oklch(30% 0.1 55)";

interface Props {
  gigs: RecommendedGig[];
  userSlots: number[][];
  hoveredGigId: string | null;
  onHoverGig: (id: string | null) => void;
}

export function CalendarGigCards({ gigs, userSlots, hoveredGigId, onHoverGig }: Props) {
  if (gigs.length === 0) return null;

  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, gap: 10 }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, letterSpacing: "-0.02em" }}>
            Recommended for you
          </h3>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--color-ink-soft)" }}>
            Matched to your profile · hover a card to preview it in your calendar
          </p>
        </div>
        <Link href="/gigs" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink-soft)", flexShrink: 0, textDecoration: "none" }}>
          Browse all →
        </Link>
      </div>

      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 10, scrollSnapType: "x mandatory" }}>
        {gigs.map((g) => {
          const fits        = gigMatchesSchedule(g, userSlots);
          const isInstant   = g.is_instant;
          const overlaps    = (g.overlap_skills ?? []).slice(0, 3);
          const isHovering  = hoveredGigId === g.id;
          const highlight   = computeGigHighlight(g);
          const showTimeTag = !!(g.start_time && g.end_time);

          return (
            <div
              key={g.id}
              onMouseEnter={() => onHoverGig(g.id)}
              onMouseLeave={() => onHoverGig(null)}
              style={{
                minWidth: 215,
                maxWidth: 235,
                flexShrink: 0,
                padding: "14px 16px",
                borderRadius: 16,
                background: isHovering ? PREVIEW_COLOR_SOFT : "var(--color-surface-raised)",
                border: isHovering
                  ? `2px solid ${PREVIEW_COLOR}`
                  : fits
                    ? "1.5px solid oklch(from var(--color-jade) l c h / 0.5)"
                    : "1px solid var(--color-line)",
                scrollSnapAlign: "start",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                cursor: "default",
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              <div>
                {isInstant && (
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)", display: "block", marginBottom: 3 }}>
                    ⚡ {gigDateLabel(g)}
                  </span>
                )}
                <p style={{ margin: 0, fontWeight: 600, fontSize: 13, lineHeight: 1.35 }}>{g.title}</p>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--color-ink-mute)" }}>
                  {[g.category, g.location].filter(Boolean).join(" · ") || "General"}
                </p>
              </div>

              {/* Time + duration badge */}
              {(showTimeTag || g.duration_label) && (
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {showTimeTag && (
                    <span style={{ fontSize: 9.5, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: isHovering ? PREVIEW_COLOR : "var(--color-muted)", color: isHovering ? "white" : "var(--color-ink-soft)", fontFamily: "var(--font-mono)", transition: "background 0.15s, color 0.15s" }}>
                      {timeLabel(slotFromTime(g.start_time!))} – {timeLabel(slotFromTimeEnd(g.end_time!))}
                    </span>
                  )}
                  {g.duration_label && (
                    <span style={{ fontSize: 9.5, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)" }}>
                      {g.duration_label}
                    </span>
                  )}
                  {highlight && (
                    <span style={{ fontSize: 9.5, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)" }}>
                      {highlight.cols.map((c) => DAYS[c]).join(", ")}
                    </span>
                  )}
                </div>
              )}

              {overlaps.length > 0 && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {overlaps.map((sk) => (
                    <span key={sk} style={{ fontSize: 9.5, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "var(--color-jade-soft)", color: "var(--color-jade-ink)" }}>
                      {sk}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", gap: 8 }}>
                <div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--color-ink)" }}>
                    {formatBudget(g.budget_cents, g.budget_kind)}
                  </span>
                  {fits && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                      <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--color-jade)", display: "inline-block" }} />
                      <span style={{ fontSize: 9.5, color: "var(--color-jade-ink)", fontWeight: 600 }}>Fits schedule</span>
                    </div>
                  )}
                </div>
                <Link
                  href={isInstant ? "/instant" : `/gigs/${g.id}`}
                  style={{ fontSize: 11, fontWeight: 700, padding: "5px 13px", borderRadius: 999, background: isInstant ? "var(--color-accent)" : "var(--color-ink)", color: isInstant ? "oklch(22% 0.08 38)" : "var(--color-surface)", whiteSpace: "nowrap", textDecoration: "none", flexShrink: 0 }}
                >
                  {isInstant ? "⚡ Now" : "Apply →"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
