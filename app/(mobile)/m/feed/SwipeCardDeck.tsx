"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { acceptInstantGig } from "@/app/actions/gigs";
import { createClient } from "@/lib/supabase/client";
import {
  PTR_THRESHOLD,
  SWIPE_THRESHOLD,
  haversineKm,
  rowToMobileGig,
  type MobileGig,
} from "./deck-utils";
import { DeckOverlays, type DeckToast } from "./DeckOverlays";
import { EmptyDeck } from "./EmptyDeck";
import { GigCard } from "./GigCard";

export type { MobileGig } from "./deck-utils";

interface Props {
  gigs: MobileGig[];
  isLoggedIn: boolean;
}

export function SwipeCardDeck({ gigs: initial, isLoggedIn }: Props) {
  const hadGigs = initial.length > 0;
  const [queue, setQueue] = useState(initial);
  const [dx, setDx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [flyDir, setFlyDir] = useState<"left" | "right" | null>(null);
  const [toast, setToast] = useState<DeckToast | null>(null);
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

          setQueue((prev) => [rowToMobileGig(row, profile?.display_name ?? "Employer"), ...prev]);
          setNewGigBanner(true);
          setTimeout(() => setNewGigBanner(false), 4000);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const showToast = (kind: DeckToast) => {
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
    if (finalDx > SWIPE_THRESHOLD) dismiss("right");
    else if (finalDx < -SWIPE_THRESHOLD) dismiss("left");
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
            ...newOnes.map((g) => rowToMobileGig(g, (g.employerName as string) ?? "Employer")),
            ...prev,
          ]);
        }
      }
    } finally {
      setRefreshing(false);
    }
  };

  if (queue.length === 0) {
    return <EmptyDeck hadGigs={hadGigs} isLoggedIn={isLoggedIn} />;
  }

  const km =
    top && userLat !== null && userLon !== null && top.lat !== null && top.lon !== null
      ? Math.round(haversineKm(userLat, userLon, top.lat, top.lon) * 10) / 10
      : null;

  const cardX = flyDir === "right" ? 480 : flyDir === "left" ? -480 : dx;

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
      <DeckOverlays
        isPulling={isPulling}
        refreshing={refreshing}
        ptrDy={ptrDy}
        newGigBanner={newGigBanner}
        toast={toast}
      />

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

        <GigCard
          gig={top}
          km={km}
          cardX={cardX}
          isDragging={isDragging}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
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
    </div>
  );
}
