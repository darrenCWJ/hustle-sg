import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { getAdminUser } from "@/lib/auth/admin";

// Internal moderation surface (IMPROVEMENT_PLAN.md Phase 2.5). Not linked from
// any user-facing nav; non-admins get a 404 so the route stays undiscoverable.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) notFound();

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-surface)" }}>
      <header
        style={{
          borderBottom: "1px solid var(--color-line)",
          padding: "14px 28px",
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "-0.02em" }}>
          HustleSG <span style={{ color: "var(--color-accent)" }}>Admin</span>
        </span>
        <nav style={{ display: "flex", gap: 16, fontSize: 13.5 }} aria-label="Admin">
          <Link href="/admin" style={{ color: "var(--color-ink-soft)" }}>Overview</Link>
          <Link href="/admin/reports" style={{ color: "var(--color-ink-soft)" }}>Reports</Link>
          <Link href="/admin/certs" style={{ color: "var(--color-ink-soft)" }}>Verifications</Link>
          <Link href="/admin/disputes" style={{ color: "var(--color-ink-soft)" }}>Disputes</Link>
          <Link href="/admin/errors" style={{ color: "var(--color-ink-soft)" }}>Errors</Link>
        </nav>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-ink-mute)", fontFamily: "var(--font-mono)" }}>
          @{admin.handle}
        </span>
        <Link href="/feed" style={{ fontSize: 12.5, color: "var(--color-ink-soft)" }}>
          ← Back to app
        </Link>
      </header>
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 28px 80px" }}>{children}</main>
    </div>
  );
}
