"use client";

import React, { useState } from "react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  style = {},
  type = "button",
  fullWidth = false,
}: {
  children: React.ReactNode;
  variant?: "primary" | "accent" | "ghost" | "ink" | "quiet" | "danger";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  type?: "button" | "submit";
  fullWidth?: boolean;
}) {
  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: "6px 12px", fontSize: 12 },
    md: { padding: "10px 18px", fontSize: 13.5 },
    lg: { padding: "14px 22px", fontSize: 14.5 },
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: "var(--color-ink)", color: "oklch(97% 0.012 85)" },
    accent: { background: "var(--color-accent)", color: "oklch(20% 0.08 var(--accent-h))" },
    ghost: { background: "transparent", color: "var(--color-ink)", border: "1px solid var(--color-line)" },
    ink: { background: "oklch(97% 0.012 85)", color: "var(--color-ink)" },
    quiet: { background: "var(--color-muted)", color: "var(--color-ink)" },
    danger: { background: "transparent", color: "var(--color-ink-soft)", border: "1px solid var(--color-line)" },
  };
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    fontWeight: 600,
    letterSpacing: "-0.005em",
    transition: "transform 0.2s var(--ease-out-smooth), box-shadow 0.2s",
    textAlign: "center",
    justifyContent: "center",
    width: fullWidth ? "100%" : undefined,
    textDecoration: "none",
    cursor: "pointer",
    ...sizes[size],
    ...variants[variant],
    ...style,
  };

  const onEnter = (el: HTMLElement) => {
    el.style.transform = "translateY(-2px)";
    el.style.boxShadow = "var(--shadow-lift)";
    el.style.filter = "brightness(1.05)";
  };
  const onLeave = (el: HTMLElement) => {
    el.style.transform = "";
    el.style.boxShadow = "";
    el.style.filter = "";
  };

  if (href) {
    return (
      <a
        href={href}
        style={base}
        onMouseEnter={(e) => onEnter(e.currentTarget as HTMLElement)}
        onMouseLeave={(e) => onLeave(e.currentTarget as HTMLElement)}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      style={base}
      onMouseEnter={(e) => onEnter(e.currentTarget)}
      onMouseLeave={(e) => onLeave(e.currentTarget)}
    >
      {children}
    </button>
  );
}

export function SkillChip({
  children,
  active = false,
  onClick,
  tone = "default",
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  tone?: "default" | "accent" | "trust" | "ghost";
}) {
  const tones: Record<string, React.CSSProperties> = {
    default: { background: "var(--color-muted)", color: "var(--color-ink-soft)" },
    accent: { background: "var(--color-accent-soft)", color: "var(--color-accent-ink)" },
    trust: { background: "var(--color-trust-soft)", color: "var(--color-trust)" },
    ghost: { background: "transparent", color: "var(--color-ink-soft)", border: "1px solid var(--color-line)" },
  };
  return (
    <span
      onClick={onClick}
      style={{
        fontSize: 11,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "4px 10px",
        borderRadius: 999,
        fontWeight: 600,
        cursor: onClick ? "pointer" : "default",
        display: "inline-block",
        ...tones[tone],
        ...(active ? { background: "var(--color-ink)", color: "oklch(97% 0.012 85)" } : {}),
      }}
    >
      {children}
    </span>
  );
}

export function MatchScoreBadge({
  score,
  overlap = [],
  compact = false,
}: {
  score: number;
  overlap?: string[];
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pct = Math.round(score);
  const ringColor =
    pct >= 85 ? "var(--color-jade)" :
    pct >= 65 ? "var(--color-accent)" :
    "var(--color-ink-mute)";
  const circ = 2 * Math.PI * 18;

  return (
    <div
      style={{ position: "relative", cursor: "help" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: compact ? "4px 10px 4px 4px" : "5px 12px 5px 5px",
        borderRadius: 999,
        background: "var(--color-surface)",
        border: "1px solid var(--color-line)",
      }}>
        <svg width={compact ? 28 : 34} height={compact ? 28 : 34} viewBox="0 0 40 40" aria-hidden>
          <circle cx="20" cy="20" r="18" fill="none" stroke="var(--color-line)" strokeWidth="3" />
          <circle
            cx="20" cy="20" r="18" fill="none"
            stroke={ringColor} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * circ} ${circ}`}
            transform="rotate(-90 20 20)"
            style={{ transition: "stroke-dasharray 0.8s var(--ease-out-expo)" }}
          />
        </svg>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, letterSpacing: "-0.02em" }}>
          {pct}%
        </span>
      </div>
      {open && overlap.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 30,
          width: 260, padding: 12, borderRadius: 12,
          background: "var(--color-ink)", color: "oklch(97% 0.012 85)",
          boxShadow: "var(--shadow-deep)", fontSize: 12,
          animation: "fadeUp 0.2s var(--ease-out-expo) both",
        }}>
          <p style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.6, margin: 0 }}>
            Why it matched
          </p>
          <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", display: "flex", flexWrap: "wrap", gap: 4 }}>
            {overlap.map((s) => (
              <li key={s} style={{ background: "oklch(from var(--color-accent) l c h / 0.18)", color: "var(--color-accent)", padding: "3px 8px", borderRadius: 999, fontSize: 11 }}>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
