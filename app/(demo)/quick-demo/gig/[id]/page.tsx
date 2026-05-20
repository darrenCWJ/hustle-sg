"use client";

import { useParams, useRouter } from "next/navigation";
import { useDemo } from "../../DemoProvider";
import { GIGS } from "../../data";

const STATUS_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  applied: { bg: "var(--color-muted)", fg: "var(--color-ink-soft)", label: "Applied" },
  shortlisted: { bg: "#dcfce7", fg: "#166534", label: "Shortlisted" },
  accepted: { bg: "var(--color-ink)", fg: "var(--color-surface)", label: "Accepted" },
  rejected: { bg: "var(--color-muted)", fg: "var(--color-ink-mute)", label: "Not selected" },
};

export default function DemoGigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { activeAccount, applyToGig, applications } = useDemo();

  const gig = GIGS.find((g) => g.id === params.id);
  if (!gig) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "var(--color-ink-mute)" }}>
        Gig not found.
      </div>
    );
  }

  const existingApp = applications.find(
    (a) => a.gigId === gig.id && a.freelancerId === activeAccount.id,
  );

  function handleApply() {
    applyToGig(gig!.id);
  }

  return (
    <div style={{ padding: "16px", overflowY: "auto", height: "100%" }}>
      <button
        onClick={() => router.back()}
        style={{
          fontSize: 13,
          color: "var(--color-accent)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          marginBottom: 12,
          fontWeight: 600,
        }}
      >
        ← Back
      </button>

      <div
        style={{
          background: "var(--color-surface-raised)",
          borderRadius: 16,
          border: "1px solid var(--color-line)",
          padding: "18px 16px",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
          }}
        >
          {gig.category}
        </span>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            margin: "6px 0 8px",
            letterSpacing: "-0.025em",
            lineHeight: 1.2,
            color: "var(--color-ink)",
          }}
        >
          {gig.title}
        </h1>

        <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: "0 0 4px" }}>
          Posted by <strong>Darren Loh</strong> · {gig.postedAgo}
        </p>
        <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: "0 0 16px" }}>
          {gig.location}
        </p>

        <div
          style={{
            padding: "12px 14px",
            background: "var(--color-muted)",
            borderRadius: 10,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 18,
              fontWeight: 700,
              color: "var(--color-ink)",
            }}
          >
            {gig.budget}
          </span>
        </div>

        <h2
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--color-ink-mute)",
            margin: "0 0 8px",
          }}
        >
          Description
        </h2>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--color-ink-soft)",
            margin: "0 0 16px",
          }}
        >
          {gig.description}
        </p>

        {gig.skills.length > 0 && (
          <>
            <h2
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-ink-mute)",
                margin: "0 0 8px",
              }}
            >
              Skills Required
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
              {gig.skills.map((s) => (
                <span
                  key={s}
                  style={{
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "var(--color-muted)",
                    color: "var(--color-ink-soft)",
                    fontWeight: 600,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </>
        )}

        {activeAccount.role === "freelancer" && (
          <div style={{ marginTop: 8 }}>
            {existingApp ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "6px 14px",
                    borderRadius: 999,
                    background: STATUS_STYLES[existingApp.status].bg,
                    color: STATUS_STYLES[existingApp.status].fg,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {STATUS_STYLES[existingApp.status].label}
                </span>
                <button
                  onClick={() => router.push(`/quick-demo/messages?app=${existingApp.id}`)}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "8px 16px",
                    borderRadius: 10,
                    border: "1px solid var(--color-line)",
                    background: "transparent",
                    color: "var(--color-accent)",
                    cursor: "pointer",
                  }}
                >
                  Message Employer
                </button>
              </div>
            ) : (
              <button
                onClick={handleApply}
                style={{
                  width: "100%",
                  fontSize: 14,
                  fontWeight: 700,
                  padding: "12px 0",
                  borderRadius: 12,
                  border: "none",
                  background: "var(--color-accent)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Apply Now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
