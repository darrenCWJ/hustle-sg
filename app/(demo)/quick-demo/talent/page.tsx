"use client";

import { useState } from "react";
import { PROFILES } from "../data";

const FREELANCERS = PROFILES.filter((p) => p.role === "freelancer");

const ROLES = Array.from(new Set(FREELANCERS.map((f) => f.specialization!)));

const ROLE_COLORS: Record<string, string> = {
  "IT & Software Design": "#3b82f6",
  "Events & Marketing": "#f59e0b",
  Teaching: "#10b981",
};

export default function DemoTalentPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const filtered = selectedRole
    ? FREELANCERS.filter((f) => f.specialization === selectedRole)
    : FREELANCERS;

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
          Talent Pool
        </h1>
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "3px 0 0" }}>
          {filtered.length} freelancers{selectedRole ? ` in ${selectedRole}` : ""}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "10px 12px",
          overflowX: "auto",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setSelectedRole(null)}
          style={{
            fontSize: 11,
            fontWeight: selectedRole === null ? 700 : 500,
            padding: "6px 12px",
            borderRadius: 999,
            border: "1px solid",
            borderColor: selectedRole === null ? "var(--color-ink)" : "var(--color-line)",
            background: selectedRole === null ? "var(--color-ink)" : "transparent",
            color: selectedRole === null ? "var(--color-surface)" : "var(--color-ink-soft)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          All Roles
        </button>
        {ROLES.map((role) => {
          const active = selectedRole === role;
          const color = ROLE_COLORS[role] ?? "var(--color-ink)";
          return (
            <button
              key={role}
              onClick={() => setSelectedRole(active ? null : role)}
              style={{
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid",
                borderColor: active ? color : "var(--color-line)",
                background: active ? color : "transparent",
                color: active ? "#fff" : "var(--color-ink-soft)",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {role}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 12px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((f) => {
            const color = ROLE_COLORS[f.specialization ?? ""] ?? "var(--color-ink-mute)";
            return (
              <div
                key={f.id}
                style={{
                  borderRadius: 14,
                  background: "var(--color-surface-raised)",
                  border: "1px solid var(--color-line)",
                  boxShadow: "var(--shadow-soft)",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "var(--color-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--color-ink-soft)",
                      flexShrink: 0,
                    }}
                  >
                    {f.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "var(--color-ink)",
                          fontFamily: "var(--font-display)",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {f.name}
                      </span>
                      {f.rating && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#f59e0b",
                          }}
                        >
                          ★ {f.rating}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-ink-mute)", marginTop: 1 }}>
                      {f.headline}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color,
                    }}
                  >
                    {f.specialization}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {f.hourlyRate && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--color-ink)",
                        }}
                      >
                        {f.hourlyRate}
                      </span>
                    )}
                    {f.completedGigs !== undefined && (
                      <span style={{ fontSize: 10, color: "var(--color-ink-mute)" }}>
                        {f.completedGigs} gigs
                      </span>
                    )}
                  </div>
                </div>

                {f.skills && f.skills.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {f.skills.map((s) => (
                      <span
                        key={s}
                        style={{
                          fontSize: 10,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "var(--color-muted)",
                          color: "var(--color-ink-mute)",
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
