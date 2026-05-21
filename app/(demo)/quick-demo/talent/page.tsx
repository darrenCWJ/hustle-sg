"use client";

import { useState, useMemo } from "react";
import { PROFILES, DemoProfile } from "../data";
import { useViewMode } from "../ViewModeContext";

const FREELANCERS = PROFILES.filter((p) => p.role === "freelancer");

const ROLE_FILTERS = [
  { label: "All",       value: null,        color: null },
  { label: "Tech",      value: "tech",      color: "#3b82f6", keywords: ["react", "typescript", "javascript", "node", "python", "flutter", "swift", "devops", "docker", "aws", "frontend", "backend", "full-stack", "mobile", "software"] },
  { label: "Design",    value: "design",    color: "#a855f7", keywords: ["figma", "ui/ux", "ux", "ui", "design", "illustrator", "branding", "graphic", "motion graphics", "animation"] },
  { label: "Events",    value: "events",    color: "#f59e0b", keywords: ["event", "coordinator", "emcee", "venue", "hospitality", "catering", "conference"] },
  { label: "Marketing", value: "marketing", color: "#ec4899", keywords: ["marketing", "seo", "sem", "social media", "google ads", "meta ads", "content", "copywriting", "analytics", "tiktok"] },
  { label: "Tuition",   value: "tuition",   color: "#10b981", keywords: ["tutor", "teaching", "maths", "physics", "chemistry", "english", "science", "a-level", "o-level", "ib", "primary"] },
] as const;

type RoleValue = typeof ROLE_FILTERS[number]["value"];

function matchesRole(f: DemoProfile, role: RoleValue): boolean {
  if (!role) return true;
  const filter = ROLE_FILTERS.find((r) => r.value === role);
  if (!filter || !("keywords" in filter)) return true;
  const lc = [...(f.skills ?? []), f.headline, f.specialization ?? ""]
    .join(" ")
    .toLowerCase();
  return (filter.keywords as readonly string[]).some((kw) => lc.includes(kw));
}

const AVATAR_HUES = [250, 165, 340, 38, 260, 200, 78, 310];
function avatarColors(name: string) {
  const hue = AVATAR_HUES[(name.charCodeAt(0) + (name.charCodeAt(1) ?? 0)) % AVATAR_HUES.length];
  return { bg: `oklch(78% 0.08 ${hue})`, fg: `oklch(22% 0.08 ${hue})` };
}
function initials(name: string) {
  return name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
}

// ── Desktop card ───────────────────────────────────────────────────────────────

function FreelancerCard({ f }: { f: DemoProfile }) {
  const [hovered, setHovered] = useState(false);
  const ini = initials(f.name);
  const { bg, fg } = avatarColors(f.name);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 20,
        borderRadius: 18,
        background: "var(--color-surface-raised)",
        border: `1px solid ${hovered ? "var(--color-ink)" : "var(--color-line)"}`,
        transform: hovered ? "translateY(-1px)" : "none",
        boxShadow: hovered ? "var(--shadow-lift)" : "none",
        transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
        <span style={{ width: 48, height: 48, borderRadius: "50%", background: bg, color: fg, display: "grid", placeItems: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
          {ini}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{f.name}</p>
            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "var(--color-jade-soft, #dcfce7)", color: "var(--color-jade-ink, #166534)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Singpass ✓
            </span>
          </div>
          <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "var(--color-ink-soft)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {f.headline}
          </p>
          {f.rating && (
            <p style={{ margin: "3px 0 0", fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>
              ★ {f.rating} · {f.completedGigs} gigs completed
            </p>
          )}
        </div>
      </div>

      {f.skills && f.skills.length > 0 && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {f.skills.slice(0, 5).map((s) => (
            <span key={s} style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", fontWeight: 600 }}>
              {s}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {f.hourlyRate && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--color-ink)" }}>
            {f.hourlyRate}
          </span>
        )}
        <span style={{ padding: "7px 16px", borderRadius: 999, border: "1px solid var(--color-line)", fontSize: 12, fontWeight: 600, textAlign: "center", color: "var(--color-ink)", marginLeft: "auto" }}>
          View profile →
        </span>
      </div>
    </article>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DemoTalentPage() {
  const { viewMode } = useViewMode();
  const [q, setQ] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleValue>(null);
  const [verifiedOnly] = useState(false);

  const filtered = useMemo(() => {
    return FREELANCERS.filter((f) => {
      if (!matchesRole(f, selectedRole)) return false;
      if (q) {
        const lq = q.toLowerCase();
        if (
          !f.name.toLowerCase().includes(lq) &&
          !f.headline.toLowerCase().includes(lq) &&
          !(f.skills ?? []).some((s) => s.toLowerCase().includes(lq))
        ) return false;
      }
      return true;
    });
  }, [q, selectedRole]);

  // ── Desktop ──────────────────────────────────────────────────────────────────

  if (viewMode === "desktop") {
    return (
      <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
        <header style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 8px" }}>
            Browse · {FREELANCERS.length} freelancers
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 3.5vw, 3.8rem)", margin: 0, lineHeight: 0.98, letterSpacing: "-0.035em" }}>
            Find verified <span style={{ color: "var(--color-accent-ink)" }}>talent</span>.
          </h1>
        </header>

        {/* Controls bar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, skill…"
            style={{ flex: "1 1 220px", padding: "10px 14px", borderRadius: 12, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)", fontSize: 13, color: "var(--color-ink)", outline: "none" }}
          />
          <button
            style={{ padding: "10px 16px", borderRadius: 12, border: "1px solid var(--color-jade-ink, #16a34a)", background: "var(--color-jade-soft, #dcfce7)", color: "var(--color-jade-ink, #166534)", fontSize: 13, fontWeight: 600, cursor: "default", whiteSpace: "nowrap" }}
          >
            Singpass verified only ✓
          </button>
        </div>

        {/* Role filter pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {ROLE_FILTERS.map((role) => {
            const active = selectedRole === role.value;
            const color = role.color ?? "var(--color-ink)";
            return (
              <button
                key={role.label}
                onClick={() => setSelectedRole(active ? null : role.value)}
                style={{ fontSize: 12, fontWeight: active ? 700 : 500, padding: "7px 14px", borderRadius: 999, border: "1px solid", borderColor: active ? color : "var(--color-line)", background: active ? color : "transparent", color: active ? "#fff" : "var(--color-ink-soft)", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}
              >
                {role.label}
              </button>
            );
          })}
        </div>

        <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--color-ink-soft)" }}>
          <b style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink)" }}>{filtered.length}</b> freelancer{filtered.length !== 1 ? "s" : ""}
        </p>

        {filtered.length === 0 ? (
          <div style={{ padding: 60, borderRadius: 20, border: "1px dashed var(--color-line)", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: 0 }}>No freelancers match those filters.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {filtered.map((f) => <FreelancerCard key={f.id} f={f} />)}
          </div>
        )}
      </main>
    );
  }

  // ── Mobile ───────────────────────────────────────────────────────────────────

  const MOBILE_ROLES = [
    { label: "All",       value: null,        color: "var(--color-ink)" },
    { label: "IT & Software", value: "tech",  color: "#3b82f6" },
    { label: "Events",    value: "events",    color: "#f59e0b" },
    { label: "Teaching",  value: "tuition",   color: "#10b981" },
  ] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid var(--color-line)", flexShrink: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, letterSpacing: "-0.025em", color: "var(--color-ink)" }}>
          Talent Pool
        </h1>
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "3px 0 0" }}>
          {filtered.length} freelancers{selectedRole ? ` in ${selectedRole}` : ""}
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, padding: "10px 12px", overflowX: "auto", flexShrink: 0, scrollbarWidth: "none" }}>
        {MOBILE_ROLES.map((role) => {
          const active = selectedRole === role.value;
          return (
            <button
              key={role.label}
              onClick={() => setSelectedRole(active ? null : role.value)}
              style={{ fontSize: 11, fontWeight: active ? 700 : 500, padding: "6px 12px", borderRadius: 999, border: "1px solid", borderColor: active ? role.color : "var(--color-line)", background: active ? role.color : "transparent", color: active ? "#fff" : "var(--color-ink-soft)", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              {role.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 12px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((f) => {
            const { bg, fg } = avatarColors(f.name);
            return (
              <div key={f.id} style={{ borderRadius: 14, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {initials(f.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-ink)", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>{f.name}</span>
                      {f.rating && <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b" }}>★ {f.rating}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-ink-mute)", marginTop: 1 }}>{f.headline}</div>
                  </div>
                </div>
                {f.skills && f.skills.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {f.skills.map((s) => <span key={s} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-mute)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s}</span>)}
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
