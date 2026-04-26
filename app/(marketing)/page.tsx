import { Hero } from "./Hero";
import { NewPostingsStream } from "./NewPostingsStream";
import { GigDefinitionCard } from "./GigDefinitionCard";
import { FeatureBento } from "./FeatureBento";
import { Testimonials } from "./Testimonials";
import { Eyebrow } from "@/components/ui/primitives";
import { Button } from "@/components/ui/interactive";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const STATS_SG = [
  { label: "Verified freelancers", value: "12,847", delta: "+214 this week" },
  { label: "Gigs live right now", value: "2,196", delta: "+38 today" },
  { label: "Paid out to hustlers", value: "S$8.4M", delta: "in 2025" },
  { label: "Avg. match quality", value: "84%", delta: "vs 62% keyword" },
];

const CATEGORIES = [
  { label: "Design", count: 214, hue: 38 },
  { label: "Tuition", count: 480, hue: 340 },
  { label: "Engineering", count: 189, hue: 165 },
  { label: "Events & Emcee", count: 92, hue: 78 },
  { label: "Video", count: 76, hue: 260 },
  { label: "Translation", count: 58, hue: 200 },
];

export default function Landing() {
  return (
    <main>
      {/* HERO */}
      <Hero />

      {/* NEW POSTINGS STREAM */}
      <section style={{ borderTop: "1px solid var(--color-line)", borderBottom: "1px solid var(--color-line)", background: "var(--color-surface-raised)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "18px 28px" }}>
          <NewPostingsStream />
        </div>
      </section>

      {/* GIG DEFINITION */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "80px 28px 0" }}>
        <ScrollReveal>
          <GigDefinitionCard />
        </ScrollReveal>
      </section>

      {/* STATS */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "80px 28px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {STATS_SG.map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 80}>
              <div className="card-hover" style={{ padding: "22px 24px", borderRadius: 18, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", height: "100%" }}>
                <Eyebrow>{s.label}</Eyebrow>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 46, margin: "10px 0 4px", letterSpacing: "-0.035em", lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-jade-ink)", margin: 0 }}>↗ {s.delta}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* FEATURE BENTO */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "100px 28px" }}>
        <ScrollReveal>
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 30, marginBottom: 36 }}>
            <div>
              <Eyebrow>The four pillars</Eyebrow>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 3.5vw, 3.6rem)", margin: "14px 0 0", maxWidth: "14ch", lineHeight: 0.98 }}>
                Built around how Singapore{" "}
                <span style={{ color: "var(--color-accent-ink)" }}>actually works</span>.
              </h2>
            </div>
            <p style={{ maxWidth: 360, color: "var(--color-ink-soft)", fontSize: 14, margin: 0 }}>
              CPF, WSQ, ACRA, IRAS. Local rules baked in — not an afterthought after a global platform&apos;s legal review.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={120}>
          <FeatureBento />
        </ScrollReveal>
      </section>

      {/* HOW IT WORKS */}
      <section className="grain" style={{ background: "var(--color-ink)", color: "oklch(97% 0.012 85)", padding: "100px 0" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 28px" }}>
          <Eyebrow tone="surface">How it works</Eyebrow>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3vw, 3.2rem)", margin: "14px 0 60px", maxWidth: "18ch", lineHeight: 0.98 }}>
            From Singpass to first paycheck — in{" "}
            <span style={{ fontStyle: "italic", color: "var(--color-accent)" }}>one evening</span>.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {[
              { step: "01", time: "0:20", title: "Verify with Singpass", body: "NRIC + face scan. 20 seconds. We hash your identifier; the raw identifier is never stored." },
              { step: "02", time: "4:30", title: "Build your profile", body: "Upload a 90s video, paste a WSQ cert. Details are extracted and indexed for matching." },
              { step: "03", time: "8:00", title: "Match, apply, record", body: "Assignments are matched against your verified skills. Submit video responses when shortlisted." },
              { step: "04", time: "→ day 1", title: "Get paid. Register your business", body: "SGD payments held in escrow. ACRA registration guidance when you are ready." },
            ].map((s, i) => (
              <ScrollReveal key={s.step} delay={i * 90}>
                <div style={{ borderTop: "1px solid oklch(100% 0 0 / 0.15)", paddingTop: 20 }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-accent)", margin: 0 }}>{s.step} · {s.time}</p>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "10px 0 10px", color: "oklch(97% 0.012 85)" }}>{s.title}</h3>
                  <p style={{ fontSize: 13.5, color: "oklch(100% 0 0 / 0.65)", lineHeight: 1.55, margin: 0 }}>{s.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "100px 28px 60px" }}>
        <ScrollReveal>
          <Eyebrow>From the freelancers</Eyebrow>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3vw, 3.2rem)", margin: "12px 0 40px", maxWidth: "16ch", lineHeight: 0.98 }}>
            Outcomes from our users{" "}
            <span style={{ fontStyle: "italic", color: "var(--color-accent-ink)" }}>work</span>.
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <Testimonials />
        </ScrollReveal>
      </section>

      {/* CATEGORIES */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "40px 28px 80px" }}>
        <ScrollReveal>
          <Eyebrow>Where the gig work lives</Eyebrow>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 2.5vw, 2.6rem)", margin: "12px 0 30px" }}>Browse by category</h2>
        </ScrollReveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}>
          {CATEGORIES.map((c, i) => (
            <ScrollReveal key={c.label} delay={i * 60}>
              <a
                href="/gigs"
                className="category-card"
                style={{
                  borderRadius: 16,
                  padding: "18px 18px 20px",
                  background: `oklch(96% 0.03 ${c.hue})`,
                  color: `oklch(28% 0.08 ${c.hue})`,
                  border: `1px solid oklch(88% 0.04 ${c.hue})`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 120,
                  textDecoration: "none",
                }}
              >
                <span style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: "-0.02em" }}>{c.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, opacity: 0.7 }}>{c.count} open →</span>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "0 28px 100px" }}>
        <ScrollReveal>
        <div
          className="grain"
          style={{
            borderRadius: 28,
            overflow: "hidden",
            position: "relative",
            background: "var(--color-ink)",
            color: "oklch(97% 0.012 85)",
            padding: "80px 60px",
            backgroundImage: "radial-gradient(800px 400px at 90% 120%, oklch(from var(--color-accent) l c h / 0.35), transparent)",
          }}
        >
          <div style={{ position: "relative", zIndex: 1, maxWidth: 640 }}>
            <Eyebrow tone="surface">Get started</Eyebrow>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 4vw, 4.4rem)", margin: "14px 0 22px", lineHeight: 0.94 }}>
              Your side income, on<br />infrastructure built by{" "}
              <span style={{ fontStyle: "italic", color: "var(--color-accent)" }}>Singapore</span>.
            </h2>
            <p style={{ color: "oklch(100% 0 0 / 0.7)", maxWidth: 480, marginBottom: 32, fontSize: 15, lineHeight: 1.5 }}>
              Sign in with Singpass. Identity, credentials and payouts are handled end-to-end through Government-grade infrastructure.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button variant="accent" size="lg" href="/singpass">Sign in with Singpass</Button>
              <Button variant="ink" size="lg" href="/gigs">Browse assignments first</Button>
            </div>
          </div>
          <div
            aria-hidden
            style={{
              position: "absolute", right: -20, top: -40,
              fontFamily: "var(--font-display)", fontSize: 420, lineHeight: 0.8,
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
