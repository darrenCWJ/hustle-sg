"use client";

import { useState } from "react";
import { useDemo } from "../DemoProvider";
import { useViewMode } from "../ViewModeContext";

// ── Types ──────────────────────────────────────────────────────────────────────

interface DemoInstantGig {
  id: string;
  title: string;
  description: string;
  skills_required: string[];
  budget_cents: number;
  budget_kind: "hourly" | "fixed";
  location: string;
  lat: number | null;
  lon: number | null;
  urgency: "now" | "today" | "weekend";
  duration_label: string;
  hours_required?: number;
  start_time?: string;
  end_time?: string;
  employerName: string;
}

interface EnrichedGig extends DemoInstantGig {
  km: number | null;
  rank: number;
  locked: boolean;
  reason: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const MOCK_INSTANT_GIGS: DemoInstantGig[] = [
  {
    id: "instant-1",
    urgency: "now",
    title: "Emergency bug fix — React app down",
    description: "Production checkout flow broken after a bad deploy. Need a React/TypeScript dev ASAP to diagnose and patch. Remote OK.",
    skills_required: ["React", "TypeScript", "Debugging"],
    budget_cents: 18000, budget_kind: "hourly",
    location: "Remote", lat: null, lon: null,
    duration_label: "~3h", hours_required: 3,
    employerName: "Darren Loh",
  },
  {
    id: "instant-2",
    urgency: "now",
    title: "Last-minute emcee — corporate luncheon",
    description: "Our host dropped out. Need a confident bilingual emcee for a 120-pax corporate lunch today at 1pm.",
    skills_required: ["Emcee", "Public Speaking", "Bilingual"],
    budget_cents: 80000, budget_kind: "fixed",
    location: "Suntec City", lat: 1.2942, lon: 103.8578,
    duration_label: "4h", hours_required: 4, start_time: "12:00", end_time: "16:00",
    employerName: "Darren Loh",
  },
  {
    id: "instant-3",
    urgency: "today",
    title: "Video editing — urgent reel for product launch",
    description: "Raw footage from morning shoot needs a 60-sec social reel cut for an 8pm product launch post. Remote.",
    skills_required: ["Video Editing", "Premiere Pro", "TikTok"],
    budget_cents: 35000, budget_kind: "fixed",
    location: "Remote", lat: null, lon: null,
    duration_label: "~5h", hours_required: 5,
    employerName: "Darren Loh",
  },
  {
    id: "instant-4",
    urgency: "today",
    title: "On-site product photographer — Orchard showroom",
    description: "Need a product photographer for 2h at our Orchard showroom today. Bring own camera and lighting.",
    skills_required: ["Photography", "Product Shots", "Lightroom"],
    budget_cents: 25000, budget_kind: "fixed",
    location: "Orchard Road", lat: 1.3048, lon: 103.8318,
    duration_label: "2h", hours_required: 2, start_time: "14:00", end_time: "16:00",
    employerName: "Darren Loh",
  },
  {
    id: "instant-5",
    urgency: "today",
    title: "Urgent data migration script — Python",
    description: "One-off ETL script to move CSV exports into Postgres. Well-defined spec provided. Remote work fine.",
    skills_required: ["Python", "PostgreSQL", "ETL"],
    budget_cents: 12000, budget_kind: "hourly",
    location: "Remote", lat: null, lon: null,
    duration_label: "~4h", hours_required: 4,
    employerName: "Darren Loh",
  },
  {
    id: "instant-6",
    urgency: "weekend",
    title: "A-level Chemistry tutor — Saturday morning",
    description: "JC2 student needs help with organic chemistry foundations this Saturday. Clear explanation is key.",
    skills_required: ["Chemistry", "A-level", "H2 Chemistry"],
    budget_cents: 8500, budget_kind: "hourly",
    location: "Bishan", lat: 1.3506, lon: 103.8480,
    duration_label: "2h", hours_required: 2, start_time: "10:00", end_time: "12:00",
    employerName: "Darren Loh",
  },
  {
    id: "instant-7",
    urgency: "weekend",
    title: "Lifestyle content shoot — Haji Lane",
    description: "Instagram & TikTok shoot for a lifestyle brand. 3–4 outfit changes at Haji Lane this Sunday.",
    skills_required: ["Content Creation", "Photography", "Social Media"],
    budget_cents: 60000, budget_kind: "fixed",
    location: "Haji Lane", lat: 1.3012, lon: 103.8590,
    duration_label: "4h", hours_required: 4, start_time: "10:00", end_time: "14:00",
    employerName: "Darren Loh",
  },
];

// Approximate home district for each demo freelancer
const PROFILE_COORDS: Record<string, { lat: number; lon: number }> = {
  it:                   { lat: 1.3506, lon: 103.8480 },
  events:               { lat: 1.2746, lon: 103.8441 },
  teaching:             { lat: 1.3500, lon: 103.9412 },
  "tech-2-profile":     { lat: 1.3329, lon: 103.7436 },
  "design-2-profile":   { lat: 1.3048, lon: 103.8318 },
  "events-2-profile":   { lat: 1.3201, lon: 103.8432 },
  "teaching-2-profile": { lat: 1.3281, lon: 103.7832 },
  "events-3-profile":   { lat: 1.3721, lon: 103.8869 },
};

const SG_LOCATIONS: Record<string, { lat: number | null; lon: number | null }> = {
  "Raffles Place": { lat: 1.2839, lon: 103.8513 },
  "Orchard Road":  { lat: 1.3048, lon: 103.8318 },
  "Suntec City":   { lat: 1.2942, lon: 103.8578 },
  "Clarke Quay":   { lat: 1.2895, lon: 103.8463 },
  "Bishan":        { lat: 1.3506, lon: 103.8480 },
  "Tampines":      { lat: 1.3500, lon: 103.9412 },
  "Jurong East":   { lat: 1.3329, lon: 103.7436 },
  "Novena":        { lat: 1.3201, lon: 103.8432 },
  "Haji Lane":     { lat: 1.3012, lon: 103.8590 },
  "Remote":        { lat: null,   lon: null       },
};

const AI_RANK_FACTORS = [
  { label: "Distance",       pct: 28 },
  { label: "Skill match",    pct: 24 },
  { label: "Trust score",    pct: 18 },
  { label: "Response speed", pct: 14 },
  { label: "Repeat rate",    pct: 10 },
  { label: "Calendar fit",   pct: 6  },
];

const URGENCY_CONFIG = {
  now:     { label: "Need now", bg: "oklch(52% 0.22 25)",              fg: "#fff"                         },
  today:   { label: "Today",   bg: "var(--color-accent)",              fg: "oklch(22% 0.08 38)"           },
  weekend: { label: "Weekend", bg: "var(--color-jade-soft, #dcfce7)",  fg: "var(--color-jade-ink, #166534)" },
};

// ── Utility functions ──────────────────────────────────────────────────────────

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function distanceScore(km: number | null): number {
  if (km === null) return 0.6;
  if (km < 1) return 1.0;
  if (km < 3) return 0.85;
  if (km < 7) return 0.65;
  if (km < 15) return 0.45;
  return 0.25;
}

function skillScore(profileSkills: string[] | undefined, gigSkills: string[]): number {
  if (!profileSkills?.length || !gigSkills.length) return 0.3;
  const pLower = profileSkills.map((s) => s.toLowerCase());
  const gLower = gigSkills.map((s) => s.toLowerCase());
  const matches = gLower.filter((s) => pLower.some((p) => p.includes(s) || s.includes(p))).length;
  return Math.min(1, 0.2 + (matches / gLower.length) * 0.8);
}

function computeAiRank(score: number, km: number | null): number {
  return Math.round((score * 0.55 + distanceScore(km) * 0.45) * 100);
}

function buildReason(score: number, km: number | null, skills: string[]): string {
  const parts: string[] = [];
  if (score > 0.7) parts.push(`Strong match (${skills.slice(0, 2).join(", ")})`);
  else if (score > 0.5) parts.push("Partial skill match");
  else parts.push("Low skill overlap");
  if (km !== null) {
    if (km < 2) parts.push(`${km.toFixed(1)} km away`);
    else if (km < 8) parts.push(`${km.toFixed(1)} km`);
    else parts.push(`${km.toFixed(0)} km — reduces rank`);
  } else {
    parts.push("remote gig");
  }
  return parts.join(" · ");
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}${m ? `:${String(m).padStart(2, "0")}` : ""}${ampm}`;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function DistanceDots({ km }: { km: number | null }) {
  const filled = km === null ? 4 : km < 2 ? 5 : km < 5 ? 4 : km < 9 ? 3 : km < 15 ? 2 : 1;
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i < filled ? "#16a34a" : "var(--color-muted)" }} />
      ))}
    </span>
  );
}

function GigCard({
  g, isEmployer, accepted, onAccept, expanded, onToggle,
}: {
  g: EnrichedGig; isEmployer: boolean; accepted: boolean;
  onAccept: () => void; expanded: boolean; onToggle: () => void;
}) {
  const uc = URGENCY_CONFIG[g.urgency];
  return (
    <article style={{ borderRadius: 20, border: "1px solid var(--color-line)", background: g.locked && !isEmployer ? "var(--color-muted)" : "var(--color-surface-raised)", display: "flex", flexDirection: "column", overflow: "hidden", opacity: g.locked && !isEmployer ? 0.75 : 1 }}>
      <div style={{ padding: "16px 16px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <span style={{ padding: "3px 10px", borderRadius: 999, background: uc.bg, color: uc.fg, fontSize: 11, fontWeight: 700 }}>{uc.label}</span>
          {!isEmployer && <DistanceDots km={g.km} />}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-soft)", marginLeft: "auto" }}>
            {g.km !== null ? `${g.km} km` : "Remote"}
          </span>
        </div>

        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, margin: "0 0 4px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{g.title}</h3>
        <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: "0 0 10px" }}>{g.employerName} · {g.location}</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
          {g.skills_required.slice(0, 4).map((s) => (
            <span key={s} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s}</span>
          ))}
        </div>

        {!isEmployer && (
          <div style={{ padding: "9px 11px", borderRadius: 12, background: g.locked ? "oklch(70% 0.12 38 / 0.1)" : "var(--color-jade-soft, #dcfce7)", border: `1px solid ${g.locked ? "oklch(70% 0.12 38 / 0.2)" : "oklch(from #16a34a 0.5 0.1 h / 0.25)"}`, marginBottom: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: g.locked ? "oklch(50% 0.1 38)" : "var(--color-jade-ink, #166534)", margin: "0 0 3px" }}>{g.locked ? "Why locked" : "Why you rank"}</p>
            <p style={{ fontSize: 12, color: g.locked ? "oklch(40% 0.08 38)" : "var(--color-jade-ink, #166534)", margin: 0, lineHeight: 1.4 }}>
              {g.locked ? "Your profile doesn't yet match this gig's skill requirements." : g.reason}
            </p>
          </div>
        )}

        <button type="button" onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "7px 0", background: "none", border: "none", cursor: "pointer", color: "var(--color-ink-soft)", fontSize: 12, fontWeight: 600, borderTop: "1px solid var(--color-line)" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "none", flexShrink: 0 }}>
            <path d="M2 5l5 4 5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Job details
        </button>

        <div style={{ overflow: "hidden", maxHeight: expanded ? 300 : 0, transition: "max-height 0.25s ease" }}>
          <div style={{ paddingTop: 10, paddingBottom: 4, display: "flex", flexDirection: "column", gap: 10 }}>
            {g.description && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 5px" }}>What's needed</p>
                <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.55 }}>{g.description}</p>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {g.hours_required && (
                <div style={{ padding: "5px 11px", borderRadius: 10, background: "var(--color-muted)" }}>
                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 2px" }}>Duration</p>
                  <p style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", margin: 0 }}>{g.hours_required}h</p>
                </div>
              )}
              {g.start_time && (
                <div style={{ padding: "5px 11px", borderRadius: 10, background: "var(--color-muted)" }}>
                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 2px" }}>Time</p>
                  <p style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", margin: 0 }}>{formatTime(g.start_time)}{g.end_time ? ` – ${formatTime(g.end_time)}` : ""}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "11px 16px", borderTop: "1px solid var(--color-line)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--color-surface)", gap: 10, marginTop: "auto" }}>
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700 }}>S${(g.budget_cents / 100).toFixed(0)}</span>
          <span style={{ fontSize: 12, color: "var(--color-ink-soft)", marginLeft: 4 }}>{g.budget_kind === "hourly" ? "/hr" : " fixed"}</span>
          {!isEmployer && !g.locked && g.rank > 0 && (
            <span style={{ marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "var(--color-jade-soft, #dcfce7)", color: "var(--color-jade-ink, #166534)", fontWeight: 700 }}>{g.rank}%</span>
          )}
        </div>

        {isEmployer ? (
          <span style={{ fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Your gig</span>
        ) : accepted ? (
          <span style={{ fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 999, background: "var(--color-jade-soft, #dcfce7)", color: "var(--color-jade-ink, #166534)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Accepted ✓</span>
        ) : g.locked ? (
          <button style={{ padding: "7px 14px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", fontSize: 12, fontWeight: 600, color: "var(--color-ink-soft)", cursor: "pointer" }}>Add credential →</button>
        ) : (
          <button onClick={onAccept} style={{ padding: "7px 16px", borderRadius: 999, border: "none", background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>Accept →</button>
        )}
      </div>
    </article>
  );
}

function PostInstantModal({ onClose, onPost }: { onClose: () => void; onPost: (g: DemoInstantGig) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"now" | "today" | "weekend">("today");
  const [skillsText, setSkillsText] = useState("");
  const [budget, setBudget] = useState("500");
  const [budgetKind, setBudgetKind] = useState<"hourly" | "fixed">("fixed");
  const [hours, setHours] = useState("3");
  const [location, setLocation] = useState("Raffles Place");

  function handleSubmit() {
    if (!title.trim()) return;
    const coords = SG_LOCATIONS[location] ?? { lat: null, lon: null };
    onPost({
      id: `instant-custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      skills_required: skillsText.split(",").map((s) => s.trim()).filter(Boolean),
      budget_cents: Math.round(parseFloat(budget || "0") * 100),
      budget_kind: budgetKind,
      location,
      lat: coords.lat,
      lon: coords.lon,
      urgency,
      duration_label: hours ? `${hours}h` : "",
      hours_required: hours ? parseInt(hours) : undefined,
      employerName: "Darren Loh",
    });
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--color-line)", background: "var(--color-surface)", color: "var(--color-ink)", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "oklch(0% 0 0 / 0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "var(--color-surface)", borderRadius: 20, padding: "26px 26px 22px", width: "100%", maxWidth: 500, maxHeight: "90dvh", overflowY: "auto", boxShadow: "0 24px 80px oklch(0% 0 0 / 0.35)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: 0, letterSpacing: "-0.02em" }}>Post Instant Gig</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "var(--color-ink-mute)", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-mute)", display: "block", marginBottom: 6 }}>Urgency</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["now", "today", "weekend"] as const).map((u) => (
                <button key={u} onClick={() => setUrgency(u)} style={{ padding: "7px 16px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: urgency === u ? URGENCY_CONFIG[u].bg : "var(--color-muted)", color: urgency === u ? URGENCY_CONFIG[u].fg : "var(--color-ink-soft)" }}>
                  {URGENCY_CONFIG[u].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-mute)", display: "block", marginBottom: 6 }}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Emergency designer needed for pitch deck" style={inputStyle} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-mute)", display: "block", marginBottom: 6 }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What needs to be done, any specific requirements..." style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-mute)", display: "block", marginBottom: 6 }}>Skills (comma-separated)</label>
            <input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="e.g. Figma, Canva, Presentation Design" style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-mute)", display: "block", marginBottom: 6 }}>Budget (S$)</label>
              <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} min="0" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-mute)", display: "block", marginBottom: 6 }}>Rate</label>
              <select value={budgetKind} onChange={(e) => setBudgetKind(e.target.value as "hourly" | "fixed")} style={inputStyle}>
                <option value="fixed">Fixed</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-mute)", display: "block", marginBottom: 6 }}>Hours</label>
              <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} min="1" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-mute)", display: "block", marginBottom: 6 }}>Location</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle}>
              {Object.keys(SG_LOCATIONS).map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          <button onClick={handleSubmit} disabled={!title.trim()} style={{ marginTop: 4, padding: "13px 0", borderRadius: 12, border: "none", background: title.trim() ? "var(--color-ink)" : "var(--color-muted)", color: title.trim() ? "var(--color-surface)" : "var(--color-ink-mute)", fontSize: 15, fontWeight: 700, cursor: title.trim() ? "pointer" : "default", fontFamily: "inherit" }}>
            Post Instant Gig
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function DemoInstantPage() {
  const { activeAccount } = useDemo();
  const { viewMode } = useViewMode();

  const [gigs, setGigs] = useState<DemoInstantGig[]>(MOCK_INSTANT_GIGS);
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "now" | "today" | "weekend">("all");
  const [kmMax, setKmMax] = useState(30);
  const [showModal, setShowModal] = useState(false);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const isEmployer = activeAccount.role === "employer";
  const isMobile = viewMode === "mobile";
  const myCoords = !isEmployer ? (PROFILE_COORDS[activeAccount.id] ?? null) : null;

  const enriched: EnrichedGig[] = gigs.map((g) => {
    const km = myCoords && g.lat !== null && g.lon !== null
      ? haversineKm(myCoords.lat, myCoords.lon, g.lat, g.lon)
      : null;
    const score = skillScore(activeAccount.skills, g.skills_required);
    const rank = computeAiRank(score, km);
    return { ...g, km, rank, locked: !isEmployer && score < 0.35, reason: buildReason(score, km, g.skills_required) };
  });

  const sorted = [...enriched].sort((a, b) => isEmployer ? 0 : b.rank - a.rank);
  const visible = sorted.filter((g) => {
    const distOk = g.km === null || g.km <= kmMax;
    const urgencyOk = urgencyFilter === "all" || g.urgency === urgencyFilter;
    return distOk && urgencyOk;
  });

  function toggleExpand(id: string) {
    setExpandedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function handleAccept(id: string) {
    setAcceptedIds((prev) => new Set([...prev, id]));
  }

  function handlePost(gig: DemoInstantGig) {
    setGigs((prev) => [gig, ...prev]);
    setShowModal(false);
  }

  const filterBar = (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {(["all", "now", "today", "weekend"] as const).map((u) => (
        <button key={u} onClick={() => setUrgencyFilter(u)} style={{ padding: isMobile ? "6px 12px" : "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: urgencyFilter === u ? "1px solid var(--color-ink)" : "1px solid var(--color-line)", background: urgencyFilter === u ? "var(--color-ink)" : "transparent", color: urgencyFilter === u ? "var(--color-surface)" : "var(--color-ink-soft)" }}>
          {u === "all" ? "All" : URGENCY_CONFIG[u].label}
        </button>
      ))}
    </div>
  );

  const gigCards = visible.length === 0 ? (
    <div style={{ padding: 40, textAlign: "center", borderRadius: 20, border: "1px dashed var(--color-line)" }}>
      <p style={{ fontSize: 28, margin: "0 0 10px" }}>{gigs.length === 0 ? "⚡" : "🔍"}</p>
      <p style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 6px" }}>
        {gigs.length === 0 ? "No instant gigs yet." : "No gigs in this range."}
      </p>
      <p style={{ color: "var(--color-ink-soft)", margin: 0, fontSize: 13 }}>
        {gigs.length === 0 ? "Employers post throughout the day." : "Try expanding your radius or changing the urgency filter."}
      </p>
      {isEmployer && (
        <button onClick={() => setShowModal(true)} style={{ marginTop: 16, padding: "10px 22px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
          Post the first instant gig
        </button>
      )}
    </div>
  ) : (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 14 }}>
      {visible.map((g) => (
        <GigCard key={g.id} g={g} isEmployer={isEmployer} accepted={acceptedIds.has(g.id)} onAccept={() => handleAccept(g.id)} expanded={expandedIds.has(g.id)} onToggle={() => toggleExpand(g.id)} />
      ))}
    </div>
  );

  // ── Mobile layout ──────────────────────────────────────────────────────────

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: isEmployer ? 80 : 20 }}>
          {/* Header */}
          <div style={{ padding: "18px 18px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: "oklch(52% 0.22 25)", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "pulse 1.4s ease-in-out infinite" }} />
                Live
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-soft)" }}>{gigs.length} gigs</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: "0 0 4px", lineHeight: 1, letterSpacing: "-0.03em" }}>
              Same-day gigs, <span style={{ color: "oklch(52% 0.22 25)" }}>instant</span>.
            </h1>
            <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: "0 0 14px", lineHeight: 1.4 }}>
              AI-ranked urgent gigs near you. Accept in one tap.
            </p>
            {filterBar}
          </div>

          {!isEmployer && (
            <div style={{ margin: "14px 18px 0", padding: 14, borderRadius: 16, background: "var(--color-ink)", color: "var(--color-surface)" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 600, margin: "0 0 6px" }}>AI Rank factors</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {AI_RANK_FACTORS.map((f) => (
                  <div key={f.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: "oklch(100% 0 0 / 0.7)" }}>{f.label}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-accent)" }}>{f.pct}%</span>
                    </div>
                    <div style={{ height: 3, borderRadius: 999, background: "oklch(100% 0 0 / 0.1)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${f.pct * 3.57}%`, background: "var(--color-accent)", borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: "14px 18px 0" }}>{gigCards}</div>
        </div>

        {isEmployer && (
          <div style={{ position: "absolute", bottom: "calc(58px + env(safe-area-inset-bottom, 0px))", left: 0, right: 0, padding: "12px 18px", background: "var(--color-surface-raised)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: "1px solid var(--color-line)" }}>
            <button onClick={() => setShowModal(true)} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              + Post Instant Gig
            </button>
          </div>
        )}

        {showModal && <PostInstantModal onClose={() => setShowModal(false)} onPost={handlePost} />}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </div>
    );
  }

  // ── Desktop layout ─────────────────────────────────────────────────────────

  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
      <header style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "oklch(52% 0.22 25)", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", animation: "pulse 1.4s ease-in-out infinite" }} />
            Live
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-soft)" }}>{gigs.length} gigs available</span>
          {isEmployer && (
            <button onClick={() => setShowModal(true)} style={{ marginLeft: "auto", padding: "7px 16px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
              + Post Instant Gig
            </button>
          )}
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 4vw, 4rem)", margin: "0 0 10px", lineHeight: 0.98, letterSpacing: "-0.035em" }}>
          Same-day gig work, <span style={{ color: "oklch(52% 0.22 25)" }}>instant</span>.
        </h1>
        <p style={{ maxWidth: 520, color: "var(--color-ink-soft)", margin: 0, fontSize: 14.5, lineHeight: 1.55 }}>
          AI-ranked urgent gigs within your radius. Accept in one tap, show up, get paid same week.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 28, alignItems: "start" }}>
        {/* Sidebar */}
        <aside>
          <div className="grain" style={{ position: "relative", padding: 22, borderRadius: 20, background: "var(--color-ink)", color: "var(--color-surface)", marginBottom: 16 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 600, margin: "0 0 8px" }}>
              {isEmployer ? "How ranking works" : "AI Rank factors"}
            </p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
              {isEmployer ? "Best workers first." : "Why you're ranked."}
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
            <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 12px" }}>Filters</p>
            <div style={{ marginBottom: 14 }}>{filterBar}</div>
            <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>Max distance</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>{kmMax} km</span>
              </div>
              <input type="range" min={1} max={30} value={kmMax} onChange={(e) => setKmMax(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--color-ink)" }} />
            </label>
          </div>
        </aside>

        {/* Gig grid */}
        <div>{gigCards}</div>
      </div>

      {showModal && <PostInstantModal onClose={() => setShowModal(false)} onPost={handlePost} />}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </main>
  );
}
