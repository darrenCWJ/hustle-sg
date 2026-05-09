"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/ui/primitives";
import { SkillChip, MatchScoreBadge } from "@/components/ui/interactive";

type ProfileKey = "designer" | "engineer" | "tutor" | "emcee";

const PROFILES: Record<ProfileKey, { label: string; emoji: string; skills: string[]; hue: number }> = {
  designer: {
    label: "Product Designer",
    emoji: "🎨",
    skills: ["Product design", "Figma", "User research", "Prototyping"],
    hue: 340,
  },
  engineer: {
    label: "Engineer",
    emoji: "⚙️",
    skills: ["React", "TypeScript", "Node.js", "API design"],
    hue: 200,
  },
  tutor: {
    label: "Tutor",
    emoji: "📚",
    skills: ["Mathematics", "Physics", "O-level prep", "Curriculum"],
    hue: 78,
  },
  emcee: {
    label: "Emcee",
    emoji: "🎤",
    skills: ["Event hosting", "Bilingual", "Corporate events", "Scripting"],
    hue: 165,
  },
};

const GIGS: {
  id: number;
  title: string;
  company: string;
  location: string;
  budget: string;
  requiredSkills: string[];
  matchScores: Record<ProfileKey, number>;
  reasons: Partial<Record<ProfileKey, string[]>>;
}[] = [
  {
    id: 1,
    title: "Design a loyalty app for kopitiam chain",
    company: "Kopitiam Co.",
    location: "Bedok",
    budget: "S$8,400 fixed",
    requiredSkills: ["Product design", "Figma", "Prototyping"],
    matchScores: { designer: 94, engineer: 18, tutor: 5, emcee: 7 },
    reasons: {
      designer: ["Portfolio: F&B app UX case study", "WSQ Diploma in Design Thinking", "3 Figma projects shipped"],
      engineer: ["Partial — React skills noted", "No design-skill overlap detected"],
    },
  },
  {
    id: 2,
    title: "Build React dashboard for F&B analytics",
    company: "FoodTech SG",
    location: "One-North",
    budget: "S$6,200 fixed",
    requiredSkills: ["React", "TypeScript", "Data viz"],
    matchScores: { designer: 31, engineer: 91, tutor: 4, emcee: 3 },
    reasons: {
      engineer: ["TypeScript & React skill overlap", "Portfolio: OpenAPI spec + dashboard", "4 shipped web apps"],
      designer: ["Partial — Figma noted", "No engineering skill overlap"],
    },
  },
  {
    id: 3,
    title: "O-level Math tuition — 2 students",
    company: "Private family",
    location: "Tampines",
    budget: "S$60 / hr",
    requiredSkills: ["Mathematics", "O-level prep", "Teaching"],
    matchScores: { designer: 8, engineer: 12, tutor: 96, emcee: 6 },
    reasons: {
      tutor: ["NUS BSc Mathematics", "5 prior tutees · avg A1", "O-level specialist cert"],
    },
  },
  {
    id: 4,
    title: "Emcee for corporate D&D, 400 pax",
    company: "Prudential Singapore",
    location: "Marina Bay Sands",
    budget: "S$2,800 fixed",
    requiredSkills: ["Emceeing", "Corporate events", "Bilingual"],
    matchScores: { designer: 6, engineer: 4, tutor: 11, emcee: 92 },
    reasons: {
      emcee: ["8 prior corporate events on portfolio", "English + Mandarin verified", "Lazada D&D 2024 video reference"],
    },
  },
  {
    id: 5,
    title: "UX research for checkout redesign",
    company: "Lazada SG",
    location: "Remote",
    budget: "S$4,500 fixed",
    requiredSkills: ["User research", "Usability testing", "Figma"],
    matchScores: { designer: 87, engineer: 24, tutor: 9, emcee: 5 },
    reasons: {
      designer: ["2 prior UX research projects", "Usability testing cert (NN/g)", "Figma skill overlap"],
      engineer: ["Partial — API design noted", "No UX-skill overlap"],
    },
  },
  {
    id: 6,
    title: "A-level Physics tuition — JC student",
    company: "Private family",
    location: "Jurong East",
    budget: "S$75 / hr",
    requiredSkills: ["Physics", "A-level prep", "JC curriculum"],
    matchScores: { designer: 6, engineer: 15, tutor: 89, emcee: 4 },
    reasons: {
      tutor: ["NUS Physics background", "JC curriculum experience", "A-level specialist rated"],
      engineer: ["Partial — problem-solving noted", "No physics-teaching overlap"],
    },
  },
];

export function MatchSimulator() {
  const [active, setActive] = useState<ProfileKey>("designer");

  const profile = PROFILES[active];
  const topGigs = [...GIGS]
    .sort((a, b) => b.matchScores[active] - a.matchScores[active])
    .slice(0, 3);

  return (
    <div>
      {/* Profile picker */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {(Object.entries(PROFILES) as [ProfileKey, (typeof PROFILES)[ProfileKey]][]).map(([key, p]) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: `1px solid ${active === key ? "var(--color-ink)" : "var(--color-line)"}`,
              background: active === key ? "var(--color-ink)" : "var(--color-surface-raised)",
              color: active === key ? "oklch(97% 0.012 85)" : "var(--color-ink-soft)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.18s var(--ease-out-smooth)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: `oklch(68% 0.18 ${p.hue})`,
            }} />
            {p.label}
          </button>
        ))}
      </div>

      {/* Current profile skills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 32 }}>
        <span style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-ink-mute)", marginRight: 4 }}>
          Your skills
        </span>
        {profile.skills.map((s) => (
          <SkillChip key={s} tone="accent">{s}</SkillChip>
        ))}
      </div>

      {/* Ranked gigs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {topGigs.map((gig, i) => {
          const score = gig.matchScores[active];
          const reasons = gig.reasons[active] ?? ["Semantic similarity detected", "Skill vector overlap"];
          const matchedSkills = gig.requiredSkills.filter((req) =>
            profile.skills.some(
              (ps) =>
                ps.toLowerCase().includes(req.toLowerCase()) ||
                req.toLowerCase().includes(ps.toLowerCase())
            )
          );

          return (
            <div
              key={gig.id}
              className="card-hover"
              style={{
                background: "var(--color-surface-raised)",
                border: "1px solid var(--color-line)",
                borderRadius: 18,
                padding: "20px 24px",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 20,
                alignItems: "start",
                animation: `fadeUp 0.4s var(--ease-out-expo) ${i * 55}ms both`,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-ink-mute)" }}>
                    #{i + 1}
                  </span>
                  {matchedSkills.map((s) => (
                    <SkillChip key={s} tone="trust">{s}</SkillChip>
                  ))}
                </div>
                <p style={{
                  fontFamily: "var(--font-display)", fontSize: 22,
                  margin: "0 0 5px", letterSpacing: "-0.02em", lineHeight: 1.1,
                }}>
                  {gig.title}
                </p>
                <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: "0 0 14px" }}>
                  {gig.company} · {gig.location}
                </p>
                <div style={{
                  background: "var(--color-ink)", borderRadius: 10,
                  padding: "10px 14px", display: "inline-block",
                }}>
                  <p style={{
                    fontFamily: "var(--font-mono)", fontSize: 9,
                    letterSpacing: "0.16em", textTransform: "uppercase",
                    color: "var(--color-accent)", margin: 0,
                  }}>
                    Why it matched
                  </p>
                  <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 3 }}>
                    {reasons.map((r) => (
                      <li key={r} style={{ fontSize: 11, color: "oklch(100% 0 0 / 0.75)" }}>✓ {r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                <MatchScoreBadge score={score} overlap={matchedSkills} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}>
                  {gig.budget}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: 16, fontSize: 11, color: "var(--color-ink-mute)", textAlign: "center", fontFamily: "var(--font-mono)" }}>
        Cosine similarity · pgvector 1536-d · re-ranks on profile save
      </p>
    </div>
  );
}
