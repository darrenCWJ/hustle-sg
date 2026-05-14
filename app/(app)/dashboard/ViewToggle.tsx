import Link from "next/link";

export function ViewToggle({ active }: { active: "employer" | "worker" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
      <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)" }}>
        Viewing as
      </span>
      <div style={{ display: "inline-flex", borderRadius: 999, border: "1px solid var(--color-line)", padding: 3, background: "var(--color-surface-raised)", gap: 2 }}>
        <Link
          href="/dashboard?view=employer"
          style={{
            padding: "7px 20px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            background: active === "employer" ? "var(--color-ink)" : "transparent",
            color: active === "employer" ? "var(--color-surface)" : "var(--color-ink-soft)",
            whiteSpace: "nowrap",
          }}
        >
          Employer
        </Link>
        <Link
          href="/dashboard?view=worker"
          style={{
            padding: "7px 20px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            background: active === "worker" ? "var(--color-ink)" : "transparent",
            color: active === "worker" ? "var(--color-surface)" : "var(--color-ink-soft)",
            whiteSpace: "nowrap",
          }}
        >
          Worker
        </Link>
      </div>
    </div>
  );
}
