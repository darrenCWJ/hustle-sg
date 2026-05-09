import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const STATUS = {
  applied: { label: "Applied", color: "var(--color-ink-mute)", dot: "var(--color-ink-mute)" },
  interviewing: { label: "Interviewing", color: "#d97706", dot: "#d97706" },
  shortlisted: { label: "Shortlisted", color: "var(--color-jade)", dot: "var(--color-jade)" },
  hired: { label: "Hired!", color: "var(--color-trust)", dot: "var(--color-trust)" },
  rejected: { label: "Not selected", color: "rgba(239,68,68,0.6)", dot: "rgba(239,68,68,0.5)" },
};

export default async function MobileApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/m/singpass?next=/m/applications");

  const { data: apps } = await supabase
    .from("applications")
    .select(
      `id, status, created_at, cover_note,
       gigs(id, title, category, location, budget_cents, budget_kind, is_instant,
            employer:profiles!gigs_employer_id_fkey(display_name))`,
    )
    .eq("applicant_id", user.id)
    .order("created_at", { ascending: false });

  const items = apps ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          padding: "10px 16px 8px",
          borderBottom: "1px solid var(--color-line)",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-ink-mute)",
            margin: "0 0 4px",
            fontWeight: 600,
          }}
        >
          Your history
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            margin: 0,
            letterSpacing: "-0.025em",
            color: "var(--color-ink)",
          }}
        >
          Applications
        </h1>
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "3px 0 0" }}>
          {items.length} total · {items.filter((a) => a.status === "hired").length} hired
        </p>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px 12px" }}>
        {items.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 16,
              textAlign: "center",
              padding: 32,
            }}
          >
            <div style={{ fontSize: 48 }}>📋</div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                color: "var(--color-ink)",
                margin: 0,
              }}
            >
              No applications yet.
            </p>
            <p style={{ color: "var(--color-ink-soft)", fontSize: 14, margin: 0 }}>
              Swipe right on a gig to apply instantly.
            </p>
            <Link
              href="/m/feed"
              style={{
                padding: "12px 28px",
                borderRadius: 999,
                background: "var(--color-ink)",
                color: "var(--color-surface)",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Go to feed →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((app) => {
              const rawGig = app.gigs as unknown as {
                id: string;
                title: string;
                category: string | null;
                location: string | null;
                budget_cents: number;
                budget_kind: string;
                is_instant: boolean;
                employer: { display_name: string | null }[] | { display_name: string | null } | null;
              } | null;
              const gig = rawGig
                ? {
                    ...rawGig,
                    employer: Array.isArray(rawGig.employer)
                      ? (rawGig.employer[0] ?? null)
                      : rawGig.employer,
                  }
                : null;

              if (!gig) return null;

              const st = STATUS[app.status as keyof typeof STATUS] ?? STATUS.applied;

              return (
                <Link
                  key={app.id}
                  href={`/gigs/${gig.id}`}
                  style={{
                    display: "block",
                    borderRadius: 14,
                    background: "var(--color-surface-raised)",
                    border: "1px solid var(--color-line)",
                    boxShadow: "var(--shadow-soft)",
                    padding: "11px 14px",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  {/* Status + time */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: st.dot,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{ fontSize: 11, fontWeight: 700, color: st.color, letterSpacing: "0.02em" }}
                      >
                        {st.label}
                      </span>
                    </div>
                    <span
                      style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-ink-mute)" }}
                    >
                      {timeAgo(app.created_at)}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 17,
                      margin: "0 0 4px",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.15,
                      color: "var(--color-ink)",
                    }}
                  >
                    {gig.title}
                  </h3>

                  <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: "0 0 10px" }}>
                    {gig.employer?.display_name ?? "Employer"}
                    {gig.is_instant && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 10,
                          padding: "1px 7px",
                          borderRadius: 999,
                          background: "rgba(220,38,38,0.10)",
                          color: "#dc2626",
                          fontWeight: 700,
                        }}
                      >
                        ⚡ Instant
                      </span>
                    )}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 15,
                        fontWeight: 700,
                        color: "var(--color-ink)",
                      }}
                    >
                      S${(gig.budget_cents / 100).toFixed(0)}
                      <span
                        style={{ fontSize: 11, fontWeight: 400, color: "var(--color-ink-mute)", marginLeft: 4 }}
                      >
                        {gig.budget_kind === "hourly" ? "/hr" : "fixed"}
                      </span>
                    </span>
                    <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>
                      {gig.location ?? "Singapore"} →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
