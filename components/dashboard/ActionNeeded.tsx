import Link from "next/link";

export interface ActionItem {
  count: number;
  label: string;
  href: string;
  urgent?: boolean;
}

/**
 * "Needs your attention" strip for the dashboards: every item is a real count
 * with a deep link, computed server-side. Renders nothing when there's
 * nothing to do — an empty to-do list shouldn't take up space.
 */
export function ActionNeeded({ items }: { items: ActionItem[] }) {
  const visible = items.filter((i) => i.count > 0);
  if (visible.length === 0) return null;

  return (
    <section style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 10px" }}>
        Needs your attention
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {visible.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              borderRadius: 14,
              border: `1px solid ${item.urgent ? "var(--color-accent)" : "var(--color-line)"}`,
              background: item.urgent ? "var(--color-accent-soft)" : "var(--color-surface-raised)",
              color: item.urgent ? "var(--color-accent-ink)" : "var(--color-ink)",
              textDecoration: "none",
              fontSize: 13.5,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: 15,
                minWidth: 22,
                textAlign: "center",
              }}
            >
              {item.count}
            </span>
            {item.label}
            <span aria-hidden style={{ opacity: 0.6 }}>→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
