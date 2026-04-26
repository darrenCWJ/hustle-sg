import { Eyebrow, Stat, VerifiedBadge } from "@/components/ui/primitives";

function EmbeddingDiagram() {
  return (
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
  );
}

function FeatureVerified() {
  return (
    <article
      className="cell-lg tall grain"
      style={{ borderRadius: 22, background: "var(--color-ink)", color: "oklch(97% 0.012 85)", padding: 36, position: "relative", overflow: "hidden" }}
    >
      <Eyebrow tone="surface">01 · Verified identity</Eyebrow>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 2.6vw, 2.8rem)", margin: "18px 0 14px", letterSpacing: "-0.03em", lineHeight: 1 }}>
        Singpass-verified,<br />
        <span style={{ fontStyle: "italic", color: "var(--color-accent)" }}>AI-matched</span>.
      </h3>
      <p style={{ color: "oklch(100% 0 0 / 0.7)", maxWidth: 440, fontSize: 14, lineHeight: 1.55 }}>
        Authenticate through Singpass. We embed your profile into a vector index, then surface gigs that match your certifications and portfolio — not just your keyword hits.
      </p>
      <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Stat dark label="Identity" value="SHA-256" delta="hashed + salted" />
        <Stat dark label="Match" value="1536-d" delta="cosine · pgvector" />
        <Stat dark label="Latency" value="~120ms" delta="p95 SG edge" />
        <Stat dark label="Index" value="ivfflat" delta="re-embed on save" />
      </div>
      <div style={{ position: "absolute", right: -60, top: 60, opacity: 0.9, pointerEvents: "none", animation: "float 6s ease-in-out infinite" }} aria-hidden>
        <EmbeddingDiagram />
      </div>
    </article>
  );
}

function FeaturePortfolio() {
  return (
    <article
      className="cell-sm"
      style={{ borderRadius: 22, background: "var(--color-accent)", color: "oklch(22% 0.08 var(--accent-h))", padding: 32, position: "relative", overflow: "hidden" }}
    >
      <Eyebrow>02 · Portfolio video</Eyebrow>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 32, margin: "16px 0 10px", letterSpacing: "-0.025em", lineHeight: 1 }}>
        90 seconds of <span style={{ fontStyle: "italic" }}>you</span>.
      </h3>
      <p style={{ fontSize: 13.5, opacity: 0.85, margin: "0 0 22px", maxWidth: 340 }}>
        Show the tuition class, the pasar malam booth, the Figma walkthrough. Raw and real is the new resume.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[{ label: "tuition", time: "1:24" }, { label: "design", time: "2:05" }, { label: "mc", time: "0:47" }].map((v) => (
          <div
            key={v.label}
            style={{
              aspectRatio: "3 / 4",
              borderRadius: 12,
              background: "oklch(22% 0.08 var(--accent-h))",
              color: "var(--color-accent)",
              padding: 10,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
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
  );
}

function FeatureCredentials() {
  return (
    <article className="cell-sm" style={{ borderRadius: 22, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", padding: 32 }}>
      <Eyebrow>03 · Credentials</Eyebrow>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 32, margin: "16px 0 10px", letterSpacing: "-0.025em", lineHeight: 1 }}>
        WSQ, <span style={{ fontStyle: "italic", color: "var(--color-trust)" }}>verified</span>.
      </h3>
      <p style={{ fontSize: 13.5, color: "var(--color-ink-soft)", margin: "0 0 22px", maxWidth: 360 }}>
        Upload a cert, Claude Haiku extracts issuer + skills, whitelist confirms it. Real badges on your profile in under a minute.
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexWrap: "wrap", gap: 6 }}>
        {["SkillsFuture", "NUS", "NTU", "SMU", "SIT", "SIM", "IES", "SCS", "ACSM", "MOE-trained"].map((i) => (
          <li key={i}><VerifiedBadge tone="trust">{i}</VerifiedBadge></li>
        ))}
      </ul>
      <div style={{ padding: 14, borderRadius: 12, border: "1px dashed var(--color-line)", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-soft)", lineHeight: 1.7 }}>
        → parsed: &ldquo;WSQ Diploma in Design Thinking&rdquo;<br />
        → skills: <span style={{ color: "var(--color-trust)" }}>[service_design, user_research]</span><br />
        → issuer: <span style={{ color: "var(--color-jade-ink)" }}>SkillsFuture SG ✓</span>
      </div>
    </article>
  );
}

function FeatureAsync() {
  return (
    <article className="cell-md" style={{ borderRadius: 22, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", padding: 32 }}>
      <Eyebrow>04 · Async interview</Eyebrow>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 32, margin: "16px 0 10px", letterSpacing: "-0.025em", lineHeight: 1 }}>
        Say it. Don&apos;t <span style={{ fontStyle: "italic" }}>type</span> it.
      </h3>
      <p style={{ fontSize: 13.5, color: "var(--color-ink-soft)", margin: "0 0 22px" }}>
        Employers post 1–3 questions. You record 90s answers on your own time. No Zoom scheduling gymnastics.
      </p>
      <div style={{ borderRadius: 14, background: "var(--color-ink)", color: "oklch(97% 0.012 85)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
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
  );
}

function FeatureCeo() {
  return (
    <article
      className="cell-md grain"
      style={{ borderRadius: 22, background: "var(--color-ink)", color: "oklch(97% 0.012 85)", padding: 32, position: "relative", overflow: "hidden" }}
    >
      <Eyebrow tone="surface">05 · Go full-time</Eyebrow>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 32, margin: "16px 0 10px", letterSpacing: "-0.025em", lineHeight: 1 }}>
        From side to <span style={{ fontStyle: "italic", color: "var(--color-accent)" }}>CEO</span>.
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
  );
}

export function FeatureBento() {
  return (
    <div className="bento">
      <FeatureVerified />
      <FeaturePortfolio />
      <FeatureCredentials />
      <FeatureAsync />
      <FeatureCeo />
    </div>
  );
}
