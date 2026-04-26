"use client";

import Link from "next/link";
import { MatchScoreBadge, SkillChip, Button } from "@/components/ui/interactive";
import { Eyebrow } from "@/components/ui/primitives";

function HeroMatchCard() {
  return (
    <div className="card-hover" style={{
      background: "var(--color-surface-raised)",
      border: "1px solid var(--color-line)",
      borderRadius: 22,
      padding: 20,
      position: "relative",
      boxShadow: "var(--shadow-lift)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Eyebrow>Live · matched for you</Eyebrow>
        <MatchScoreBadge score={94} overlap={["Product design", "Prototyping", "Design systems"]} compact />
      </div>
      <p style={{ fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 8px", lineHeight: 1.05 }}>
        Design a kopitiam loyalty app — 3 weeks
      </p>
      <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: "0 0 14px" }}>Kopitiam Co. · Bedok · 2h ago</p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {["Product design", "Figma", "Prototyping"].map((s) => (
          <SkillChip key={s} tone="accent">{s}</SkillChip>
        ))}
      </div>

      <div style={{ background: "var(--color-ink)", borderRadius: 14, padding: 14 }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-accent)", margin: 0 }}>
          Why it matched
        </p>
        <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", fontSize: 12, color: "oklch(100% 0 0 / 0.75)", display: "flex", flexDirection: "column", gap: 6 }}>
          <li>✓ Portfolio: &ldquo;Kopitiam POS onboarding&rdquo;</li>
          <li>✓ WSQ Diploma in Design Thinking</li>
          <li>✓ Shipped 2 F&amp;B design projects · 12mo</li>
        </ul>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontSize: 12, color: "var(--color-ink-soft)" }}>
        <span>
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink)", fontWeight: 700 }}>S$8,400</span> fixed
        </span>
        <span>14 applied · 3 shortlisted</span>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section style={{ borderBottom: "1px solid var(--color-line)", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "60px 28px 100px", position: "relative" }}>
        <div
          style={{
            display: "flex", alignItems: "center", marginBottom: 40,
            animation: "fadeUp 0.55s var(--ease-out-expo) 0.05s both",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--color-ink-soft)" }}>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-ink)" }}>
              An official platform of the Government of Singapore
            </span>
            <span style={{ width: 1, height: 12, background: "var(--color-line)" }} />
            <span>Side income · Verified · gov.sg</span>
          </div>
        </div>

        <h1 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 400,
          fontSize: "clamp(3.6rem, 10vw, 10rem)",
          lineHeight: 0.88,
          letterSpacing: "-0.04em",
          margin: 0,
          maxWidth: "14ch",
          animation: "fadeUp 0.75s var(--ease-out-expo) 0.12s both",
        }}>
          Your side gig work,{" "}
          <span style={{ color: "var(--color-accent-ink)" }}>actually</span> verified.
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 60, marginTop: 50, alignItems: "end" }}>
          <div style={{ animation: "fadeUp 0.7s var(--ease-out-expo) 0.26s both" }}>
            <p style={{ fontSize: 18, color: "var(--color-ink-soft)", maxWidth: 560, lineHeight: 1.5 }}>
              The official Singapore platform for verified freelancers. Singpass identity, WSQ and university cert checks, portfolio videos, async video interviews — and when you&apos;re ready, we walk you through registering your own company.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
              <Button variant="primary" size="lg" href="/singpass">Get verified with Singpass</Button>
              <Button variant="ghost" size="lg" href="/gigs">Browse open assignments</Button>
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 30, flexWrap: "wrap", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-ink-mute)" }}>
              {["Singpass", "SkillsFuture", "NUS · NTU · SMU · SIT · SIM", "ACRA"].map((t) => (
                <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-accent)" }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div style={{ animation: "scaleIn 0.85s var(--ease-out-expo) 0.18s both" }}>
            <HeroMatchCard />
          </div>
        </div>
      </div>
    </section>
  );
}
