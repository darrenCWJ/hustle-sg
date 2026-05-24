"use client";

import { useParams, useRouter } from "next/navigation";
import { useDemo } from "../../DemoProvider";
import { useViewMode } from "../../ViewModeContext";
import { PROFILES } from "../../data";

interface MockCred {
  issuer: string;
  title: string;
  skills: string[];
  verified: boolean;
}

interface WorkEntry {
  title: string;
  client: string;
  budget: string;
  duration: string;
  category: string;
  outcome?: string;
}

const MOCK_DATA: Record<string, {
  trustScore: number;
  creds: MockCred[];
  bio: string;
  location: string;
  memberSince: string;
  responseTime: string;
  workHistory: WorkEntry[];
}> = {
  requestor: {
    trustScore: 62,
    bio: "Operations Director at Demo Corp SG. Regularly engages freelance talent across tech, design, and events.",
    location: "Singapore",
    memberSince: "Mar 2024",
    responseTime: "< 2 hrs",
    creds: [],
    workHistory: [],
  },
  it: {
    trustScore: 91,
    bio: "Full-stack developer and UI/UX designer with 6 years of experience building SaaS products and mobile apps. Ex-Grab, ex-Carousell. I specialise in Next.js, TypeScript, Supabase, and React Native.",
    location: "Tanjong Pagar, Singapore",
    memberSince: "Jan 2024",
    responseTime: "< 1 hr",
    creds: [
      { issuer: "Amazon Web Services", title: "AWS Cloud Practitioner", skills: ["AWS", "Cloud Architecture"], verified: true },
      { issuer: "Google", title: "Google Cloud Professional Developer", skills: ["GCP", "Cloud Run", "BigQuery"], verified: true },
      { issuer: "Meta", title: "Meta Frontend Developer Certificate", skills: ["React", "JavaScript", "Accessibility"], verified: true },
      { issuer: "SkillsFuture SG", title: "AI Essentials for Tech Professionals", skills: ["AI/ML", "Python"], verified: true },
    ],
    workHistory: [
      { title: "B2B SaaS dashboard — full-stack build", client: "Logistech Pte Ltd", budget: "$12,000", duration: "4 months", category: "tech", outcome: "Shipped to 800 daily active users" },
      { title: "React Native loyalty app — iOS & Android", client: "FreshMart SG", budget: "$9,500", duration: "3 months", category: "tech", outcome: "4.7★ on App Store at launch" },
      { title: "UI/UX redesign — fintech mobile app", client: "PayLah Startup", budget: "$4,800", duration: "6 weeks", category: "design", outcome: "30% improvement in onboarding completion" },
      { title: "AWS infrastructure migration", client: "Logistics SaaS", budget: "$6,200", duration: "2 months", category: "tech", outcome: "63% reduction in infra costs" },
      { title: "Design system in Figma — 120+ components", client: "HealthTech SG", budget: "$3,400", duration: "3 weeks", category: "design", outcome: "Adopted across 3 product teams" },
    ],
  },
  events: {
    trustScore: 83,
    bio: "Event coordinator and content strategist with 8 years across corporate events, product launches, and social media campaigns. I've managed events from 50 to 2,000 pax across Singapore and the region.",
    location: "Orchard, Singapore",
    memberSince: "Jun 2024",
    responseTime: "< 3 hrs",
    creds: [
      { issuer: "NTUC Learning Hub", title: "MICE Event Management", skills: ["Event Planning", "Vendor Management"], verified: true },
      { issuer: "Google", title: "Google Analytics Certification", skills: ["Analytics", "Data Insights"], verified: true },
      { issuer: "HubSpot Academy", title: "Content Marketing Certification", skills: ["Content Strategy", "SEO", "Inbound Marketing"], verified: true },
    ],
    workHistory: [
      { title: "Product launch event — Marina Bay Sands", client: "TechCorp SEA", budget: "$8,500", duration: "3 weeks prep", category: "events", outcome: "350 attendees, press coverage in Business Times" },
      { title: "Annual corporate dinner — 800 pax", client: "DBS Group", budget: "$12,000", duration: "6 weeks", category: "events", outcome: "Full execution, within budget" },
      { title: "Social media strategy — F&B chain", client: "Grain Traders", budget: "$2,400", duration: "Ongoing (8 months)", category: "marketing", outcome: "Instagram followers grew 3.2×" },
      { title: "Trade show booth design & logistics", client: "SGInnovate", budget: "$5,600", duration: "4 weeks", category: "events", outcome: "Best booth award at Tech Summit 2024" },
    ],
  },
  teaching: {
    trustScore: 88,
    bio: "Experienced A-level tutor specialising in Mathematics, Physics, and Chemistry. MOE-trained teacher, 10 years private tutoring experience. 94% of my students achieve their target grade.",
    location: "Bishan, Singapore",
    memberSince: "Feb 2024",
    responseTime: "< 4 hrs",
    creds: [
      { issuer: "NIE Singapore", title: "Postgraduate Diploma in Education", skills: ["Teaching Pedagogy", "Curriculum Design"], verified: true },
      { issuer: "Cambridge Assessment", title: "Certified IB Examiner — Mathematics", skills: ["IB Maths", "Assessment"], verified: true },
      { issuer: "SkillsFuture SG", title: "Advanced Certificate in Training & Assessment", skills: ["Adult Learning", "Facilitation"], verified: true },
    ],
    workHistory: [
      { title: "H2 Maths intensive — JC2 student", client: "Private (Bishan)", budget: "$85/hr · 24 sessions", duration: "6 months", category: "tuition", outcome: "Student achieved A in A-levels" },
      { title: "IB Maths AA HL tutoring", client: "Private (Orchard)", budget: "$100/hr · 30 sessions", duration: "8 months", category: "tuition", outcome: "Student scored 6/7 in IB exams" },
      { title: "O-Level Physics group (3 students)", client: "Private (Tampines)", budget: "$70/hr × 3 students", duration: "5 months", category: "tuition", outcome: "All 3 students passed with B3 or above" },
      { title: "Primary 5 English enrichment class", client: "Community Centre (Bishan)", budget: "$60/hr · 8 sessions", duration: "2 months", category: "tuition", outcome: "Average class score improved by 18pts" },
    ],
  },
  "tech-2-profile": {
    trustScore: 76,
    bio: "Mobile developer specialising in React Native and Flutter. I've shipped 12 apps on the App Store and Google Play, reaching over 500k combined downloads.",
    location: "Buona Vista, Singapore",
    memberSince: "Apr 2024",
    responseTime: "< 2 hrs",
    creds: [
      { issuer: "Google", title: "Associate Android Developer", skills: ["Android", "Kotlin", "Jetpack"], verified: true },
      { issuer: "Meta", title: "React Native Developer Certificate", skills: ["React Native", "JavaScript"], verified: true },
      { issuer: "SkillsFuture SG", title: "Mobile App Development (iOS/Android)", skills: ["Swift", "Flutter", "Firebase"], verified: true },
    ],
    workHistory: [
      { title: "Flutter e-commerce app — iOS & Android", client: "Boutique Retail SG", budget: "$7,200", duration: "3 months", category: "tech", outcome: "20k downloads in first 60 days" },
      { title: "React Native rewards app rebuild", client: "F&B Chain", budget: "$5,800", duration: "2.5 months", category: "tech", outcome: "Reduced crash rate from 4% to 0.2%" },
      { title: "Push notification & deep-link system", client: "News Portal SG", budget: "$2,600", duration: "3 weeks", category: "tech", outcome: "35% uplift in daily active opens" },
    ],
  },
  "design-2-profile": {
    trustScore: 79,
    bio: "Brand designer and visual storyteller. I've worked with 40+ startups across SEA to craft visual identities that actually land. Figma power user, motion graphics as needed.",
    location: "Tiong Bahru, Singapore",
    memberSince: "May 2024",
    responseTime: "< 6 hrs",
    creds: [
      { issuer: "Adobe", title: "Adobe Certified Professional — Visual Design", skills: ["Illustrator", "Photoshop", "InDesign"], verified: true },
      { issuer: "Canva", title: "Canva Certified Creator", skills: ["Design Systems", "Brand Kits"], verified: false },
    ],
    workHistory: [
      { title: "Full brand identity — fintech startup", client: "CashFlow App", budget: "$5,500", duration: "5 weeks", category: "design", outcome: "Used in $2M seed fundraise deck" },
      { title: "Marketing collateral — product launch", client: "HealthTech SG", budget: "$2,800", duration: "2 weeks", category: "design", outcome: "Delivered 40 assets across 3 formats" },
      { title: "Pitch deck design — Series A", client: "EdTech Startup", budget: "$1,900", duration: "1 week", category: "design", outcome: "Founders closed $4.5M round" },
    ],
  },
  "events-2-profile": {
    trustScore: 72,
    bio: "Digital marketing specialist focused on paid media. I manage $250k+ in monthly ad spend across Google and Meta platforms for SG clients.",
    location: "Raffles Place, Singapore",
    memberSince: "Jul 2024",
    responseTime: "< 2 hrs",
    creds: [
      { issuer: "Google", title: "Google Ads Search Certification", skills: ["Google Ads", "SEM", "Search Strategy"], verified: true },
      { issuer: "Meta", title: "Meta Blueprint — Media Buying", skills: ["Meta Ads", "Facebook", "Instagram"], verified: true },
    ],
    workHistory: [
      { title: "Google & Meta paid media — e-commerce", client: "Fashion Brand SG", budget: "$75/hr · ongoing", duration: "6 months", category: "marketing", outcome: "4.2× ROAS on $80k monthly spend" },
      { title: "Lead generation campaign — B2B SaaS", client: "HR Software Co", budget: "$3,200", duration: "6 weeks", category: "marketing", outcome: "CPL reduced by 44%" },
      { title: "Retargeting strategy — D2C supplements", client: "Wellness Brand", budget: "$2,100", duration: "4 weeks", category: "marketing", outcome: "Cart abandonment recovered by 22%" },
    ],
  },
  "teaching-2-profile": {
    trustScore: 85,
    bio: "English language and General Paper tutor with 12 years experience. Former MOE school teacher, now full-time private tutor with a 97% pass rate.",
    location: "Clementi, Singapore",
    memberSince: "Mar 2024",
    responseTime: "< 5 hrs",
    creds: [
      { issuer: "NIE Singapore", title: "Bachelor of Arts (English Language & Literature)", skills: ["English Literature", "Linguistics"], verified: true },
      { issuer: "Cambridge Assessment", title: "O/A-level Examiner — English Language", skills: ["Assessment", "Marking"], verified: true },
    ],
    workHistory: [
      { title: "A-Level GP intensive programme", client: "Private (West SG)", budget: "$80/hr · 20 sessions", duration: "4 months", category: "tuition", outcome: "Student jumped from E to B in GP" },
      { title: "O-Level English group class (4 students)", client: "Private (Clementi)", budget: "$65/hr × 4 students", duration: "5 months", category: "tuition", outcome: "All students achieved B3 or above" },
      { title: "Creative writing crash course", client: "Primary school (CCE)", budget: "$55/hr · 12 sessions", duration: "3 months", category: "tuition", outcome: "Avg score improvement of 15 marks" },
    ],
  },
  "events-3-profile": {
    trustScore: 74,
    bio: "Video editor and content creator with 5+ years creating YouTube series, brand videos, and social content for Singapore brands.",
    location: "Jurong East, Singapore",
    memberSince: "Aug 2024",
    responseTime: "< 4 hrs",
    creds: [
      { issuer: "YouTube", title: "YouTube Creator Academy — Advanced", skills: ["YouTube SEO", "Audience Building"], verified: true },
    ],
    workHistory: [
      { title: "YouTube series — 10 episodes, 15 min each", client: "Business Education Channel", budget: "$600/episode", duration: "2 months", category: "content", outcome: "Series averaged 45k views/episode" },
      { title: "Brand video + social cuts — product launch", client: "Tech Startup SG", budget: "$2,200", duration: "3 weeks", category: "content", outcome: "Hero video reached 120k organic views" },
      { title: "Podcast video production — 20 episodes", client: "Finance Podcast SG", budget: "$250/episode", duration: "4 months", category: "content", outcome: "Grew channel subscribers by 3.8k" },
    ],
  },
};

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  tech:      { bg: "#eff6ff", fg: "#1d4ed8" },
  design:    { bg: "#faf5ff", fg: "#7e22ce" },
  events:    { bg: "#fffbeb", fg: "#b45309" },
  marketing: { bg: "#fdf2f8", fg: "#be185d" },
  content:   { bg: "#eef2ff", fg: "#4338ca" },
  tuition:   { bg: "#f0fdf4", fg: "#166534" },
};

const AVATAR_HUES = [250, 165, 340, 38, 260, 200, 78, 310];
function avatarColors(name: string) {
  const hue = AVATAR_HUES[(name.charCodeAt(0) + (name.charCodeAt(1) ?? 0)) % AVATAR_HUES.length];
  return { bg: `oklch(78% 0.08 ${hue})`, fg: `oklch(22% 0.08 ${hue})` };
}
function initials(name: string) {
  return name.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase();
}
function issuerColor(name: string) {
  const hue = AVATAR_HUES[(name.charCodeAt(0) + (name.charCodeAt(1) ?? 0)) % AVATAR_HUES.length];
  return { bg: `oklch(82% 0.06 ${hue})`, fg: `oklch(28% 0.08 ${hue})` };
}

export default function FreelancerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { ratings } = useDemo();
  const { viewMode } = useViewMode();

  const profileId = params.id as string;
  const profile = PROFILES.find(p => p.id === profileId);
  const mock = MOCK_DATA[profileId] ?? { trustScore: 70, bio: "", location: "Singapore", memberSince: "2024", responseTime: "< 4 hrs", creds: [], workHistory: [] };

  if (!profile) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-mute)" }}>
        Profile not found.
      </div>
    );
  }

  const { bg: avBg, fg: avFg } = avatarColors(profile.name);
  const ini = initials(profile.name);
  const verifiedCreds = mock.creds.filter(c => c.verified).length;

  const myRatings = (ratings ?? []).filter(r => r.toId === profileId);
  const avgStars = myRatings.length > 0
    ? Math.round((myRatings.reduce((s, r) => s + r.stars, 0) / myRatings.length) * 10) / 10
    : null;

  const displayRating = avgStars ?? profile.rating ?? null;
  const totalGigs = (profile.completedGigs ?? 0) + mock.workHistory.length;

  const STATS = [
    { label: "Gigs completed", value: totalGigs, sub: "verified on platform" },
    { label: "Rating", value: displayRating !== null ? `★ ${displayRating}` : "—", sub: myRatings.length > 0 ? `${myRatings.length} review${myRatings.length !== 1 ? "s" : ""}` : "from past clients" },
    { label: "Rate", value: profile.hourlyRate ?? "TBD", sub: "typical engagement" },
    { label: "Response", value: mock.responseTime, sub: "avg. response time" },
    { label: "Trust score", value: mock.trustScore, sub: `top ${100 - mock.trustScore + 10}%` },
  ];

  // ── Desktop layout ─────────────────────────────────────────────────────────
  if (viewMode === "desktop") {
    return (
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 28px 80px" }}>
        <button
          onClick={() => router.back()}
          style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 32, fontWeight: 600 }}
        >
          ← Back
        </button>

        {/* Hero: name/bio left + trust panel right */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 40, marginBottom: 36, alignItems: "start" }}>
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#dcfce7", color: "#166534", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Singpass ✓
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-mute)", padding: "3px 10px", borderRadius: 999, background: "var(--color-muted)" }}>
                @{profile.name.toLowerCase().replace(/\s+/g, ".")}
              </span>
              <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>📍 {mock.location}</span>
              <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>Member since {mock.memberSince}</span>
            </div>

            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 4.5vw, 5rem)", margin: "0 0 12px", lineHeight: 0.95, letterSpacing: "-0.04em" }}>
              {profile.name}
            </h1>

            {profile.headline && (
              <p style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 14px", color: "var(--color-ink-soft)", letterSpacing: "-0.02em" }}>
                {profile.headline}
              </p>
            )}

            <p style={{ fontSize: 15, color: "var(--color-ink-soft)", lineHeight: 1.65, margin: "0 0 24px", maxWidth: 520 }}>
              {mock.bio}
            </p>

            {profile.skills && profile.skills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profile.skills.map(s => (
                  <span key={s} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 999, background: "var(--color-accent-soft)", color: "var(--color-accent-ink)", fontWeight: 600 }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Trust panel */}
          <div style={{ borderRadius: 20, background: "var(--color-ink)", color: "var(--color-surface)", padding: 28 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 700, margin: "0 0 6px" }}>Trust score</p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 20px", letterSpacing: "-0.025em" }}>Verified freelancer</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {[
                { label: "Singpass identity", value: "L2 verified", ok: true },
                { label: "MyInfo prefill", value: "synced ✓", ok: true },
                { label: "WSQ / degree certs", value: verifiedCreds > 0 ? `${verifiedCreds} of ${mock.creds.length} verified` : "None uploaded", ok: verifiedCreds > 0 },
                { label: "Completed gigs", value: totalGigs > 0 ? `${totalGigs} done` : "None yet", ok: totalGigs > 0 },
                { label: "Response time", value: mock.responseTime, ok: true },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: 13, color: "oklch(100% 0 0 / 0.7)" }}>{item.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.ok ? "#4ade80" : "oklch(100% 0 0 / 0.3)", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: item.ok ? "#4ade80" : "oklch(100% 0 0 / 0.5)" }}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid oklch(100% 0 0 / 0.12)", paddingTop: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "oklch(100% 0 0 / 0.5)", margin: "0 0 4px", fontWeight: 600 }}>Score</p>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 48, margin: 0, lineHeight: 1, letterSpacing: "-0.04em" }}>
                    {mock.trustScore}<span style={{ fontSize: 18, opacity: 0.5 }}>/100</span>
                  </p>
                </div>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-accent)", fontWeight: 700 }}>
                  Top {100 - mock.trustScore + 10}%
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "oklch(100% 0 0 / 0.12)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${mock.trustScore}%`, background: "linear-gradient(90deg, var(--color-accent), #4ade80)", borderRadius: 999, transition: "width 0.8s ease" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${STATS.length}, 1fr)`, gap: 12, marginBottom: 40 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ padding: "18px 20px", borderRadius: 16, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, color: "var(--color-ink)", margin: 0, letterSpacing: "-0.02em" }}>{s.value}</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-soft)", margin: "4px 0 1px", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</p>
              <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: 0 }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Body: main + sidebar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32, alignItems: "start" }}>

          {/* LEFT: work history + reviews */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Work history */}
            {mock.workHistory.length > 0 && (
              <section>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: 0, letterSpacing: "-0.02em" }}>Work history</h2>
                  <span style={{ fontSize: 12, color: "var(--color-ink-soft)", fontFamily: "var(--font-mono)" }}>{mock.workHistory.length} past gigs</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {mock.workHistory.map((w, i) => {
                    const catStyle = CATEGORY_COLORS[w.category] ?? { bg: "var(--color-muted)", fg: "var(--color-ink-soft)" };
                    return (
                      <div key={i} style={{ padding: "16px 18px", borderRadius: 14, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontFamily: "var(--font-display)", fontSize: 16, margin: "0 0 3px", letterSpacing: "-0.015em", lineHeight: 1.2 }}>{w.title}</p>
                            <p style={{ fontSize: 12, color: "var(--color-ink-mute)", margin: 0 }}>
                              {w.client} · {w.duration}
                            </p>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--color-ink)" }}>{w.budget}</span>
                            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: catStyle.bg, color: catStyle.fg, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                              {w.category}
                            </span>
                          </div>
                        </div>
                        {w.outcome && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--color-line)" }}>
                            <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>✓</span>
                            <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>{w.outcome}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Reviews */}
            {myRatings.length > 0 && (
              <section>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: 0, letterSpacing: "-0.02em" }}>Reviews</h2>
                  {displayRating !== null && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "#f59e0b", fontWeight: 700 }}>★ {displayRating} · {myRatings.length} total</span>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {myRatings.slice().reverse().map(r => (
                    <div key={r.id} style={{ padding: "16px 18px", borderRadius: 14, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)" }}>
                      <div style={{ color: "#f59e0b", fontSize: 14, marginBottom: 6 }}>
                        {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                      </div>
                      <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: "0 0 6px", lineHeight: 1.55 }}>{r.review}</p>
                      <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: 0 }}>{r.gigTitle}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {mock.workHistory.length === 0 && myRatings.length === 0 && (
              <div style={{ padding: "32px 24px", borderRadius: 16, border: "1px dashed var(--color-line)", textAlign: "center", color: "var(--color-ink-mute)", fontSize: 14 }}>
                No work history yet.
              </div>
            )}
          </div>

          {/* RIGHT: credentials */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {mock.creds.length > 0 && (
              <section>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, letterSpacing: "-0.02em" }}>Credentials</h2>
                  <span style={{ fontSize: 12, color: "var(--color-ink-mute)", fontFamily: "var(--font-mono)" }}>{verifiedCreds}/{mock.creds.length} verified</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {mock.creds.map((cred, i) => {
                    const ic = issuerColor(cred.issuer);
                    return (
                      <div key={i} style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${cred.verified ? "#bbf7d0" : "var(--color-line)"}`, background: "var(--color-surface-raised)" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: ic.bg, color: ic.fg, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, fontFamily: "var(--font-mono)" }}>
                            {cred.issuer.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 2px", fontWeight: 600 }}>{cred.issuer}</p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-ink)", margin: 0, lineHeight: 1.3 }}>{cred.title}</p>
                          </div>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: cred.verified ? "#dcfce7" : "var(--color-muted)", color: cred.verified ? "#166534" : "var(--color-ink-mute)", flexShrink: 0 }}>
                            {cred.verified ? "Verified ✓" : "Pending"}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {cred.skills.map(s => (
                            <span key={s} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-mute)", fontWeight: 600, letterSpacing: "0.04em" }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {mock.creds.length === 0 && (
              <div style={{ padding: "20px 16px", borderRadius: 14, background: "var(--color-muted)", fontSize: 13, color: "var(--color-ink-mute)", textAlign: "center" }}>
                No credentials uploaded yet.
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ── Mobile layout ──────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid var(--color-line)", flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => router.back()}
          style={{ fontSize: 18, background: "none", border: "none", cursor: "pointer", color: "var(--color-accent)", padding: "4px", flexShrink: 0 }}
        >
          ←
        </button>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 18, margin: 0, letterSpacing: "-0.02em", color: "var(--color-ink)", flex: 1 }}>
          Profile
        </h1>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 32px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Identity card */}
        <div style={{ padding: "18px 16px", borderRadius: 16, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: avBg, color: avFg, display: "grid", placeItems: "center", fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
              {ini}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, margin: "0 0 2px", letterSpacing: "-0.02em", color: "var(--color-ink)" }}>{profile.name}</h2>
              {profile.headline && (
                <p style={{ fontSize: 12, color: "var(--color-ink-mute)", margin: 0 }}>{profile.headline}</p>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: "#dcfce7", color: "#166534", letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>
              Singpass ✓
            </span>
          </div>

          {mock.bio && (
            <p style={{ fontSize: 13, color: "var(--color-ink-soft)", lineHeight: 1.55, margin: "0 0 8px" }}>{mock.bio}</p>
          )}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {mock.location && (
              <span style={{ fontSize: 11, color: "var(--color-ink-mute)" }}>📍 {mock.location}</span>
            )}
            {profile.hourlyRate && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-ink)" }}>{profile.hourlyRate}</span>
            )}
            {displayRating !== null && (
              <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>
                ★ {displayRating}
                {myRatings.length > 0 && <span style={{ fontWeight: 400, color: "var(--color-ink-mute)" }}> ({myRatings.length} review{myRatings.length !== 1 ? "s" : ""})</span>}
              </span>
            )}
          </div>
        </div>

        {/* Trust score */}
        <div style={{ borderRadius: 16, background: "var(--color-ink)", color: "var(--color-surface)", padding: "16px 18px" }}>
          <p style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 700, margin: "0 0 6px" }}>Trust score</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 40, letterSpacing: "-0.04em" }}>{mock.trustScore}</span>
            <span style={{ fontSize: 14, opacity: 0.4 }}>/100</span>
            <span style={{ marginLeft: "auto", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-accent)", fontWeight: 700 }}>
              Top {100 - mock.trustScore + 10}%
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 999, background: "oklch(100% 0 0 / 0.12)", overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", width: `${mock.trustScore}%`, background: "linear-gradient(90deg, var(--color-accent), #4ade80)", borderRadius: 999 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { label: "Singpass identity", value: "L2 verified ✓", ok: true },
              { label: "MyInfo prefill", value: "synced ✓", ok: true },
              { label: "WSQ / degree certs", value: verifiedCreds > 0 ? `${verifiedCreds} of ${mock.creds.length}` : "None uploaded", ok: verifiedCreds > 0 },
              { label: "Completed gigs", value: totalGigs > 0 ? `${totalGigs} done` : "None yet", ok: totalGigs > 0 },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "oklch(100% 0 0 / 0.6)" }}>{item.label}</span>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: item.ok ? "#4ade80" : "oklch(100% 0 0 / 0.35)" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 10px", fontWeight: 600 }}>Skills</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {profile.skills.map(s => (
                <span key={s} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 999, background: "var(--color-accent-soft)", color: "var(--color-accent-ink)", fontWeight: 600 }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Work history — mobile compact */}
        {mock.workHistory.length > 0 && (
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 8px", fontWeight: 600 }}>
              Work history · {mock.workHistory.length} gigs
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {mock.workHistory.map((w, i) => {
                const catStyle = CATEGORY_COLORS[w.category] ?? { bg: "var(--color-muted)", fg: "var(--color-ink-soft)" };
                return (
                  <div key={i} style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", margin: "0 0 2px", lineHeight: 1.3 }}>{w.title}</p>
                        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: 0 }}>{w.client} · {w.duration}</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-ink)" }}>{w.budget}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 999, background: catStyle.bg, color: catStyle.fg, textTransform: "uppercase", letterSpacing: "0.06em" }}>{w.category}</span>
                      </div>
                    </div>
                    {w.outcome && (
                      <p style={{ fontSize: 11, color: "#16a34a", margin: "6px 0 0", fontWeight: 600 }}>✓ {w.outcome}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Credentials */}
        {mock.creds.length > 0 ? (
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 8px", fontWeight: 600 }}>
              Credentials · {verifiedCreds}/{mock.creds.length} verified
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {mock.creds.map((cred, i) => {
                const ic = issuerColor(cred.issuer);
                return (
                  <div key={i} style={{ padding: "14px 14px", borderRadius: 12, border: `1px solid ${cred.verified ? "#bbf7d0" : "var(--color-line)"}`, background: "var(--color-surface-raised)" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: ic.bg, color: ic.fg, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, fontFamily: "var(--font-mono)" }}>
                        {cred.issuer.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 2px", fontWeight: 600 }}>{cred.issuer}</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-ink)", margin: 0, lineHeight: 1.3 }}>{cred.title}</p>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: cred.verified ? "#dcfce7" : "var(--color-muted)", color: cred.verified ? "#166534" : "var(--color-ink-mute)", flexShrink: 0 }}>
                        {cred.verified ? "Verified ✓" : "Pending"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {cred.skills.map(s => (
                        <span key={s} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-mute)", fontWeight: 600, letterSpacing: "0.04em" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--color-muted)", fontSize: 13, color: "var(--color-ink-mute)", textAlign: "center" }}>
            No credentials uploaded yet.
          </div>
        )}

        {/* Reviews */}
        {myRatings.length > 0 && (
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 10px", fontWeight: 600 }}>
              Reviews · {myRatings.length} total
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {myRatings.slice().reverse().map(r => (
                <div key={r.id} style={{ paddingBottom: 10, borderBottom: "1px solid var(--color-line)" }}>
                  <div style={{ color: "#f59e0b", fontSize: 13, marginBottom: 3 }}>
                    {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: "0 0 3px", lineHeight: 1.5 }}>{r.review}</p>
                  <p style={{ fontSize: 10, color: "var(--color-ink-mute)", margin: 0 }}>{r.gigTitle}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
