"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useDemo } from "../DemoProvider";
import { useViewMode } from "../ViewModeContext";
import { GIGS, PROFILES } from "../data";

const STATUS_CONFIG: Record<string, { bg: string; fg: string; label: string }> = {
  applied:     { bg: "var(--color-accent-soft)",       fg: "var(--color-accent-ink)", label: "Applied"     },
  shortlisted: { bg: "var(--color-jade-soft, #dcfce7)", fg: "#166534",               label: "Shortlisted" },
  accepted:    { bg: "var(--color-ink)",               fg: "var(--color-surface)",    label: "Accepted"    },
  rejected:    { bg: "var(--color-muted)",             fg: "var(--color-ink-mute)",   label: "Not selected"},
};

const AVATAR_HUES = [250, 165, 340, 38, 260, 200, 78, 310];
function avatarHue(name: string) {
  return AVATAR_HUES[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_HUES.length];
}

export default function DemoApplicantsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getApplicationsForRequestor, updateApplicationStatus, getMessagesForApplication } = useDemo();
  const { viewMode } = useViewMode();

  const gigFilter = searchParams.get("gig");
  const allApps = getApplicationsForRequestor();
  const filtered = gigFilter ? allApps.filter((a) => a.gigId === gigFilter) : allApps;

  const counts = {
    all: allApps.length,
    applied: allApps.filter((a) => a.status === "applied").length,
    shortlisted: allApps.filter((a) => a.status === "shortlisted").length,
    accepted: allApps.filter((a) => a.status === "accepted").length,
  };

  // Group by gig
  const byGig = new Map<string, { title: string; apps: typeof filtered }>();
  for (const a of filtered) {
    const gig = GIGS.find((g) => g.id === a.gigId);
    if (!gig) continue;
    if (!byGig.has(gig.id)) byGig.set(gig.id, { title: gig.title, apps: [] });
    byGig.get(gig.id)!.apps.push(a);
  }

  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 36, gap: 20, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 8px" }}>
            Employer · Talent pipeline
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 3.5vw, 3.6rem)", margin: 0, lineHeight: 0.98, letterSpacing: "-0.035em" }}>
            All applicants,{" "}
            <span style={{ color: "var(--color-accent-ink)" }}>ranked.</span>
          </h1>
        </div>
        <button
          onClick={() => router.push("/quick-demo/post")}
          style={{ padding: "10px 22px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          + Post assignment
        </button>
      </header>

      {/* Status pills */}
      <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
        {[
          { label: "All", count: counts.all },
          { label: "Applied", count: counts.applied },
          { label: "Shortlisted", count: counts.shortlisted },
          { label: "Accepted", count: counts.accepted },
        ].map((s) => (
          <span key={s.label} style={{ padding: "7px 16px", borderRadius: 999, border: "1px solid var(--color-line)", fontSize: 13, fontWeight: 600, background: "var(--color-surface-raised)", color: "var(--color-ink)" }}>
            {s.label}
            <span style={{ marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-soft)" }}>
              {s.count}
            </span>
          </span>
        ))}
        {gigFilter && (
          <button
            onClick={() => router.push("/quick-demo/applicants")}
            style={{ padding: "7px 16px", borderRadius: 999, border: "1px solid var(--color-accent)", fontSize: 13, fontWeight: 600, background: "var(--color-accent-soft)", color: "var(--color-accent-ink)", cursor: "pointer" }}
          >
            Filtered: {GIGS.find((g) => g.id === gigFilter)?.title} · Clear ×
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: 80, borderRadius: 24, border: "1px dashed var(--color-line)", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: "0 0 10px" }}>No applicants yet.</p>
          <p style={{ color: "var(--color-ink-soft)", fontSize: 14, margin: "0 0 24px" }}>
            Post an open assignment to start receiving applications.
          </p>
          <button
            onClick={() => router.push("/quick-demo/post")}
            style={{ padding: "10px 24px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}
          >
            Post an assignment →
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {Array.from(byGig.entries()).map(([gigId, { title, apps: gigApps }]) => (
            <section key={gigId}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: 0, letterSpacing: "-0.02em" }}>
                  {title}
                </h2>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-soft)", padding: "3px 10px", borderRadius: 999, border: "1px solid var(--color-line)" }}>
                  {gigApps.length} applicant{gigApps.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
                {gigApps.map((a) => {
                  const name = a.freelancer?.name ?? "?";
                  const hue = avatarHue(name);
                  const initials = name.split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase();
                  const config = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.applied;
                  const msgs = getMessagesForApplication(a.id);

                  return (
                    <article key={a.id} style={{ padding: 20, borderRadius: 18, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
                        <span style={{ width: 44, height: 44, borderRadius: "50%", background: `oklch(78% 0.08 ${hue})`, color: `oklch(22% 0.08 ${hue})`, display: "grid", placeItems: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                          {initials}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{name}</p>
                          </div>
                          {a.freelancer?.headline && (
                            <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "var(--color-ink-soft)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {a.freelancer.headline}
                            </p>
                          )}
                        </div>
                        <span style={{ padding: "4px 10px", borderRadius: 999, background: config.bg, color: config.fg, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>
                          {config.label}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {a.status === "applied" && (
                            <>
                              <button onClick={() => updateApplicationStatus(a.id, "shortlisted")} style={{ padding: "6px 12px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>
                                Shortlist
                              </button>
                              <button onClick={() => updateApplicationStatus(a.id, "rejected")} style={{ padding: "6px 12px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                Reject
                              </button>
                            </>
                          )}
                          {a.status === "shortlisted" && (
                            <button onClick={() => updateApplicationStatus(a.id, "accepted")} style={{ padding: "6px 12px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>
                              Accept
                            </button>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => router.push(`/quick-demo/messages?app=${a.id}`)}
                            style={{ padding: "6px 12px", borderRadius: 999, border: "1px solid var(--color-line)", fontSize: 12, fontWeight: 600, background: "transparent", cursor: "pointer", color: "var(--color-accent)" }}
                          >
                            Message{msgs.length > 0 ? ` (${msgs.length})` : ""}
                          </button>
                          <button
                            onClick={() => router.push(`/quick-demo/review/${a.id}`)}
                            style={{ padding: "6px 14px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}
                          >
                            Review →
                          </button>
                        </div>
                      </div>
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
