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
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden grain"
        style={{
          background: "var(--color-ink)",
          color: "var(--color-surface)",
          padding: "clamp(60px, 10vw, 120px) 28px clamp(80px, 12vw, 140px)",
        }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 600, margin: "0 0 20px" }}>
            Singapore Government · Gig Work Platform
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 1rem + 7vw, 7.5rem)", margin: "0 0 24px", lineHeight: 0.94, letterSpacing: "-0.03em", maxWidth: "14ch" }}>
            Built for the 200,000+{" "}
            <span style={{ color: "var(--color-accent)" }}>side-hustlers</span> of SG.
          </h1>
          <p style={{ maxWidth: 520, fontSize: "clamp(1rem, 0.92rem + 0.4vw, 1.2rem)", color: "oklch(100% 0 0 / 0.7)", lineHeight: 1.55, margin: "0 0 36px" }}>
            Singpass identity. WSQ credential checks. AI-powered matching. A path to registering your own company.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/singpass" style={{ padding: "12px 24px", borderRadius: 999, background: "var(--color-accent)", color: "oklch(20% 0.08 38)", fontSize: 14, fontWeight: 600, display: "inline-block" }}>
              Start with Singpass →
            </Link>
            <Link href="/gigs" style={{ padding: "12px 24px", borderRadius: 999, background: "oklch(100% 0 0 / 0.08)", color: "var(--color-surface)", fontSize: 14, fontWeight: 600, border: "1px solid oklch(100% 0 0 / 0.2)", display: "inline-block" }}>
              Browse assignments
            </Link>
          </div>
        </div>
      </section>

      {/* ── GIG DEFINITION ────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "80px 28px 0" }}>
        <article
          className="grain"
          style={{
            padding: "44px 48px",
            borderRadius: 22,
            background: "var(--color-ink)",
            color: "var(--color-surface)",
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 48,
            alignItems: "start",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative large "G" */}
          <div
            aria-hidden
            style={{
              position: "absolute", right: -30, bottom: -120,
              fontFamily: "var(--font-display)", fontSize: 420, fontWeight: 700,
              lineHeight: 0.8, letterSpacing: "-0.06em",
              color: "oklch(100% 0 0 / 0.04)",
              userSelect: "none", pointerEvents: "none",
            }}
          >
            G
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-accent)", padding: "4px 10px", borderRadius: 999, border: "1px solid oklch(from var(--color-accent) l c h / 0.35)" }}>
                Glossary · 01
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "oklch(100% 0 0 / 0.45)" }}>/ɡɪɡ/ · noun</span>
            </div>

            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(3rem, 7vw, 6rem)", lineHeight: 0.92, letterSpacing: "-0.035em", margin: "8px 0 24px" }}>
              Gig<span style={{ color: "var(--color-accent)" }}>.</span>
            </h2>

            <p style={{ fontSize: 18, lineHeight: 1.55, maxWidth: 560, color: "oklch(100% 0 0 / 0.82)", margin: "0 0 18px" }}>
              <b style={{ color: "var(--color-accent)", fontWeight: 600 }}>1.</b>{" "}
              A short, paid piece of work — usually a single project or engagement — done outside a full-time employer. On{" "}
              <span style={{ fontWeight: 600, color: "var(--color-surface)" }}>HustleSG</span>, every gig is Singpass-verified and budgeted in SGD.
            </p>

            <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 560, color: "oklch(100% 0 0 / 0.55)", margin: 0, borderLeft: "2px solid var(--color-accent)", paddingLeft: 14 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-accent)" }}>usage · </span>
              &ldquo;I picked up a 3-week design gig with a kopitiam chain over CNY.&rdquo;
            </p>
          </div>

          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "oklch(100% 0 0 / 0.5)", margin: 0 }}>
              Also known as
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Assignment", "Project", "Freelance job", "Side hustle", "Contract work", "One-off engagement"].map((w) => (
                <span key={w} style={{ padding: "7px 12px", borderRadius: 999, background: "oklch(100% 0 0 / 0.08)", border: "1px solid oklch(100% 0 0 / 0.1)", fontSize: 12.5, color: "oklch(100% 0 0 / 0.85)" }}>
                  {w}
                </span>
              ))}
            </div>

            <div style={{ height: 1, background: "oklch(100% 0 0 / 0.1)", margin: "10px 0" }} />

            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "oklch(100% 0 0 / 0.5)", margin: 0 }}>
              On HustleSG, a gig always has
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["✓", "A verified employer (ACRA or Singpass-checked)"],
                ["S$", "A transparent SGD budget — fixed, hourly, or event-based"],
                ["⏱", "A clear scope and end date"],
                ["🔒", "Escrowed payment released on delivery"],
              ].map(([icon, text]) => (
                <li key={text} style={{ display: "flex", alignItems: "start", gap: 10, fontSize: 13.5, color: "oklch(100% 0 0 / 0.8)", lineHeight: 1.45 }}>
                  <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 6, display: "grid", placeItems: "center", background: "oklch(from var(--color-accent) l c h / 0.18)", color: "var(--color-accent)", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                    {icon}
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "80px 28px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {STATS_SG.map((s) => (
            <div key={s.label} style={{ padding: "22px 24px", borderRadius: 18, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
              <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: 0 }}>{s.label}</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", margin: "10px 0 4px", letterSpacing: "-0.035em", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-jade-ink)", margin: 0 }}>↗ {s.delta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURE BENTO ─────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "100px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 30, marginBottom: 36 }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 14px" }}>The four pillars</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 3.5vw, 3.6rem)", margin: 0, maxWidth: "14ch", lineHeight: 0.98 }}>
              Built around how Singapore{" "}
              <span style={{ color: "var(--color-accent-ink)" }}>actually works</span>.
            </h2>
          </div>
          <p style={{ maxWidth: 360, color: "var(--color-ink-soft)", fontSize: 14, margin: 0 }}>
            CPF, WSQ, ACRA, IRAS. Local rules baked in — not an afterthought after a global platform&apos;s legal review.
          </p>
        </div>

        <div className="bento">
          {/* 01 · Verified identity */}
          <article
            className="cell-lg tall grain"
            style={{ borderRadius: 22, background: "var(--color-ink)", color: "var(--color-surface)", padding: 36, position: "relative", overflow: "hidden" }}
          >
            <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", margin: "0 0 18px", fontWeight: 600 }}>
              01 · Verified identity
            </p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 2.6vw, 2.8rem)", margin: "0 0 14px", letterSpacing: "-0.03em", lineHeight: 1 }}>
              Singpass-verified,<br />
              <span style={{ color: "var(--color-accent)" }}>AI-matched</span>.
            </h3>
            <p style={{ color: "oklch(100% 0 0 / 0.7)", maxWidth: 440, fontSize: 14, lineHeight: 1.55, margin: "0 0 28px" }}>
              Authenticate through Singpass. We embed your profile into a vector index, then surface gigs that match your certifications and portfolio — not just your keyword hits.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Identity", value: "SHA-256", delta: "hashed + salted" },
                { label: "Match", value: "1536-d", delta: "cosine · AI vectors" },
                { label: "Latency", value: "~120ms", delta: "p95 SG edge" },
                { label: "Index", value: "ivfflat", delta: "re-embed on save" },
              ].map((s) => (
                <div key={s.label} style={{ borderRadius: 12, border: "1px solid oklch(100% 0 0 / 0.1)", padding: 14, background: "oklch(100% 0 0 / 0.03)" }}>
                  <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", margin: 0, opacity: 0.55 }}>{s.label}</p>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: "6px 0 0", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, margin: "6px 0 0", opacity: 0.6 }}>{s.delta}</p>
                </div>
              ))}
            </div>

            {/* Constellation / embedding diagram */}
            <div style={{ position: "absolute", right: -60, top: 60, opacity: 0.9, pointerEvents: "none" }} aria-hidden>
              <svg width="340" height="340" viewBox="0 0 340 340" fill="none">
                <circle cx="170" cy="170" r="120" stroke="oklch(100% 0 0 / 0.08)" strokeWidth="1" />
                <circle cx="170" cy="170" r="80" stroke="oklch(100% 0 0 / 0.12)" strokeWidth="1" />
                <circle cx="170" cy="170" r="40" stroke="oklch(100% 0 0 / 0.2)" strokeWidth="1" />
                {Array.from({ length: 28 }).map((_, i) => {
                  const a = (i / 28) * Math.PI * 2;
                  const r = 40 + (i % 3) * 40;
                  const x = 170 + Math.cos(a) * r;
                  const y = 170 + Math.sin(a) * r;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={i % 5 === 0 ? 4 : 2}
                      fill={i % 4 === 0 ? "var(--color-accent)" : "oklch(100% 0 0 / 0.4)"}
                    />
                  );
                })}
                <circle cx="170" cy="170" r="8" fill="var(--color-accent)" style={{ animation: "pulse-ring 2s infinite" }} />
              </svg>
            </div>
          </article>

          {/* 02 · Portfolio video */}
          <article
            className="cell-md"
            style={{ borderRadius: 22, background: "var(--color-accent)", color: "oklch(22% 0.08 var(--accent-h))", padding: 32, position: "relative", overflow: "hidden" }}
          >
            <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.7, margin: "0 0 16px", fontWeight: 600 }}>
              02 · Portfolio video
            </p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 32, margin: "0 0 10px", letterSpacing: "-0.025em", lineHeight: 1 }}>
              90 seconds of you.
            </h3>
            <p style={{ fontSize: 13.5, opacity: 0.85, margin: "0 0 22px", maxWidth: 340 }}>
              Show the tuition class, the pasar malam booth, the Figma walkthrough. Raw and real is the new resume.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { label: "tuition", time: "1:24" },
                { label: "design", time: "2:05" },
                { label: "mc", time: "0:47" },
              ].map((v) => (
                <div
                  key={v.label}
                  style={{ aspectRatio: "3 / 4", borderRadius: 12, background: "oklch(22% 0.08 var(--accent-h))", color: "var(--color-accent)", padding: 10, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>{v.label}</span>
                  <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                    <span style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-accent)", color: "oklch(22% 0.08 var(--accent-h))", display: "grid", placeItems: "center", fontSize: 11 }}>▶</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, alignSelf: "end" }}>{v.time}</span>
                </div>
              ))}
            </div>
          </article>

          {/* 03 · Credentials */}
          <article
            className="cell-md"
            style={{ borderRadius: 22, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", padding: 32 }}
          >
            <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-ink-soft)", margin: "0 0 16px", fontWeight: 600 }}>
              03 · Credentials
            </p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 32, margin: "0 0 10px", letterSpacing: "-0.025em", lineHeight: 1 }}>
              WSQ, <span style={{ color: "var(--color-trust)" }}>verified</span>.
            </h3>
            <p style={{ fontSize: 13.5, color: "var(--color-ink-soft)", margin: "0 0 22px", maxWidth: 360 }}>
              Upload a cert, Claude Haiku extracts issuer + skills, whitelist confirms it. Real badges on your profile in under a minute.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["SkillsFuture", "NUS", "NTU", "SMU", "SIT", "SIM", "IES", "SCS", "ACSM", "MOE-trained"].map((i) => (
                <li key={i}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: "var(--color-trust-soft)", color: "var(--color-trust)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden><path d="M1.5 5 4 7.5 8.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {i}
                  </span>
                </li>
              ))}
            </ul>
            <div style={{ padding: 14, borderRadius: 12, border: "1px dashed var(--color-line)", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-soft)", lineHeight: 1.7 }}>
              → parsed: &ldquo;WSQ Diploma in Design Thinking&rdquo;<br />
              → skills: <span style={{ color: "var(--color-trust)" }}>[service_design, user_research]</span><br />
              → issuer: <span style={{ color: "var(--color-jade-ink)" }}>SkillsFuture SG ✓</span>
            </div>
          </article>

          {/* 04 · Async interview */}
          <article
            className="cell-md"
            style={{ borderRadius: 22, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", padding: 32 }}
          >
            <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-ink-soft)", margin: "0 0 16px", fontWeight: 600 }}>
              04 · Async interview
            </p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 32, margin: "0 0 10px", letterSpacing: "-0.025em", lineHeight: 1 }}>
              Say it. Don&apos;t type it.
            </h3>
            <p style={{ fontSize: 13.5, color: "var(--color-ink-soft)", margin: "0 0 22px" }}>
              Employers post 1–3 questions. You record 90s answers on your own time. No Zoom scheduling gymnastics.
            </p>
            <div style={{ borderRadius: 14, background: "var(--color-ink)", color: "var(--color-surface)", padding: 16, display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--color-accent)", animation: "pulse-ring 1.5s infinite" }} />
                  REC · 00:47
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, opacity: 0.6 }}>Q2 / 3 · 90s</span>
              </div>
              <div style={{ height: 40, display: "flex", alignItems: "center", gap: 3 }}>
                {Array.from({ length: 40 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      width: 3,
                      borderRadius: 2,
                      height: `${Math.max(8, 20 + Math.abs(Math.sin(i * 0.8) * 70) + (i < 28 ? 0 : -50))}%`,
                      background: i < 28 ? "var(--color-accent)" : "oklch(100% 0 0 / 0.2)",
                    }}
                  />
                ))}
              </div>
              <p style={{ fontSize: 12, opacity: 0.7, margin: 0 }}>
                Q: &ldquo;What&apos;s a design decision you regret, and what did you learn?&rdquo;
              </p>
            </div>
          </article>

          {/* 05 · Go full-time */}
          <article
            className="cell-md grain"
            style={{ borderRadius: 22, background: "var(--color-ink)", color: "var(--color-surface)", padding: 32, position: "relative", overflow: "hidden" }}
          >
            <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", margin: "0 0 16px", fontWeight: 600 }}>
              05 · Go full-time
            </p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 32, margin: "0 0 10px", letterSpacing: "-0.025em", lineHeight: 1 }}>
              From side to <span style={{ color: "var(--color-accent)" }}>CEO</span>.
            </h3>
            <p style={{ fontSize: 13.5, color: "oklch(100% 0 0 / 0.7)", margin: "0 0 22px" }}>
              When you&apos;re ready, we walk you through ACRA BizFile, CPF self-employed, GST thresholds, and bank picks.
            </p>
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["01", "Decide (sole-prop vs Pte Ltd)"],
                ["02", "Reserve your company name"],
                ["03", "Register via ACRA BizFile"],
                ["04", "Post-reg: CPF, GST, banking"],
              ].map(([n, t]) => (
                <li key={n} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13, color: "oklch(100% 0 0 / 0.85)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-accent)", width: 22, flexShrink: 0 }}>{n}</span>
                  <span style={{ flex: 1, height: 1, background: "oklch(100% 0 0 / 0.12)" }} />
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </article>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section
        className="grain"
        style={{ background: "var(--color-ink)", color: "var(--color-surface)", padding: "100px 0", marginTop: 100 }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 28px" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 600, margin: "0 0 14px" }}>
            How it works
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3vw, 3.2rem)", margin: "0 0 60px", maxWidth: "18ch", lineHeight: 0.98 }}>
            From Singpass to first paycheck — in{" "}
            <span style={{ color: "var(--color-accent)" }}>one evening</span>.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {[
              { step: "01", time: "0:20", title: "Verify with Singpass", body: "NRIC + face scan. 20 seconds. We hash your identifier; the raw identifier is never stored." },
              { step: "02", time: "4:30", title: "Build your profile", body: "Upload a 90s video, paste a WSQ cert. Details are extracted and indexed for matching." },
              { step: "03", time: "8:00", title: "Match, apply, record", body: "Assignments are matched against your verified skills. Submit video responses when shortlisted." },
              { step: "04", time: "→ day 1", title: "Get paid. Register your business", body: "SGD payments held in escrow. ACRA registration guidance when you are ready." },
            ].map((s) => (
              <div key={s.step} style={{ borderTop: "1px solid oklch(100% 0 0 / 0.15)", paddingTop: 20 }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-accent)", margin: "0 0 10px" }}>
                  {s.step} · {s.time}
                </p>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 10px", color: "var(--color-surface)" }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 13.5, color: "oklch(100% 0 0 / 0.65)", lineHeight: 1.55, margin: 0 }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "100px 28px 60px" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 12px" }}>
          From the freelancers
        </p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3vw, 3.2rem)", margin: "0 0 40px", maxWidth: "16ch", lineHeight: 0.98 }}>
          People who made it <span style={{ color: "var(--color-accent-ink)" }}>work</span>.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 20 }}>
          {[
            {
              featured: true,
              quote: "I stopped sending portfolio PDFs. Employers watch my 90-second video, see the Singpass tick, and just message. Three months in, I quit my agency job.",
              name: "Arif R.", role: "Product designer · Tampines",
              meta: "S$18,400 in 90 days",
            },
            {
              quote: "The WSQ cert verification was the deal-breaker. Parents don't trust random Carousell tutors anymore — they trust the blue tick.",
              name: "Priya N.", role: "Tuition · Pasir Ris",
            },
            {
              quote: "Completed three assignments, got the feedback I needed, and the platform walked me through registering my Pte Ltd. Stripe was live by week six.",
              name: "Wei Jie T.", role: "Now: founder, Muezza Studio",
            },
          ].map((r) => (
            <figure
              key={r.name}
              style={{
                margin: 0,
                padding: r.featured ? 34 : 26,
                borderRadius: 22,
                background: r.featured ? "var(--color-surface-raised)" : "transparent",
                border: r.featured ? "1px solid var(--color-line)" : "1px solid var(--color-line-soft)",
                display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 20,
                minHeight: 280,
              }}
            >
              <blockquote style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: r.featured ? 26 : 19, lineHeight: 1.25, letterSpacing: "-0.02em" }}>
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <figcaption style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{r.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--color-ink-soft)" }}>{r.role}</p>
                </div>
                {r.meta && (
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-jade-ink)", margin: 0, textAlign: "right" }}>{r.meta}</p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "0 28px 100px" }}>
        <div
          className="grain"
          style={{ borderRadius: 28, background: "var(--color-ink)", color: "var(--color-surface)", padding: "clamp(40px, 6vw, 80px)", position: "relative", overflow: "hidden" }}
        >
          <div style={{ position: "relative", zIndex: 1, maxWidth: 560 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 600, margin: "0 0 14px" }}>
              One more thing
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 4rem)", margin: "0 0 18px", lineHeight: 0.95, letterSpacing: "-0.03em" }}>
              Your hustle deserves infrastructure that respects it.
            </h2>
            <p style={{ color: "oklch(100% 0 0 / 0.65)", fontSize: 15, margin: "0 0 28px", lineHeight: 1.5 }}>
              Sign up with Singpass in under 20 seconds. Demo NRICs provided for testing.
            </p>
            <Link
              href="/singpass"
              style={{ display: "inline-block", padding: "12px 24px", borderRadius: 999, background: "var(--color-accent)", color: "oklch(20% 0.08 38)", fontSize: 14, fontWeight: 600 }}
            >
              Start now — it&apos;s free →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
