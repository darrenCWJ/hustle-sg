import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { timeAgo, formatSgd } from "@/lib/utils";
import { NotificationsToggle } from "@/components/notifications/NotificationsToggle";

const GIG_STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  open:   { label: "Open",   bg: "var(--color-jade-soft)", fg: "var(--color-jade-ink)" },
  closed: { label: "Closed", bg: "var(--color-muted)",     fg: "var(--color-ink-mute)" },
  filled: { label: "Filled", bg: "var(--color-ink)",       fg: "var(--color-surface)"  },
};

const APP_STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  applied:      { label: "New",          bg: "var(--color-accent-soft)",   fg: "var(--color-accent-ink)"  },
  interviewing: { label: "Interviewing", bg: "oklch(92% 0.06 250)",        fg: "oklch(35% 0.14 250)"      },
  shortlisted:  { label: "Shortlisted",  bg: "var(--color-jade-soft)",     fg: "var(--color-jade-ink)"    },
  offered:      { label: "Offer sent",   bg: "var(--color-accent-soft)",   fg: "var(--color-accent-ink)"  },
  hired:        { label: "Hired",        bg: "var(--color-ink)",           fg: "var(--color-surface)"     },
  rejected:     { label: "Rejected",     bg: "var(--color-muted)",         fg: "var(--color-ink-mute)"    },
};

export async function EmployerDashboard({ userId }: { userId: string }) {
  const supabase = await createClient();

  const [gigsRes, appsRes] = await Promise.all([
    supabase
      .from("gigs")
      .select("id, title, status, created_at, budget_cents, budget_kind, category, applications(count)")
      .eq("employer_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("applications")
      .select("id, status, created_at, applicant:profiles!applications_applicant_id_fkey(handle, display_name, headline, singpass_verified_at), gigs!inner(id, title, employer_id)")
      .eq("gigs.employer_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const gigs = gigsRes.data ?? [];
  const apps = appsRes.data ?? [];
  const openGigs = gigs.filter((g) => g.status === "open");
  const pendingReview = apps.filter((a) => a.status === "applied").length;
  const hired = apps.filter((a) => a.status === "hired").length;

  return (
    <div>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 40, gap: 20, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 8px" }}>
            Employer dashboard
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 4vw, 4rem)", margin: 0, lineHeight: 0.98, letterSpacing: "-0.035em" }}>
            Your assignments,{" "}
            <span style={{ color: "var(--color-accent-ink)" }}>managed</span>.
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <NotificationsToggle />
          <Link
            href="/applicants"
            style={{ padding: "9px 18px", borderRadius: 999, border: "1px solid var(--color-line)", fontSize: 13, fontWeight: 600 }}
          >
            All applicants
          </Link>
          <Link
            href="/gigs/new"
            style={{ padding: "10px 20px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}
          >
            + Post assignment
          </Link>
        </div>
      </header>

      {/* KPI tiles */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 36 }}>
        {[
          { label: "Open assignments", value: openGigs.length,    sub: "live now",          dark: true  },
          { label: "Total applicants", value: apps.length,        sub: "across all gigs",   dark: false },
          { label: "Pending review",   value: pendingReview,      sub: "awaiting decision", dark: false },
          { label: "Hired",            value: hired,              sub: "this period",       dark: false },
        ].map(({ label, value, sub, dark }) => (
          <div
            key={label}
            className={dark ? "grain" : ""}
            style={{
              padding: "22px 24px",
              borderRadius: 18,
              background: dark ? "var(--color-ink)" : "var(--color-surface-raised)",
              border: dark ? "none" : "1px solid var(--color-line)",
              color: dark ? "var(--color-surface)" : "inherit",
            }}
          >
            <p style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: dark ? "var(--color-accent)" : "var(--color-ink-soft)", margin: 0, fontWeight: 600 }}>
              {label}
            </p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 44, margin: "6px 0 0", letterSpacing: "-0.04em", lineHeight: 1 }}>
              {value}
            </p>
            <p style={{ fontSize: 12, color: dark ? "oklch(100% 0 0 / 0.5)" : "var(--color-ink-mute)", margin: "4px 0 0", fontFamily: "var(--font-mono)" }}>
              {sub}
            </p>
          </div>
        ))}
      </section>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 24 }}>
        {/* Posted gigs */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: 0, letterSpacing: "-0.025em" }}>
              Posted assignments
            </h2>
            <Link href="/gigs/new" style={{ fontSize: 12, color: "var(--color-ink-soft)", fontWeight: 600 }}>
              + New →
            </Link>
          </div>

          {gigs.length === 0 ? (
            <div style={{ padding: "40px 24px", borderRadius: 18, border: "1px dashed var(--color-line)", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: "0 0 16px" }}>No assignments posted yet.</p>
              <Link href="/gigs/new" style={{ padding: "9px 18px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 13, fontWeight: 600 }}>
                Post your first assignment →
              </Link>
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {gigs.map((g: any) => {
                const sc = GIG_STATUS[g.status] ?? GIG_STATUS.open;
                const appCount = g.applications?.[0]?.count ?? 0;
                return (
                  <li key={g.id} style={{ padding: "18px 20px", borderRadius: 14, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10, marginBottom: 10 }}>
                      <div style={{ flex: 1 }}>
                        <Link href={`/gigs/${g.id}`} style={{ fontWeight: 700, fontSize: 14.5, color: "inherit" }}>
                          {g.title}
                        </Link>
                        <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--color-ink-mute)" }}>
                          {[g.category, timeAgo(g.created_at)].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: sc.bg, color: sc.fg, whiteSpace: "nowrap" }}>
                        {sc.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 14 }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-soft)" }}>
                          {appCount} applicant{appCount !== 1 ? "s" : ""}
                        </span>
                        {g.budget_cents && (
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-soft)" }}>
                            {formatSgd(g.budget_cents)}{g.budget_kind === "hourly" ? " /hr" : " fixed"}
                          </span>
                        )}
                      </div>
                      <Link href={`/applicants?gig=${g.id}`} style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 999, border: "1px solid var(--color-line)", whiteSpace: "nowrap" }}>
                        Applicants →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Recent applicants */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: 0, letterSpacing: "-0.025em" }}>
              Recent applicants
            </h2>
            <Link href="/applicants" style={{ fontSize: 12, color: "var(--color-ink-soft)", fontWeight: 600 }}>
              View all →
            </Link>
          </div>

          {apps.length === 0 ? (
            <div style={{ padding: "40px 24px", borderRadius: 18, border: "1px dashed var(--color-line)", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: 0 }}>
                Applicants appear once your assignments go live.
              </p>
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {apps.map((a: any) => {
                const name = a.applicant?.display_name ?? "?";
                const initials = name.split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase();
                const HUES = [250, 165, 340, 38, 260, 200, 78, 310];
                const hue = HUES[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % HUES.length];
                const asc = APP_STATUS[a.status] ?? APP_STATUS.applied;
                const isVerified = Boolean(a.applicant?.singpass_verified_at);
                return (
                  <li key={a.id} style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 38, height: 38, borderRadius: "50%", background: `oklch(78% 0.08 ${hue})`, color: `oklch(22% 0.08 ${hue})`, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {initials}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5 }}>{name}</p>
                        {isVerified && (
                          <span style={{ fontSize: 9.5, padding: "1px 6px", borderRadius: 999, background: "var(--color-jade-soft)", color: "var(--color-jade-ink)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            ✓ Singpass
                          </span>
                        )}
                      </div>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-ink-mute)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {(a.gigs as any)?.title ?? ""}
                      </p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: asc.bg, color: asc.fg, whiteSpace: "nowrap" }}>
                      {asc.label}
                    </span>
                    <Link href={`/interviews/${a.id}`} style={{ fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: 999, border: "1px solid var(--color-line)", whiteSpace: "nowrap" }}>
                      Review →
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
