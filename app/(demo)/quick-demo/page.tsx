"use client";

import { useState } from "react";
import { useDemo } from "./DemoProvider";
import { PROFILES } from "./data";
import { useRouter } from "next/navigation";

const ROLE_COLORS: Record<string, { bg: string; fg: string }> = {
  employer:   { bg: "var(--color-trust, #3b82f6)", fg: "#fff" },
  freelancer: { bg: "var(--color-accent)",         fg: "#fff" },
};

export default function DemoLandingPage() {
  const { sessionId, createSession, switchAccount } = useDemo();
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);

  function handleStart(id: string) {
    switchAccount(id);
    const profile = PROFILES.find((p) => p.id === id);
    if (profile?.role === "employer") {
      router.push("/quick-demo/dashboard");
    } else {
      router.push("/quick-demo/feed");
    }
  }

  async function handleCreate() {
    setCreating(true);
    await createSession();
    setCreating(false);
  }

  async function handleJoin() {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) return;
    setJoining(true);
    await createSession(code);
    setJoining(false);
  }

  function copyLink() {
    if (!sessionId) return;
    const url = `${window.location.origin}/quick-demo?s=${sessionId}`;
    navigator.clipboard.writeText(url).catch(() => {});
  }

  // No session yet — show session creation UI
  if (!sessionId) {
    return (
      <div style={{ padding: "32px 16px", overflow: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 24, maxWidth: 420, margin: "0 auto" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 700, margin: "0 0 6px" }}>
            Quick Demo
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: "0 0 8px", letterSpacing: "-0.03em", color: "var(--color-ink)" }}>
            Start a demo session
          </h1>
          <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.5 }}>
            Sessions are shared between devices — employer and worker can communicate in real-time.
          </p>
        </div>

        {/* Create new session */}
        <button
          onClick={handleCreate}
          disabled={creating}
          style={{
            padding: "14px 0",
            borderRadius: 14,
            border: "none",
            background: "var(--color-ink)",
            color: "var(--color-surface)",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            opacity: creating ? 0.6 : 1,
          }}
        >
          {creating ? "Creating…" : "Start new session"}
        </button>

        {/* Join existing */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 12, color: "var(--color-ink-mute)", margin: 0, textAlign: "center" }}>
            — or join an existing session —
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 8))}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="Enter session code"
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid var(--color-line)",
                background: "var(--color-surface-raised)",
                fontSize: 14,
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-ink)",
                outline: "none",
              }}
            />
            <button
              onClick={handleJoin}
              disabled={joinCode.trim().length < 4 || joining}
              style={{
                padding: "12px 18px",
                borderRadius: 12,
                border: "none",
                background: joinCode.trim().length >= 4 ? "var(--color-accent)" : "var(--color-muted)",
                color: joinCode.trim().length >= 4 ? "#fff" : "var(--color-ink-mute)",
                fontSize: 14,
                fontWeight: 700,
                cursor: joinCode.trim().length >= 4 ? "pointer" : "default",
              }}
            >
              {joining ? "…" : "Join"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Session exists — show session code + account picker
  return (
    <div style={{ padding: "32px 16px", overflow: "auto", flex: 1 }}>
      {/* Session info */}
      <div style={{ marginBottom: 24, padding: "12px 16px", borderRadius: 12, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 3px", fontWeight: 600 }}>
            Session
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 800, letterSpacing: "0.12em", color: "var(--color-ink)", margin: 0 }}>
            {sessionId}
          </p>
        </div>
        <button
          onClick={copyLink}
          style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--color-line)", background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--color-accent)", whiteSpace: "nowrap" }}
        >
          Copy link
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 6px", letterSpacing: "-0.03em", color: "var(--color-ink)" }}>
          Choose your account
        </h1>
        <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.5 }}>
          Share the session code or link with the other person.
          <br />
          Each device picks a different account.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {PROFILES.map((p) => {
          const rc = ROLE_COLORS[p.role];
          return (
            <button
              key={p.id}
              onClick={() => handleStart(p.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid var(--color-line)",
                background: "var(--color-surface-raised)",
                boxShadow: "var(--shadow-soft)",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--color-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--color-ink-soft)", flexShrink: 0 }}>
                {p.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
                    {p.name}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 999, background: `color-mix(in oklch, ${rc.bg} 14%, transparent)`, color: rc.bg }}>
                    {p.role}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: 0 }}>
                  {p.headline}
                </p>
                {p.specialization && (
                  <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "3px 0 0", fontStyle: "italic" }}>
                    Sees: {p.specialization} gigs only
                  </p>
                )}
              </div>
              <span style={{ fontSize: 18, color: "var(--color-ink-mute)" }}>›</span>
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: 11, color: "var(--color-ink-mute)", textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
        Switch accounts anytime using the top bar.
        <br />
        Click &ldquo;Reset&rdquo; to clear all applications and messages.
      </p>
    </div>
  );
}
