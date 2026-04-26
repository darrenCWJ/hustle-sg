export function GigDefinitionCard() {
  return (
    <article
      className="grain"
      style={{
        padding: "44px 48px",
        borderRadius: 22,
        background: "var(--color-ink)",
        color: "oklch(97% 0.012 85)",
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        gap: 48,
        alignItems: "start",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div aria-hidden style={{ position: "absolute", right: -30, bottom: -120, fontFamily: "var(--font-display)", fontSize: 420, fontWeight: 700, lineHeight: 0.8, letterSpacing: "-0.06em", color: "oklch(100% 0 0 / 0.04)", userSelect: "none", pointerEvents: "none" }}>
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
          <span style={{ fontWeight: 600 }}>HustleSG</span>, every gig is Singpass-verified and budgeted in SGD.
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
            <span key={w} style={{ padding: "7px 12px", borderRadius: 999, background: "oklch(100% 0 0 / 0.08)", border: "1px solid oklch(100% 0 0 / 0.15)", fontSize: 12.5, color: "oklch(100% 0 0 / 0.85)", fontFamily: "var(--font-sans)" }}>
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
  );
}
