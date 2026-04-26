import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatSgd, timeAgo } from "@/lib/utils";
import { DashboardCalendar } from "@/components/dashboard/DashboardCalendar";
import { loadAvailability } from "@/app/actions/availability";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/singpass?next=/dashboard");

  const [myAppsRes, myPostedGigsRes, appsOnMyGigsRes, profileRes, savedSlots] = await Promise.all([
    supabase
      .from("applications")
      .select("id, status, created_at, gigs(id, title, employer_id)")
      .eq("applicant_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("gigs")
      .select("id, title, status, created_at")
      .eq("employer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("applications")
      .select(
        "id, status, created_at, applicant:profiles!applications_applicant_id_fkey(handle, display_name, headline), gigs!inner(id, title, employer_id)",
      )
      .eq("gigs.employer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase.from("profiles").select("display_name, handle").eq("id", user.id).single(),
    loadAvailability(),
  ]);

  const myApps = myAppsRes.data ?? [];
  const myPostedGigs = myPostedGigsRes.data ?? [];
  const appsOnMyGigs = appsOnMyGigsRes.data ?? [];
  const profile = profileRes.data;

  const statusConfig: Record<string, { bg: string; fg: string; label: string }> = {
    applied: { bg: "var(--color-muted)", fg: "var(--color-ink-soft)", label: "Applied" },
    shortlisted: { bg: "var(--color-jade-soft)", fg: "var(--color-jade-ink)", label: "Shortlisted" },
    interview_pending: { bg: "var(--color-accent-soft)", fg: "var(--color-accent-ink)", label: "Interview sent" },
    hired: { bg: "var(--color-ink)", fg: "var(--color-surface)", label: "Hired" },
    declined: { bg: "var(--color-muted)", fg: "var(--color-ink-mute)", label: "Declined" },
  };

  function getStatusConfig(status: string) {
    return statusConfig[status] ?? statusConfig.applied;
  }

  function getAppStep(status: string) {
    if (status === "hired") return 4;
    if (status === "interview_pending") return 3;
    if (status === "shortlisted") return 2;
    return 1;
  }

  const weekNum = Math.ceil((new Date().getDate()) / 7);

  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 36, gap: 20, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 8px" }}>
            Dashboard · Week {weekNum}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 4vw, 4rem)",
              margin: 0,
              lineHeight: 0.98,
              letterSpacing: "-0.035em",
            }}
          >
            Your gig work,{" "}
            <span style={{ color: "var(--color-accent-ink)" }}>tracked</span>.
          </h1>
        </div>
        <Link
          href="/gigs/new"
          style={{
            padding: "10px 20px",
            borderRadius: 999,
            background: "var(--color-ink)",
            color: "var(--color-surface)",
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          + Post an assignment
        </Link>
      </header>

      {/* Top row: earnings + streak + profile completion */}
      <section style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 16, marginBottom: 40 }}>
        {/* Earnings card — dark */}
        <div
          className="grain"
          style={{
            padding: 28,
            borderRadius: 22,
            background: "var(--color-ink)",
            color: "var(--color-surface)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 600, margin: "0 0 10px" }}>
            Applications · this month
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 52, letterSpacing: "-0.04em", lineHeight: 1 }}>
              {myApps.length}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-accent)" }}>active</span>
          </div>
          <p style={{ fontSize: 12, color: "oklch(100% 0 0 / 0.55)", margin: "8px 0 0" }}>
            Track your gig applications and inbound interest
          </p>
          {/* Mini bar chart */}
          <div style={{ marginTop: 22, display: "flex", alignItems: "end", gap: 5, height: 60 }}>
            {[0.3, 0.5, 0.4, 0.7, 0.6, 0.8, 0.9, 1.0, 0.85, 0.95, 0.7, myApps.length > 0 ? 1 : 0.3].map(
              (v, i, arr) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${v * 100}%`,
                    background: i === arr.length - 1 ? "var(--color-accent)" : "oklch(100% 0 0 / 0.2)",
                    borderRadius: 4,
                  }}
                />
              ),
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 10, color: "oklch(100% 0 0 / 0.4)", marginTop: 6 }}>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
          </div>
        </div>

        {/* Posted gigs card — accent */}
        <div style={{ padding: 24, borderRadius: 22, background: "var(--color-accent-soft)", color: "var(--color-accent-ink)" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-accent-ink)", margin: "0 0 10px" }}>
            Gigs posted
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 52, letterSpacing: "-0.04em", lineHeight: 1 }}>
              {myPostedGigs.length}
            </span>
            <span style={{ fontSize: 14 }}>assignments</span>
          </div>
          <p style={{ fontSize: 12.5, margin: "8px 0 14px", opacity: 0.85 }}>
            {myPostedGigs.length > 0
              ? "Track responses and shortlist applicants."
              : "Post your first assignment to start receiving applications."}
          </p>
          <div style={{ display: "flex", gap: 3 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 2,
                  background: "var(--color-accent-ink)",
                  opacity: i < myPostedGigs.length ? 0.9 : 0.15,
                }}
              />
            ))}
          </div>
        </div>

        {/* Profile completion */}
        <div
          style={{
            padding: 24,
            borderRadius: 22,
            border: "1px solid var(--color-line)",
            background: "var(--color-surface-raised)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 10px" }}>
            Profile
          </p>
          {profile ? (
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                {profile.display_name}
              </p>
              <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: "0 0 16px" }}>
                @{profile.handle}
              </p>
            </div>
          ) : (
            <p style={{ color: "var(--color-ink-soft)", fontSize: 13 }}>No profile yet</p>
          )}
          <Link
            href={profile ? `/profile/${profile.handle}` : "/profile/edit"}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid var(--color-line)",
              fontSize: 13,
              fontWeight: 600,
              textAlign: "center",
              display: "block",
            }}
          >
            {profile ? "View profile →" : "Set up profile →"}
          </Link>
        </div>
      </section>

      {/* Calendar + Matches */}
      <div style={{ marginBottom: 40 }}>
        <DashboardCalendar initialSlots={savedSlots} authenticated />
      </div>

      {/* Applications + Inbound */}
      <section style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20, marginBottom: 40 }}>
        {/* Your applications */}
        <div
          style={{
            padding: 26,
            borderRadius: 22,
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-line)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: 0, letterSpacing: "-0.025em" }}>
              Your applications
            </h2>
            <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>{myApps.length} active</span>
          </div>

          {myApps.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {myApps.map((a: any) => {
                const sc = getStatusConfig(a.status);
                const step = getAppStep(a.status);
                const steps = ["Applied", "Shortlisted", "Interview", "Offer"];
                return (
                  <li
                    key={a.id}
                    style={{
                      padding: 16,
                      borderRadius: 14,
                      border: "1px solid var(--color-line)",
                      background: "var(--color-surface)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10, marginBottom: 12 }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                          {a.gigs?.title ?? "Untitled gig"}
                        </p>
                        <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--color-ink-soft)" }}>
                          Applied {timeAgo(a.created_at)}
                        </p>
                      </div>
                      <span
                        className="pill"
                        style={{ background: sc.bg, color: sc.fg, flexShrink: 0 }}
                      >
                        {sc.label}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
                      {steps.map((s, i) => (
                        <div key={s}>
                          <div
                            style={{
                              height: 4,
                              borderRadius: 999,
                              background:
                                i < step - 1
                                  ? "var(--color-ink)"
                                  : i === step - 1
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
                              color: i < step ? "var(--color-ink)" : "var(--color-ink-mute)",
                              fontWeight: 600,
                            }}
                          >
                            {s}
                          </p>
                        </div>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div style={{ padding: "24px 0", textAlign: "center" }}>
              <p style={{ color: "var(--color-ink-soft)", fontSize: 14 }}>No applications yet.</p>
              <Link
                href="/gigs"
                style={{
                  display: "inline-block",
                  marginTop: 12,
                  padding: "8px 16px",
                  borderRadius: 999,
                  background: "var(--color-ink)",
                  color: "var(--color-surface)",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Browse assignments →
              </Link>
            </div>
          )}
        </div>

        {/* Inbound applicants */}
        <div
          style={{
            padding: 26,
            borderRadius: 22,
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-line)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: 0, letterSpacing: "-0.025em" }}>
              Applicants
            </h2>
            {appsOnMyGigs.length > 0 && (
              <span style={{ fontSize: 12, color: "var(--color-accent-ink)", fontWeight: 600 }}>
                {appsOnMyGigs.length} new
              </span>
            )}
          </div>

          {appsOnMyGigs.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {appsOnMyGigs.map((a: any) => {
                const initials = (a.applicant?.display_name ?? "?")
                  .split(" ")
                  .map((s: string) => s[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <li
                    key={a.id}
                    style={{
                      padding: 14,
                      borderRadius: 14,
                      border: "1px solid var(--color-line)",
                      background: "var(--color-surface)",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "oklch(78% 0.08 165)",
                        color: "oklch(22% 0.08 165)",
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
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                        {a.applicant?.display_name ?? "Applicant"}
                      </p>
                      {a.applicant?.headline && (
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 12,
                            color: "var(--color-ink-soft)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {a.applicant.headline}
                        </p>
                      )}
                      <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--color-ink-mute)" }}>
                        {timeAgo(a.created_at)}
                      </p>
                    </div>
                    <Link
                      href={`/interviews/${a.id}`}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        border: "1px solid var(--color-line)",
                        fontSize: 12,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Review →
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div style={{ padding: "24px 0", textAlign: "center" }}>
              <p style={{ color: "var(--color-ink-soft)", fontSize: 14 }}>
                No applicants yet.
              </p>
              <Link
                href="/gigs/new"
                style={{
                  display: "inline-block",
                  marginTop: 12,
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "1px solid var(--color-line)",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Post an assignment →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Activity + Next steps */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Activity */}
        <div
          style={{
            padding: 26,
            borderRadius: 22,
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-line)",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: "0 0 18px", letterSpacing: "-0.02em" }}>
            Recent activity
          </h2>
          {myApps.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 0 }}>
              {myApps.slice(0, 4).map((a: any, i: number) => {
                const sc = getStatusConfig(a.status);
                return (
                  <li
                    key={a.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 4px",
                      borderBottom: i < Math.min(myApps.length, 4) - 1 ? "1px dashed var(--color-line)" : "none",
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-jade)", flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: 13.5, flex: 1 }}>
                      <b>{a.gigs?.title ?? "Gig"}</b>
                      <span style={{ color: "var(--color-ink-soft)" }}> · {sc.label}</span>
                    </p>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-mute)" }}>
                      {timeAgo(a.created_at)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p style={{ color: "var(--color-ink-soft)", fontSize: 14 }}>
              No activity yet. Apply to gigs to see your history here.
            </p>
          )}
        </div>

        {/* Next steps — dark */}
        <div
          className="grain"
          style={{
            padding: 26,
            borderRadius: 22,
            background: "var(--color-ink)",
            color: "var(--color-surface)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 600, margin: "0 0 10px" }}>
            What&apos;s next
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: "0 0 20px", letterSpacing: "-0.025em" }}>
            Your <span style={{ color: "var(--color-accent)" }}>2026</span> playbook.
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { t: "Complete your profile to get matched to more gigs", cta: "Edit profile", href: "/profile/edit" },
              { t: "Browse open assignments and find your next gig", cta: "Browse gigs", href: "/gigs" },
              { t: "Ready to go full-time? Register your business", cta: "Start guide", href: "/start-a-business" },
            ].map((s, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 0",
                  borderTop: "1px solid oklch(100% 0 0 / 0.1)",
                }}
              >
                <span style={{ fontSize: 14, color: "oklch(100% 0 0 / 0.85)" }}>{s.t}</span>
                <Link
                  href={s.href}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: i === 0 ? "var(--color-accent)" : "oklch(100% 0 0 / 0.1)",
                    color: i === 0 ? "oklch(22% 0.08 38)" : "var(--color-surface)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.cta}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
