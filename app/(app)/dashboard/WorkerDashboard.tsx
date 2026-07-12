import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/utils";
import { DashboardCalendar, type RecommendedGig, type BookedGig } from "@/components/dashboard/DashboardCalendar";
import { NotificationsToggle } from "@/components/notifications/NotificationsToggle";
import { ActionNeeded } from "@/components/dashboard/ActionNeeded";
import { matchGigsForUser } from "@/lib/ai/match";

const STATUS_CONFIG: Record<string, { bg: string; fg: string; label: string }> = {
  applied:      { bg: "var(--color-muted)",       fg: "var(--color-ink-soft)",  label: "Applied"        },
  interviewing: { bg: "oklch(92% 0.06 250)",       fg: "oklch(35% 0.14 250)",   label: "Interviewing"   },
  shortlisted:  { bg: "var(--color-jade-soft)",   fg: "var(--color-jade-ink)",  label: "Shortlisted"    },
  offered:      { bg: "var(--color-accent-soft)", fg: "var(--color-accent-ink)", label: "Offer received" },
  hired:        { bg: "var(--color-ink)",          fg: "var(--color-surface)",   label: "Hired"          },
  rejected:     { bg: "var(--color-muted)",        fg: "var(--color-ink-mute)",  label: "Not selected"   },
  withdrawn:    { bg: "var(--color-muted)",        fg: "var(--color-ink-mute)",  label: "Withdrawn"      },
};

const STEPS = ["Applied", "Interview", "Shortlisted", "Offer", "Hired"];

function getStep(status: string) {
  if (status === "hired") return 5;
  if (status === "offered") return 4;
  if (status === "shortlisted") return 3;
  if (status === "interviewing") return 2;
  return 1;
}

async function CalendarSection({ userId, savedSlots }: { userId: string; savedSlots: number[][] | null }) {
  const supabase = await createClient();

  const [gigsRes, bookedRes, matchedRpc] = await Promise.all([
    supabase
      .from("gigs")
      .select("id, title, category, budget_cents, budget_kind, location, is_instant, instant_urgency, starts_at, duration_label, start_time, end_time, days_of_week")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("applications")
      .select("gigs(id, title, start_time, end_time, days_of_week)")
      .eq("applicant_id", userId)
      .eq("status", "hired"),
    matchGigsForUser(userId, 10).catch(() => []),
  ]);

  const bookedGigs: BookedGig[] = (bookedRes.data ?? [])
    .map((a: any) => a.gigs)
    .filter(Boolean) as BookedGig[];

  const basicMap = new Map((gigsRes.data ?? []).map((g: any) => [g.id, g]));

  let openGigs: RecommendedGig[];
  if (matchedRpc.length > 0) {
    openGigs = (matchedRpc as any[]).map((m: any) => {
      const basic = basicMap.get(m.gig_id) ?? {} as any;
      return {
        id: m.gig_id,
        title: m.title,
        category: m.category ?? null,
        budget_cents: m.budget_cents ?? null,
        budget_kind: m.budget_kind ?? "fixed",
        location: m.location ?? null,
        is_instant: basic.is_instant ?? false,
        instant_urgency: basic.instant_urgency ?? null,
        starts_at: basic.starts_at ?? null,
        duration_label: basic.duration_label ?? null,
        start_time: basic.start_time ?? null,
        end_time: basic.end_time ?? null,
        days_of_week: basic.days_of_week ?? null,
        overlap_skills: m.overlap_skills ?? [],
      } as RecommendedGig;
    });
  } else {
    openGigs = (gigsRes.data ?? []).map((g: any) => ({
      id: g.id,
      title: g.title,
      category: g.category ?? null,
      budget_cents: g.budget_cents ?? null,
      budget_kind: g.budget_kind ?? "fixed",
      location: g.location ?? null,
      is_instant: g.is_instant ?? false,
      instant_urgency: g.instant_urgency ?? null,
      starts_at: g.starts_at ?? null,
      duration_label: g.duration_label ?? null,
      start_time: g.start_time ?? null,
      end_time: g.end_time ?? null,
      days_of_week: g.days_of_week ?? null,
      overlap_skills: [],
    })) as RecommendedGig[];
  }

  return (
    <DashboardCalendar
      initialSlots={savedSlots}
      authenticated
      recommendedGigs={openGigs}
      bookedGigs={bookedGigs}
    />
  );
}

export async function WorkerDashboard({ userId, handle }: { userId: string; handle: string }) {
  const supabase = await createClient();

  const [appsRes, availRes] = await Promise.all([
    supabase
      .from("applications")
      .select("id, status, created_at, gigs(id, title, category, budget_cents, budget_kind, status)")
      .eq("applicant_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("user_availability").select("slots").eq("user_id", userId).maybeSingle(),
  ]);

  const apps = appsRes.data ?? [];
  const savedSlots: number[][] | null = (availRes.data as any)?.slots ?? null;

  // Exclude completed (hired) and terminal applications from the visible list
  const visibleApps = apps.filter((a) => a.status !== "hired");
  const activeApps  = visibleApps.filter((a) => ["applied", "interviewing", "offered"].includes(a.status));
  const hired       = apps.filter((a) => a.status === "hired").length;

  // "Needs your attention": offers waiting, interviews to record, reviews
  // owed on completed gigs, and unread message threads.
  const offersWaiting = apps.filter((a) => a.status === "offered").length;
  const interviewsToRecord = apps.filter((a) => a.status === "interviewing").length;
  const completedIds = apps.filter((a) => a.status === "completed").map((a) => a.id);
  const [{ data: myRatings }, unreadRes] = await Promise.all([
    completedIds.length
      ? supabase
          .from("ratings")
          .select("application_id")
          .eq("from_id", userId)
          .in("application_id", completedIds)
      : Promise.resolve({ data: [] as Array<{ application_id: string }> }),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .neq("sender_id", userId)
      .is("read_at", null),
  ]);
  const ratedIds = new Set((myRatings ?? []).map((r) => r.application_id));
  const reviewsOwed = completedIds.filter((id) => !ratedIds.has(id)).length;

  const actionItems = [
    { count: offersWaiting, label: "offers waiting for your answer", href: "/applications", urgent: true },
    { count: unreadRes.count ?? 0, label: "unread messages", href: "/messages", urgent: true },
    { count: interviewsToRecord, label: "interviews to record", href: "/applications" },
    { count: reviewsOwed, label: "completed gigs awaiting your review", href: "/applications" },
  ];

  return (
    <div>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 40, gap: 20, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 8px" }}>
            Worker dashboard
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 4vw, 4rem)", margin: 0, lineHeight: 0.98, letterSpacing: "-0.035em" }}>
            Your gig work,{" "}
            <span style={{ color: "var(--color-accent-ink)" }}>tracked</span>.
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <NotificationsToggle />
          {handle && (
            <Link href={`/profile/${handle}`} style={{ padding: "9px 18px", borderRadius: 999, border: "1px solid var(--color-line)", fontSize: 13, fontWeight: 600 }}>
              My profile →
            </Link>
          )}
          <Link href="/gigs" style={{ padding: "10px 20px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>
            Browse gigs →
          </Link>
        </div>
      </header>

      <ActionNeeded items={actionItems} />

      {/* KPI tiles */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 36 }}>
        <div className="grain" style={{ padding: "22px 24px", borderRadius: 18, background: "var(--color-ink)", color: "var(--color-surface)" }}>
          <p style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-accent)", margin: 0, fontWeight: 600 }}>
            Applications sent
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 52, margin: "6px 0 0", letterSpacing: "-0.04em", lineHeight: 1 }}>
            {apps.length}
          </p>
          <p style={{ fontSize: 12, color: "oklch(100% 0 0 / 0.5)", margin: "4px 0 0", fontFamily: "var(--font-mono)" }}>total</p>
        </div>
        <div style={{ padding: "22px 24px", borderRadius: 18, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
          <p style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-ink-soft)", margin: 0, fontWeight: 600 }}>
            Active
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 52, margin: "6px 0 0", letterSpacing: "-0.04em", lineHeight: 1 }}>
            {activeApps.length}
          </p>
          <p style={{ fontSize: 12, color: "var(--color-ink-mute)", margin: "4px 0 0", fontFamily: "var(--font-mono)" }}>in progress</p>
        </div>
        <div style={{ padding: "22px 24px", borderRadius: 18, background: "var(--color-jade-soft)", border: "1px solid oklch(from var(--color-jade) l c h / 0.3)" }}>
          <p style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-jade-ink)", margin: 0, fontWeight: 600 }}>
            Hired
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 52, margin: "6px 0 0", letterSpacing: "-0.04em", lineHeight: 1, color: "var(--color-jade-ink)" }}>
            {hired}
          </p>
          <p style={{ fontSize: 12, color: "var(--color-jade-ink)", margin: "4px 0 0", fontFamily: "var(--font-mono)", opacity: 0.7 }}>gigs won</p>
        </div>
      </section>

      {/* Applications + playbook side-by-side */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, marginBottom: 36 }}>
        {/* My applications */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: 0, letterSpacing: "-0.025em" }}>
              My applications
            </h2>
            {visibleApps.length > 6 && (
              <Link href="/applications" style={{ fontSize: 12, color: "var(--color-ink-soft)", fontWeight: 600 }}>
                View all →
              </Link>
            )}
          </div>

          {visibleApps.length === 0 ? (
            <div style={{ padding: "40px 24px", borderRadius: 18, border: "1px dashed var(--color-line)", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: "0 0 16px" }}>No applications yet.</p>
              <Link href="/gigs" style={{ padding: "9px 18px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 13, fontWeight: 600 }}>
                Browse open gigs →
              </Link>
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {visibleApps.slice(0, 8).map((a: any) => {
                const conf = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.applied;
                const step = getStep(a.status);
                const isDone = a.status === "rejected" || a.status === "withdrawn";
                return (
                  <li
                    key={a.id}
                    style={{ padding: 16, borderRadius: 14, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)", opacity: isDone ? 0.55 : 1 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10, marginBottom: isDone ? 0 : 12 }}>
                      <div style={{ flex: 1 }}>
                        <Link href={`/gigs/${(a.gigs as any)?.id}`} style={{ fontWeight: 600, fontSize: 14, color: "inherit" }}>
                          {(a.gigs as any)?.title ?? "Untitled gig"}
                        </Link>
                        <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--color-ink-mute)" }}>
                          {[
                            (a.gigs as any)?.category,
                            `Applied ${timeAgo(a.created_at)}`,
                          ].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: conf.bg, color: conf.fg, whiteSpace: "nowrap" }}>
                        {conf.label}
                      </span>
                    </div>

                    {!isDone && (
                      <div style={{ display: "grid", gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`, gap: 4 }}>
                        {STEPS.map((s, i) => (
                          <div key={s}>
                            <div style={{ height: 3, borderRadius: 999, background: i < step - 1 ? "var(--color-ink)" : i === step - 1 ? "var(--color-accent)" : "var(--color-muted)" }} />
                            <p style={{ margin: "4px 0 0", fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: i < step ? "var(--color-ink)" : "var(--color-ink-mute)", fontWeight: 600 }}>
                              {s}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Playbook */}
        <div
          className="grain"
          style={{ padding: 28, borderRadius: 22, background: "var(--color-ink)", color: "var(--color-surface)", position: "relative", overflow: "hidden", alignSelf: "start" }}
        >
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 600, margin: "0 0 10px" }}>
            What&apos;s next
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: "0 0 20px", letterSpacing: "-0.025em" }}>
            Your <span style={{ color: "var(--color-accent)" }}>2026</span> playbook.
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { t: "Complete your profile to get matched to more gigs", cta: "Edit profile", href: "/profile/edit", highlight: false },
              { t: "Browse open assignments and find your next gig",    cta: "Browse gigs",  href: "/gigs",          highlight: true  },
              { t: "Import certs to boost your profile ranking",        cta: "Add certs",    href: "/skillsfuture",  highlight: false },
            ].map((s, i) => (
              <li
                key={i}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 0", borderTop: "1px solid oklch(100% 0 0 / 0.1)" }}
              >
                <span style={{ fontSize: 13, color: "oklch(100% 0 0 / 0.85)", lineHeight: 1.4 }}>{s.t}</span>
                <Link
                  href={s.href}
                  style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 999, background: s.highlight ? "var(--color-accent)" : "oklch(100% 0 0 / 0.12)", color: s.highlight ? "oklch(22% 0.08 38)" : "var(--color-surface)", whiteSpace: "nowrap" }}
                >
                  {s.cta}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Availability calendar + gig recommendations — streams in after AI matching */}
      <section style={{ marginBottom: 0 }}>
        <Suspense fallback={<div className="skeleton" style={{ height: 360, borderRadius: 22 }} />}>
          <CalendarSection userId={userId} savedSlots={savedSlots} />
        </Suspense>
      </section>
    </div>
  );
}
