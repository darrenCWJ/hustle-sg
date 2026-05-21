import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/utils";
import { RehireForm } from "./RehireForm";
import { CloseGigButton } from "./CloseGigButton";
import { MarkCompletedButton } from "./MarkCompletedButton";

const STATUS_CONFIG: Record<string, { bg: string; fg: string; label: string }> =
  {
    applied: {
      bg: "var(--color-muted)",
      fg: "var(--color-ink-soft)",
      label: "Applied",
    },
    interviewing: {
      bg: "var(--color-accent-soft)",
      fg: "var(--color-accent-ink)",
      label: "Interviewing",
    },
    shortlisted: {
      bg: "var(--color-jade-soft)",
      fg: "var(--color-jade-ink)",
      label: "Shortlisted",
    },
    hired: {
      bg: "var(--color-ink)",
      fg: "var(--color-surface)",
      label: "Hired",
    },
    completed: {
      bg: "#7c3aed",
      fg: "#fff",
      label: "Completed",
    },
    rejected: {
      bg: "var(--color-muted)",
      fg: "var(--color-ink-mute)",
      label: "Not selected",
    },
    offered: {
      bg: "var(--color-accent-soft)",
      fg: "var(--color-accent-ink)",
      label: "Offer sent",
    },
  };

function sc(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.applied;
}

export default async function ApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ gig?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/singpass?next=/applicants");

  const { gig: filterGigId } = await searchParams;

  // All applications across all gigs this employer posted
  const { data: apps } = await supabase
    .from("applications")
    .select(
      `id, status, created_at, cover_note,
       gigs!inner(id, title, status, employer_id),
       applicant:profiles!applications_applicant_id_fkey(id, handle, display_name, headline, singpass_verified_at)`,
    )
    .eq("gigs.employer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  const myGigs = await supabase
    .from("gigs")
    .select("id, title, status")
    .eq("employer_id", user.id)
    .order("created_at", { ascending: false });

  const applications = apps ?? [];
  const openGigs = (myGigs.data ?? []).filter((g) => g.status === "open");

  // Ratings the employer has already submitted
  const appIds = applications.map((a) => a.id);
  const { data: myRatings } = appIds.length > 0
    ? await supabase.from("ratings").select("application_id").eq("from_id", user.id).in("application_id", appIds)
    : { data: [] };
  const ratedAppIds = new Set((myRatings ?? []).map((r: any) => r.application_id));

  // Build per-worker set of gig IDs they've already applied to (among this employer's gigs)
  const appliedByWorker = new Map<string, Set<string>>();
  for (const a of applications) {
    const gig = a.gigs as any;
    const applicant = a.applicant as any;
    const wId = applicant?.id as string | undefined;
    const gId = gig?.id as string | undefined;
    if (wId && gId) {
      if (!appliedByWorker.has(wId)) appliedByWorker.set(wId, new Set());
      appliedByWorker.get(wId)!.add(gId);
    }
  }

  // Group by gig
  const byGig = new Map<
    string,
    { title: string; status: string; apps: (typeof applications)[number][] }
  >();
  for (const a of applications) {
    const gig = a.gigs as any;
    if (!byGig.has(gig.id)) byGig.set(gig.id, { title: gig.title, status: gig.status, apps: [] });
    byGig.get(gig.id)!.apps.push(a);
  }

  const counts = {
    all: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    interviewing: applications.filter((a) => a.status === "interviewing").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    hired: applications.filter((a) => a.status === "hired").length,
  };

  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          marginBottom: 36,
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
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
            Employer · Talent pipeline
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
            All applicants,{" "}
            <span style={{ color: "var(--color-accent-ink)" }}>ranked.</span>
          </h1>
        </div>
        <Link
          href="/gigs/new"
          style={{
            padding: "10px 22px",
            borderRadius: 999,
            background: "var(--color-ink)",
            color: "var(--color-surface)",
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          + Post assignment
        </Link>
      </header>

      {/* Status summary pills */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 32,
          flexWrap: "wrap",
        }}
      >
        {[
          { key: "all", label: "All", count: counts.all },
          { key: "applied", label: "Applied", count: counts.applied },
          {
            key: "interviewing",
            label: "Interviewing",
            count: counts.interviewing,
          },
          {
            key: "shortlisted",
            label: "Shortlisted",
            count: counts.shortlisted,
          },
          { key: "hired", label: "Hired", count: counts.hired },
        ].map((s) => (
          <span
            key={s.key}
            style={{
              padding: "7px 16px",
              borderRadius: 999,
              border: "1px solid var(--color-line)",
              fontSize: 13,
              fontWeight: 600,
              background: "var(--color-surface-raised)",
              color: "var(--color-ink)",
            }}
          >
            {s.label}
            <span
              style={{
                marginLeft: 8,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--color-ink-soft)",
              }}
            >
              {s.count}
            </span>
          </span>
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
            No applicants yet.
          </p>
          <p style={{ color: "var(--color-ink-soft)", fontSize: 14, margin: "0 0 24px" }}>
            Post an open assignment to start receiving applications.
          </p>
          <Link
            href="/gigs/new"
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              background: "var(--color-ink)",
              color: "var(--color-surface)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Post an assignment →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {filterGigId && byGig.has(filterGigId) && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 10, background: "var(--color-accent-soft)", color: "var(--color-accent-ink)", fontSize: 13 }}>
              <span>Showing applicants for: <b>{byGig.get(filterGigId)!.title}</b></span>
              <Link href="/applicants" style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "var(--color-accent-ink)", textDecoration: "underline" }}>
                Show all
              </Link>
            </div>
          )}
          {Array.from(byGig.entries()).filter(([gigId]) => !filterGigId || gigId === filterGigId).map(([gigId, { title, status: gigStatus, apps: gigApps }]) => (
            <section key={gigId}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 14,
                  flexWrap: "wrap",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    margin: 0,
                    letterSpacing: "-0.02em",
                    opacity: gigStatus !== "open" ? 0.55 : 1,
                  }}
                >
                  {title}
                </h2>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--color-ink-soft)",
                    padding: "3px 10px",
                    borderRadius: 999,
                    border: "1px solid var(--color-line)",
                  }}
                >
                  {gigApps.length} applicant{gigApps.length !== 1 ? "s" : ""}
                </span>
                {gigStatus !== "open" && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {gigStatus}
                  </span>
                )}
                <Link
                  href={`/gigs/${gigId}`}
                  style={{
                    fontSize: 12,
                    color: "var(--color-ink-soft)",
                    textDecoration: "underline",
                    marginLeft: 4,
                  }}
                >
                  View gig →
                </Link>
                {gigStatus === "open" && (
                  <span style={{ marginLeft: "auto" }}>
                    <CloseGigButton gigId={gigId} />
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: 14,
                }}
              >
                {gigApps.map((a) => {
                  const applicant = a.applicant as any;
                  const config = sc(a.status);
                  const aName = applicant?.display_name ?? "?";
                  const initials = aName
                    .split(" ")
                    .map((s: string) => s[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const AVATAR_HUES = [250, 165, 340, 38, 260, 200, 78, 310, 190, 50];
                  const aHue = AVATAR_HUES[(aName.charCodeAt(0) + (aName.charCodeAt(1) || 0)) % AVATAR_HUES.length];
                  const isVerified = Boolean(applicant?.singpass_verified_at);

                  return (
                    <article
                      key={a.id}
                      style={{
                        padding: 20,
                        borderRadius: 18,
                        background: "var(--color-surface-raised)",
                        border: "1px solid var(--color-line)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "start",
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: `oklch(78% 0.08 ${aHue})`,
                            color: `oklch(22% 0.08 ${aHue})`,
                            display: "grid",
                            placeItems: "center",
                            fontSize: 14,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontWeight: 700,
                                fontSize: 15,
                              }}
                            >
                              {applicant?.display_name ?? "Applicant"}
                            </p>
                            {isVerified && (
                              <span
                                style={{
                                  fontSize: 10,
                                  padding: "2px 7px",
                                  borderRadius: 999,
                                  background: "var(--color-jade-soft)",
                                  color: "var(--color-jade-ink)",
                                  fontWeight: 700,
                                  letterSpacing: "0.08em",
                                  textTransform: "uppercase",
                                }}
                              >
                                Singpass ✓
                              </span>
                            )}
                          </div>
                          {applicant?.headline && (
                            <p
                              style={{
                                margin: "3px 0 0",
                                fontSize: 12.5,
                                color: "var(--color-ink-soft)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {applicant.headline}
                            </p>
                          )}
                        </div>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: config.bg,
                            color: config.fg,
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            flexShrink: 0,
                          }}
                        >
                          {config.label}
                        </span>
                      </div>

                      {a.cover_note && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            color: "var(--color-ink-soft)",
                            lineHeight: 1.55,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          } as React.CSSProperties}
                        >
                          &ldquo;{a.cover_note}&rdquo;
                        </p>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: "var(--color-ink-mute)",
                          }}
                        >
                          {timeAgo(a.created_at)}
                        </span>
                        <div style={{ display: "flex", gap: 8 }}>
                          {applicant?.handle && (
                            <Link
                              href={`/profile/${applicant.handle}`}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 999,
                                border: "1px solid var(--color-line)",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              Profile
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
                            Review →
                          </Link>
                        </div>
                      </div>
                      {a.status === "hired" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          <MarkCompletedButton applicationId={a.id} />
                          <RehireForm
                            workerId={applicant?.id}
                            workerName={applicant?.display_name ?? "this worker"}
                            openGigs={openGigs.filter(
                              (g) => !appliedByWorker.get(applicant?.id)?.has(g.id),
                            )}
                          />
                        </div>
                      )}
                      {a.status === "completed" && !ratedAppIds.has(a.id) && (
                        <Link
                          href={`/rate/${a.id}`}
                          style={{ display: "block", textAlign: "center", padding: "9px 14px", borderRadius: 999, background: "#7c3aed", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
                        >
                          ★ Rate this worker
                        </Link>
                      )}
                      {a.status === "completed" && ratedAppIds.has(a.id) && (
                        <p style={{ fontSize: 12, color: "#7c3aed", textAlign: "center", margin: 0, fontWeight: 600 }}>
                          ✓ Reviewed
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
