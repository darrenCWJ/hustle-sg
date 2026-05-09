import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Eyebrow } from "@/components/ui/primitives";
import { Button } from "@/components/ui/interactive";
import { MatchSimulator } from "./MatchSimulator";
import { CertParserDemo } from "./CertParserDemo";

function AsyncInterviewPreview() {
  const steps = [
    {
      actor: "Employer",
      hue: 200,
      action: "Posts 1–3 questions",
      detail: "What's a project you're most proud of?",
      icon: "✏️",
    },
    {
      actor: "You",
      hue: 340,
      action: "Record 90s answers",
      detail: "On your own time — no Zoom link, no scheduling gymnastics",
      icon: "🎙️",
    },
    {
      actor: "Employer",
      hue: 165,
      action: "Reviews shortlist",
      detail: "Side-by-side video comparisons, then selects candidates",
      icon: "✅",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
      {steps.map((s, i) => (
        <div key={s.actor + i} style={{ position: "relative" }}>
          {/* Connector arrow */}
          {i < steps.length - 1 && (
            <div style={{
              position: "absolute", right: -14, top: "50%",
              transform: "translateY(-50%)",
              fontSize: 18, color: "var(--color-ink-mute)", zIndex: 2,
            }}>→</div>
          )}

          <div
            className="card-hover"
            style={{
              borderRadius: 20, border: "1px solid var(--color-line)",
              background: "var(--color-surface-raised)", padding: 28,
              height: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <span style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `oklch(92% 0.06 ${s.hue})`,
                color: `oklch(30% 0.1 ${s.hue})`,
                display: "grid", placeItems: "center", fontSize: 16,
              }}>
                {s.icon}
              </span>
              <div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-ink-mute)", display: "block" }}>
                  Step {i + 1}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: `oklch(32% 0.1 ${s.hue})` }}>
                  {s.actor}
                </span>
              </div>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {s.action}
            </p>
            <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.55 }}>
              {s.detail}
            </p>
          </div>
        </div>
      ))}

      {/* Recording visualiser */}
      <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
        <div style={{
          borderRadius: 16, background: "var(--color-ink)",
          padding: "20px 24px", display: "flex", alignItems: "center", gap: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "var(--color-accent)", animation: "pulse-ring 1.5s infinite",
            }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "oklch(97% 0.012 85)" }}>
              REC · 00:47
            </span>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 2, height: 36 }}>
            {Array.from({ length: 60 }).map((_, i) => (
              <span
                key={i}
                style={{
                  flex: "0 0 3px",
                  borderRadius: 2,
                  height: `${Math.max(15, 20 + Math.abs(Math.sin(i * 0.7 + 1) * 65) + (i < 40 ? 0 : -55))}%`,
                  background: i < 40 ? "var(--color-accent)" : "oklch(100% 0 0 / 0.18)",
                  transition: "height 0.3s",
                }}
              />
            ))}
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "oklch(100% 0 0 / 0.5)", flexShrink: 0 }}>
            Q2 / 3 · 90s max
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const W = { maxWidth: 1320, margin: "0 auto", padding: "0 28px" };

  return (
    <main>
      {/* ── Page header ── */}
      <section style={{
        borderBottom: "1px solid var(--color-line)",
        background: "var(--color-surface-raised)",
        padding: "64px 28px 72px",
      }}>
        <div style={W}>
          <Eyebrow tone="accent">Interactive demo · No account needed</Eyebrow>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3rem, 7vw, 7rem)",
            margin: "16px 0 18px",
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
          }}>
            Try it live.<br />
            <span style={{ color: "var(--color-accent-ink)", fontStyle: "italic" }}>No login.</span>
          </h1>
          <p style={{ fontSize: 16, color: "var(--color-ink-soft)", maxWidth: 540, lineHeight: 1.55, margin: "0 0 28px" }}>
            Three working demos below — AI matching, cert parsing with Claude, and the async interview flow. See the real product before committing to a Singpass sign-in.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Button variant="primary" href="/singpass">Log in / Sign up</Button>
            <Button variant="ghost" href="/">Back to landing</Button>
          </div>

          {/* Demo index */}
          <div style={{ display: "flex", gap: 16, marginTop: 36, flexWrap: "wrap" }}>
            {[
              { n: "01", label: "AI Matching", color: "var(--color-accent)" },
              { n: "02", label: "Cert Parser", color: "var(--color-trust)" },
              { n: "03", label: "Async Interview", color: "var(--color-jade)" },
            ].map((d) => (
              <div key={d.n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: d.color, letterSpacing: "0.1em",
                }}>{d.n}</span>
                <span style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo 1: AI Matching ── */}
      <section style={{ ...W, padding: "88px 28px 0" }}>
        <ScrollReveal>
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 30, marginBottom: 36, flexWrap: "wrap" }}>
            <div>
              <Eyebrow tone="accent">Demo 01 · AI Matching</Eyebrow>
              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.2rem, 3.5vw, 3.4rem)",
                margin: "12px 0 0", letterSpacing: "-0.03em", lineHeight: 0.95,
              }}>
                Pick a profile.<br />Watch the scores{" "}
                <span style={{ fontStyle: "italic", color: "var(--color-accent-ink)" }}>change.</span>
              </h2>
            </div>
            <p style={{ maxWidth: 380, fontSize: 14, color: "var(--color-ink-soft)", margin: 0 }}>
              Gigs are ranked by cosine similarity against your skill embedding — not keyword matching. Swap profiles to see rankings shift in real time.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <MatchSimulator />
        </ScrollReveal>
      </section>

      {/* ── Demo 2: Cert Parser ── */}
      <section style={{ ...W, padding: "100px 28px 0" }}>
        <ScrollReveal>
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 30, marginBottom: 36, flexWrap: "wrap" }}>
            <div>
              <Eyebrow tone="accent">Demo 02 · Cert Parser</Eyebrow>
              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.2rem, 3.5vw, 3.4rem)",
                margin: "12px 0 0", letterSpacing: "-0.03em", lineHeight: 0.95,
              }}>
                Paste a cert.<br />
                <span style={{ fontStyle: "italic", color: "var(--color-accent-ink)" }}>Claude</span> reads it.
              </h2>
            </div>
            <p style={{ maxWidth: 380, fontSize: 14, color: "var(--color-ink-soft)", margin: 0 }}>
              Claude Haiku extracts issuer, title, skills, and dates — then checks against our whitelist of 20+ Singapore institutions for verified badge status.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <CertParserDemo />
        </ScrollReveal>
      </section>

      {/* ── Demo 3: Async Interview ── */}
      <section style={{ ...W, padding: "100px 28px 0" }}>
        <ScrollReveal>
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 30, marginBottom: 36, flexWrap: "wrap" }}>
            <div>
              <Eyebrow tone="accent">Demo 03 · Async Interview</Eyebrow>
              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.2rem, 3.5vw, 3.4rem)",
                margin: "12px 0 0", letterSpacing: "-0.03em", lineHeight: 0.95,
              }}>
                No scheduling.<br />
                Record{" "}
                <span style={{ fontStyle: "italic", color: "var(--color-accent-ink)" }}>when you&apos;re ready.</span>
              </h2>
            </div>
            <p style={{ maxWidth: 380, fontSize: 14, color: "var(--color-ink-soft)", margin: 0 }}>
              Employers post 1–3 questions. You record 90-second answers at any time. Employers review shortlisted candidates side by side — no Zoom, no live pressure.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <AsyncInterviewPreview />
        </ScrollReveal>
      </section>

      {/* ── CTA ── */}
      <section style={{ ...W, padding: "100px 28px 0" }}>
        <ScrollReveal>
          <div
            className="grain"
            style={{
              borderRadius: 28, overflow: "hidden", position: "relative",
              background: "var(--color-ink)", color: "oklch(97% 0.012 85)",
              padding: "80px 60px",
              backgroundImage: "radial-gradient(700px 350px at 85% 110%, oklch(from var(--color-accent) l c h / 0.3), transparent)",
            }}
          >
            <div style={{ position: "relative", zIndex: 1, maxWidth: 580 }}>
              <Eyebrow tone="surface">Ready to go live</Eyebrow>
              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.4rem, 4vw, 4.2rem)",
                margin: "14px 0 20px", lineHeight: 0.94,
              }}>
                Log in or sign up with Singpass.<br />
                <span style={{ fontStyle: "italic", color: "var(--color-accent)" }}>Your profile in 5 minutes.</span>
              </h2>
              <p style={{ color: "oklch(100% 0 0 / 0.7)", maxWidth: 460, marginBottom: 30, fontSize: 15, lineHeight: 1.5 }}>
                Identity verified, skills indexed, and the AI match engine starts working for you immediately.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button variant="accent" size="lg" href="/singpass">Log in / Sign up</Button>
                <Button variant="ink" size="lg" href="/gigs">Browse assignments first</Button>
              </div>
            </div>
            <div
              aria-hidden
              style={{
                position: "absolute", right: -20, top: -40,
                fontFamily: "var(--font-display)", fontSize: 380, lineHeight: 0.8,
                color: "oklch(100% 0 0 / 0.04)", userSelect: "none", pointerEvents: "none",
              }}
            >
              sg
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
