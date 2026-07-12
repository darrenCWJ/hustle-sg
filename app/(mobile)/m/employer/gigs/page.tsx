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

const STATUS_DOT: Record<string, string> = {
  open: "var(--color-jade)",
  closed: "var(--color-ink-mute)",
  filled: "var(--color-accent)",
};

export default async function MobileEmployerGigsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/m/singpass?next=/m/employer/gigs");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "freelancer") redirect("/m/feed");

  const { data: gigs } = await supabase
    .from("gigs")
    .select(`id, title, category, location, budget_cents, budget_kind, status, is_instant, created_at,
             applications(count)`)
    .eq("employer_id", user.id)
    .order("created_at", { ascending: false });

  const items = gigs ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          padding: "10px 16px 8px",
          borderBottom: "1px solid var(--color-line)",
          flexShrink: 0,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
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
            Employer
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
            My Gigs
          </h1>
          <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "3px 0 0" }}>
            {items.length} posted · {items.filter((g) => g.status === "open").length} open
          </p>
        </div>
        <Link
          href="/m/employer/post"
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            background: "var(--color-ink)",
            color: "var(--color-surface)",
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          + Post
        </Link>
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
            <div style={{ fontSize: 48 }}>💼</div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                color: "var(--color-ink)",
                margin: 0,
              }}
            >
              No gigs yet.
            </p>
            <p style={{ color: "var(--color-ink-soft)", fontSize: 14, margin: 0 }}>
              Post your first gig to start finding workers.
            </p>
            <Link
              href="/m/employer/post"
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
              Post a gig →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((gig) => {
              const appCount = Array.isArray(gig.applications)
                ? (gig.applications[0] as { count: number } | undefined)?.count ?? 0
                : 0;

              return (
                <Link
                  key={gig.id}
                  href={`/m/employer/applicants?gig=${gig.id}`}
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
                  {/* Status row */}
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
                          background: STATUS_DOT[gig.status] ?? "var(--color-ink-mute)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: STATUS_DOT[gig.status] ?? "var(--color-ink-mute)",
                          letterSpacing: "0.02em",
                          textTransform: "capitalize",
                        }}
                      >
                        {gig.status}
                      </span>
                      {gig.is_instant && (
                        <span
                          style={{
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
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--color-ink-mute)",
                      }}
                    >
                      {timeAgo(gig.created_at)}
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

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--color-ink)",
                      }}
                    >
                      S${((gig.budget_cents ?? 0) / 100).toFixed(0)}
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 400,
                          color: "var(--color-ink-mute)",
                          marginLeft: 4,
                        }}
                      >
                        {gig.budget_kind === "hourly" ? "/hr" : "fixed"}
                      </span>
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: appCount > 0 ? 700 : 400,
                        color: appCount > 0 ? "var(--color-accent)" : "var(--color-ink-soft)",
                      }}
                    >
                      {appCount} applicant{appCount !== 1 ? "s" : ""} →
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
