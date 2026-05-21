"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useDemo } from "../DemoProvider";
import type { BookedSlot } from "../DemoProvider";
import { GIGS, DemoGig } from "../data";
import { useViewMode } from "../ViewModeContext";

function toMinG(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function instantConflicts(startTime: string, endTime: string, slots: BookedSlot[]): boolean {
  const gs = toMinG(startTime);
  const ge = toMinG(endTime);
  return slots.some((s) => gs < toMinG(s.endTime) && toMinG(s.startTime) < ge);
}

// ── Mock instant gigs ─────────────────────────────────────────────────────────

const INSTANT_GIGS = [
  {
    id: "inst-1",
    title: "Barista — weekday morning cover",
    urgency: "now" as const,
    budget: "S$18/hr",
    budgetKind: "hourly",
    location: "Tanjong Pagar",
    distanceKm: 1.2,
    skills: ["Coffee", "F&B", "Customer Service"],
    description: "Need cover for opening shift today. 7am–11am, 4 hours. Coffee experience required.",
    hoursRequired: 4,
    startTime: "07:00",
    endTime: "11:00",
    employer: "Kith Café",
    score: 0.55,
  },
  {
    id: "inst-2",
    title: "Event setup crew — product launch",
    urgency: "today" as const,
    budget: "S$120 fixed",
    budgetKind: "fixed",
    location: "Marina Bay Sands",
    distanceKm: 3.5,
    skills: ["Event Setup", "Heavy Lifting", "AV Equipment"],
    description: "4-hour setup for a 100-pax product launch. Loading dock access provided.",
    hoursRequired: 4,
    startTime: "14:00",
    endTime: "18:00",
    employer: "EventSG",
    score: 0.42,
  },
  {
    id: "inst-3",
    title: "Delivery driver — last mile CBD",
    urgency: "now" as const,
    budget: "S$25/hr",
    budgetKind: "hourly",
    location: "CBD",
    distanceKm: 0.8,
    skills: ["Driving", "Class 3 License", "Logistics"],
    description: "Urgent — need delivery driver for 3 hours in the CBD area. Own vehicle preferred.",
    hoursRequired: 3,
    startTime: "12:00",
    endTime: "15:00",
    employer: "QuickDeliver",
    score: 0.38,
  },
  {
    id: "inst-4",
    title: "Social media content shoot",
    urgency: "today" as const,
    budget: "S$200 fixed",
    budgetKind: "fixed",
    location: "Orchard",
    distanceKm: 5.2,
    skills: ["Photography", "Instagram", "Content"],
    description: "2-hour content shoot for Instagram Stories. Bring your own DSLR or iPhone 15+.",
    hoursRequired: 2,
    startTime: "16:00",
    endTime: "18:00",
    employer: "FashionBrand SG",
    score: 0.61,
  },
  {
    id: "inst-5",
    title: "Tutor — O-level Physics emergency session",
    urgency: "today" as const,
    budget: "S$70/hr",
    budgetKind: "hourly",
    location: "Bishan",
    distanceKm: 8.1,
    skills: ["Physics", "O-level", "Tutoring"],
    description: "Student has paper tomorrow. Need 2-hour session this evening. Online OK.",
    hoursRequired: 2,
    startTime: "19:00",
    endTime: "21:00",
    employer: "Parent (private)",
    score: 0.78,
  },
  {
    id: "inst-6",
    title: "Weekend wedding emcee",
    urgency: "weekend" as const,
    budget: "S$800 fixed",
    budgetKind: "fixed",
    location: "Mandarin Orchard",
    distanceKm: 4.9,
    skills: ["Emcee", "Public Speaking", "Bilingual"],
    description: "Bilingual (English/Mandarin) emcee for Saturday evening wedding dinner, 150 pax.",
    hoursRequired: 5,
    startTime: "18:00",
    endTime: "23:00",
    employer: "Wedding couple (private)",
    score: 0.44,
  },
];

const URGENCY_CONFIG = {
  now:     { label: "Need now",  bg: "oklch(52% 0.22 25)", fg: "#fff" },
  today:   { label: "Today",     bg: "var(--color-accent)", fg: "oklch(22% 0.08 38)" },
  weekend: { label: "Weekend",   bg: "var(--color-jade-soft, #dcfce7)", fg: "#166534" },
} as const;

const AI_RANK_FACTORS = [
  { label: "Distance",       pct: 28 },
  { label: "Skill match",    pct: 24 },
  { label: "Trust score",    pct: 18 },
  { label: "Response speed", pct: 14 },
  { label: "Repeat rate",    pct: 10 },
  { label: "Calendar fit",   pct: 6  },
];

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}${m ? `:${String(m).padStart(2, "0")}` : ""}${ampm}`;
}

function computeAiRank(score: number, km: number): number {
  const ds = km < 1 ? 1.0 : km < 3 ? 0.85 : km < 7 ? 0.65 : km < 15 ? 0.45 : 0.25;
  return Math.round((score * 0.55 + ds * 0.45) * 100);
}

function DistanceDots({ km }: { km: number }) {
  const filled = km < 2 ? 5 : km < 5 ? 4 : km < 9 ? 3 : km < 15 ? 2 : 1;
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i < filled ? "var(--color-jade, #16a34a)" : "var(--color-muted)", display: "inline-block" }} />
      ))}
    </span>
  );
}

// ── Category colors ────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  tech: "#3b82f6",
  design: "#a855f7",
  events: "#f59e0b",
  marketing: "#ec4899",
  content: "#6366f1",
  tuition: "#10b981",
};

const CATEGORIES = Array.from(new Set(GIGS.map((g) => g.category)));

// ── Shared sub-components ──────────────────────────────────────────────────────

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 18, borderRadius: 16, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
      <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-ink-soft)", margin: "0 0 10px" }}>
        {label}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{children}</div>
    </div>
  );
}

function FilterRow({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: "7px 10px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 500,
        background: active ? "var(--color-ink)" : "transparent",
        color: active ? "var(--color-surface)" : "var(--color-ink-soft)",
        transition: "all 0.15s",
        border: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function GigRow({ gig, hasApplied }: { gig: DemoGig; hasApplied: boolean }) {
  const [hovered, setHovered] = useState(false);
  const catColor = CATEGORY_COLORS[gig.category] ?? "var(--color-ink-mute)";

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        padding: 22,
        borderRadius: 18,
        background: "var(--color-surface-raised)",
        border: `1px solid ${hovered ? "var(--color-ink)" : "var(--color-line)"}`,
        display: "grid",
        gridTemplateColumns: "1fr 130px",
        gap: 20,
        alignItems: "start",
        transform: hovered ? "translateY(-1px)" : "none",
        boxShadow: hovered ? "var(--shadow-lift)" : "none",
        transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
      }}
    >
      <Link href={`/quick-demo/gig/${gig.id}`} style={{ display: "contents" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: catColor, fontWeight: 600 }}>
              {gig.category} · {gig.location}
            </span>
            <span style={{ fontSize: 11, color: "var(--color-ink-mute)" }}>· {gig.postedAgo}</span>
            {hasApplied && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 999, background: "var(--color-jade-soft, #dcfce7)", color: "var(--color-jade-ink, #166534)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Applied
              </span>
            )}
            {(gig.headcount ?? 1) > 1 && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 999, background: "var(--color-accent-soft)", color: "var(--color-accent-ink)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {gig.headcount} slots
              </span>
            )}
            {gig.duration && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", letterSpacing: "0.04em" }}>
                {gig.duration}
              </span>
            )}
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 8px", letterSpacing: "-0.02em", lineHeight: 1.1, color: "var(--color-ink)" }}>
            {gig.title}
          </h3>
          <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: "0 0 12px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
            {gig.description}
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {gig.skills.slice(0, 5).map((s) => (
              <span key={s} style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", fontWeight: 600 }}>
                {s}
              </span>
            ))}
            <span style={{ fontSize: 12, color: "var(--color-ink-soft)", marginLeft: 4 }}>
              Darren Loh{" "}
              <span style={{ color: "var(--color-trust, #16a34a)" }}>✓</span>
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "end", gap: 6 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, margin: 0 }}>{gig.budget}</p>
          <p style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink-soft)", margin: 0 }}>
            {gig.location}
          </p>
        </div>
      </Link>
    </article>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DemoGigsPage() {
  const { applications, activeAccount, getGigsForAccount, bookedSlots, bookSlot } = useDemo();
  const [acceptedInstantIds, setAcceptedInstantIds] = useState<Set<string>>(new Set());
  const { viewMode } = useViewMode();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [loc, setLoc] = useState("all");
  const [sort, setSort] = useState("new");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [gigView, setGigView] = useState<"gigs" | "instant">("gigs");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "now" | "today" | "weekend">("all");

  function toggleExpand(id: string) {
    setExpandedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const allGigs = getGigsForAccount();

  const filtered = useMemo(() => {
    let list = allGigs.filter((g) => {
      if (q && !(g.title.toLowerCase().includes(q.toLowerCase()) || g.skills.join(" ").toLowerCase().includes(q.toLowerCase()))) return false;
      if (cat !== "all" && g.category !== cat) return false;
      if (loc === "remote" && !g.location.toLowerCase().includes("remote")) return false;
      if (loc === "inperson" && g.location.toLowerCase().includes("remote")) return false;
      return true;
    });
    if (sort === "title") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [allGigs, q, cat, loc, sort]);

  // ── Desktop ──────────────────────────────────────────────────────────────────

  if (viewMode === "desktop") {
    return (
      <main style={{ maxWidth: 1320, margin: "0 auto", padding: "0 28px", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "end", paddingTop: 50, marginBottom: 30, gap: 20, flexWrap: "wrap", flexShrink: 0 }}>
          <div>
            <div style={{ display: "inline-flex", borderRadius: 999, background: "var(--color-muted)", padding: 3, gap: 2, marginBottom: 14 }}>
              <button
                onClick={() => setGigView("gigs")}
                style={{ padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: gigView === "gigs" ? 600 : 500, background: gigView === "gigs" ? "var(--color-ink)" : "transparent", color: gigView === "gigs" ? "var(--color-surface)" : "var(--color-ink-soft)", border: "none", cursor: "pointer", transition: "all 0.15s" }}
              >
                Gigs
              </button>
              <button
                onClick={() => setGigView("instant")}
                style={{ padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: gigView === "instant" ? 600 : 500, background: gigView === "instant" ? "var(--color-ink)" : "transparent", color: gigView === "instant" ? "var(--color-surface)" : "var(--color-ink-soft)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "oklch(52% 0.22 25)", display: "inline-block" }} />
                Instant
              </button>
            </div>
            {gigView === "gigs" ? (
              <>
                <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: 0 }}>
                  Browse · {allGigs.length} open assignments
                </p>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 4vw, 4rem)", margin: "10px 0 0", lineHeight: 0.98, letterSpacing: "-0.035em" }}>
                  Every open gig in{" "}
                  <span style={{ color: "var(--color-accent-ink)" }}>Singapore</span>, today.
                </h1>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "oklch(52% 0.22 25)", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", animation: "pulse 1.4s ease-in-out infinite" }} />
                    Live
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-soft)" }}>
                    {INSTANT_GIGS.length} gigs available
                  </span>
                </div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 4vw, 4rem)", margin: 0, lineHeight: 0.98, letterSpacing: "-0.035em" }}>
                  Same-day gig work,{" "}
                  <span style={{ color: "oklch(52% 0.22 25)" }}>instant</span>.
                </h1>
              </>
            )}
          </div>
          <Link
            href="/quick-demo/post"
            style={{ padding: "12px 22px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", textDecoration: "none" }}
          >
            + Post a gig
          </Link>
        </header>

        {gigView === "gigs" ? (
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 28, flex: 1, overflow: "hidden", minHeight: 0 }}>
            {/* Sidebar */}
            <aside style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, paddingBottom: 80 }}>
              <div style={{ padding: 18, borderRadius: 16, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
                <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-ink-soft)", marginBottom: 10 }}>
                  Search
                </label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="React, emcee, tutor…"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--color-line)", background: "var(--color-surface)", fontSize: 13, color: "var(--color-ink)", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <FilterGroup label="Category">
                <FilterRow active={cat === "all"} onClick={() => setCat("all")}>All categories</FilterRow>
                {CATEGORIES.map((c) => (
                  <FilterRow key={c} active={cat === c} onClick={() => setCat(c)}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </FilterRow>
                ))}
              </FilterGroup>
              <FilterGroup label="Location">
                <FilterRow active={loc === "all"} onClick={() => setLoc("all")}>Any location</FilterRow>
                <FilterRow active={loc === "remote"} onClick={() => setLoc("remote")}>Remote</FilterRow>
                <FilterRow active={loc === "inperson"} onClick={() => setLoc("inperson")}>In-person / hybrid</FilterRow>
              </FilterGroup>
            </aside>

            {/* Results */}
            <div style={{ overflowY: "auto", paddingBottom: 80 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 13, color: "var(--color-ink-soft)" }}>
                  <b style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>{filtered.length}</b> gigs
                  {cat !== "all" && <> · {cat}</>}
                </p>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid var(--color-line)", background: "var(--color-surface)", fontSize: 13, fontWeight: 500, color: "var(--color-ink)", cursor: "pointer" }}
                >
                  <option value="new">Newest</option>
                  <option value="title">Alphabetical</option>
                </select>
              </div>
              {filtered.length === 0 ? (
                <div style={{ padding: 60, borderRadius: 20, border: "1px dashed var(--color-line)", textAlign: "center" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: 0 }}>No gigs match those filters.</p>
                  <p style={{ color: "var(--color-ink-soft)", marginTop: 8 }}>Try a different category or clear the search.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {filtered.map((g) => (
                    <GigRow
                      key={g.id}
                      gig={g}
                      hasApplied={applications.some((a: any) => a.gigId === g.id && a.freelancerId === activeAccount.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── Instant view ── */
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 28, flex: 1, overflow: "hidden", minHeight: 0 }}>
            {/* AI rank sidebar */}
            <aside style={{ overflowY: "auto", paddingBottom: 80, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: 24, borderRadius: 20, background: "var(--color-ink)", color: "var(--color-surface)" }}>
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
                <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 12px" }}>Urgency filter</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(["all", "now", "today", "weekend"] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUrgencyFilter(u)}
                      style={{ padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${urgencyFilter === u ? "var(--color-ink)" : "var(--color-line)"}`, background: urgencyFilter === u ? "var(--color-ink)" : "transparent", color: urgencyFilter === u ? "var(--color-surface)" : "var(--color-ink-soft)" }}
                    >
                      {u === "all" ? "All" : URGENCY_CONFIG[u].label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Instant gig cards */}
            <div style={{ overflowY: "auto", paddingBottom: 80 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                {INSTANT_GIGS.filter(g => urgencyFilter === "all" || g.urgency === urgencyFilter).map((g) => {
                  const uc = URGENCY_CONFIG[g.urgency];
                  const rank = computeAiRank(g.score, g.distanceKm);
                  const isExpanded = expandedIds.has(g.id);
                  const isAccepted = acceptedInstantIds.has(g.id);
                  const isConflict = !isAccepted && instantConflicts(g.startTime, g.endTime, bookedSlots);
                  return (
                    <article key={g.id} style={{ borderRadius: 20, border: `1px solid ${isConflict ? "#fca5a5" : "var(--color-line)"}`, background: isConflict ? "oklch(98% 0.01 25)" : "var(--color-surface-raised)", display: "flex", flexDirection: "column", overflow: "hidden", opacity: isConflict ? 0.75 : 1 }}>
                      <div style={{ padding: "18px 18px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                          <span style={{ padding: "3px 10px", borderRadius: 999, background: uc.bg, color: uc.fg, fontSize: 11, fontWeight: 700 }}>{uc.label}</span>
                          {isAccepted && <span style={{ padding: "3px 10px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 700 }}>✓ Accepted</span>}
                          {isConflict && <span style={{ padding: "3px 10px", borderRadius: 999, background: "#fee2e2", color: "#991b1b", fontSize: 11, fontWeight: 700 }}>⚠ Time conflict</span>}
                          <DistanceDots km={g.distanceKm} />
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-soft)", marginLeft: "auto" }}>{g.distanceKm} km</span>
                        </div>

                        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, margin: "0 0 4px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{g.title}</h3>
                        <p style={{ fontSize: 12.5, color: "var(--color-ink-soft)", margin: "0 0 10px" }}>{g.employer} · {g.location}</p>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                          {g.skills.map((s) => (
                            <span key={s} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s}</span>
                          ))}
                        </div>

                        <div style={{ padding: "10px 12px", borderRadius: 12, background: "var(--color-jade-soft, #dcfce7)", border: "1px solid oklch(from #16a34a l c h / 0.3)", marginBottom: 14 }}>
                          <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#166534", margin: "0 0 4px" }}>Your AI rank</p>
                          <p style={{ fontSize: 12, color: "#166534", margin: 0, lineHeight: 1.4 }}>
                            Score {rank}% · {g.distanceKm} km away · skill overlap {Math.round(g.score * 100)}%
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleExpand(g.id)}
                          style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "8px 0", background: "none", border: "none", borderTop: "1px solid var(--color-line)", cursor: "pointer", color: "var(--color-ink-soft)", fontSize: 12, fontWeight: 600 }}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                            <path d="M2 5l5 4 5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Job details
                        </button>

                        <div style={{ overflow: "hidden", maxHeight: isExpanded ? 200 : 0, transition: "max-height 0.25s ease" }}>
                          <div style={{ paddingTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                            <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.55 }}>{g.description}</p>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <div style={{ padding: "6px 12px", borderRadius: 10, background: "var(--color-muted)" }}>
                                <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-mute)", display: "block" }}>Duration</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>{g.hoursRequired}h</span>
                              </div>
                              <div style={{ padding: "6px 12px", borderRadius: 10, background: "var(--color-muted)" }}>
                                <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-mute)", display: "block" }}>Time</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>{formatTime(g.startTime)}–{formatTime(g.endTime)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: "12px 18px", borderTop: "1px solid var(--color-line)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--color-surface)", gap: 10, marginTop: "auto" }}>
                        <div>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700 }}>{g.budget}</span>
                          <span style={{ marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "var(--color-jade-soft, #dcfce7)", color: "#166534", fontWeight: 700 }}>{rank}%</span>
                        </div>
                        <button
                          disabled={isAccepted || isConflict}
                          style={{
                            padding: "8px 20px",
                            borderRadius: 999,
                            background: isAccepted ? "#dcfce7" : isConflict ? "#fee2e2" : "var(--color-ink)",
                            color: isAccepted ? "#166534" : isConflict ? "#991b1b" : "var(--color-surface)",
                            border: "none",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: isAccepted || isConflict ? "default" : "pointer",
                            whiteSpace: "nowrap",
                          }}
                          onClick={() => {
                            if (isAccepted || isConflict) return;
                            setAcceptedInstantIds((prev) => new Set([...prev, g.id]));
                            bookSlot({ gigId: g.id, startTime: g.startTime, endTime: g.endTime, label: g.title });
                          }}
                        >
                          {isAccepted ? "✓ Accepted" : isConflict ? "Time conflict" : "Accept →"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      </main>
    );
  }

  // ── Mobile ───────────────────────────────────────────────────────────────────

  const mobileGigs = selectedCat ? allGigs.filter((g) => g.category === selectedCat) : allGigs;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid var(--color-line)", flexShrink: 0 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 4px", fontWeight: 600 }}>
          All open gigs
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, letterSpacing: "-0.025em", color: "var(--color-ink)" }}>
          Browse Gigs
        </h1>
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "3px 0 0" }}>
          {mobileGigs.length} open positions
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, padding: "8px 12px", overflowX: "auto", flexShrink: 0, scrollbarWidth: "none" }}>
        <button onClick={() => setSelectedCat(null)} style={{ fontSize: 11, fontWeight: selectedCat === null ? 700 : 500, padding: "5px 12px", borderRadius: 999, border: "1px solid", borderColor: selectedCat === null ? "var(--color-ink)" : "var(--color-line)", background: selectedCat === null ? "var(--color-ink)" : "transparent", color: selectedCat === null ? "var(--color-surface)" : "var(--color-ink-soft)", cursor: "pointer", whiteSpace: "nowrap" }}>
          All
        </button>
        {CATEGORIES.map((c) => {
          const active = selectedCat === c;
          const color = CATEGORY_COLORS[c] ?? "var(--color-ink)";
          return (
            <button key={c} onClick={() => setSelectedCat(active ? null : c)} style={{ fontSize: 11, fontWeight: active ? 700 : 500, padding: "5px 12px", borderRadius: 999, border: "1px solid", borderColor: active ? color : "var(--color-line)", background: active ? color : "transparent", color: active ? "#fff" : "var(--color-ink-soft)", cursor: "pointer", whiteSpace: "nowrap", textTransform: "capitalize" }}>
              {c}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 12px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mobileGigs.map((g) => {
            const catColor = CATEGORY_COLORS[g.category] ?? "var(--color-ink-mute)";
            const hasApplied = applications.some((a: any) => a.gigId === g.id && a.freelancerId === activeAccount.id);
            return (
              <Link key={g.id} href={`/quick-demo/gig/${g.id}`} style={{ display: "block", borderRadius: 14, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", boxShadow: "var(--shadow-soft)", padding: "12px 14px", textDecoration: "none", color: "inherit" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: catColor }}>{g.category}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {hasApplied && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 999, background: "var(--color-jade-soft, #dcfce7)", color: "var(--color-jade-ink, #166534)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Applied</span>}
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-ink-mute)" }}>{g.postedAgo}</span>
                  </div>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, margin: "0 0 3px", letterSpacing: "-0.02em", lineHeight: 1.15, color: "var(--color-ink)" }}>{g.title}</h3>
                <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: "0 0 8px" }}>
                  Darren Loh <span style={{ marginLeft: 4, fontSize: 10, color: "var(--color-trust, #16a34a)", fontWeight: 700 }}>✓ Verified</span> · {g.location}
                </p>
                {g.skills.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                    {g.skills.slice(0, 4).map((s) => <span key={s} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-mute)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s}</span>)}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "var(--color-ink)" }}>{g.budget}</span>
                    {g.duration && (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)" }}>
                        {g.duration}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--color-ink-soft)", fontWeight: 500 }}>View →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
