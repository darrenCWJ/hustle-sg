"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AcceptButton } from "./AcceptButton";
import { CreateInstantModal } from "./CreateInstantModal";
import { acceptInstantGig } from "@/app/actions/gigs";
import type { InstantGigRow } from "@/app/actions/instant";
import { budgetKindLabel } from "@/lib/utils";

interface InstantGig extends InstantGigRow {
  distanceKm: number | null;
  aiRank: number;
  aiReason: string;
  aiLocked: boolean;
}

const AI_RANK_FACTORS = [
  { label: "Distance", pct: 28 },
  { label: "Skill match", pct: 24 },
  { label: "Trust score", pct: 18 },
  { label: "Response speed", pct: 14 },
  { label: "Repeat rate", pct: 10 },
  { label: "Calendar fit", pct: 6 },
];

const URGENCY_CONFIG = {
  now: { label: "Need now", bg: "oklch(52% 0.22 25)", fg: "#fff" },
  today: { label: "Today", bg: "var(--color-accent)", fg: "oklch(22% 0.08 38)" },
  weekend: { label: "Weekend", bg: "var(--color-jade-soft)", fg: "var(--color-jade-ink)" },
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceScore(km: number | null): number {
  if (km === null) return 0.6;
  if (km < 1) return 1.0;
  if (km < 3) return 0.85;
  if (km < 7) return 0.65;
  if (km < 15) return 0.45;
  return 0.25;
}

function computeAiRank(score: number, km: number | null): number {
  const ds = distanceScore(km);
  return Math.round((score * 0.55 + ds * 0.45) * 100);
}

function aiReason(score: number, km: number | null, skills: string[]): string {
  const parts: string[] = [];
  if (score > 0.7) parts.push(`Strong skill match (${skills.slice(0, 2).join(", ")})`);
  else if (score > 0.5) parts.push(`Partial skill match`);
  else parts.push(`Low skill overlap`);

  if (km !== null) {
    if (km < 2) parts.push(`${km.toFixed(1)} km away`);
    else if (km < 8) parts.push(`${km.toFixed(1)} km — moderate distance`);
    else parts.push(`${km.toFixed(0)} km — distance reduces rank`);
  } else {
    parts.push("remote gig");
  }

  return parts.join(" · ");
}

function DistanceDots({ km }: { km: number | null }) {
  const filled = km === null ? 4 : km < 2 ? 5 : km < 5 ? 4 : km < 9 ? 3 : km < 15 ? 2 : 1;
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 6, height: 6, borderRadius: "50%",
            background: i < filled ? "var(--color-jade)" : "var(--color-muted)",
          }}
        />
      ))}
    </span>
  );
}

function GuestSidebar({ kmMax, setKmMax, hasLocation, geoLoading }: {
  kmMax: number;
  setKmMax: (v: number) => void;
  hasLocation: boolean;
  geoLoading: boolean;
}) {
  return (
    <aside>
      <div className="grain" style={{ position: "relative", padding: 24, borderRadius: 20, background: "var(--color-ink)", color: "var(--color-surface)", marginBottom: 16 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 600, margin: "0 0 8px" }}>
          AI Ranking
        </p>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          See where you rank.
        </h3>
        <p style={{ fontSize: 13, color: "oklch(100% 0 0 / 0.55)", lineHeight: 1.55, margin: "0 0 20px" }}>
          Sign in with Singpass to get your personal AI rank score based on distance, verified skills, and trust score.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {AI_RANK_FACTORS.map((f) => (
            <div key={f.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "oklch(100% 0 0 / 0.55)" }}>{f.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "oklch(100% 0 0 / 0.2)" }}>—%</span>
              </div>
              <div style={{ height: 4, borderRadius: 999, background: "oklch(100% 0 0 / 0.08)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: "100%", background: "oklch(100% 0 0 / 0.06)", borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/singpass"
          style={{
            display: "block", marginTop: 22, textAlign: "center",
            padding: "10px 16px", borderRadius: 999,
            background: "var(--color-accent)", color: "oklch(22% 0.08 38)",
            fontSize: 13, fontWeight: 700, textDecoration: "none",
          }}
        >
          Log in / Sign up →
        </Link>
      </div>

      <div style={{ padding: 18, borderRadius: 20, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 12px" }}>
          Filters
        </p>
        <label style={{ display: "flex", flexDirection: "column", gap: 8, opacity: hasLocation ? 1 : 0.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>Max distance</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>{kmMax} km</span>
          </div>
          <input type="range" min={1} max={30} value={kmMax} onChange={(e) => setKmMax(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--color-ink)" }} disabled={!hasLocation} />
        </label>
        {!hasLocation && (
          <p style={{ fontSize: 11, color: "var(--color-ink-soft)", margin: "8px 0 0", lineHeight: 1.4 }}>
            {geoLoading ? "Locating you…" : "Allow location access to filter by distance."}
          </p>
        )}
      </div>
    </aside>
  );
}

interface Props {
  isLoggedIn: boolean;
  isEmployer: boolean;
  initialGigs: InstantGigRow[];
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}${m ? `:${String(m).padStart(2, "0")}` : ""}${ampm}`;
}

export function InstantPageClient({ isLoggedIn, isEmployer, initialGigs }: Props) {
  const [kmMax, setKmMax] = useState(30);
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "now" | "today" | "weekend">("all");
  const [showModal, setShowModal] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [gigs, setGigs] = useState<InstantGigRow[]>(initialGigs);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Responsive layout detection
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Request geolocation on mount
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLon(pos.coords.longitude);
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 8000, enableHighAccuracy: false },
    );
  }, []);

  const refreshGigs = useCallback(async () => {
    const res = await fetch("/api/instant-gigs");
    if (res.ok) {
      const data = await res.json();
      setGigs(data);
    }
  }, []);

  // Build enriched gig list with computed distance and AI rank
  const enrichedGigs: InstantGig[] = gigs.map((g) => {
    const km =
      userLat !== null && userLon !== null && g.lat !== null && g.lon !== null
        ? Math.round(haversineKm(userLat, userLon, g.lat, g.lon) * 10) / 10
        : null;

    const rank = isLoggedIn ? computeAiRank(g.score, km) : 0;
    const locked = isLoggedIn && g.score < 0.35;

    return {
      ...g,
      distanceKm: km,
      aiRank: rank,
      aiReason: isLoggedIn ? aiReason(g.score, km, g.skills_required) : "",
      aiLocked: locked,
    };
  });

  // Sort: if logged in, by combined rank desc; else by distance asc (nulls last)
  const sorted = [...enrichedGigs].sort((a, b) => {
    if (isLoggedIn) return b.aiRank - a.aiRank;
    if (a.distanceKm === null && b.distanceKm === null) return 0;
    if (a.distanceKm === null) return 1;
    if (b.distanceKm === null) return -1;
    return a.distanceKm - b.distanceKm;
  });

  const visible = sorted.filter((g) => {
    const distOk = g.distanceKm === null || g.distanceKm <= kmMax;
    const urgencyOk = urgencyFilter === "all" || g.instant_urgency === urgencyFilter;
    return distOk && urgencyOk;
  });

  const layoutStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "280px 1fr",
    gap: 28,
    alignItems: "start",
  };

  const gigGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
    gap: 16,
  };

  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: isMobile ? "28px 16px 60px" : "50px 28px 80px" }}>
      {/* Header */}
      <header style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "inline-flex", borderRadius: 999, background: "var(--color-muted)", padding: 3, gap: 2 }}>
            <Link href="/gigs" style={{ padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 500, color: "var(--color-ink-soft)", textDecoration: "none" }}>
              Gigs
            </Link>
            <span style={{ padding: "6px 16px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "oklch(52% 0.22 25)", display: "inline-block" }} />
              Instant
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "oklch(52% 0.22 25)", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", animation: "pulse 1.4s ease-in-out infinite" }} />
            Live
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-soft)" }}>
            {gigs.length} gigs available {geoLoading ? "· locating you…" : userLat !== null ? "· GPS active" : ""}
          </span>
          {isEmployer && (
            <button
              onClick={() => setShowModal(true)}
              style={{
                marginLeft: "auto", padding: "7px 16px", borderRadius: 999,
                background: "var(--color-ink)", color: "var(--color-surface)",
                border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
              }}
            >
              + Post Instant Gig
            </button>
          )}
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 4vw, 4rem)", margin: "0 0 10px", lineHeight: 0.98, letterSpacing: "-0.035em" }}>
          Same-day gig work,{" "}
          <span style={{ color: "oklch(52% 0.22 25)" }}>instant</span>.
        </h1>
        <p style={{ maxWidth: 520, color: "var(--color-ink-soft)", margin: 0, fontSize: 14.5, lineHeight: 1.55 }}>
          AI-ranked urgent gigs within your radius. Accept in one tap, show up, get paid same week.
        </p>
      </header>

      <div style={layoutStyle}>
        {/* Left sidebar */}
        {isLoggedIn ? (
          <aside>
            <div className="grain" style={{ position: "relative", padding: 22, borderRadius: 20, background: "var(--color-ink)", color: "var(--color-surface)", marginBottom: 16 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 600, margin: "0 0 8px" }}>
                AI Rank factors
              </p>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
                Why you&apos;re ranked.
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {AI_RANK_FACTORS.map((f) => (
                  <div key={f.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "oklch(100% 0 0 / 0.75)" }}>{f.label}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-accent)" }}>{f.pct}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 999, background: "oklch(100% 0 0 / 0.1)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${f.pct * 3.57}%`, background: "var(--color-accent)", borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: 18, borderRadius: 20, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)" }}>
              <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 12px" }}>
                Filters
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {(["all", "now", "today", "weekend"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUrgencyFilter(u)}
                    style={{
                      padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      border: urgencyFilter === u ? "1px solid var(--color-ink)" : "1px solid var(--color-line)",
                      background: urgencyFilter === u ? "var(--color-ink)" : "transparent",
                      color: urgencyFilter === u ? "var(--color-surface)" : "var(--color-ink-soft)",
                    }}
                  >
                    {u === "all" ? "All" : URGENCY_CONFIG[u].label}
                  </button>
                ))}
              </div>
              <label style={{ display: "flex", flexDirection: "column", gap: 8, opacity: userLat !== null ? 1 : 0.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>Max distance</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>{kmMax} km</span>
                </div>
                <input
                  type="range" min={1} max={30} value={kmMax}
                  onChange={(e) => setKmMax(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--color-ink)" }}
                  disabled={userLat === null}
                />
              </label>
              {userLat === null && (
                <p style={{ fontSize: 11, color: "var(--color-ink-soft)", margin: "8px 0 0", lineHeight: 1.4 }}>
                  {geoLoading ? "Locating you…" : "Allow location access to filter by distance."}
                </p>
              )}
            </div>
          </aside>
        ) : (
          <GuestSidebar
            kmMax={kmMax}
            setKmMax={setKmMax}
            hasLocation={userLat !== null}
            geoLoading={geoLoading}
          />
        )}

        {/* Gig grid */}
        <div>
          {visible.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", borderRadius: 20, border: "1px dashed var(--color-line)" }}>
              <p style={{ fontSize: 32, margin: "0 0 12px" }}>
                {gigs.length === 0 ? "⚡" : "🔍"}
              </p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: "0 0 8px" }}>
                {gigs.length === 0 ? "No instant gigs today yet." : "No gigs in this range."}
              </p>
              <p style={{ color: "var(--color-ink-soft)", margin: "0 0 20px" }}>
                {gigs.length === 0
                  ? "Employers post throughout the day. Check back in a bit."
                  : "Try expanding your radius or changing the urgency filter."}
              </p>
              {gigs.length === 0 && isEmployer && (
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    padding: "10px 22px", borderRadius: 999,
                    background: "var(--color-ink)", color: "var(--color-surface)",
                    border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
                  }}
                >
                  Be the first — post an instant gig
                </button>
              )}
              {gigs.length === 0 && !isEmployer && !isLoggedIn && (
                <a
                  href="/singpass"
                  style={{
                    display: "inline-block", padding: "10px 22px", borderRadius: 999,
                    background: "var(--color-ink)", color: "var(--color-surface)",
                    fontSize: 13, fontWeight: 700, textDecoration: "none",
                  }}
                >
                  Sign in to get notified →
                </a>
              )}
            </div>
          ) : (
            <div style={gigGridStyle}>
              {visible.map((g) => {
                const uc = URGENCY_CONFIG[g.instant_urgency];
                const isExpanded = expandedIds.has(g.id);
                return (
                  <article
                    key={g.id}
                    style={{
                      borderRadius: 20,
                      border: "1px solid var(--color-line)",
                      background: g.aiLocked ? "var(--color-muted)" : "var(--color-surface-raised)",
                      display: "flex", flexDirection: "column", overflow: "hidden",
                      opacity: g.aiLocked && isLoggedIn ? 0.75 : 1,
                    }}
                  >
                    <div style={{ padding: "18px 18px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 999, background: uc.bg, color: uc.fg, fontSize: 11, fontWeight: 700 }}>
                          {uc.label}
                        </span>
                        <DistanceDots km={g.distanceKm} />
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-soft)", marginLeft: "auto" }}>
                          {g.distanceKm !== null ? `${g.distanceKm} km` : "Remote"}
                        </span>
                      </div>

                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, margin: "0 0 4px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                        {g.title}
                      </h3>
                      <p style={{ fontSize: 12.5, color: "var(--color-ink-soft)", margin: "0 0 10px" }}>
                        {g.employerName} · {g.location}
                      </p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                        {g.skills_required.slice(0, 4).map((s) => (
                          <span key={s} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                            {s}
                          </span>
                        ))}
                      </div>

                      {isLoggedIn && (
                        <div style={{
                          padding: "10px 12px", borderRadius: 12,
                          background: g.aiLocked ? "oklch(70% 0.12 38 / 0.12)" : "var(--color-jade-soft)",
                          border: `1px solid ${g.aiLocked ? "oklch(70% 0.12 38 / 0.25)" : "oklch(from var(--color-jade) l c h / 0.3)"}`,
                          marginBottom: 14,
                        }}>
                          <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: g.aiLocked ? "oklch(50% 0.12 38)" : "var(--color-jade-ink)", margin: "0 0 4px" }}>
                            {g.aiLocked ? "Why locked" : "Why you rank"}
                          </p>
                          <p style={{ fontSize: 12, color: g.aiLocked ? "oklch(40% 0.08 38)" : "var(--color-jade-ink)", margin: 0, lineHeight: 1.4 }}>
                            {g.aiLocked ? "Your profile doesn't yet match this gig's skill requirements." : g.aiReason}
                          </p>
                        </div>
                      )}

                      {/* Details toggle */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(g.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6, width: "100%",
                          padding: "8px 0", background: "none", border: "none",
                          cursor: "pointer", color: "var(--color-ink-soft)", fontSize: 12, fontWeight: 600,
                          borderTop: "1px solid var(--color-line)",
                        }}
                      >
                        <svg
                          width="14" height="14" viewBox="0 0 14 14" fill="none"
                          style={{ transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
                        >
                          <path d="M2 5l5 4 5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Job details
                      </button>

                      {/* Expandable panel */}
                      <div style={{
                        overflow: "hidden",
                        maxHeight: isExpanded ? 400 : 0,
                        transition: "max-height 0.25s ease",
                      }}>
                        <div style={{ paddingTop: 10, paddingBottom: 4, display: "flex", flexDirection: "column", gap: 12 }}>
                          {g.description && (
                            <div>
                              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 5px" }}>
                                What&apos;s needed
                              </p>
                              <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.55 }}>
                                {g.description}
                              </p>
                            </div>
                          )}
                          {(g.duration_label || g.hours_required || g.start_time) && (
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                              {g.hours_required && (
                                <div style={{ padding: "6px 12px", borderRadius: 10, background: "var(--color-muted)", display: "flex", flexDirection: "column", gap: 1 }}>
                                  <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-mute)" }}>Duration</span>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>{g.hours_required}h</span>
                                </div>
                              )}
                              {g.duration_label && !g.hours_required && (
                                <div style={{ padding: "6px 12px", borderRadius: 10, background: "var(--color-muted)", display: "flex", flexDirection: "column", gap: 1 }}>
                                  <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-mute)" }}>Duration</span>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-ink)" }}>{g.duration_label}</span>
                                </div>
                              )}
                              {g.start_time && (
                                <div style={{ padding: "6px 12px", borderRadius: 10, background: "var(--color-muted)", display: "flex", flexDirection: "column", gap: 1 }}>
                                  <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-mute)" }}>Time</span>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
                                    {formatTime(g.start_time)}{g.end_time ? ` – ${formatTime(g.end_time)}` : ""}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      padding: "12px 18px", borderTop: "1px solid var(--color-line)",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: "var(--color-surface)", gap: 10, marginTop: "auto",
                    }}>
                      <div>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700 }}>
                          S${(g.budget_cents / 100).toFixed(0)}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--color-ink-soft)", marginLeft: 4 }}>
                          {budgetKindLabel(g.budget_kind)}
                        </span>
                        {isLoggedIn && !g.aiLocked && g.aiRank > 0 && (
                          <span style={{ marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "var(--color-jade-soft)", color: "var(--color-jade-ink)", fontWeight: 700 }}>
                            {g.aiRank}%
                          </span>
                        )}
                      </div>

                      {!isLoggedIn ? (
                        <Link
                          href="/singpass"
                          style={{ padding: "8px 16px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}
                        >
                          Sign in to apply
                        </Link>
                      ) : g.aiLocked ? (
                        <button style={{ padding: "8px 14px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", fontSize: 12, fontWeight: 600, color: "var(--color-ink-soft)", cursor: "pointer", whiteSpace: "nowrap" }}>
                          Add credential →
                        </button>
                      ) : (
                        <AcceptButton gigId={g.id} onAccept={acceptInstantGig} />
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CreateInstantModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            refreshGigs();
          }}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </main>
  );
}
