"use client";

import { useRouter } from "next/navigation";
import { useDemo } from "../DemoProvider";
import { useViewMode } from "../ViewModeContext";

const STATUS_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  applied:      { bg: "var(--color-muted)",              fg: "var(--color-ink-soft)",  label: "Applied"      },
  interviewing: { bg: "#fef9c3",                         fg: "#854d0e",                label: "Interview sent" },
  shortlisted:  { bg: "#dcfce7",                         fg: "#166534",                label: "Shortlisted"  },
  accepted:     { bg: "var(--color-ink)",                fg: "var(--color-surface)",   label: "Accepted"     },
  rejected:     { bg: "var(--color-muted)",              fg: "var(--color-ink-mute)",  label: "Not selected" },
  offered:      { bg: "var(--color-accent)",             fg: "oklch(22% 0.08 38)",     label: "Offer received" },
  completed:    { bg: "#7c3aed",                         fg: "#fff",                   label: "Completed"    },
};

const STEPS = ["Applied", "Shortlist", "Accepted"];

function getStep(status: string) {
  if (status === "accepted" || status === "completed") return 3;
  if (status === "shortlisted") return 2;
  return 1;
}

export default function DemoApplicationsPage() {
  const router = useRouter();
  const { getApplicationsForAccount, getMessagesForApplication, getAllGigs } = useDemo();
  const { viewMode } = useViewMode();
  const apps = getApplicationsForAccount();
  const allGigs = getAllGigs();

  if (viewMode === "desktop") {
    return (
      <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
        <header style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 8px" }}>
            Worker
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 3.5vw, 3.6rem)", margin: 0, lineHeight: 0.98, letterSpacing: "-0.035em" }}>
            My <span style={{ color: "var(--color-accent-ink)" }}>applications</span>.
          </h1>
        </header>

        {apps.length === 0 ? (
          <div style={{ padding: 80, borderRadius: 24, border: "1px dashed var(--color-line)", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: "0 0 10px" }}>No applications yet.</p>
            <p style={{ color: "var(--color-ink-soft)", fontSize: 14, margin: "0 0 24px" }}>
              Browse open gigs and apply to get started.
            </p>
            <button
              onClick={() => router.push("/quick-demo/gigs")}
              style={{ padding: "10px 24px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}
            >
              Browse gigs →
            </button>
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {apps.map((a) => {
              const gig = allGigs.find((g) => g.id === a.gigId);
              const conf = STATUS_STYLES[a.status] ?? STATUS_STYLES.applied;
              const step = getStep(a.status);
              const isDone = a.status === "rejected";
              const isOffer = a.status === "offered";
              const msgs = getMessagesForApplication(a.id);
              return (
                <li key={a.id} style={{ padding: 16, borderRadius: 14, border: `1px solid ${isOffer ? "var(--color-accent)" : "var(--color-line)"}`, background: "var(--color-surface-raised)", opacity: isDone ? 0.55 : 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10, marginBottom: isDone || isOffer ? 0 : 14 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 3px", color: "var(--color-ink)" }}>
                        {gig?.title ?? "Gig"}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--color-ink-mute)" }}>
                        {gig?.category}{gig?.budget ? ` · ${gig.budget}` : ""}{gig?.location ? ` · ${gig.location}` : ""}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: conf.bg, color: conf.fg, whiteSpace: "nowrap" }}>
                        {conf.label}
                      </span>
                      <button
                        onClick={() => router.push("/quick-demo/profile/requestor")}
                        style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", color: "var(--color-ink-soft)", cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        Employer
                      </button>
                      <button
                        onClick={() => router.push(`/quick-demo/messages?app=${a.id}`)}
                        style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", color: "var(--color-accent)", cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        Message{msgs.length > 0 ? ` (${msgs.length})` : ""}
                      </button>
                    </div>
                  </div>
                  {!isDone && !isOffer && (
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
                  {a.status === "shortlisted" && gig?.questions && gig.questions.length > 0 && (
                    <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 10, background: "#fef9c3", border: "1px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#854d0e", margin: "0 0 2px" }}>Interview request received</p>
                        <p style={{ fontSize: 11, color: "#92400e", margin: 0 }}>Record {gig.questions.length} short video answer{gig.questions.length !== 1 ? "s" : ""} to proceed.</p>
                      </div>
                      <button
                        onClick={() => router.push(`/quick-demo/interview/${a.id}`)}
                        style={{ fontSize: 12, fontWeight: 700, padding: "7px 16px", borderRadius: 999, border: "none", background: "#854d0e", color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        Complete interview →
                      </button>
                    </div>
                  )}
                  {a.status === "shortlisted" && (!gig?.questions || gig.questions.length === 0) && (
                    <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 10, background: "#dcfce7", border: "1px solid #bbf7d0" }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#166534", margin: "0 0 2px" }}>You've been shortlisted!</p>
                      <p style={{ fontSize: 11, color: "#166534", margin: 0, opacity: 0.8 }}>The employer is reviewing your profile and will confirm shortly.</p>
                    </div>
                  )}
                  {a.status === "accepted" && (
                    <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 10, background: "var(--color-ink)", border: "1px solid var(--color-ink)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-surface)", margin: "0 0 2px" }}>Congratulations! You got the gig</p>
                        <p style={{ fontSize: 11, color: "var(--color-surface)", margin: 0, opacity: 0.7 }}>Check your messages for next steps from the employer.</p>
                      </div>
                      <button
                        onClick={() => router.push(`/quick-demo/messages?app=${a.id}`)}
                        style={{ fontSize: 12, fontWeight: 700, padding: "7px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "var(--color-surface)", cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        View messages →
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    );
  }

  // Mobile layout
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid var(--color-line)", flexShrink: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, letterSpacing: "-0.025em", color: "var(--color-ink)" }}>
          My Applications
        </h1>
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "3px 0 0" }}>
          {apps.length} application{apps.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px 12px" }}>
        {apps.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-mute)", fontSize: 13 }}>
            No applications yet. Browse gigs and apply!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {apps.map((app) => {
              const gig = allGigs.find((g) => g.id === app.gigId);
              const msgs = getMessagesForApplication(app.id);
              const st = STATUS_STYLES[app.status] ?? STATUS_STYLES.applied;
              const isOffer = app.status === "offered";
              return (
                <div key={app.id} style={{ borderRadius: 14, background: "var(--color-surface-raised)", border: `1px solid ${isOffer ? "var(--color-accent)" : "var(--color-line)"}`, padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 14, margin: 0, letterSpacing: "-0.02em", color: "var(--color-ink)", flex: 1 }}>
                      {gig?.title ?? "Gig"}
                    </h3>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: st.bg, color: st.fg, textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0, marginLeft: 8 }}>
                      {st.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "0 0 8px" }}>
                    {gig?.budget ?? ""}{gig?.location ? ` · ${gig.location}` : ""}
                  </p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => router.push("/quick-demo/profile/requestor")}
                      style={{ fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--color-line)", background: "transparent", color: "var(--color-ink-soft)", cursor: "pointer" }}
                    >
                      Employer
                    </button>
                    <button
                      onClick={() => router.push(`/quick-demo/messages?app=${app.id}`)}
                      style={{ fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--color-line)", background: "transparent", color: "var(--color-accent)", cursor: "pointer" }}
                    >
                      Messages{msgs.length > 0 ? ` (${msgs.length})` : ""}
                    </button>
                  </div>
                  {app.status === "shortlisted" && gig?.questions && gig.questions.length > 0 && (
                    <button
                      onClick={() => router.push(`/quick-demo/interview/${app.id}`)}
                      style={{ fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 8, border: "none", background: "#854d0e", color: "#fff", cursor: "pointer", marginTop: 8, width: "100%", textAlign: "center" }}
                    >
                      Complete interview →
                    </button>
                  )}
                  {app.status === "shortlisted" && (!gig?.questions || gig.questions.length === 0) && (
                    <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8, background: "#dcfce7", border: "1px solid #bbf7d0" }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#166534", margin: 0 }}>You've been shortlisted! Awaiting employer decision.</p>
                    </div>
                  )}
                  {app.status === "accepted" && (
                    <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8, background: "var(--color-ink)" }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-surface)", margin: "0 0 4px" }}>Congratulations! You got the gig</p>
                      <button
                        onClick={() => router.push(`/quick-demo/messages?app=${app.id}`)}
                        style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "var(--color-surface)", cursor: "pointer" }}
                      >
                        View messages →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
