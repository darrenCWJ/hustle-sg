"use client";

import { useDemo } from "./DemoProvider";
import { PROFILES } from "./data";
import { useRouter } from "next/navigation";

const ROLE_COLORS: Record<string, { bg: string; fg: string }> = {
  employer: { bg: "var(--color-trust)", fg: "#fff" },
  freelancer: { bg: "var(--color-accent)", fg: "#fff" },
};

export default function DemoLandingPage() {
  const { switchAccount } = useDemo();
  const router = useRouter();

  function handleStart(id: string) {
    switchAccount(id);
    const profile = PROFILES.find((p) => p.id === id);
    if (profile?.role === "employer") {
      router.push("/quick-demo/dashboard");
    } else {
      router.push("/quick-demo/feed");
    }
  }

  return (
    <div style={{ padding: "32px 16px", overflow: "auto", flex: 1 }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <p
          style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
            fontWeight: 700,
            margin: "0 0 6px",
          }}
        >
          Quick Demo
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            margin: "0 0 8px",
            letterSpacing: "-0.03em",
            color: "var(--color-ink)",
          }}
        >
          Choose an account
        </h1>
        <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.5 }}>
          4 hardcoded accounts. Zero loading. Instant switching.
          <br />
          All actions are shared via localStorage.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--color-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--color-ink-soft)",
                  flexShrink: 0,
                }}
              >
                {p.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--color-ink)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {p.name}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "2px 7px",
                      borderRadius: 999,
                      background: `color-mix(in oklch, ${rc.bg} 14%, transparent)`,
                      color: rc.bg,
                    }}
                  >
                    {p.role}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: 0 }}>
                  {p.headline}
                </p>
                {p.specialization && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--color-ink-mute)",
                      margin: "3px 0 0",
                      fontStyle: "italic",
                    }}
                  >
                    Sees: {p.specialization} gigs only
                  </p>
                )}
              </div>
              <span style={{ fontSize: 18, color: "var(--color-ink-mute)" }}>›</span>
            </button>
          );
        })}
      </div>

      <p
        style={{
          fontSize: 11,
          color: "var(--color-ink-mute)",
          textAlign: "center",
          marginTop: 24,
          lineHeight: 1.6,
        }}
      >
        Switch accounts anytime using the top bar.
        <br />
        Click "Reset" to clear all applications and messages.
      </p>
    </div>
  );
}
