import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getBlockedCounterparties } from "@/lib/safety/blocks";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function MobileBrowsePage() {
  const service = createServiceClient();

  const { data: raw } = await service
    .from("gigs")
    .select(
      "id, title, description, category, location, budget_cents, budget_kind, skills_required, created_at, employer_id",
    )
    .eq("is_instant", false)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(40);

  const employerIds = [...new Set((raw ?? []).map((g) => g.employer_id))];
  const { data: profiles } = await service
    .from("profiles")
    .select("id, display_name, singpass_verified_at")
    .in("id", employerIds.length > 0 ? employerIds : ["00000000-0000-0000-0000-000000000000"]);

  const profileMap: Record<string, { name: string; verified: boolean }> = {};
  for (const p of profiles ?? []) {
    profileMap[p.id] = { name: p.display_name ?? "Employer", verified: !!p.singpass_verified_at };
  }

  // Blocked pairs don't see each other's gigs on the plain browse list either.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const blocked = user ? await getBlockedCounterparties(user.id) : new Set<string>();

  const gigs = (raw ?? [])
    .filter((g) => !blocked.has(g.employer_id))
    .map((g) => ({
      ...g,
      employer: profileMap[g.employer_id] ?? { name: "Employer", verified: false },
    }));

  const CATEGORY_COLORS: Record<string, string> = {
    engineering: "#3b82f6",
    design: "#a855f7",
    marketing: "#f59e0b",
    finance: "#10b981",
    operations: "#6366f1",
    "pet-care": "#f97316",
    errands: "#ec4899",
    "home-help": "#14b8a6",
    care: "#84cc16",
  };

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
          All open gigs
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
          Browse Gigs
        </h1>
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "3px 0 0" }}>
          {gigs.length} open positions
        </p>
      </div>

      {/* Gig list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px 12px" }}>
        {gigs.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--color-ink-mute)",
              fontSize: 14,
            }}
          >
            No open gigs right now.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {gigs.map((g) => {
              const catColor = CATEGORY_COLORS[g.category ?? ""] ?? "var(--color-ink-mute)";
              return (
                <Link
                  key={g.id}
                  href={`/m/gigs/${g.id}`}
                  style={{
                    display: "block",
                    borderRadius: 14,
                    background: "var(--color-surface-raised)",
                    border: "1px solid var(--color-line)",
                    boxShadow: "var(--shadow-soft)",
                    padding: "12px 14px",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  {/* Category + time */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: catColor,
                      }}
                    >
                      {g.category ?? "gig"}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--color-ink-mute)",
                      }}
                    >
                      {timeAgo(g.created_at)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 15,
                      margin: "0 0 3px",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.15,
                      color: "var(--color-ink)",
                    }}
                  >
                    {g.title}
                  </h3>

                  {/* Employer + location */}
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--color-ink-soft)",
                      margin: "0 0 8px",
                    }}
                  >
                    {g.employer.name}
                    {g.employer.verified && (
                      <span
                        style={{
                          marginLeft: 5,
                          fontSize: 10,
                          color: "var(--color-jade)",
                          fontWeight: 700,
                        }}
                      >
                        ✓ Verified
                      </span>
                    )}{" "}
                    · {g.location ?? "Singapore"}
                  </p>

                  {/* Skills */}
                  {g.skills_required?.length > 0 && (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}
                    >
                      {g.skills_required.slice(0, 4).map((s: string) => (
                        <span
                          key={s}
                          style={{
                            fontSize: 10,
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: "var(--color-muted)",
                            color: "var(--color-ink-mute)",
                            fontWeight: 600,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Budget */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--color-ink)",
                      }}
                    >
                      S${((g.budget_cents ?? 0) / 100).toFixed(0)}
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 400,
                          color: "var(--color-ink-mute)",
                          marginLeft: 5,
                        }}
                      >
                        {g.budget_kind === "hourly" ? "/hr" : "fixed"}
                      </span>
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--color-ink-soft)",
                        fontWeight: 500,
                      }}
                    >
                      View →
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
