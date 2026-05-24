"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo, DEFAULT_EMPLOYER_PROFILE, type EmployerProfile } from "../DemoProvider";
import { useViewMode } from "../ViewModeContext";
import { GIGS } from "../data";

// ── Mock enrichment data per profile ──────────────────────────────────────────

interface MockCred {
  issuer: string;
  title: string;
  skills: string[];
  verified: boolean;
}

const MOCK_DATA: Record<string, { trustScore: number; creds: MockCred[]; bio: string; location: string }> = {
  requestor: {
    trustScore: 62,
    bio: "Operations Director at Demo Corp SG. Regularly engages freelance talent across tech, design, and events.",
    location: "Singapore",
    creds: [],
  },
  it: {
    trustScore: 91,
    bio: "Full-stack developer and UI/UX designer with 6 years of experience building SaaS products and mobile apps. Ex-Grab, ex-Carousell.",
    location: "Tanjong Pagar, Singapore",
    creds: [
      { issuer: "Amazon Web Services", title: "AWS Cloud Practitioner", skills: ["AWS", "Cloud Architecture"], verified: true },
      { issuer: "Google", title: "Google Cloud Professional Developer", skills: ["GCP", "Cloud Run", "BigQuery"], verified: true },
      { issuer: "Meta", title: "Meta Frontend Developer Certificate", skills: ["React", "JavaScript", "Accessibility"], verified: true },
      { issuer: "SkillsFuture SG", title: "AI Essentials for Tech Professionals", skills: ["AI/ML", "Python"], verified: true },
    ],
  },
  events: {
    trustScore: 83,
    bio: "Event coordinator and content strategist with 8 years across corporate events, product launches, and social media campaigns.",
    location: "Orchard, Singapore",
    creds: [
      { issuer: "NTUC Learning Hub", title: "MICE Event Management", skills: ["Event Planning", "Vendor Management"], verified: true },
      { issuer: "Google", title: "Google Analytics Certification", skills: ["Analytics", "Data Insights"], verified: true },
      { issuer: "HubSpot Academy", title: "Content Marketing Certification", skills: ["Content Strategy", "SEO", "Inbound Marketing"], verified: true },
    ],
  },
  teaching: {
    trustScore: 88,
    bio: "Experienced A-level tutor specialising in Mathematics, Physics, and Chemistry. MOE-trained teacher, 10 years private tutoring experience.",
    location: "Bishan, Singapore",
    creds: [
      { issuer: "NIE Singapore", title: "Postgraduate Diploma in Education", skills: ["Teaching Pedagogy", "Curriculum Design"], verified: true },
      { issuer: "Cambridge Assessment", title: "Certified IB Examiner — Mathematics", skills: ["IB Maths", "Assessment"], verified: true },
      { issuer: "SkillsFuture SG", title: "Advanced Certificate in Training & Assessment", skills: ["Adult Learning", "Facilitation"], verified: true },
    ],
  },
  "tech-2-profile": {
    trustScore: 76,
    bio: "Mobile developer specialising in React Native and Flutter. I've shipped 12 apps on the App Store and Google Play.",
    location: "Buona Vista, Singapore",
    creds: [
      { issuer: "Google", title: "Associate Android Developer", skills: ["Android", "Kotlin", "Jetpack"], verified: true },
      { issuer: "Meta", title: "React Native Developer Certificate", skills: ["React Native", "JavaScript"], verified: true },
      { issuer: "SkillsFuture SG", title: "Mobile App Development (iOS/Android)", skills: ["Swift", "Flutter", "Firebase"], verified: true },
    ],
  },
  "design-2-profile": {
    trustScore: 79,
    bio: "Brand designer and visual storyteller. I've worked with 40+ startups across SEA to craft visual identities that actually land.",
    location: "Tiong Bahru, Singapore",
    creds: [
      { issuer: "Adobe", title: "Adobe Certified Professional — Visual Design", skills: ["Illustrator", "Photoshop", "InDesign"], verified: true },
      { issuer: "Canva", title: "Canva Certified Creator", skills: ["Design Systems", "Brand Kits"], verified: false },
    ],
  },
  "events-2-profile": {
    trustScore: 72,
    bio: "Digital marketing specialist focused on paid media. I manage $250k+ in monthly ad spend across Google and Meta platforms.",
    location: "Raffles Place, Singapore",
    creds: [
      { issuer: "Google", title: "Google Ads Search Certification", skills: ["Google Ads", "SEM", "Search Strategy"], verified: true },
      { issuer: "Meta", title: "Meta Blueprint — Media Buying", skills: ["Meta Ads", "Facebook", "Instagram"], verified: true },
    ],
  },
  "teaching-2-profile": {
    trustScore: 85,
    bio: "English language and General Paper tutor with 12 years experience. Former MOE school teacher, now full-time private tutor.",
    location: "Clementi, Singapore",
    creds: [
      { issuer: "NIE Singapore", title: "Bachelor of Arts (English Language & Literature)", skills: ["English Literature", "Linguistics"], verified: true },
      { issuer: "Cambridge Assessment", title: "O/A-level Examiner — English Language", skills: ["Assessment", "Marking"], verified: true },
    ],
  },
  "events-3-profile": {
    trustScore: 74,
    bio: "Video editor and content creator with 5+ years creating YouTube series, brand videos, and social content for Singapore brands.",
    location: "Jurong East, Singapore",
    creds: [
      { issuer: "YouTube", title: "YouTube Creator Academy — Advanced", skills: ["YouTube SEO", "Audience Building"], verified: true },
    ],
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const AVATAR_HUES = [250, 165, 340, 38, 260, 200, 78, 310];
function avatarColors(name: string) {
  const hue = AVATAR_HUES[(name.charCodeAt(0) + (name.charCodeAt(1) ?? 0)) % AVATAR_HUES.length];
  return { bg: `oklch(78% 0.08 ${hue})`, fg: `oklch(22% 0.08 ${hue})` };
}
function initials(name: string) {
  return name.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase();
}
function issuerInitials(name: string) {
  return name.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase();
}
function issuerColor(name: string) {
  const hue = AVATAR_HUES[(name.charCodeAt(0) + (name.charCodeAt(1) ?? 0)) % AVATAR_HUES.length];
  return { bg: `oklch(82% 0.06 ${hue})`, fg: `oklch(28% 0.08 ${hue})` };
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function monthYear(offsetMonths: number) {
  const d = new Date(2026, 4, 1); // May 2026
  d.setMonth(d.getMonth() - offsetMonths);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// ── Profile page ───────────────────────────────────────────────────────────────

const COMPANY_SIZES = ["1–10 employees", "11–50 employees", "51–200 employees", "201–500 employees", "500+ employees"];
const INDUSTRIES = ["Logistics & Supply Chain", "Technology & Software", "Retail & E-commerce", "Finance & Banking", "Healthcare", "Education", "Marketing & Advertising", "Construction & Property", "F&B & Hospitality", "Media & Entertainment", "Professional Services", "Others"];

function EditProfileForm({ current, onSave, onCancel }: { current: EmployerProfile; onSave: (p: EmployerProfile) => void; onCancel: () => void }) {
  const [form, setForm] = useState<EmployerProfile>(current);
  const set = (k: keyof EmployerProfile, v: string) => setForm((prev) => ({ ...prev, [k]: v }));
  const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--color-line)", fontSize: 13, background: "var(--color-surface)", color: "var(--color-ink)", outline: "none", boxSizing: "border-box" as const };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: "var(--color-ink-soft)", letterSpacing: "0.1em", textTransform: "uppercase" as const, display: "block", marginBottom: 5 };
  return (
    <div style={{ borderRadius: 20, border: "2px solid var(--color-accent)", background: "var(--color-surface-raised)", padding: 28, marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, letterSpacing: "-0.02em" }}>Edit company profile</h3>
        <button onClick={onCancel} style={{ fontSize: 13, color: "var(--color-ink-mute)", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={labelStyle}>Company name</label>
          <input style={inputStyle} value={form.companyName} onChange={e => set("companyName", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>UEN / ACRA No.</label>
          <input style={inputStyle} value={form.uen} onChange={e => set("uen", e.target.value)} placeholder="e.g. 202401234A" />
        </div>
        <div>
          <label style={labelStyle}>Industry</label>
          <select style={{ ...inputStyle, appearance: "none" as const }} value={form.industry} onChange={e => set("industry", e.target.value)}>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Company size</label>
          <select style={{ ...inputStyle, appearance: "none" as const }} value={form.companySize} onChange={e => set("companySize", e.target.value)}>
            {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Location</label>
          <input style={inputStyle} value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Tanjong Pagar, Singapore" />
        </div>
        <div>
          <label style={labelStyle}>Website (optional)</label>
          <input style={inputStyle} value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://yourcompany.com" />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>About / Bio</label>
          <textarea
            style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
            value={form.bio}
            onChange={e => set("bio", e.target.value)}
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ padding: "9px 20px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "var(--color-ink-soft)" }}>
          Discard
        </button>
        <button onClick={() => onSave(form)} style={{ padding: "9px 22px", borderRadius: 999, border: "none", background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Save changes
        </button>
      </div>
    </div>
  );
}

export default function DemoProfilePage() {
  const router = useRouter();
  const { activeAccount, getApplicationsForAccount, getApplicationsForRequestor, ratings, employerProfile, updateEmployerProfile } = useDemo();
  const { viewMode } = useViewMode();
  const [editingProfile, setEditingProfile] = useState(false);

  const isEmployer = activeAccount.role === "employer";
  const liveEmployer: EmployerProfile = { ...DEFAULT_EMPLOYER_PROFILE, ...(employerProfile ?? {}) };
  const mockBase = MOCK_DATA[activeAccount.id] ?? MOCK_DATA.requestor;
  const mock = isEmployer
    ? { ...mockBase, bio: liveEmployer.bio, location: liveEmployer.location }
    : mockBase;
  const workerApps = getApplicationsForAccount();
  const employerApps = getApplicationsForRequestor();

  const totalCreds = mock.creds.length;
  const verifiedCreds = mock.creds.filter(c => c.verified).length;
  const completedGigs = activeAccount.completedGigs ?? 0;
  const trustScore = mock.trustScore;

  const { bg: avBg, fg: avFg } = avatarColors(activeAccount.name);
  const ini = initials(activeAccount.name);

  // Live ratings for this user
  const myRatings = (ratings ?? []).filter((r) => r.toId === activeAccount.id);
  const avgStars = myRatings.length > 0
    ? Math.round((myRatings.reduce((s, r) => s + r.stars, 0) / myRatings.length) * 10) / 10
    : null;

  // Mock gig history entries based on completedGigs
  const gigHistoryLabels = [
    "UI/UX redesign — fintech dashboard",
    "Full-stack developer — 3-month contract",
    "Brand identity — health-tech startup",
    "Social media manager — 3 months",
    "Google Ads specialist — e-commerce",
    "A-level H2 Maths tutor — JC2 student",
    "Video editor — YouTube series",
    "Corporate D&D event coordinator",
    "React Native mobile app — loyalty programme",
    "Copywriter — website relaunch",
  ];
  const gigHistoryCount = Math.min(completedGigs > 0 ? Math.min(completedGigs, 5) : 0, gigHistoryLabels.length);

  // ── Employer-specific metrics ─────────────────────────────────────────────
  const fulfilledGigIds = isEmployer
    ? new Set(employerApps.filter(a => a.status === "accepted" || a.status === "completed").map(a => a.gigId))
    : new Set<string>();
  const fulfilledCount = fulfilledGigIds.size;
  const totalRaised = isEmployer ? GIGS.length : 0;
  const activeCount = totalRaised - fulfilledCount;
  const cancelledCount = 0; // no cancellations in demo
  const fulfilledPct = totalRaised > 0 ? Math.round((fulfilledCount / totalRaised) * 100) : 0;

  // ── Stat rows ─────────────────────────────────────────────────────────────
  const STATS = isEmployer ? [
    { label: "Total raised", value: totalRaised, sub: "gigs posted" },
    { label: "Fulfilled", value: fulfilledCount, sub: "gigs completed" },
    { label: "Cancelled", value: cancelledCount, sub: "withdrawn" },
    { label: "Active", value: activeCount, sub: "open now" },
    { label: "Applications", value: employerApps.length, sub: "received" },
  ] : [
    { label: "Credentials", value: totalCreds, sub: "uploaded" },
    { label: "Verified", value: verifiedCreds, sub: `of ${totalCreds}` },
    { label: "Applications", value: workerApps.length, sub: "sent" },
    { label: "Completed", value: completedGigs, sub: "gigs" },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // Desktop layout
  // ─────────────────────────────────────────────────────────────────────────

  if (viewMode === "desktop") {
    return (
      <main style={{ maxWidth: 1320, margin: "0 auto", padding: "60px 28px 80px" }}>

        {/* Edit profile form (employer only) */}
        {isEmployer && editingProfile && (
          <EditProfileForm
            current={liveEmployer}
            onSave={(p) => { updateEmployerProfile(p); setEditingProfile(false); }}
            onCancel={() => setEditingProfile(false)}
          />
        )}

        {/* Hero row: 2 columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 40, marginBottom: 36, alignItems: "start" }}>

          {/* Left: identity */}
          <div>
            {/* Badges */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#dcfce7", color: "#166534", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Singpass ✓
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-mute)", padding: "3px 10px", borderRadius: 999, background: "var(--color-muted)" }}>
                @{activeAccount.name.toLowerCase().replace(/\s+/g, ".")}
              </span>
              {mock.location && (
                <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>
                  📍 {mock.location}
                </span>
              )}
            </div>

            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 4.5vw, 5rem)", margin: "0 0 12px", lineHeight: 0.95, letterSpacing: "-0.04em" }}>
              {activeAccount.name}
            </h1>

            {activeAccount.headline && (
              <p style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 14px", color: "var(--color-ink-soft)", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                {activeAccount.headline}
              </p>
            )}

            {mock.bio && (
              <p style={{ fontSize: 15, color: "var(--color-ink-soft)", lineHeight: 1.6, margin: "0 0 16px", maxWidth: 540 }}>
                {mock.bio}
              </p>
            )}

            {/* Employer company details */}
            {isEmployer && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                <span style={{ fontSize: 12, padding: "4px 11px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", fontWeight: 600 }}>
                  {liveEmployer.companyName}
                </span>
                <span style={{ fontSize: 12, padding: "4px 11px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", fontWeight: 600 }}>
                  {liveEmployer.industry}
                </span>
                <span style={{ fontSize: 12, padding: "4px 11px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", fontWeight: 600 }}>
                  {liveEmployer.companySize}
                </span>
                {liveEmployer.uen && (
                  <span style={{ fontSize: 11, padding: "4px 11px", borderRadius: 999, background: "#dbeafe", color: "#1e40af", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    UEN: {liveEmployer.uen}
                  </span>
                )}
                {liveEmployer.website && (
                  <span style={{ fontSize: 12, padding: "4px 11px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-accent)", fontWeight: 600 }}>
                    {liveEmployer.website}
                  </span>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => router.push("/quick-demo/post")}
                style={{ padding: "11px 24px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}
              >
                Post a gig →
              </button>
              {isEmployer && (
                <button
                  onClick={() => setEditingProfile(true)}
                  style={{ padding: "11px 22px", borderRadius: 999, background: "transparent", color: "var(--color-ink)", fontSize: 14, fontWeight: 600, border: "1px solid var(--color-line)", cursor: "pointer" }}
                >
                  Edit profile
                </button>
              )}
            </div>
          </div>

          {/* Right: Trust panel */}
          <div style={{ borderRadius: 20, background: "var(--color-ink)", color: "var(--color-surface)", padding: 28, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 700, margin: "0 0 6px" }}>Trust panel</p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 20px", letterSpacing: "-0.025em" }}>
              {isEmployer ? "Verified requestor" : "Verified on gig work"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {(isEmployer ? [
                { label: "Singpass identity", value: "L2 verified", ok: true },
                { label: "Payment escrow", value: "SGD protected", ok: true },
                { label: "Fulfillment rate", value: totalRaised > 0 ? `${fulfilledPct}%` : "No gigs yet", ok: fulfilledPct >= 50 },
                { label: "Workers hired", value: employerApps.filter(a => a.status === "accepted" || a.status === "completed").length > 0 ? `${employerApps.filter(a => a.status === "accepted" || a.status === "completed").length} total` : "None yet", ok: employerApps.filter(a => a.status === "accepted" || a.status === "completed").length > 0 },
                { label: "Member since", value: "Jan 2025", ok: true },
              ] : [
                { label: "Singpass identity", value: "L2 identity", ok: true },
                { label: "MyInfo prefill", value: "synced", ok: true },
                { label: "WSQ / degree certs", value: verifiedCreds > 0 ? `${verifiedCreds} of ${totalCreds}` : "None yet", ok: verifiedCreds > 0 },
                { label: "Completed gigs", value: completedGigs > 0 ? `${completedGigs} done` : "None yet", ok: completedGigs > 0 },
              ]).map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: 13, color: "oklch(100% 0 0 / 0.7)" }}>{item.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.ok ? "#4ade80" : "oklch(100% 0 0 / 0.3)", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: item.ok ? "#4ade80" : "oklch(100% 0 0 / 0.5)" }}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Score / rate bar */}
            <div style={{ borderTop: "1px solid oklch(100% 0 0 / 0.12)", paddingTop: 18 }}>
              {isEmployer ? (
                <>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "oklch(100% 0 0 / 0.5)", margin: "0 0 4px", fontWeight: 600 }}>Fulfillment rate</p>
                      <p style={{ fontFamily: "var(--font-display)", fontSize: 48, margin: 0, lineHeight: 1, letterSpacing: "-0.04em" }}>{fulfilledPct}<span style={{ fontSize: 18, opacity: 0.5 }}>%</span></p>
                    </div>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-accent)", fontWeight: 700 }}>
                      {fulfilledCount}/{totalRaised} gigs
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: "oklch(100% 0 0 / 0.12)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${fulfilledPct}%`, background: "linear-gradient(90deg, var(--color-accent), #4ade80)", borderRadius: 999, transition: "width 0.8s ease" }} />
                  </div>
                  <p style={{ fontSize: 11, color: "oklch(100% 0 0 / 0.4)", margin: "10px 0 0", lineHeight: 1.4 }}>
                    Freelancers see this panel before applying. Verified requestors attract higher-quality talent.
                  </p>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "oklch(100% 0 0 / 0.5)", margin: "0 0 4px", fontWeight: 600 }}>Trust score</p>
                      <p style={{ fontFamily: "var(--font-display)", fontSize: 48, margin: 0, lineHeight: 1, letterSpacing: "-0.04em" }}>{trustScore}<span style={{ fontSize: 18, opacity: 0.5 }}>/100</span></p>
                    </div>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-accent)", fontWeight: 700 }}>
                      Top {100 - trustScore + 10}%
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: "oklch(100% 0 0 / 0.12)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${trustScore}%`, background: "linear-gradient(90deg, var(--color-accent), #4ade80)", borderRadius: 999, transition: "width 0.8s ease" }} />
                  </div>
                  <p style={{ fontSize: 11, color: "oklch(100% 0 0 / 0.4)", margin: "10px 0 0", lineHeight: 1.4 }}>
                    Employers see this panel before contacting you.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${STATS.length}, 1fr)`, gap: 12, marginBottom: 40 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ padding: "18px 20px", borderRadius: 16, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: "var(--color-ink)", margin: 0, letterSpacing: "-0.02em" }}>{s.value}</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-soft)", margin: "4px 0 1px", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</p>
              <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: 0 }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Body: 2 columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Recent assignments (employer) */}
            {isEmployer && (
              <section>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, letterSpacing: "-0.02em" }}>Recent assignments</h2>
                  <span style={{ fontSize: 12, color: "var(--color-ink-soft)", fontFamily: "var(--font-mono)" }}>{totalRaised} total</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {GIGS.slice(0, 6).map((g) => {
                    const isFulfilled = fulfilledGigIds.has(g.id);
                    const chipBg = isFulfilled ? "#dcfce7" : "var(--color-accent-soft)";
                    const chipFg = isFulfilled ? "#166534" : "var(--color-accent-ink)";
                    const chipLabel = isFulfilled ? "Fulfilled" : "Active";
                    return (
                      <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)", gap: 10 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: "var(--font-display)", fontSize: 14, margin: "0 0 2px", letterSpacing: "-0.015em", lineHeight: 1.2 }}>{g.title}</p>
                          <p style={{ fontSize: 10, color: "var(--color-ink-mute)", margin: 0 }}>
                            {g.category}{g.duration ? ` · ${g.duration}` : ""}
                          </p>
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: chipBg, color: chipFg, letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>
                          {chipLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Skills */}
            {activeAccount.skills && activeAccount.skills.length > 0 && (
              <section>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 14px", letterSpacing: "-0.02em" }}>
                  What {activeAccount.name.split(" ")[0]} works on
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {activeAccount.skills.map(s => (
                    <span key={s} style={{ fontSize: 13, padding: "6px 14px", borderRadius: 999, background: "var(--color-accent-soft)", color: "var(--color-accent-ink)", fontWeight: 600 }}>
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Gig history */}
            {gigHistoryCount > 0 && (
              <section>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", letterSpacing: "-0.02em" }}>Gig history</h2>
                <div style={{ position: "relative", paddingLeft: 20 }}>
                  <div style={{ position: "absolute", left: 6, top: 8, bottom: 8, width: 1, background: "var(--color-line)" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    {gigHistoryLabels.slice(0, gigHistoryCount).map((title, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: -18, top: 6, width: 8, height: 8, borderRadius: "50%", background: i === 0 ? "var(--color-ink)" : "var(--color-line)", border: "1.5px solid var(--color-line)" }} />
                        <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 2px", color: "var(--color-ink)" }}>{title}</p>
                        <p style={{ fontSize: 12, color: "var(--color-ink-mute)", margin: 0, fontFamily: "var(--font-mono)" }}>
                          Hired via HustleSG · {monthYear(i * 2 + 1)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Credentials */}
            {mock.creds.length > 0 && (
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, letterSpacing: "-0.02em" }}>Credentials</h2>
                  <span style={{ fontSize: 12, color: "var(--color-ink-soft)", fontFamily: "var(--font-mono)" }}>
                    <span style={{ color: "var(--color-ink)", fontWeight: 700 }}>{verifiedCreds}</span>/{totalCreds} verified
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {mock.creds.map((cred, i) => {
                    const ic = issuerColor(cred.issuer);
                    return (
                      <div
                        key={i}
                        style={{ padding: "16px 18px", borderRadius: 14, border: "1px solid var(--color-line)", background: cred.verified ? "var(--color-surface-raised)" : "var(--color-muted)" }}
                      >
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: ic.bg, color: ic.fg, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, fontFamily: "var(--font-mono)" }}>
                            {issuerInitials(cred.issuer)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-mute)", fontWeight: 600, margin: "0 0 2px" }}>{cred.issuer}</p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-ink)", margin: 0, lineHeight: 1.3 }}>{cred.title}</p>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {cred.skills.slice(0, 3).map(s => (
                            <span key={s} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-mute)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s}</span>
                          ))}
                          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: cred.verified ? "#dcfce7" : "var(--color-muted)", color: cred.verified ? "#166534" : "var(--color-ink-mute)" }}>
                            {cred.verified ? "Verified ✓" : "Pending"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Right sidebar: rate + additional info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activeAccount.hourlyRate && (
              <div style={{ padding: "18px 20px", borderRadius: 16, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 6px", fontWeight: 600 }}>Rate</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "var(--color-ink)", margin: 0 }}>{activeAccount.hourlyRate}</p>
              </div>
            )}
            {(activeAccount.rating || avgStars !== null) && (
              <div style={{ padding: "18px 20px", borderRadius: 16, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 6px", fontWeight: 600 }}>Rating</p>
                {avgStars !== null ? (
                  <>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "#f59e0b", margin: 0 }}>★ {avgStars}</p>
                    <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "3px 0 0" }}>{myRatings.length} review{myRatings.length !== 1 ? "s" : ""} on HustleSG</p>
                  </>
                ) : (
                  <>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "#f59e0b", margin: 0 }}>★ {activeAccount.rating}</p>
                    <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "3px 0 0" }}>from {activeAccount.completedGigs} gigs</p>
                  </>
                )}
              </div>
            )}

            <div style={{ padding: "18px 20px", borderRadius: 16, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 12px", fontWeight: 600 }}>Recent reviews</p>
              {myRatings.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {myRatings.slice(-3).reverse().map((r) => (
                    <div key={r.id} style={{ paddingBottom: 12, borderBottom: "1px solid var(--color-line)" }}>
                      <div style={{ color: "#f59e0b", fontSize: 14, marginBottom: 4 }}>
                        {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                      </div>
                      <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: "0 0 4px", lineHeight: 1.5 }}>{r.review}</p>
                      <p style={{ fontSize: 10, color: "var(--color-ink-mute)", margin: 0 }}>{r.gigTitle}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--color-ink-mute)", margin: 0, lineHeight: 1.5 }}>
                  {isEmployer
                    ? "No reviews yet. Workers can rate you after a gig is completed."
                    : "No reviews yet. Complete a gig to receive your first review."}
                </p>
              )}
            </div>
            <div style={{ padding: "16px 18px", borderRadius: 16, background: "var(--color-muted)", fontSize: 12, color: "var(--color-ink-mute)", lineHeight: 1.5 }}>
              Demo profile — real profiles include full work history, portfolio, and live trust score updates.
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Mobile layout
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      {/* Hero card */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid var(--color-line)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: avBg, color: avFg, display: "grid", placeItems: "center", fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
            {ini}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 3px", letterSpacing: "-0.02em", color: "var(--color-ink)" }}>{activeAccount.name}</h1>
            <p style={{ fontSize: 12, color: "var(--color-ink-mute)", margin: 0 }}>{activeAccount.headline}</p>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: "#dcfce7", color: "#166534", letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>
            Singpass ✓
          </span>
        </div>

        {mock.bio && (
          <p style={{ fontSize: 13, color: "var(--color-ink-soft)", lineHeight: 1.5, margin: "0 0 10px" }}>{mock.bio}</p>
        )}

        {/* Mobile employer company chips */}
        {isEmployer && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", fontWeight: 600 }}>{liveEmployer.companyName}</span>
            <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", fontWeight: 600 }}>{liveEmployer.industry}</span>
            {liveEmployer.uen && <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 999, background: "#dbeafe", color: "#1e40af", fontWeight: 700, fontFamily: "var(--font-mono)" }}>UEN: {liveEmployer.uen}</span>}
          </div>
        )}

        {mock.location && (
          <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: 0 }}>📍 {mock.location}</p>
        )}
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(STATS.length, 3)}, 1fr)`, gap: 8 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ padding: "10px 12px", borderRadius: 12, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--color-ink)", margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 9, color: "var(--color-ink-mute)", margin: "2px 0 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mobile edit profile button (employer only) */}
        {isEmployer && (
          editingProfile ? (
            <EditProfileForm
              current={liveEmployer}
              onSave={(p) => { updateEmployerProfile(p); setEditingProfile(false); }}
              onCancel={() => setEditingProfile(false)}
            />
          ) : (
            <button
              onClick={() => setEditingProfile(true)}
              style={{ padding: "10px 18px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", fontSize: 13, fontWeight: 600, color: "var(--color-ink)", cursor: "pointer", textAlign: "center" as const }}
            >
              Edit company profile
            </button>
          )
        )}

        {/* Trust panel (compact mobile) */}
        <div style={{ borderRadius: 16, background: "var(--color-ink)", color: "var(--color-surface)", padding: 16 }}>
          <p style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 700, margin: "0 0 10px" }}>
            {isEmployer ? "Requestor trust" : "Trust score"}
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
            {isEmployer ? (
              <>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: "-0.04em" }}>{fulfilledPct}</span>
                <span style={{ fontSize: 14, opacity: 0.4 }}>% fulfilled</span>
              </>
            ) : (
              <>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: "-0.04em" }}>{trustScore}</span>
                <span style={{ fontSize: 14, opacity: 0.4 }}>/100</span>
              </>
            )}
          </div>
          <div style={{ height: 5, borderRadius: 999, background: "oklch(100% 0 0 / 0.12)", overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", width: `${isEmployer ? fulfilledPct : trustScore}%`, background: "linear-gradient(90deg, var(--color-accent), #4ade80)", borderRadius: 999 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(isEmployer ? [
              { label: "Singpass", value: "L2 ✓", ok: true },
              { label: "Escrow", value: "SGD ✓", ok: true },
              { label: "Raised", value: `${totalRaised}`, ok: totalRaised > 0 },
              { label: "Fulfilled", value: `${fulfilledCount}/${totalRaised}`, ok: fulfilledCount > 0 },
            ] : [
              { label: "Singpass", value: "L2 ✓", ok: true },
              { label: "Certs", value: verifiedCreds > 0 ? `${verifiedCreds}/${totalCreds}` : "—", ok: verifiedCreds > 0 },
              { label: "Gigs done", value: completedGigs > 0 ? `${completedGigs}` : "—", ok: completedGigs > 0 },
            ]).map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "oklch(100% 0 0 / 0.6)" }}>{item.label}</span>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: item.ok ? "#4ade80" : "oklch(100% 0 0 / 0.35)" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        {activeAccount.skills && activeAccount.skills.length > 0 && (
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 10px", fontWeight: 600 }}>Skills</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {activeAccount.skills.map(s => (
                <span key={s} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 999, background: "var(--color-accent-soft)", color: "var(--color-accent-ink)", fontWeight: 600 }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rate */}
        {activeAccount.hourlyRate && (
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 4px", fontWeight: 600 }}>Rate</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--color-ink)", margin: 0 }}>{activeAccount.hourlyRate}</p>
            {avgStars !== null ? (
              <p style={{ fontSize: 12, color: "#f59e0b", margin: "4px 0 0", fontWeight: 700 }}>★ {avgStars} · {myRatings.length} review{myRatings.length !== 1 ? "s" : ""}</p>
            ) : activeAccount.rating ? (
              <p style={{ fontSize: 12, color: "#f59e0b", margin: "4px 0 0", fontWeight: 700 }}>★ {activeAccount.rating} · {activeAccount.completedGigs} gigs completed</p>
            ) : null}
          </div>
        )}

        {/* Recent reviews (mobile) */}
        <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 10px", fontWeight: 600 }}>Recent reviews</p>
          {myRatings.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {myRatings.slice(-3).reverse().map((r) => (
                <div key={r.id} style={{ paddingBottom: 10, borderBottom: "1px solid var(--color-line)" }}>
                  <div style={{ color: "#f59e0b", fontSize: 13, marginBottom: 3 }}>
                    {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: "0 0 3px", lineHeight: 1.5 }}>{r.review}</p>
                  <p style={{ fontSize: 10, color: "var(--color-ink-mute)", margin: 0 }}>{r.gigTitle}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--color-ink-mute)", margin: 0, lineHeight: 1.5 }}>
              {isEmployer
                ? "No reviews yet. Workers can rate you after a gig is completed."
                : "No reviews yet. Complete a gig to receive your first review."}
            </p>
          )}
        </div>

        {/* Credentials */}
        {mock.creds.length > 0 && (
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 8px", fontWeight: 600 }}>Credentials · {verifiedCreds}/{totalCreds} verified</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {mock.creds.map((cred, i) => {
                const ic = issuerColor(cred.issuer);
                return (
                  <div key={i} style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 30, height: 30, borderRadius: 6, background: ic.bg, color: ic.fg, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                        {issuerInitials(cred.issuer)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 1px" }}>{cred.issuer}</p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-ink)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cred.title}</p>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: cred.verified ? "#dcfce7" : "var(--color-muted)", color: cred.verified ? "#166534" : "var(--color-ink-mute)", flexShrink: 0 }}>
                        {cred.verified ? "Verified" : "Pending"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
