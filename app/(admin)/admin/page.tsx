import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const service = createServiceClient();

  const [openReports, reviewingReports, pendingCerts] = await Promise.all([
    service.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    service.from("reports").select("id", { count: "exact", head: true }).eq("status", "under_review"),
    service
      .from("certifications")
      .select("id", { count: "exact", head: true })
      .eq("verification_status", "pending"),
  ]);

  const cards = [
    { label: "Open reports", count: openReports.count ?? 0, href: "/admin/reports" },
    { label: "Under review", count: reviewingReports.count ?? 0, href: "/admin/reports" },
    { label: "Certs awaiting verification", count: pendingCerts.count ?? 0, href: "/admin/certs" },
  ];

  return (
    <>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, margin: "0 0 24px", letterSpacing: "-0.03em" }}>
        Moderation queue
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            style={{
              display: "block",
              padding: "20px 22px",
              borderRadius: 14,
              border: "1px solid var(--color-line)",
              background: "var(--color-surface-raised, var(--color-surface))",
              textDecoration: "none",
              color: "var(--color-ink)",
            }}
          >
            <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink-soft)", fontWeight: 600 }}>
              {c.label}
            </p>
            <p style={{ margin: "8px 0 0", fontFamily: "var(--font-display)", fontSize: 40, lineHeight: 1 }}>
              {c.count}
            </p>
          </Link>
        ))}
      </div>
      <p style={{ marginTop: 28, fontSize: 13, color: "var(--color-ink-mute)" }}>
        Admins are promoted via SQL only:{" "}
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
          update profiles set is_admin = true where handle = &lt;handle&gt;
        </code>
      </p>
    </>
  );
}
