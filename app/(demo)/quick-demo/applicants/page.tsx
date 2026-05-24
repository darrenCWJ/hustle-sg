"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDemo } from "../DemoProvider";
import { useViewMode } from "../ViewModeContext";
import { GIGS, PROFILES, type DemoProfile, type DemoGig } from "../data";

const STATUS_CONFIG: Record<string, { bg: string; fg: string; label: string }> = {
  applied:      { bg: "var(--color-accent-soft)",        fg: "var(--color-accent-ink)", label: "Applied"       },
  interviewing: { bg: "#fef9c3",                         fg: "#854d0e",                 label: "Interview sent" },
  shortlisted:  { bg: "var(--color-jade-soft, #dcfce7)", fg: "#166534",                 label: "Shortlisted"   },
  accepted:     { bg: "var(--color-ink)",                fg: "var(--color-surface)",    label: "Accepted"      },
  rejected:     { bg: "var(--color-muted)",              fg: "var(--color-ink-mute)",   label: "Not selected"  },
  offered:      { bg: "var(--color-accent-soft)",        fg: "var(--color-accent-ink)", label: "Offered"       },
};

const AVATAR_HUES_REC = [250, 165, 340, 38, 260, 200, 78, 310];
function recHue(name: string) {
  return AVATAR_HUES_REC[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_HUES_REC.length];
}

function scoreFreelancer(profile: DemoProfile, gig: DemoGig): number {
  const gigSkills = gig.skills.map((s) => s.toLowerCase());
  const profileSkills = (profile.skills ?? []).map((s) => s.toLowerCase());
  if (gigSkills.length === 0) return 0;
  const matches = profileSkills.filter((ps) =>
    gigSkills.some((gs) => gs.includes(ps) || ps.includes(gs)),
  ).length;
  return matches / gigSkills.length;
}

const AVATAR_HUES = [250, 165, 340, 38, 260, 200, 78, 310];
function avatarHue(name: string) {
  return AVATAR_HUES[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_HUES.length];
}

function ApplicantsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getApplicationsForRequestor, updateApplicationStatus, shortlistApplicant, getMessagesForApplication, sendDirectOffer } = useDemo();
  const { viewMode } = useViewMode();

  const gigFilter = searchParams.get("gig");
  const allApps = getApplicationsForRequestor();
  const filtered = gigFilter ? allApps.filter((a) => a.gigId === gigFilter) : allApps;
  const [offerStatuses, setOfferStatuses] = useState<Record<string, "idle" | "sending" | "sent">>({});

  const filteredGig = gigFilter ? [...GIGS, ...allApps.map((a) => a.gig)].find((g) => g?.id === gigFilter) : null;
  const existingApplicantIds = new Set(allApps.filter((a) => a.gigId === gigFilter).map((a) => a.freelancerId));

  const recommendedCandidates = filteredGig
    ? PROFILES.filter((p) => p.role === "freelancer" && !existingApplicantIds.has(p.id))
        .map((p) => ({ profile: p, score: scoreFreelancer(p, filteredGig) }))
        .filter((c) => c.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
    : [];

  function handleOffer(freelancerId: string) {
    if (!gigFilter || offerStatuses[freelancerId] !== undefined) return;
    setOfferStatuses((prev) => ({ ...prev, [freelancerId]: "sending" }));
    sendDirectOffer(freelancerId, gigFilter);
    setTimeout(() => {
      setOfferStatuses((prev) => ({ ...prev, [freelancerId]: "sent" }));
    }, 400);
  }

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
                              <button onClick={() => shortlistApplicant(a.id, title)} style={{ padding: "6px 12px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>
                                Shortlist
                              </button>
                              <button onClick={() => updateApplicationStatus(a.id, "rejected")} style={{ padding: "6px 12px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                Reject
                              </button>
                            </>
                          )}
                          {a.status === "shortlisted" && (a.gig?.questions ?? []).length > 0 && (
                            <span style={{ fontSize: 11, color: "var(--color-ink-mute)", fontStyle: "italic" }}>
                              Awaiting interview
                            </span>
                          )}
                          {a.status === "shortlisted" && (a.gig?.questions ?? []).length === 0 && (
                            <>
                              <button onClick={() => updateApplicationStatus(a.id, "accepted")} style={{ padding: "6px 12px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>
                                Accept
                              </button>
                              <button onClick={() => updateApplicationStatus(a.id, "rejected")} style={{ padding: "6px 12px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                Reject
                              </button>
                            </>
                          )}
                          {a.status === "interviewing" && (
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

      {recommendedCandidates.length > 0 && (
        <section style={{ marginTop: 56, paddingTop: 40, borderTop: "1px solid var(--color-line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: 0, letterSpacing: "-0.025em" }}>
              Recommended candidates
            </h2>
            <span style={{ padding: "4px 10px", borderRadius: 999, background: "var(--color-accent-soft)", color: "var(--color-accent-ink)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              AI matched
            </span>
          </div>
          <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: "0 0 24px" }}>
            Freelancers with skills matching <strong>{filteredGig?.title}</strong>. Send direct offers instantly.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {recommendedCandidates.map(({ profile, score }) => {
              const pct = Math.round(score * 100);
              const highMatch = pct >= 70;
              const status = offerStatuses[profile.id] ?? "idle";
              const name = profile.name;
              const hue = recHue(name);
              const initials = name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div
                  key={profile.id}
                  style={{ padding: 18, borderRadius: 16, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ width: 40, height: 40, borderRadius: "50%", background: `oklch(78% 0.08 ${hue})`, color: `oklch(22% 0.08 ${hue})`, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {initials}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--font-display)", fontSize: 16, margin: "0 0 2px", letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {name}
                      </p>
                      {profile.headline && (
                        <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {profile.headline}
                        </p>
                      )}
                    </div>
                    <span style={{ flexShrink: 0, padding: "3px 8px", borderRadius: 999, background: highMatch ? "var(--color-jade-soft, #dcfce7)" : "var(--color-muted)", color: highMatch ? "#166534" : "var(--color-ink-soft)", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                      {pct}%
                    </span>
                  </div>

                  <div style={{ height: 3, borderRadius: 999, background: "var(--color-muted)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: highMatch ? "#16a34a" : "var(--color-accent)", transition: "width 0.4s ease" }} />
                  </div>

                  {profile.skills && profile.skills.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {profile.skills.slice(0, 4).map((s) => {
                        const matched = filteredGig?.skills.some((gs) => gs.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(gs.toLowerCase()));
                        return (
                          <span key={s} style={{ fontSize: 10.5, padding: "3px 8px", borderRadius: 999, background: matched ? "var(--color-jade-soft, #dcfce7)" : "var(--color-muted)", color: matched ? "#166534" : "var(--color-ink-soft)", fontWeight: 600 }}>
                            {s}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOffer(profile.id)}
                    disabled={status !== "idle"}
                    style={{
                      marginTop: "auto",
                      padding: "7px 14px",
                      borderRadius: 999,
                      border: "none",
                      background: status === "sent" ? "var(--color-jade-soft, #dcfce7)" : status === "sending" ? "var(--color-muted)" : "var(--color-ink)",
                      color: status === "sent" ? "#166534" : status === "sending" ? "var(--color-ink-mute)" : "var(--color-surface)",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: status === "idle" ? "pointer" : "default",
                      transition: "background 0.15s",
                    }}
                  >
                    {status === "sending" ? "Sending…" : status === "sent" ? "✓ Offer sent" : "Send offer →"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

export default function DemoApplicantsPage() {
  return (
    <Suspense>
      <ApplicantsContent />
    </Suspense>
  );
}
