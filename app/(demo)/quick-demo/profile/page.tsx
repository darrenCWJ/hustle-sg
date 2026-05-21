"use client";

import { useDemo } from "../DemoProvider";
import { useViewMode } from "../ViewModeContext";
import { GIGS } from "../data";

export default function DemoProfilePage() {
  const { activeAccount, getApplicationsForAccount, getApplicationsForRequestor } = useDemo();
  const { viewMode } = useViewMode();

  const isEmployer = activeAccount.role === "employer";
  const workerApps = getApplicationsForAccount();
  const employerApps = getApplicationsForRequestor();

  const stats = isEmployer
    ? [
        { label: "Gigs posted", value: GIGS.length },
        { label: "Applicants", value: employerApps.length },
        { label: "Accepted", value: employerApps.filter((a) => a.status === "accepted").length },
      ]
    : [
        { label: "Applications", value: workerApps.length },
        { label: "Shortlisted", value: workerApps.filter((a) => a.status === "shortlisted").length },
        { label: "Accepted", value: workerApps.filter((a) => a.status === "accepted").length },
        ...(activeAccount.rating ? [{ label: "Rating", value: `★ ${activeAccount.rating}` }] : []),
      ];

  const wrapStyle = viewMode === "desktop"
    ? { maxWidth: 680, margin: "50px auto", padding: "0 28px 80px" }
    : { padding: "16px", overflowY: "auto" as const, height: "100%" };

  return (
    <div style={wrapStyle}>
      {/* Avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: activeAccount.role === "employer" ? "var(--color-trust, #3b82f6)" : "var(--color-accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, fontWeight: 800, color: "#fff", flexShrink: 0,
        }}>
          {activeAccount.avatar}
        </div>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: viewMode === "desktop" ? 28 : 22, margin: 0, letterSpacing: "-0.025em", color: "var(--color-ink)" }}>
            {activeAccount.name}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "2px 8px", borderRadius: 999,
              background: activeAccount.role === "employer" ? "color-mix(in oklch, var(--color-trust, #3b82f6) 14%, transparent)" : "var(--color-accent-soft)",
              color: activeAccount.role === "employer" ? "var(--color-trust, #3b82f6)" : "var(--color-accent)",
            }}>
              {activeAccount.role}
            </span>
            {activeAccount.specialization && (
              <span style={{ fontSize: 12, color: "var(--color-ink-mute)" }}>
                {activeAccount.specialization}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Headline */}
      <p style={{ fontSize: viewMode === "desktop" ? 16 : 14, color: "var(--color-ink-soft)", lineHeight: 1.5, marginBottom: 24 }}>
        {activeAccount.headline}
      </p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`, gap: 10, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ padding: "14px 16px", borderRadius: 14, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "var(--color-ink)", margin: 0 }}>
              {s.value}
            </p>
            <p style={{ fontSize: 10, color: "var(--color-ink-mute)", margin: "3px 0 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Rate */}
      {activeAccount.hourlyRate && (
        <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", marginBottom: 16 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 4px", fontWeight: 600 }}>
            Rate
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--color-ink)", margin: 0 }}>
            {activeAccount.hourlyRate}
          </p>
        </div>
      )}

      {/* Skills */}
      {activeAccount.skills && activeAccount.skills.length > 0 && (
        <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 10px", fontWeight: 600 }}>
            Skills
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {activeAccount.skills.map((s) => (
              <span key={s} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, padding: "12px 16px", borderRadius: 12, background: "var(--color-muted)", fontSize: 12, color: "var(--color-ink-mute)", textAlign: "center" }}>
        Demo profile — editing disabled in quick demo mode.
      </div>
    </div>
  );
}
