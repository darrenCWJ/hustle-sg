"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { acceptInstantGig } from "@/app/actions/gigs";
import { createClient } from "@/lib/supabase/client";

export interface MobileGig {
  id: string;
  title: string;
  description: string | null;
  location: string;
  lat: number | null;
  lon: number | null;
  budget_cents: number;
  budget_kind: "fixed" | "hourly";
  instant_urgency: "now" | "today" | "weekend";
  skills_required: string[];
  employerName: string;
  score?: number;
}

const URGENCY = {
  now: { label: "Right Now", bg: "#dc2626", text: "#fff" },
  today: { label: "Today", bg: "#d97706", text: "#fff" },
  weekend: { label: "Weekend", bg: "#16a34a", text: "#fff" },
};

const THRESHOLD = 85;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface Props {
  gigs: MobileGig[];
  isLoggedIn: boolean;
}

// Pull-to-refresh: swipe down on the whole deck container
const PTR_THRESHOLD = 72;

export function SwipeCardDeck({ gigs: initial, isLoggedIn }: Props) {
  const hadGigs = initial.length > 0;
  const [queue, setQueue] = useState(initial);
  const [dx, setDx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [flyDir, setFlyDir] = useState<"left" | "right" | null>(null);
  const [toast, setToast] = useState<"accepted" | "skipped" | "sign-in" | null>(null);
  const [newGigBanner, setNewGigBanner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [ptrDy, setPtrDy] = useState(0); // pull-to-refresh drag distance
  const [isPulling, setIsPulling] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const dxRef = useRef(0);
  const pullStartY = useRef(0);
  const seenIds = useRef(new Set(initial.map((g) => g.id)));

  const top = queue[0];

  // Geolocation
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLon(pos.coords.longitude);
      },
      () => {},
      { timeout: 8000, enableHighAccuracy: false },
    );
  }, []);

  // Supabase Realtime — auto-inject new instant gigs
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("mobile-instant-gigs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "gigs" },
        async (payload) => {
          const row = payload.new as Record<string, unknown>;
          if (!row.is_instant || seenIds.current.has(row.id as string)) return;
          seenIds.current.add(row.id as string);

          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", row.employer_id as string)
            .single();

          const gig: MobileGig = {
            id: row.id as string,
            title: row.title as string,
            description: (row.description as string) ?? null,
            location: (row.location as string) ?? "Singapore",
            lat: (row.lat as number) ?? null,
            lon: (row.lon as number) ?? null,
            budget_cents: row.budget_cents as number,
            budget_kind: row.budget_kind as "fixed" | "hourly",
            instant_urgency: row.instant_urgency as "now" | "today" | "weekend",
            skills_required: (row.skills_required as string[]) ?? [],
            employerName: profile?.display_name ?? "Employer",
          };

          setQueue((prev) => [gig, ...prev]);
          setNewGigBanner(true);
          setTimeout(() => setNewGigBanner(false), 4000);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const showToast = (kind: "accepted" | "skipped" | "sign-in") => {
    setToast(kind);
    setTimeout(() => setToast(null), 2200);
  };

  const dismiss = useCallback(
    (dir: "left" | "right") => {
      if (!top || flyDir) return;

      if (dir === "right" && !isLoggedIn) {
        setIsDragging(false);
        showToast("sign-in");
        setDx(0);
        dxRef.current = 0;
        return;
      }

      setIsDragging(false);
      setFlyDir(dir);
      if (dir === "right") {
        acceptInstantGig(top.id).catch(() => {});
        showToast("accepted");
      } else {
        showToast("skipped");
      }
      setTimeout(() => {
        setQueue((prev) => prev.slice(1));
        dxRef.current = 0;
        setDx(0);
        setFlyDir(null);
      }, 340);
    },
    [top, flyDir, isLoggedIn],
  );

  // --- Card pointer events ---
  const onPointerDown = (e: React.PointerEvent) => {
    if (flyDir) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    dxRef.current = 0;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || flyDir) return;
    const newDx = e.clientX - startX.current;
    dxRef.current = newDx;
    setDx(newDx);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const finalDx = dxRef.current;
    if (finalDx > THRESHOLD) dismiss("right");
    else if (finalDx < -THRESHOLD) dismiss("left");
    else setDx(0);
  };

  // --- Pull-to-refresh on the outer wrapper ---
  const onPtrTouchStart = (e: React.TouchEvent) => {
    pullStartY.current = e.touches[0].clientY;
    setIsPulling(false);
    setPtrDy(0);
  };

  const onPtrTouchMove = (e: React.TouchEvent) => {
    if (isDragging) return; // card drag takes priority
    const delta = e.touches[0].clientY - pullStartY.current;
    if (delta > 0 && delta < 120) {
      setPtrDy(delta);
      setIsPulling(true);
    }
  };

  const onPtrTouchEnd = async () => {
    if (!isPulling || ptrDy < PTR_THRESHOLD || refreshing) {
      setIsPulling(false);
      setPtrDy(0);
      return;
    }
    setIsPulling(false);
    setPtrDy(0);
    setRefreshing(true);
    try {
      const res = await fetch("/api/instant-gigs");
      if (res.ok) {
        const fresh: Array<Record<string, unknown>> = await res.json();
        const newOnes = fresh.filter((g) => !seenIds.current.has(g.id as string));
        for (const g of newOnes) seenIds.current.add(g.id as string);
        if (newOnes.length > 0) {
          setQueue((prev) => [
            ...newOnes.map((g) => ({
              id: g.id as string,
              title: g.title as string,
              description: null,
              location: (g.location as string) ?? "Singapore",
              lat: (g.lat as number) ?? null,
              lon: (g.lon as number) ?? null,
              budget_cents: g.budget_cents as number,
              budget_kind: g.budget_kind as "fixed" | "hourly",
              instant_urgency: g.instant_urgency as "now" | "today" | "weekend",
              skills_required: (g.skills_required as string[]) ?? [],
              employerName: (g.employerName as string) ?? "Employer",
              score: typeof g.score === "number" ? g.score : undefined,
            })),
            ...prev,
          ]);
        }
      }
    } finally {
      setRefreshing(false);
    }
  };

  // --- Empty state ---
  if (queue.length === 0) {
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

  const km =
    top && userLat !== null && userLon !== null && top.lat !== null && top.lon !== null
      ? Math.round(haversineKm(userLat, userLon, top.lat, top.lon) * 10) / 10
      : null;

  const cardX = flyDir === "right" ? 480 : flyDir === "left" ? -480 : dx;
  const cardRotation = cardX * 0.055;
  const acceptPct = Math.min(1, Math.max(0, cardX / THRESHOLD));
  const skipPct = Math.min(1, Math.max(0, -cardX / THRESHOLD));
  const uc = URGENCY[top.instant_urgency];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "8px 12px 8px",
        transform: isPulling ? `translateY(${ptrDy * 0.4}px)` : "none",
        transition: isPulling ? "none" : "transform 0.3s ease",
      }}
      onTouchStart={onPtrTouchStart}
      onTouchMove={onPtrTouchMove}
      onTouchEnd={onPtrTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(isPulling || refreshing) && (
        <div
          style={{
            position: "absolute",
            top: -8,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            padding: "6px 16px",
            borderRadius: 999,
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-line)",
            color: "var(--color-ink-soft)",
            fontSize: 12,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {refreshing ? (
            <>
              <span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span>
              Refreshing…
            </>
          ) : ptrDy >= PTR_THRESHOLD ? (
            "Release to refresh"
          ) : (
            "Pull to refresh"
          )}
        </div>
      )}

      {/* New gig banner */}
      {newGigBanner && (
        <div
          style={{
            position: "absolute",
            top: 6,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            padding: "7px 18px",
            borderRadius: 999,
            background: "#16a34a",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            animation: "slideDown 0.3s ease",
            whiteSpace: "nowrap",
          }}
        >
          ⚡ New gig just posted!
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            padding: "8px 20px",
            borderRadius: 999,
            background:
              toast === "accepted"
                ? "#16a34a"
                : toast === "sign-in"
                  ? "#2563eb"
                  : "var(--color-ink)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.04em",
            pointerEvents: toast === "sign-in" ? "auto" : "none",
            animation: `fadeInOut ${toast === "sign-in" ? "2.2s" : "1.6s"} ease forwards`,
            whiteSpace: "nowrap",
          }}
        >
          {toast === "accepted" ? (
            "✓ Accepted!"
          ) : toast === "sign-in" ? (
            <Link
              href="/m/singpass?next=/m/feed"
              style={{ color: "#fff", textDecoration: "underline" }}
            >
              Sign in to accept gigs →
            </Link>
          ) : (
            "Skipped"
          )}
        </div>
      )}

      {/* Card stack */}
      <div style={{ flex: 1, position: "relative", marginBottom: 14 }}>
        {queue[2] && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 22,
              background: "var(--color-muted)",
              border: "1px solid var(--color-line-soft)",
              transform: "scale(0.90) translateY(20px)",
              transformOrigin: "bottom center",
              zIndex: 1,
            }}
          />
        )}
        {queue[1] && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 22,
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-line-soft)",
              transform: "scale(0.95) translateY(10px)",
              transformOrigin: "bottom center",
              zIndex: 2,
            }}
          />
        )}

        {/* Top card */}
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
                {top.score !== undefined && (
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
                    {Math.round(top.score * 100)}% match
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
              {top.title}
            </h2>

            <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: "0 0 10px" }}>
              {top.employerName} · {top.location}
            </p>

            {top.description && (
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
                {top.description}
              </p>
            )}

            {top.skills_required.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {top.skills_required.slice(0, 5).map((s) => (
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
                S${(top.budget_cents / 100).toFixed(0)}
              </span>
              <span style={{ fontSize: 12, color: "var(--color-ink-mute)", marginLeft: 6 }}>
                {top.budget_kind === "hourly" ? "/hr" : "fixed"}
              </span>
            </div>
            <Link
              href={`/m/gigs/${top.id}`}
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
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          paddingBottom: 4,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => dismiss("left")}
          style={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.10)",
            border: "1.5px solid rgba(239,68,68,0.28)",
            color: "#ef4444",
            fontSize: 22,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            WebkitTapHighlightColor: "transparent",
          }}
          aria-label="Skip"
        >
          ✕
        </button>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--color-ink)" }}>
            {queue.length}
          </div>
          <div style={{ fontSize: 10, color: "var(--color-ink-mute)", letterSpacing: "0.04em" }}>
            left
          </div>
        </div>

        {isLoggedIn ? (
          <button
            onClick={() => dismiss("right")}
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: "rgba(22,163,74,0.10)",
              border: "1.5px solid rgba(22,163,74,0.28)",
              color: "#22c55e",
              fontSize: 22,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              WebkitTapHighlightColor: "transparent",
            }}
            aria-label="Accept gig"
          >
            ✓
          </button>
        ) : (
          <Link
            href="/m/singpass?next=/m/feed"
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: "rgba(22,163,74,0.10)",
              border: "1.5px solid rgba(22,163,74,0.28)",
              color: "#22c55e",
              fontSize: 22,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              WebkitTapHighlightColor: "transparent",
            }}
            aria-label="Sign in to accept"
          >
            ✓
          </Link>
        )}
      </div>

      <style>{`
        @keyframes fadeInOut {
          0% { opacity:0; transform:translateX(-50%) translateY(-6px); }
          15% { opacity:1; transform:translateX(-50%) translateY(0); }
          75% { opacity:1; }
          100% { opacity:0; }
        }
        @keyframes slideDown {
          from { opacity:0; transform:translateX(-50%) translateY(-10px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
