"use client";

import { useState, useRef } from "react";
import { useDemo } from "../DemoProvider";
import type { BookedSlot } from "../DemoProvider";
import type { DemoGig } from "../data";

function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function hasTimeConflict(gig: DemoGig, slots: BookedSlot[]): boolean {
  if (!gig.startTime || !gig.endTime) return false;
  const gs = toMin(gig.startTime);
  const ge = toMin(gig.endTime);
  return slots.some((s) => gs < toMin(s.endTime) && toMin(s.startTime) < ge);
}

const THRESHOLD = 85;

const CATEGORY_COLORS: Record<string, string> = {
  tech: "#3b82f6",
  design: "#a855f7",
  events: "#f59e0b",
  marketing: "#ec4899",
  content: "#6366f1",
  tuition: "#10b981",
  community: "#f97316",
};

interface Props {
  gigs: DemoGig[];
}

export function DemoSwipeCardDeck({ gigs: initial }: Props) {
  const { applyToGig, applications, activeAccount, bookedSlots } = useDemo();
  const [queue, setQueue] = useState(initial);
  const [dx, setDx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [flyDir, setFlyDir] = useState<"left" | "right" | null>(null);
  const [toast, setToast] = useState<"applied" | "skipped" | null>(null);
  const startX = useRef(0);
  const dxRef = useRef(0);

  const top = queue[0];

  function showToast(type: "applied" | "skipped") {
    setToast(type);
    setTimeout(() => setToast(null), 1400);
  }

  function dismiss(dir: "left" | "right") {
    if (!top) return;
    if (dir === "right") {
      applyToGig(top.id);
      showToast("applied");
    } else {
      showToast("skipped");
    }
    setFlyDir(dir);
    setTimeout(() => {
      setQueue((q) => q.slice(1));
      setFlyDir(null);
      setDx(0);
      dxRef.current = 0;
    }, 320);
  }

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging) return;
    const d = e.clientX - startX.current;
    dxRef.current = d;
    setDx(d);
  }

  function onPointerUp() {
    if (!isDragging) return;
    setIsDragging(false);
    const d = dxRef.current;
    if (d > THRESHOLD) dismiss("right");
    else if (d < -THRESHOLD) dismiss("left");
    else {
      setDx(0);
      dxRef.current = 0;
    }
  }

  const hasApplied = top
    ? applications.some((a) => a.gigId === top.id && a.freelancerId === activeAccount.id)
    : false;

  const isConflict = top ? hasTimeConflict(top, bookedSlots) : false;

  const cardStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    margin: "auto",
    width: "calc(100% - 32px)",
    maxWidth: 420,
    height: "calc(100% - 20px)",
    borderRadius: 20,
    background: "var(--color-surface-raised)",
    border: "1px solid var(--color-line)",
    boxShadow: "var(--shadow-lift)",
    cursor: isDragging ? "grabbing" : "grab",
    userSelect: "none",
    touchAction: "none",
    transition: flyDir ? "transform 0.32s cubic-bezier(0.2,0,0.4,1), opacity 0.32s" : isDragging ? "none" : "transform 0.2s",
    transform: flyDir === "right"
      ? "translateX(120vw) rotate(18deg)"
      : flyDir === "left"
      ? "translateX(-120vw) rotate(-18deg)"
      : `translateX(${dx}px) rotate(${dx * 0.04}deg)`,
    opacity: flyDir ? 0 : 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  if (queue.length === 0) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, padding: 32 }}>
        <div style={{ fontSize: 40 }}>🎉</div>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: 0, letterSpacing: "-0.02em", color: "var(--color-ink)" }}>
          You&apos;ve seen all gigs!
        </p>
        <p style={{ fontSize: 13, color: "var(--color-ink-mute)", margin: 0 }}>
          Check your Applied tab to track progress.
        </p>
      </div>
    );
  }

  const catColor = CATEGORY_COLORS[top.category] ?? "var(--color-ink-mute)";
  const swipeRight = dx > THRESHOLD * 0.5;
  const swipeLeft = dx < -THRESHOLD * 0.5;

  return (
    <div style={{ position: "relative", height: "100%", overflow: "hidden" }}>
      {/* Next card ghost */}
      {queue[1] && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            margin: "auto",
            width: "calc(100% - 48px)",
            maxWidth: 400,
            height: "calc(100% - 30px)",
            borderRadius: 20,
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-line)",
            transform: "scale(0.96) translateY(8px)",
            zIndex: 0,
          }}
        />
      )}

      {/* Top card */}
      <div
        style={{ ...cardStyle, zIndex: 1 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Swipe overlays */}
        {swipeRight && (
          <div style={{ position: "absolute", inset: 0, borderRadius: 20, background: "rgba(22,163,74,0.15)", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 48, transform: `scale(${Math.min(1, (dx - THRESHOLD * 0.5) / 40)})`, transition: "transform 0.1s" }}>✓</span>
          </div>
        )}
        {swipeLeft && (
          <div style={{ position: "absolute", inset: 0, borderRadius: 20, background: "rgba(220,38,38,0.12)", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 48, transform: `scale(${Math.min(1, (-dx - THRESHOLD * 0.5) / 40)})`, transition: "transform 0.1s" }}>✕</span>
          </div>
        )}

        {/* Time conflict banner */}
        {isConflict && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 3, background: "#dc2626", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", padding: "6px 12px", borderRadius: "20px 20px 0 0" }}>
            ⚠ Time conflict — slot already booked
          </div>
        )}

        {/* Card content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Image */}
          {top.imageUrl && (
            <div style={{ width: "100%", height: 180, overflow: "hidden", borderRadius: "20px 20px 0 0", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={top.imageUrl}
                alt={top.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                draggable={false}
              />
            </div>
          )}

          <div style={{ padding: "16px 20px 0" }}>
          {/* Budget */}
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 800, color: "var(--color-ink)" }}>
              {top.budget}
            </span>
          </div>

          {/* Title */}
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 8px", letterSpacing: "-0.025em", lineHeight: 1.1, color: "var(--color-ink)" }}>
            {top.title}
          </h2>

          {/* Employer + category */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            {top.category === "community" ? (
              <>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 999, background: "#fff7ed", color: "#f97316", border: "1px solid #fed7aa", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  🤝 Community Help
                </span>
                {top.urgent && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    ⚡ Urgent
                  </span>
                )}
                {top.distanceKm !== undefined && (
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", letterSpacing: "0.03em" }}>
                    📍 {top.distanceKm} km away
                  </span>
                )}
              </>
            ) : (
              <>
                <span style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>
                  Darren Loh
                  <span style={{ marginLeft: 5, fontSize: 10, color: "var(--color-jade, #16a34a)", fontWeight: 700 }}>
                    ✓ Verified
                  </span>
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: catColor }}>
                  {top.category}
                </span>
              </>
            )}
          </div>

          {/* Location */}
          <p style={{ fontSize: 12, color: "var(--color-ink-mute)", margin: "0 0 4px" }}>
            {top.location} · {top.postedAgo}
          </p>

          {/* Timing badge */}
          {top.startTime && top.endTime && (
            <p style={{ fontSize: 11, color: isConflict ? "#dc2626" : "var(--color-ink-soft)", margin: "0 0 12px", fontWeight: 600 }}>
              🕐 {top.startTime}–{top.endTime}
              {isConflict && " · conflicts with accepted gig"}
            </p>
          )}

          {/* Description */}
          <p style={{ fontSize: 14, color: "var(--color-ink-soft)", lineHeight: 1.55, margin: "0 0 14px" }}>
            {top.description}
          </p>

          {/* Skills */}
          {top.skills.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
              {top.skills.map((s) => (
                <span key={s} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-mute)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {s}
                </span>
              ))}
            </div>
          )}
          </div>{/* end inner padding div */}
        </div>

        {/* Bottom action bar */}
        <div style={{ padding: "12px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--color-line)", background: "var(--color-surface-raised)" }}>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => dismiss("left")}
            style={{ width: 52, height: 52, borderRadius: "50%", border: "2px solid var(--color-line)", background: "var(--color-surface)", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ✕
          </button>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 10, color: isConflict ? "#dc2626" : "var(--color-ink-mute)", margin: 0, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {isConflict ? "Time conflict" : hasApplied ? "Already applied" : "Swipe to apply"}
            </p>
            <p style={{ fontSize: 9, color: "var(--color-ink-mute)", margin: "2px 0 0" }}>
              {queue.length} gig{queue.length !== 1 ? "s" : ""} left
            </p>
          </div>

          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => !hasApplied && !isConflict && dismiss("right")}
            disabled={hasApplied || isConflict}
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              border: "none",
              background: hasApplied || isConflict ? "var(--color-muted)" : "var(--color-jade, #16a34a)",
              color: "#fff",
              fontSize: 22,
              cursor: hasApplied || isConflict ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✓
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "8px 20px",
            borderRadius: 999,
            background: toast === "applied" ? "var(--color-jade, #16a34a)" : "var(--color-ink)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            zIndex: 10,
            pointerEvents: "none",
            animation: "fadeInOut 1.4s ease forwards",
          }}
        >
          {toast === "applied" ? "Applied!" : "Skipped"}
        </div>
      )}

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          15% { opacity: 1; transform: translateX(-50%) translateY(0); }
          75% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
