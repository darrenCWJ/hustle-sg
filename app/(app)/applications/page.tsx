import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatSgd, timeAgo } from "@/lib/utils";

const STATUS_CONFIG: Record<
  string,
  { bg: string; fg: string; label: string; step: number }
> = {
  applied: {
    bg: "var(--color-muted)",
    fg: "var(--color-ink-soft)",
    label: "Applied",
    step: 1,
  },
  interviewing: {
    bg: "var(--color-accent-soft)",
    fg: "var(--color-accent-ink)",
    label: "Interviewing",
    step: 2,
  },
  shortlisted: {
    bg: "var(--color-jade-soft)",
    fg: "var(--color-jade-ink)",
    label: "Shortlisted",
    step: 3,
  },
  hired: {
    bg: "var(--color-ink)",
    fg: "var(--color-surface)",
    label: "Hired",
    step: 4,
  },
  rejected: {
    bg: "var(--color-muted)",
    fg: "var(--color-ink-mute)",
    label: "Not selected",
    step: 0,
  },
};

const STEPS = ["Applied", "Interviewing", "Shortlisted", "Hired"] as const;

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/singpass?next=/applications");

  const { data: apps } = await supabase
    .from("applications")
    .select(
      `id, status, created_at, cover_note,
       gigs(id, title, category, location, budget_cents, budget_kind,
            employer:profiles!gigs_employer_id_fkey(display_name, singpass_verified_at))`,
    )
    .eq("applicant_id", user.id)
    .order("created_at", { ascending: false });

  const applications = apps ?? [];

  const counts = {
    total: applications.length,
    active: applications.filter(
      (a) => !["hired", "rejected"].includes(a.status),
    ).length,
    hired: applications.filter((a) => a.status === "hired").length,
    interviewing: applications.filter((a) => a.status === "interviewing").length,
  };

  return (
    <main
      style={{ maxWidth: 1200, margin: "0 auto", padding: "50px 28px 80px" }}
    >
      <header
        style={{ marginBottom: 36 }}
      >
        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: "var(--color-ink-soft)",
            margin: "0 0 8px",
          }}
        >
          My applications · {counts.total} total
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.2rem, 3.5vw, 3.6rem)",
            margin: 0,
            lineHeight: 0.98,
            letterSpacing: "-0.035em",
          }}
        >
          Your gig{" "}
          <span style={{ color: "var(--color-accent-ink)" }}>pipeline</span>.
        </h1>
      </header>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 36,
        }}
      >
        {[
          { label: "Total sent", value: counts.total },
          { label: "In progress", value: counts.active },
          { label: "Interviewing", value: counts.interviewing },
          { label: "Hired", value: counts.hired },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              padding: "18px 20px",
              borderRadius: 16,
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-line)",
            }}
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-ink-soft)",
                margin: "0 0 6px",
                fontWeight: 600,
              }}
            >
              {s.label}
            </p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 36,
                margin: 0,
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {applications.length === 0 ? (
        <div
          style={{
            padding: 80,
            borderRadius: 24,
            border: "1px dashed var(--color-line)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              margin: "0 0 10px",
            }}
          >
            No applications yet.
          </p>
          <p
            style={{
              color: "var(--color-ink-soft)",
              fontSize: 14,
              margin: "0 0 24px",
            }}
          >
            Browse open gigs and send your first application.
          </p>
          <Link
            href="/gigs"
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              background: "var(--color-ink)",
              color: "var(--color-surface)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Browse assignments →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {applications.map((a) => {
            const gig = a.gigs as any;
            const employer = gig?.employer;
            const config =
              STATUS_CONFIG[a.status] ?? STATUS_CONFIG.applied;
            const isRejected = a.status === "rejected";

            return (
              <article
                key={a.id}
                style={{
                  padding: 22,
                  borderRadius: 20,
                  background: "var(--color-surface-raised)",
                  border: "1px solid var(--color-line)",
                  opacity: isRejected ? 0.6 : 1,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 16,
                    alignItems: "start",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10.5,
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "var(--color-ink-soft)",
                          fontWeight: 600,
                        }}
                      >
                        {gig?.category ?? "Gig"} · {gig?.location ?? "Remote"}
                      </span>
                      {employer?.singpass_verified_at && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--color-trust)",
                            fontWeight: 600,
                          }}
                        >
                          Verified employer ✓
                        </span>
                      )}
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 22,
                        margin: "0 0 4px",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.1,
                      }}
                    >
                      {gig?.title ?? "Untitled gig"}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "var(--color-ink-soft)",
                      }}
                    >
                      {employer?.display_name ?? ""} ·{" "}
                      <span style={{ fontFamily: "var(--font-mono)" }}>
                        {formatSgd(gig?.budget_cents)}
                      </span>{" "}
                      {gig?.budget_kind}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "end",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        padding: "5px 12px",
                        borderRadius: 999,
                        background: config.bg,
                        color: config.fg,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {config.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--color-ink-mute)",
                      }}
                    >
                      {timeAgo(a.created_at)}
                    </span>
                  </div>
                </div>

                {/* Progress track — hide for rejected */}
                {!isRejected && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`,
                      gap: 6,
                      marginBottom: 14,
                    }}
                  >
                    {STEPS.map((step, i) => {
                      const stepNum = i + 1;
                      const done = config.step > stepNum;
                      const active = config.step === stepNum;
                      return (
                        <div key={step}>
                          <div
                            style={{
                              height: 4,
                              borderRadius: 999,
                              background: done
                                ? "var(--color-ink)"
                                : active
                                  ? "var(--color-accent)"
                                  : "var(--color-muted)",
                            }}
                          />
                          <p
                            style={{
                              margin: "5px 0 0",
                              fontSize: 10,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              fontWeight: 600,
                              color:
                                done || active
                                  ? "var(--color-ink)"
                                  : "var(--color-ink-mute)",
                            }}
                          >
                            {step}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  {a.cover_note ? (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12.5,
                        color: "var(--color-ink-soft)",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      &ldquo;{a.cover_note}&rdquo;
                    </p>
                  ) : (
                    <span />
                  )}
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {gig?.id && (
                      <Link
                        href={`/gigs/${gig.id}`}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 999,
                          border: "1px solid var(--color-line)",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        View gig
                      </Link>
                    )}
                    <Link
                      href={`/interviews/${a.id}`}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 999,
                        background: "var(--color-ink)",
                        color: "var(--color-surface)",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {a.status === "interviewing"
                        ? "Record answers →"
                        : "View →"}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
