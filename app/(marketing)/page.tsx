import Link from "next/link";

const STATS_SG = [
  { label: "Verified freelancers", value: "12,847", delta: "+214 this week" },
  { label: "Assignments live right now", value: "2,196", delta: "+38 today" },
  { label: "Paid out to freelancers", value: "S$8.4M", delta: "in 2025" },
  { label: "Avg. match quality", value: "84%", delta: "vs 62% keyword" },
];

export default function Landing() {
  return (
    <main>
      {/* HERO */}
      <section
        className="relative overflow-hidden grain"
        style={{
          background: "var(--color-ink)",
          color: "var(--color-surface)",
          padding: "clamp(60px, 10vw, 120px) 28px clamp(80px, 12vw, 140px)",
        }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--color-accent)",
              fontWeight: 600,
              margin: "0 0 20px",
            }}
          >
            Singapore Government · Gig Work Platform
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 1rem + 7vw, 7.5rem)",
              margin: "0 0 24px",
              lineHeight: 0.94,
              letterSpacing: "-0.03em",
              maxWidth: "14ch",
            }}
          >
            Built for the 200,000+{" "}
            <span style={{ color: "var(--color-accent)" }}>side-hustlers</span> of SG.
          </h1>
          <p
            style={{
              maxWidth: 520,
              fontSize: "clamp(1rem, 0.92rem + 0.4vw, 1.2rem)",
              color: "oklch(100% 0 0 / 0.7)",
              lineHeight: 1.55,
              margin: "0 0 36px",
            }}
          >
            Singpass identity. WSQ credential checks. AI-powered matching. A path to
            registering your own company.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Link
              href="/singpass"
              style={{
                padding: "12px 24px",
                borderRadius: 999,
                background: "var(--color-accent)",
                color: "oklch(20% 0.08 38)",
                fontSize: 14,
                fontWeight: 600,
                display: "inline-block",
              }}
            >
              Start with Singpass →
            </Link>
            <Link
              href="/gigs"
              style={{
                padding: "12px 24px",
                borderRadius: 999,
                background: "oklch(100% 0 0 / 0.08)",
                color: "var(--color-surface)",
                fontSize: 14,
                fontWeight: 600,
                border: "1px solid oklch(100% 0 0 / 0.2)",
                display: "inline-block",
              }}
            >
              Browse assignments
            </Link>
          </div>

          <div
            style={{
              position: "absolute",
              right: 28,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              textAlign: "right",
              maxWidth: 200,
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "oklch(100% 0 0 / 0.5)",
            }}
            className="hidden lg:flex"
          >
            <span style={{ color: "var(--color-accent)" }}>Vol. 01</span>
            <span>For the side-hustlers</span>
            <span>of Singapore</span>
          </div>
        </div>
      </section>

      {/* GIG DEFINITION — dictionary card */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "80px 28px 0" }}>
        <div
          className="grain"
          style={{
            borderRadius: 28,
            background: "var(--color-ink)",
            color: "var(--color-surface)",
            padding: "clamp(32px, 4vw, 56px)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(32px, 5vw, 60px)",
            alignItems: "start",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "oklch(100% 0 0 / 0.5)",
                letterSpacing: "0.14em",
                margin: "0 0 12px",
                textTransform: "uppercase",
              }}
            >
              /ɡɪɡ/ · noun · countable
            </p>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(4rem, 8vw, 9rem)",
                letterSpacing: "-0.04em",
                lineHeight: 0.88,
                margin: "0 0 16px",
              }}
            >
              Gig.
            </div>
            <p style={{ fontSize: 15, color: "oklch(100% 0 0 / 0.7)", margin: "0 0 20px", lineHeight: 1.55 }}>
              A short-term, skills-based assignment. Also known as:
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Project", "Freelance work", "Side hustle", "Assignment", "Contract"].map((t) => (
                <span
                  key={t}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 999,
                    background: "oklch(100% 0 0 / 0.08)",
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
                fontWeight: 600,
                margin: "0 0 18px",
              }}
            >
              On HustleSG, a gig always has
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["Singpass-verified identity", "Every freelancer and employer is verified via Singpass before transacting."],
                ["AI-powered matching", "Cosine similarity across portfolio, certifications, and bio — not just keywords."],
                ["SGD escrow payment", "Funds held until milestones are met. IRAS-ready receipts issued automatically."],
                ["Async video interview", "Record 1–3 short answers on your own time. No Zoom scheduling gymnastics."],
              ].map(([title, desc]) => (
                <li key={title} style={{ display: "flex", gap: 14, alignItems: "start" }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "var(--color-jade)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "white",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    ✓
                  </span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{title}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 13, color: "oklch(100% 0 0 / 0.6)", lineHeight: 1.4 }}>{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "80px 28px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {STATS_SG.map((s) => (
            <div
              key={s.label}
              style={{
                padding: "24px 26px",
                borderRadius: 20,
                background: "var(--color-surface-raised)",
                border: "1px solid var(--color-line)",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "var(--color-ink-soft)",
                  margin: 0,
                }}
              >
                {s.label}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  margin: "10px 0 4px",
                  letterSpacing: "-0.035em",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--color-jade-ink)",
                  margin: 0,
                }}
              >
                ↗ {s.delta}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURE BENTO */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "80px 28px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 24, gap: 20 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 1rem + 2vw, 2.75rem)",
              margin: 0,
              letterSpacing: "-0.025em",
              maxWidth: "20ch",
            }}
          >
            The platform Singapore gig workers deserve.
          </h2>
          <p style={{ color: "var(--color-ink-soft)", maxWidth: 320, fontSize: 14, margin: 0 }}>
            Fiverr and Upwork don&apos;t speak our local rules — CPF, WSQ, ACRA, IRAS.
            We do.
          </p>
        </div>

        <div className="bento">
          {/* Verified identity + AI matching */}
          <article
            className="cell-lg tall grain"
            style={{
              borderRadius: 20,
              background: "var(--color-ink)",
              color: "var(--color-surface)",
              padding: 32,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", margin: "0 0 16px", fontWeight: 600 }}>
              01 · Verified identity
            </p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", margin: "0 0 14px", letterSpacing: "-0.025em", lineHeight: 1.05 }}>
              Singpass-verified,<br />AI-matched.
            </h3>
            <p style={{ fontSize: 14, color: "oklch(100% 0 0 / 0.65)", maxWidth: 400, lineHeight: 1.55, margin: "0 0 28px" }}>
              Log in with Singpass-style identity. Your profile is embedded into a vector
              index, then matched against gigs by cosine similarity — not keyword search.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {[
                { label: "Identity", value: "SHA-256 hashed" },
                { label: "Matching", value: "Cosine · 1536-d" },
                { label: "Latency", value: "~120ms p95" },
                { label: "Index", value: "pgvector / ivfflat" },
              ].map((s) => (
                <div key={s.label} style={{ borderRadius: 12, border: "1px solid oklch(100% 0 0 / 0.1)", padding: 12, background: "oklch(100% 0 0 / 0.03)" }}>
                  <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", margin: 0, opacity: 0.55 }}>{s.label}</p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, margin: "6px 0 0" }}>{s.value}</p>
                </div>
              ))}
            </div>
          </article>

          {/* Portfolio videos */}
          <article
            style={{
              gridColumn: "span 2",
              borderRadius: 20,
              background: "var(--color-accent)",
              color: "oklch(20% 0.08 38)",
              padding: 28,
            }}
          >
            <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.7, margin: "0 0 12px", fontWeight: 600 }}>
              02 · Portfolio video
            </p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
              90 seconds of <em>you</em>.
            </h3>
            <p style={{ fontSize: 13, opacity: 0.8, margin: "0 0 16px", lineHeight: 1.5 }}>
              Show the tuition class, the Figma walkthrough. Raw and real is the new resume.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {["tuition", "design", "emcee"].map((t) => (
                <div
                  key={t}
                  style={{ aspectRatio: "16/9", borderRadius: 10, background: "oklch(20% 0.08 38 / 0.15)", display: "grid", placeItems: "center", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}
                >
                  {t}
                </div>
              ))}
            </div>
          </article>

          {/* Credentials */}
          <article
            style={{
              gridColumn: "span 3",
              borderRadius: 20,
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-line)",
              padding: 28,
            }}
          >
            <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-ink-soft)", margin: "0 0 12px", fontWeight: 600 }}>
              03 · Credentials
            </p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
              WSQ, <em>verified</em>.
            </h3>
            <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: "0 0 18px", lineHeight: 1.5 }}>
              Upload a cert, we extract issuer, title, and skills. Recognised issuers get a blue badge on your profile.
            </p>
            <ul style={{ display: "flex", flexWrap: "wrap", gap: 6, listStyle: "none", padding: 0, margin: 0 }}>
              {["SkillsFuture SG", "NUS", "NTU", "SMU", "SIT", "IES", "SCS", "ACSM"].map((i) => (
                <li
                  key={i}
                  style={{ padding: "4px 12px", borderRadius: 999, background: "var(--color-trust-soft)", color: "var(--color-trust)", fontSize: 11, fontWeight: 600 }}
                >
                  {i}
                </li>
              ))}
            </ul>
          </article>

          {/* Async interview */}
          <article
            style={{
              gridColumn: "span 3",
              borderRadius: 20,
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-line)",
              padding: 28,
            }}
          >
            <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-ink-soft)", margin: "0 0 12px", fontWeight: 600 }}>
              04 · Async interview
            </p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
              Say it. Don&apos;t type it.
            </h3>
            <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: "0 0 18px", lineHeight: 1.5 }}>
              Employers post 1–3 questions. Record 90s video answers on your own time. No Zoom scheduling.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-accent)", animation: "pulse-ring 2s infinite" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.14em" }}>REC · 00:47</span>
            </div>
          </article>

          {/* Entrepreneur */}
          <article
            className="cell-md grain"
            style={{
              borderRadius: 20,
              background: "var(--color-ink)",
              color: "var(--color-surface)",
              padding: 28,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", margin: "0 0 12px", fontWeight: 600 }}>
              05 · Go full-time
            </p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
              From side to CEO.
            </h3>
            <p style={{ fontSize: 13, color: "oklch(100% 0 0 / 0.65)", margin: "0 0 18px", lineHeight: 1.5 }}>
              When you&apos;re ready, we guide you through ACRA BizFile, CPF self-employed, GST thresholds, and bank picks.
            </p>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "oklch(100% 0 0 / 0.75)", display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Decide (sole-prop vs Pte Ltd)</li>
              <li>Reserve your company name via ACRA</li>
              <li>Register via ACRA BizFile</li>
              <li>CPF, GST, bank, bookkeeping</li>
            </ol>
          </article>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "80px 28px 0" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 3vw, 2.75rem)", margin: "0 0 28px", letterSpacing: "-0.025em" }}>
          Freelancers who&apos;ve hustled here.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { quote: "Calm, organised, and delivered ahead of schedule. Turned our hawker POS from a difficult spreadsheet into something our non-technical staff can use confidently.", name: "Kopitiam Co.", role: "Design · Oct '25" },
            { quote: "The async video interview saved us 6 Zoom calls. We hired in 4 days.", name: "Muezza Studio", role: "Engineering · Aug '25" },
            { quote: "Understood our Malay-first users without needing a briefing — a rare quality.", name: "Tampines CC", role: "Design · Jun '25" },
          ].map((r) => (
            <figure
              key={r.name}
              style={{
                margin: 0,
                padding: 24,
                borderRadius: 20,
                border: "1px solid var(--color-line)",
                background: "var(--color-surface-raised)",
              }}
            >
              <div style={{ color: "var(--color-accent)", letterSpacing: "0.1em", fontSize: 14, marginBottom: 12 }}>★★★★★</div>
              <blockquote style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: "var(--color-ink)" }}>
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <figcaption style={{ marginTop: 16, paddingTop: 14, borderTop: "1px dashed var(--color-line)" }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{r.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: "var(--color-ink-soft)" }}>{r.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "80px 28px 100px" }}>
        <div
          className="grain"
          style={{
            borderRadius: 28,
            background: "var(--color-ink)",
            color: "var(--color-surface)",
            padding: "clamp(40px, 6vw, 80px)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", zIndex: 1, maxWidth: 560 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 600, margin: "0 0 14px" }}>
              One more thing
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4vw, 4rem)",
                margin: "0 0 18px",
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
              }}
            >
              Your hustle deserves infrastructure that respects it.
            </h2>
            <p style={{ color: "oklch(100% 0 0 / 0.65)", fontSize: 15, margin: "0 0 28px", lineHeight: 1.5 }}>
              Sign up with Singpass in under 20 seconds. Demo NRICs provided for testing.
            </p>
            <Link
              href="/singpass"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                borderRadius: 999,
                background: "var(--color-accent)",
                color: "oklch(20% 0.08 38)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Start now — it&apos;s free →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
