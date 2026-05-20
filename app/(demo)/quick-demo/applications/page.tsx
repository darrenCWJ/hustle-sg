"use client";

import { useRouter } from "next/navigation";
import { useDemo } from "../DemoProvider";
import { GIGS } from "../data";

const STATUS_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  applied: { bg: "var(--color-muted)", fg: "var(--color-ink-soft)", label: "Applied" },
  shortlisted: { bg: "#dcfce7", fg: "#166534", label: "Shortlisted" },
  accepted: { bg: "var(--color-ink)", fg: "var(--color-surface)", label: "Accepted" },
  rejected: { bg: "var(--color-muted)", fg: "var(--color-ink-mute)", label: "Not selected" },
};

export default function DemoApplicationsPage() {
  const router = useRouter();
  const { getApplicationsForAccount, getMessagesForApplication } = useDemo();
  const apps = getApplicationsForAccount();

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
          My Applications
        </h1>
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "3px 0 0" }}>
          {apps.length} application{apps.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px 12px" }}>
        {apps.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--color-ink-mute)",
              fontSize: 13,
            }}
          >
            No applications yet. Browse gigs and apply!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {apps.map((app) => {
              const gig = GIGS.find((g) => g.id === app.gigId);
              if (!gig) return null;
              const msgs = getMessagesForApplication(app.id);
              const st = STATUS_STYLES[app.status];
              return (
                <div
                  key={app.id}
                  style={{
                    borderRadius: 14,
                    background: "var(--color-surface-raised)",
                    border: "1px solid var(--color-line)",
                    padding: "12px 14px",
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
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 14,
                        margin: 0,
                        letterSpacing: "-0.02em",
                        color: "var(--color-ink)",
                        flex: 1,
                      }}
                    >
                      {gig.title}
                    </h3>
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
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    >
                      {st.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "0 0 8px" }}>
                    {gig.budget} · {gig.location}
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => router.push(`/quick-demo/messages?app=${app.id}`)}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--color-line)",
                        background: "transparent",
                        color: "var(--color-accent)",
                        cursor: "pointer",
                      }}
                    >
                      Messages{msgs.length > 0 ? ` (${msgs.length})` : ""}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
