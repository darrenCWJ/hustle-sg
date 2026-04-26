import React from "react";

export function Avatar({
  name,
  hue = 38,
  size = 40,
  verified = false,
}: {
  name: string;
  hue?: number;
  size?: number;
  verified?: boolean;
}) {
  const initials = (name || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `oklch(78% 0.08 ${hue})`,
        color: `oklch(22% 0.08 ${hue})`,
        display: "grid",
        placeItems: "center",
        fontWeight: 600,
        fontSize: size * 0.38,
        fontFamily: "var(--font-display)",
        boxShadow: `inset 0 0 0 1px oklch(40% 0.06 ${hue} / 0.3)`,
        position: "relative",
        flexShrink: 0,
      }}
    >
      {initials}
      {verified && (
        <span
          style={{
            position: "absolute",
            right: -2,
            bottom: -2,
            width: Math.max(14, size * 0.34),
            height: Math.max(14, size * 0.34),
            borderRadius: "50%",
            background: "var(--color-trust)",
            color: "white",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 0 0 2px var(--color-surface)",
            fontSize: Math.max(8, size * 0.2),
          }}
        >
          ✓
        </span>
      )}
    </span>
  );
}

export function Eyebrow({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "accent" | "surface";
}) {
  const color =
    tone === "accent"
      ? "var(--color-accent-ink)"
      : tone === "surface"
      ? "var(--color-accent)"
      : "var(--color-ink-soft)";
  return (
    <p
      style={{
        fontSize: 11,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        fontWeight: 600,
        color,
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

export function Stat({
  label,
  value,
  delta,
  dark = false,
}: {
  label: string;
  value: string;
  delta?: string;
  dark?: boolean;
}) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid ${dark ? "oklch(100% 0 0 / 0.1)" : "var(--color-line)"}`,
        padding: 14,
        background: dark ? "oklch(100% 0 0 / 0.03)" : "transparent",
      }}
    >
      <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", margin: 0, opacity: 0.55 }}>
        {label}
      </p>
      <p style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: "6px 0 0", letterSpacing: "-0.03em", lineHeight: 1 }}>
        {value}
      </p>
      {delta && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, margin: "6px 0 0", opacity: 0.6 }}>
          {delta}
        </p>
      )}
    </div>
  );
}

export function VerifiedBadge({
  children = "Verified",
  tone = "trust",
}: {
  children?: React.ReactNode;
  tone?: "trust" | "jade" | "accent";
}) {
  const bg =
    tone === "trust" ? "var(--color-trust-soft)" :
    tone === "jade" ? "var(--color-jade-soft)" :
    "var(--color-accent-soft)";
  const fg =
    tone === "trust" ? "var(--color-trust)" :
    tone === "jade" ? "var(--color-jade-ink)" :
    "var(--color-accent-ink)";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 999,
      background: bg, color: fg,
      fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600,
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
        <path d="M1.5 5 4 7.5 8.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </span>
  );
}
