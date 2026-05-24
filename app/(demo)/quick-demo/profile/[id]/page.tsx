"use client";

import { useParams, useRouter } from "next/navigation";
import { useDemo } from "../../DemoProvider";
import { PROFILES } from "../../data";

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

export default function FreelancerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { ratings } = useDemo();

  const profileId = params.id as string;
  const profile = PROFILES.find(p => p.id === profileId);
  const mock = MOCK_DATA[profileId] ?? { trustScore: 70, bio: "", location: "Singapore", creds: [] };

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
            {(avgStars !== null || profile.rating) && (
              <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>
                ★ {avgStars ?? profile.rating}
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
              { label: "Completed gigs", value: profile.completedGigs ? `${profile.completedGigs} done` : "None yet", ok: (profile.completedGigs ?? 0) > 0 },
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
                        {issuerInitials(cred.issuer)}
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
