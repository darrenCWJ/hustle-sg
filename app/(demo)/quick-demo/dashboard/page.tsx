"use client";

import { useRouter } from "next/navigation";
import { useDemo } from "../DemoProvider";
import { GIGS, PROFILES } from "../data";

const STATUS_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  applied: { bg: "var(--color-muted)", fg: "var(--color-ink-soft)", label: "Applied" },
  shortlisted: { bg: "#dcfce7", fg: "#166534", label: "Shortlisted" },
  accepted: { bg: "var(--color-ink)", fg: "var(--color-surface)", label: "Accepted" },
  rejected: { bg: "var(--color-muted)", fg: "var(--color-ink-mute)", label: "Rejected" },
};

export default function DemoDashboardPage() {
  const router = useRouter();
  const { getApplicationsForRequestor, updateApplicationStatus, getMessagesForApplication } =
    useDemo();
  const allApps = getApplicationsForRequestor();

  const totalApps = allApps.length;
  const pendingReview = allApps.filter((a) => a.status === "applied").length;
  const shortlisted = allApps.filter((a) => a.status === "shortlisted").length;
  const accepted = allApps.filter((a) => a.status === "accepted").length;

  const gigsWithApps = GIGS.map((gig) => ({
    ...gig,
    applicants: allApps.filter((a) => a.gigId === gig.id),
  })).filter((g) => g.applicants.length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          padding: "10px 16px 8px",
          borderBottom: "1px solid var(--color-line)",
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            margin: 0,
            letterSpacing: "-0.025em",
            color: "var(--color-ink)",
          }}
        >
          Employer Dashboard
        </h1>
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "3px 0 0" }}>
          {GIGS.length} posted gigs · {totalApps} total applications
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px 12px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            marginBottom: 16,
          }}
        >
          {[
            { label: "Pending", value: pendingReview, color: "var(--color-accent)" },
            { label: "Shortlisted", value: shortlisted, color: "#16a34a" },
            { label: "Accepted", value: accepted, color: "var(--color-ink)" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                background: "var(--color-surface-raised)",
                border: "1px solid var(--color-line)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 20,
                  fontWeight: 700,
                  color: kpi.color,
                }}
              >
                {kpi.value}
              </div>
              <div style={{ fontSize: 10, color: "var(--color-ink-mute)", marginTop: 2 }}>
                {kpi.label}
              </div>
            </div>
          ))}
        </div>

        {gigsWithApps.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--color-ink-mute)",
              fontSize: 13,
            }}
          >
            No applications yet. Switch to a freelancer account and apply to gigs!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {gigsWithApps.map((gig) => (
              <div key={gig.id}>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 13,
                    margin: "0 0 8px",
                    color: "var(--color-ink)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {gig.title}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {gig.applicants.map((app) => {
                    const freelancer = PROFILES.find((p) => p.id === app.freelancerId);
                    const st = STATUS_STYLES[app.status];
                    const msgs = getMessagesForApplication(app.id);
                    return (
                      <div
                        key={app.id}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 10,
                          background: "var(--color-surface-raised)",
                          border: "1px solid var(--color-line)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 6,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: "50%",
                                background: "var(--color-muted)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 9,
                                fontWeight: 700,
                                color: "var(--color-ink-soft)",
                              }}
                            >
                              {freelancer?.avatar}
                            </div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink)" }}>
                                {freelancer?.name}
                              </div>
                              <div style={{ fontSize: 10, color: "var(--color-ink-mute)" }}>
                                {freelancer?.specialization}
                              </div>
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: 999,
                              background: st.bg,
                              color: st.fg,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            {st.label}
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {app.status === "applied" && (
                            <>
                              <button
                                onClick={() => updateApplicationStatus(app.id, "shortlisted")}
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "5px 10px",
                                  borderRadius: 6,
                                  border: "none",
                                  background: "#dcfce7",
                                  color: "#166534",
                                  cursor: "pointer",
                                }}
                              >
                                Shortlist
                              </button>
                              <button
                                onClick={() => updateApplicationStatus(app.id, "rejected")}
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "5px 10px",
                                  borderRadius: 6,
                                  border: "1px solid var(--color-line)",
                                  background: "transparent",
                                  color: "var(--color-ink-mute)",
                                  cursor: "pointer",
                                }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {app.status === "shortlisted" && (
                            <button
                              onClick={() => updateApplicationStatus(app.id, "accepted")}
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "5px 10px",
                                borderRadius: 6,
                                border: "none",
                                background: "var(--color-ink)",
                                color: "var(--color-surface)",
                                cursor: "pointer",
                              }}
                            >
                              Accept
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/quick-demo/messages?app=${app.id}`)}
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "5px 10px",
                              borderRadius: 6,
                              border: "1px solid var(--color-line)",
                              background: "transparent",
                              color: "var(--color-accent)",
                              cursor: "pointer",
                            }}
                          >
                            Message{msgs.length > 0 ? ` (${msgs.length})` : ""}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
