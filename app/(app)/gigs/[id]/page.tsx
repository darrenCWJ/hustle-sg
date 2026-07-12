import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatSgd, timeAgo } from "@/lib/utils";
import { ReportButton } from "@/components/safety/ReportButton";
import { applyToGig } from "./actions";
import { RecommendedCandidates } from "./RecommendedCandidates";

export default async function GigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: gig } = await supabase
    .from("gigs")
    .select(
      "*, employer:profiles!gigs_employer_id_fkey(id, handle, display_name, headline, singpass_verified_at)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!gig) notFound();

  const { data: questions } = await supabase
    .from("interview_questions")
    .select("*")
    .eq("gig_id", id)
    .order("display_order");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let existingApp: { id: string; status: string } | null = null;
  let userRole: string | null = null;
  if (user) {
    const [appRes, profileRes] = await Promise.all([
      supabase
        .from("applications")
        .select("id, status")
        .eq("gig_id", id)
        .eq("applicant_id", user.id)
        .maybeSingle(),
      supabase.from("profiles").select("role").eq("id", user.id).single(),
    ]);
    existingApp = appRes.data;
    userRole = profileRes.data?.role ?? null;
  }

  const isOwnGig = !!user && user.id === gig.employer_id;
  const isEmployerOnly = userRole === "employer";
  const employerVerified = Boolean(gig.employer?.singpass_verified_at);
  const isClosed = gig.applications_close_at
    ? new Date(gig.applications_close_at) < new Date()
    : false;

  function formatDeadline(iso: string) {
    return new Date(iso).toLocaleString("en-SG", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Singapore",
    });
  }
  const [similarGigsRes, { count: applicantCount }] = await Promise.all([
    supabase
      .from("gigs")
      .select("id, title, budget_cents, budget_kind, category")
      .eq("status", "open")
      .eq("category", gig.category ?? "")
      .neq("id", id)
      .limit(2),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("gig_id", id),
  ]);
  const similarGigs = similarGigsRes.data ?? [];

  type MatchedCandidate = { user_id: string; handle: string | null; display_name: string; headline: string | null; score: number };
  let recommendedCandidates: MatchedCandidate[] = [];
  let existingApplicantIds: string[] = [];

  if (isOwnGig) {
    const [matchRes, appsRes] = await Promise.all([
      supabase.rpc("match_users_for_gig", { p_gig_id: id, p_limit: 8 }),
      supabase.from("applications").select("applicant_id").eq("gig_id", id),
    ]);
    recommendedCandidates = (matchRes.data ?? []) as MatchedCandidate[];
    existingApplicantIds = ((appsRes.data ?? []) as { applicant_id: string }[]).map((a) => a.applicant_id);
  }

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 28px 80px" }}>
      <Link
        href="/gigs"
        style={{
          fontSize: 12,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--color-ink-soft)",
          marginBottom: 30,
          fontWeight: 600,
          display: "inline-block",
        }}
      >
        ← All gigs
      </Link>

      {/* Header */}
      <header style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 10.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: "var(--color-ink-soft)",
            }}
          >
            {gig.category ?? "Gig"} · {gig.location ?? "Remote"}
          </span>
          <span style={{ fontSize: 11, color: "var(--color-ink-mute)" }}>· {timeAgo(gig.created_at)}</span>
          {user && !isOwnGig && (
            <ReportButton targetKind="gig" targetId={gig.id} targetLabel="this gig" />
          )}
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.2rem, 4vw, 3.6rem)",
            margin: "0 0 16px",
            lineHeight: 1,
            letterSpacing: "-0.035em",
            maxWidth: "22ch",
          }}
        >
          {gig.title}
        </h1>

        {/* Duration strip */}
        <div
          style={{
            display: "flex",
            gap: 20,
            alignItems: "center",
            flexWrap: "wrap",
            padding: "14px 20px",
            borderRadius: 14,
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-line)",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          <div>
            <span style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-soft)", fontWeight: 600 }}>Budget</span>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, margin: "2px 0 0" }}>
              {formatSgd(gig.budget_cents)}
            </p>
          </div>
          <span style={{ width: 1, height: 32, background: "var(--color-line)" }} />
          <div>
            <span style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-soft)", fontWeight: 600 }}>Kind</span>
            <p style={{ fontSize: 14, fontWeight: 600, margin: "2px 0 0", textTransform: "capitalize" }}>
              {gig.budget_kind}
            </p>
          </div>
          <span style={{ width: 1, height: 32, background: "var(--color-line)" }} />
          <div>
            <span style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-soft)", fontWeight: 600 }}>Category</span>
            <p style={{ fontSize: 14, fontWeight: 600, margin: "2px 0 0", textTransform: "capitalize" }}>
              {gig.category ?? "General"}
            </p>
          </div>
          {gig.location && (
            <>
              <span style={{ width: 1, height: 32, background: "var(--color-line)" }} />
              <div>
                <span style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-soft)", fontWeight: 600 }}>Location</span>
                <p style={{ fontSize: 14, fontWeight: 600, margin: "2px 0 0" }}>
                  {gig.location}
                </p>
              </div>
            </>
          )}
          <>
            <span style={{ width: 1, height: 32, background: "var(--color-line)" }} />
            <div>
              <span style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-soft)", fontWeight: 600 }}>Applicants</span>
              <p style={{ fontSize: 14, fontWeight: 600, margin: "2px 0 0" }}>
                {applicantCount ?? 0}
              </p>
            </div>
          </>
          <>
            <span style={{ width: 1, height: 32, background: "var(--color-line)" }} />
            <div>
              <span style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-soft)", fontWeight: 600 }}>Slots</span>
              <p style={{ fontSize: 14, fontWeight: 600, margin: "2px 0 0" }}>
                {gig.headcount ?? 1}
              </p>
            </div>
          </>
          {gig.applications_close_at && (
            <>
              <span style={{ width: 1, height: 32, background: "var(--color-line)" }} />
              <div>
                <span style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-soft)", fontWeight: 600 }}>Deadline</span>
                <p style={{ fontSize: 14, fontWeight: 600, margin: "2px 0 0", color: isClosed ? "#e55" : "inherit" }}>
                  {isClosed ? "Closed" : formatDeadline(gig.applications_close_at)}
                </p>
              </div>
            </>
          )}
          {(gig.starts_at || gig.duration_label || gig.ends_at) && (
            <>
              <span style={{ width: 1, height: 32, background: "var(--color-line)" }} />
              <div>
                <span style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-soft)", fontWeight: 600 }}>Starts</span>
                <p style={{ fontSize: 14, fontWeight: 600, margin: "2px 0 0" }}>
                  {gig.starts_at
                    ? new Date(gig.starts_at).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })
                    : "ASAP"}
                </p>
              </div>
            </>
          )}
          {gig.duration_label && (
            <>
              <span style={{ width: 1, height: 32, background: "var(--color-line)" }} />
              <div>
                <span style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-soft)", fontWeight: 600 }}>Duration</span>
                <p style={{ fontSize: 14, fontWeight: 600, margin: "2px 0 0" }}>
                  {gig.duration_label}
                  {(gig as any).hours_required ? ` · ${(gig as any).hours_required}h` : ""}
                  {(gig as any).recurrence_cadence ? ` · ${(gig as any).recurrence_cadence}` : ""}
                </p>
              </div>
            </>
          )}
          {gig.ends_at && !gig.duration_label && (
            <>
              <span style={{ width: 1, height: 32, background: "var(--color-line)" }} />
              <div>
                <span style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-soft)", fontWeight: 600 }}>Ends</span>
                <p style={{ fontSize: 14, fontWeight: 600, margin: "2px 0 0" }}>
                  {new Date(gig.ends_at).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </>
          )}
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 40, alignItems: "start" }}>
        {/* LEFT — content */}
        <article>
          {/* About */}
          <section style={{ marginBottom: 36 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                margin: "0 0 14px",
                letterSpacing: "-0.02em",
              }}
            >
              About this gig
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--color-ink-soft)", whiteSpace: "pre-wrap" }}>
              {gig.description}
            </p>
          </section>

          {/* Milestones */}
          {Array.isArray((gig as any).milestones) && (gig as any).milestones.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: "0 0 14px", letterSpacing: "-0.02em" }}>
                Milestones
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 0, borderLeft: "2px solid var(--color-line)", paddingLeft: 18 }}>
                {((gig as any).milestones as { name: string; due_date: string }[]).map((ms, i) => (
                  <div key={i} style={{ position: "relative", paddingBottom: 16 }}>
                    <span style={{ position: "absolute", left: -25, top: 4, width: 10, height: 10, borderRadius: "50%", background: "var(--color-ink)", border: "2px solid var(--color-surface)" }} />
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{ms.name}</p>
                    {ms.due_date && (
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-ink-mute)", fontFamily: "var(--font-mono)" }}>
                        Due {new Date(ms.due_date).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {gig.skills_required.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  margin: "0 0 14px",
                  letterSpacing: "-0.02em",
                }}
              >
                Skills required
              </h2>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {gig.skills_required.map((s: string) => (
                  <span
                    key={s}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 999,
                      border: "1px solid var(--color-line)",
                      background: "transparent",
                      color: "var(--color-ink-soft)",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Async interview */}
          {questions && questions.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  margin: "0 0 8px",
                  letterSpacing: "-0.02em",
                }}
              >
                Async interview
              </h2>
              <p style={{ color: "var(--color-ink-soft)", fontSize: 14, margin: "0 0 18px" }}>
                When you apply, record {questions.length} short video answer{questions.length > 1 ? "s" : ""} on your own time.
              </p>
              <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {questions.map((q: any, i: number) => (
                  <li
                    key={q.id}
                    style={{
                      padding: 18,
                      borderRadius: 14,
                      border: "1px solid var(--color-line)",
                      background: "var(--color-surface-raised)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)" }}>
                        Q{i + 1} · {q.max_duration_sec}s · video
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-mute)" }}>
                        video answer
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>{q.prompt}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Similar gigs */}
          {similarGigs.length > 0 && (
            <section>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  margin: "0 0 14px",
                  letterSpacing: "-0.02em",
                }}
              >
                Similar gigs
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {similarGigs.map((g: any) => (
                  <Link
                    key={g.id}
                    href={`/gigs/${g.id}`}
                    style={{
                      padding: 16,
                      borderRadius: 14,
                      border: "1px solid var(--color-line)",
                      background: "var(--color-surface-raised)",
                      display: "block",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 17,
                        margin: "0 0 6px",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.2,
                      }}
                    >
                      {g.title}
                    </p>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, margin: 0 }}>
                      {formatSgd(g.budget_cents)}{" "}
                      <span style={{ fontSize: 11, color: "var(--color-ink-soft)", fontWeight: 400 }}>{g.budget_kind}</span>
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* RIGHT — apply panel */}
        <aside style={{ position: "sticky", top: 90, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Employer card (dark) */}
          <div
            className="grain"
            style={{
              borderRadius: 20,
              background: "var(--color-ink)",
              color: "var(--color-surface)",
              padding: 22,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <p style={{ fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 600, margin: "0 0 12px" }}>
              Posted by
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "oklch(78% 0.08 200)",
                  color: "oklch(22% 0.08 200)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  flexShrink: 0,
                }}
              >
                {(gig.employer?.display_name ?? "?")
                  .split(" ")
                  .map((s: string) => s[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, letterSpacing: "-0.02em" }}>
                  {gig.employer?.handle ? (
                    <Link href={`/profile/${gig.employer.handle}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {gig.employer.display_name}
                    </Link>
                  ) : gig.employer?.display_name}
                </p>
                <p style={{ fontSize: 12, color: "oklch(100% 0 0 / 0.65)", margin: "2px 0 0" }}>
                  {employerVerified ? "Singpass-verified" : "Unverified"}
                </p>
              </div>
            </div>

            {/* Apply form */}
            <div>
              {isClosed ? (
                <div
                  style={{
                    background: "oklch(100% 0 0 / 0.08)",
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 13,
                    textAlign: "center",
                    color: "oklch(100% 0 0 / 0.65)",
                  }}
                >
                  <p style={{ margin: "0 0 4px", fontWeight: 600 }}>Applications closed</p>
                  <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>
                    Closed {formatDeadline(gig.applications_close_at!)}
                  </p>
                </div>
              ) : existingApp ? (
                <div
                  style={{
                    background: "oklch(100% 0 0 / 0.08)",
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 13,
                  }}
                >
                  Applied ·{" "}
                  <span
                    style={{
                      color: "var(--color-accent)",
                      fontSize: 11,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                    }}
                  >
                    {existingApp.status}
                  </span>
                  {questions && questions.length > 0 && (
                    <Link
                      href={`/interviews/${existingApp.id}`}
                      style={{
                        display: "block",
                        marginTop: 10,
                        padding: "8px 0",
                        borderRadius: 999,
                        background: "var(--color-accent)",
                        color: "oklch(22% 0.08 38)",
                        fontSize: 13,
                        fontWeight: 600,
                        textAlign: "center",
                      }}
                    >
                      Record interview →
                    </Link>
                  )}
                </div>
              ) : isOwnGig ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ fontSize: 13, color: "oklch(100% 0 0 / 0.5)", textAlign: "center", margin: 0 }}>
                    This is your gig
                  </p>
                  {gig.status === "open" && (
                    <Link
                      href={`/gigs/${gig.id}/edit`}
                      style={{
                        display: "block",
                        padding: "10px 0",
                        borderRadius: 999,
                        border: "1px solid oklch(100% 0 0 / 0.25)",
                        color: "var(--color-surface)",
                        fontSize: 13,
                        fontWeight: 600,
                        textAlign: "center",
                        textDecoration: "none",
                      }}
                    >
                      Edit gig
                    </Link>
                  )}
                </div>
              ) : isEmployerOnly ? (
                <p style={{ fontSize: 13, color: "oklch(100% 0 0 / 0.5)", textAlign: "center", margin: 0 }}>
                  Switch to a worker account to apply
                </p>
              ) : user ? (
                <form action={applyToGig.bind(null, gig.id)} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <textarea
                    name="cover_note"
                    rows={3}
                    placeholder="Short cover note (optional)…"
                    style={{
                      width: "100%",
                      background: "oklch(100% 0 0 / 0.05)",
                      border: "1px solid oklch(100% 0 0 / 0.15)",
                      color: "var(--color-surface)",
                      borderRadius: 12,
                      padding: "10px 12px",
                      fontSize: 13,
                      resize: "vertical",
                      fontFamily: "var(--font-sans)",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "10px 0",
                      borderRadius: 999,
                      background: "var(--color-accent)",
                      color: "oklch(22% 0.08 38)",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Apply →
                  </button>
                  <p style={{ fontSize: 11, color: "oklch(100% 0 0 / 0.5)", margin: 0, textAlign: "center" }}>
                    {questions && questions.length > 0
                      ? `You'll record ${questions.length} video answer${questions.length > 1 ? "s" : ""} as part of applying`
                      : "Your application will be sent directly to the employer"}
                  </p>
                </form>
              ) : (
                <Link
                  href={`/singpass?next=/gigs/${gig.id}`}
                  style={{
                    display: "block",
                    padding: "10px 0",
                    borderRadius: 999,
                    background: "var(--color-accent)",
                    color: "oklch(22% 0.08 38)",
                    fontSize: 14,
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  Log in to apply
                </Link>
              )}
            </div>
          </div>

          {/* Safety & payments (jade card) */}
          <div
            style={{
              padding: 18,
              borderRadius: 16,
              background: "var(--color-jade-soft)",
              border: "1px solid oklch(from var(--color-jade) l c h / 0.3)",
            }}
          >
            <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-jade-ink)", margin: "0 0 10px" }}>
              Safety & payments
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7, fontSize: 13, color: "var(--color-jade-ink)" }}>
              <li>Agree scope and price with the employer before you start</li>
              <li>Payment is arranged directly between you and the employer</li>
              <li>HustleSG does not hold funds or process payments yet</li>
            </ul>
          </div>
        </aside>
      </div>

      {isOwnGig && recommendedCandidates.length > 0 && (
        <RecommendedCandidates
          candidates={recommendedCandidates}
          gigId={id}
          existingApplicantIds={existingApplicantIds}
        />
      )}
    </main>
  );
}
