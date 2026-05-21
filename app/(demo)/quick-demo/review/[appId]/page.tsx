"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDemo } from "../../DemoProvider";
import { PROFILES } from "../../data";
import { getVideoUrl } from "../../lib/videoStore";

import { useViewMode } from "../../ViewModeContext";

const STATUS_CONFIG: Record<string, { bg: string; fg: string; label: string }> = {
  applied:      { bg: "var(--color-accent-soft)",        fg: "var(--color-accent-ink)", label: "Applied"       },
  interviewing: { bg: "#fef9c3",                         fg: "#854d0e",                 label: "Interview sent" },
  shortlisted:  { bg: "var(--color-jade-soft, #dcfce7)", fg: "#166534",                 label: "Shortlisted"   },
  accepted:     { bg: "var(--color-ink)",                fg: "var(--color-surface)",    label: "Accepted"      },
  rejected:     { bg: "var(--color-muted)",              fg: "var(--color-ink-mute)",   label: "Not selected"  },
  completed:    { bg: "#7c3aed",                         fg: "#fff",                    label: "Completed"     },
  offered:      { bg: "var(--color-accent)",             fg: "oklch(22% 0.08 38)",      label: "Offered"       },
};

export default function DemoReviewPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.appId as string;

  const {
    activeAccount,
    applications,
    updateApplicationStatus,
    sendMessage,
    getMessagesForApplication,
    getInterviewResponses,
    getInterviewVideoUrl,
    getAllGigs,
    hasRated,
  } = useDemo();
  const { viewMode } = useViewMode();

  const [input, setInput] = useState("");

  const app = applications.find((a) => a.id === appId);

  if (!app) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-mute)" }}>
        Application not found.
      </div>
    );
  }

  const gig = getAllGigs().find((g) => g.id === app.gigId);
  const freelancer = PROFILES.find((p) => p.id === app.freelancerId);
  const msgs = getMessagesForApplication(appId);
  const interviewAnswered = getInterviewResponses(appId);
  const questions = gig?.questions ?? [];
  const conf = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.applied;

  const AVATAR_HUES = [250, 165, 340, 38, 260, 200, 78, 310];
  const name = freelancer?.name ?? "?";
  const hue = AVATAR_HUES[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_HUES.length];
  const initials = name.split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase();

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(appId, trimmed);
    setInput("");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16" style={{ maxWidth: 760, margin: "0 auto", padding: "50px 28px 80px" }}>
      {/* Back */}
      <button
        onClick={() => router.push("/quick-demo/applicants")}
        style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 28, fontWeight: 600 }}
      >
        ← All applicants
      </button>

      {/* Header */}
      <header style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-soft)", margin: "0 0 6px" }}>
          Reviewing application for
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", margin: "0 0 14px", letterSpacing: "-0.025em" }}>
          {gig?.title ?? "Unknown gig"}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: conf.bg, color: conf.fg, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {conf.label}
          </span>
          <span style={{ fontSize: 13, color: "var(--color-ink-soft)", fontWeight: 600 }}>{name}</span>
        </div>
      </header>

      {/* Applicant profile card */}
      <div style={{ padding: 24, borderRadius: 18, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <span style={{ width: 52, height: 52, borderRadius: "50%", background: `oklch(78% 0.08 ${hue})`, color: `oklch(22% 0.08 ${hue})`, display: "grid", placeItems: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
            {initials}
          </span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>{name}</p>
            {freelancer?.headline && (
              <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--color-ink-soft)" }}>{freelancer.headline}</p>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: freelancer?.skills?.length ? 14 : 0 }}>
          {freelancer?.specialization && (
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 3px", fontWeight: 600 }}>Specialization</p>
              <p style={{ fontSize: 13, color: "var(--color-ink)", margin: 0 }}>{freelancer.specialization}</p>
            </div>
          )}
          {freelancer?.hourlyRate && (
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 3px", fontWeight: 600 }}>Rate</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--color-ink)", margin: 0 }}>{freelancer.hourlyRate}</p>
            </div>
          )}
          {freelancer?.rating && (
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 3px", fontWeight: 600 }}>Rating</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b", margin: 0 }}>★ {freelancer.rating}</p>
            </div>
          )}
          {freelancer?.completedGigs !== undefined && (
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 3px", fontWeight: 600 }}>Completed gigs</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--color-ink)", margin: 0 }}>{freelancer.completedGigs}</p>
            </div>
          )}
        </div>

        {freelancer?.skills && freelancer.skills.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {freelancer.skills.map((s) => (
              <span key={s} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Interview section */}
      {questions.length > 0 && (
        <div style={{ padding: 20, borderRadius: 18, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", marginBottom: 28 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 14px", fontWeight: 600 }}>
            Async interview · {interviewAnswered.length}/{questions.length} answered
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {questions.map((q, i) => {
              const done = interviewAnswered.includes(i);
              return (
                <div key={i} style={{ borderRadius: 12, background: "var(--color-surface)", border: `1px solid ${done ? "#bbf7d0" : "var(--color-line)"}`, overflow: "hidden" }}>
                  <div style={{ display: "flex", gap: 12, padding: "14px 16px" }}>
                    <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: done ? "#dcfce7" : "var(--color-muted)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, color: done ? "#166534" : "var(--color-ink-mute)" }}>
                      {done ? "✓" : i + 1}
                    </div>
                    <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.4, alignSelf: "center" }}>{q}</p>
                  </div>
                  {done ? (() => {
                    const videoUrl = getInterviewVideoUrl(appId, i) ?? getVideoUrl(appId, i);
                    return (
                      <div style={{ margin: "0 16px 14px", borderRadius: 10, overflow: "hidden", background: "#0a0a0a" }}>
                        {videoUrl ? (
                          <video src={videoUrl} controls style={{ display: "block", width: "100%", maxHeight: 360, background: "#0a0a0a" }} />
                        ) : (
                          <div style={{ aspectRatio: "16/9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "grid", placeItems: "center" }}>
                              <div style={{ width: 0, height: 0, borderStyle: "solid", borderWidth: "10px 0 10px 18px", borderColor: "transparent transparent transparent rgba(255,255,255,0.7)", marginLeft: 4 }} />
                            </div>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                              Video response · 90s
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })() : (
                    <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "0 16px 14px" }}>Awaiting answer</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Decision section */}
      {!["accepted", "rejected"].includes(app.status) && (
        <div style={{ padding: 20, borderRadius: 18, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", marginBottom: 28 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 14px", fontWeight: 600 }}>
            Your decision
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(app.status === "applied" || app.status === "interviewing") && (
              <>
                <button
                  onClick={() => updateApplicationStatus(appId, "shortlisted")}
                  style={{ padding: "10px 22px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}
                >
                  Shortlist
                </button>
                <button
                  onClick={() => updateApplicationStatus(appId, "rejected")}
                  style={{ padding: "10px 22px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "var(--color-ink-mute)" }}
                >
                  Reject
                </button>
              </>
            )}
            {app.status === "shortlisted" && (
              <>
                <button
                  onClick={() => updateApplicationStatus(appId, "accepted")}
                  style={{ padding: "10px 22px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}
                >
                  Accept — Hire this person
                </button>
                <button
                  onClick={() => updateApplicationStatus(appId, "rejected")}
                  style={{ padding: "10px 22px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "var(--color-ink-mute)" }}
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {app.status === "accepted" && (
        <div style={{ padding: 20, borderRadius: 18, background: "#dcfce7", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#166534" }}>You accepted this applicant.</span>
          <button
            onClick={() => updateApplicationStatus(appId, "completed")}
            style={{ padding: "10px 22px", borderRadius: 999, background: "#7c3aed", color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}
          >
            Mark as completed
          </button>
        </div>
      )}

      {app.status === "completed" && (
        <div style={{ padding: 20, borderRadius: 18, background: "#f3e8ff", marginBottom: 28 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#7c3aed", margin: "0 0 12px" }}>Gig completed!</p>
          {!hasRated(appId, activeAccount.id) ? (
            <button
              onClick={() => router.push(`/quick-demo/rate/${appId}`)}
              style={{ padding: "10px 22px", borderRadius: 999, background: "#7c3aed", color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}
            >
              ★ Rate this freelancer
            </button>
          ) : (
            <p style={{ fontSize: 13, color: "#7c3aed", margin: 0 }}>You have already left a review.</p>
          )}
        </div>
      )}

      {app.status === "rejected" && (
        <div style={{ padding: 18, borderRadius: 18, background: "var(--color-muted)", color: "var(--color-ink-mute)", fontSize: 14, fontWeight: 700, textAlign: "center", marginBottom: 28 }}>
          You declined this applicant.
        </div>
      )}

      {/* Message thread */}
      <div style={{ padding: 20, borderRadius: 18, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 14px", fontWeight: 600 }}>
          Message thread
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14, minHeight: 60 }}>
          {msgs.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--color-ink-mute)", margin: 0 }}>No messages yet. Start the conversation.</p>
          )}
          {msgs.map((msg) => {
            const isMine = msg.senderId === activeAccount.id;
            const sender = PROFILES.find((p) => p.id === msg.senderId);
            return (
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "80%", padding: "9px 14px", borderRadius: 12, background: isMine ? "var(--color-accent)" : "var(--color-muted)", color: isMine ? "#fff" : "var(--color-ink)", fontSize: 14, lineHeight: 1.4 }}>
                  {msg.body}
                </div>
                <span style={{ fontSize: 10, color: "var(--color-ink-mute)", marginTop: 3, padding: "0 4px" }}>
                  {sender?.name} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message…"
            style={{ flex: 1, padding: "10px 16px", borderRadius: 999, border: "1px solid var(--color-line)", background: "var(--color-surface)", fontSize: 14, outline: "none", color: "var(--color-ink)" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            style={{ padding: "10px 20px", borderRadius: 999, border: "none", background: input.trim() ? "var(--color-accent)" : "var(--color-muted)", color: input.trim() ? "#fff" : "var(--color-ink-mute)", fontWeight: 700, fontSize: 13, cursor: input.trim() ? "pointer" : "default" }}
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
