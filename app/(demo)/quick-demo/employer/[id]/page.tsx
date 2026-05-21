"use client";

import { useParams, useRouter } from "next/navigation";
import { useDemo } from "../../DemoProvider";
import { useViewMode } from "../../ViewModeContext";
import { GIGS, PROFILES } from "../../data";

const EMPLOYER_BIO: Record<string, { bio: string; location: string; memberSince: string }> = {
  requestor: {
    bio: "Operations Director at Demo Corp SG. Regularly engages freelance talent across tech, design, and events. Singpass-verified and payment-protected on every assignment.",
    location: "Raffles Place, Singapore",
    memberSince: "Jan 2025",
  },
};

const AVATAR_HUES = [250, 165, 340, 38, 260, 200, 78, 310];
function avatarColors(name: string) {
  const hue = AVATAR_HUES[(name.charCodeAt(0) + (name.charCodeAt(1) ?? 0)) % AVATAR_HUES.length];
  return { bg: `oklch(78% 0.08 ${hue})`, fg: `oklch(22% 0.08 ${hue})` };
}
function initials(name: string) {
  return name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
}

export default function DemoEmployerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { viewMode } = useViewMode();
  const { applications, ratings } = useDemo();

  const profile = PROFILES.find((p) => p.id === id);
  if (!profile || profile.role !== "employer") {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-mute)" }}>
        Employer not found.
      </div>
    );
  }

  const bio = EMPLOYER_BIO[id] ?? EMPLOYER_BIO.requestor;
  const { bg: avBg, fg: avFg } = avatarColors(profile.name);
  const ini = initials(profile.name);

  // Fulfillment metrics
  const fulfilledGigIds = new Set(
    applications
      .filter((a) => a.status === "accepted" || a.status === "completed")
      .map((a) => a.gigId),
  );
  const totalRaised = GIGS.length;
  const fulfilledCount = fulfilledGigIds.size;
  const activeCount = totalRaised - fulfilledCount;
  const fulfilledPct = totalRaised > 0 ? Math.round((fulfilledCount / totalRaised) * 100) : 0;
  const workersHired = applications.filter(
    (a) => a.status === "accepted" || a.status === "completed",
  ).length;

  // Reviews received by this employer
  const myRatings = (ratings ?? []).filter((r) => r.toId === id);
  const avgStars =
    myRatings.length > 0
      ? Math.round((myRatings.reduce((s, r) => s + r.stars, 0) / myRatings.length) * 10) / 10
      : null;

  const STATS = [
    { label: "Total raised", value: totalRaised, sub: "gigs posted" },
    { label: "Fulfilled", value: fulfilledCount, sub: "gigs completed" },
    { label: "Active", value: activeCount, sub: "open now" },
    { label: "Workers", value: workersHired, sub: "hired" },
    ...(avgStars !== null
      ? [{ label: "Rating", value: `★ ${avgStars}`, sub: `${myRatings.length} review${myRatings.length !== 1 ? "s" : ""}` }]
      : []),
  ];

  if (viewMode === "desktop") {
    return (
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 28px 80px" }}>
        <button
          onClick={() => router.back()}
          style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 32, fontWeight: 600 }}
        >
          ← Back
        </button>

        {/* Hero: 2 columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 40, marginBottom: 36, alignItems: "start" }}>
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#dcfce7", color: "#166534", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Singpass ✓
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-mute)", padding: "3px 10px", borderRadius: 999, background: "var(--color-muted)" }}>
                @{profile.name.toLowerCase().replace(/\s+/g, ".")}
              </span>
              <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>📍 {bio.location}</span>
            </div>

            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 4.5vw, 5rem)", margin: "0 0 12px", lineHeight: 0.95, letterSpacing: "-0.04em" }}>
              {profile.name}
            </h1>

            {profile.headline && (
              <p style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 14px", color: "var(--color-ink-soft)", letterSpacing: "-0.02em" }}>
                {profile.headline}
              </p>
            )}

            <p style={{ fontSize: 15, color: "var(--color-ink-soft)", lineHeight: 1.6, margin: "0 0 24px", maxWidth: 520 }}>
              {bio.bio}
            </p>
          </div>

          {/* Trust panel */}
          <div style={{ borderRadius: 20, background: "var(--color-ink)", color: "var(--color-surface)", padding: 28 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 700, margin: "0 0 6px" }}>Trust panel</p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 20px", letterSpacing: "-0.025em" }}>Verified requestor</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {[
                { label: "Singpass identity", value: "L2 verified", ok: true },
                { label: "Payment escrow", value: "SGD protected", ok: true },
                { label: "Fulfillment rate", value: totalRaised > 0 ? `${fulfilledPct}%` : "No gigs yet", ok: fulfilledPct >= 50 || totalRaised === 0 },
                { label: "Workers hired", value: workersHired > 0 ? `${workersHired} total` : "None yet", ok: workersHired > 0 },
                { label: "Member since", value: bio.memberSince, ok: true },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: 13, color: "oklch(100% 0 0 / 0.7)" }}>{item.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.ok ? "#4ade80" : "oklch(100% 0 0 / 0.3)", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: item.ok ? "#4ade80" : "oklch(100% 0 0 / 0.5)" }}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid oklch(100% 0 0 / 0.12)", paddingTop: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "oklch(100% 0 0 / 0.5)", margin: "0 0 4px", fontWeight: 600 }}>Fulfillment rate</p>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 48, margin: 0, lineHeight: 1, letterSpacing: "-0.04em" }}>
                    {fulfilledPct}<span style={{ fontSize: 18, opacity: 0.5 }}>%</span>
                  </p>
                </div>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-accent)", fontWeight: 700 }}>
                  {fulfilledCount}/{totalRaised} gigs
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "oklch(100% 0 0 / 0.12)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${fulfilledPct}%`, background: "linear-gradient(90deg, var(--color-accent), #4ade80)", borderRadius: 999, transition: "width 0.8s ease" }} />
              </div>
              <p style={{ fontSize: 11, color: "oklch(100% 0 0 / 0.4)", margin: "10px 0 0", lineHeight: 1.4 }}>
                Freelancers see this panel before applying. High fulfillment rate signals reliable payments.
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${STATS.length}, 1fr)`, gap: 12, marginBottom: 40 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ padding: "18px 20px", borderRadius: 16, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: "var(--color-ink)", margin: 0, letterSpacing: "-0.02em" }}>{s.value}</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-soft)", margin: "4px 0 1px", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</p>
              <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: 0 }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Body: 2 columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32, alignItems: "start" }}>
          {/* Recent assignments */}
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, letterSpacing: "-0.02em" }}>Recent assignments</h2>
              <span style={{ fontSize: 12, color: "var(--color-ink-soft)", fontFamily: "var(--font-mono)" }}>{totalRaised} total</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {GIGS.slice(0, 8).map((g) => {
                const isFulfilled = fulfilledGigIds.has(g.id);
                return (
                  <div
                    key={g.id}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)", gap: 10, cursor: "pointer" }}
                    onClick={() => router.push(`/quick-demo/gig/${g.id}`)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--font-display)", fontSize: 14, margin: "0 0 2px", letterSpacing: "-0.015em", lineHeight: 1.2 }}>{g.title}</p>
                      <p style={{ fontSize: 10, color: "var(--color-ink-mute)", margin: 0 }}>
                        {g.category}{g.duration ? ` · ${g.duration}` : ""} · {g.budget}
                      </p>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: isFulfilled ? "#dcfce7" : "var(--color-accent-soft)", color: isFulfilled ? "#166534" : "var(--color-accent-ink)", letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>
                      {isFulfilled ? "Fulfilled" : "Active"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Reviews */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {avgStars !== null && (
              <div style={{ padding: "18px 20px", borderRadius: 16, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 6px", fontWeight: 600 }}>Rating</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "#f59e0b", margin: 0 }}>★ {avgStars}</p>
                <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "3px 0 0" }}>{myRatings.length} review{myRatings.length !== 1 ? "s" : ""} from workers</p>
              </div>
            )}

            <div style={{ padding: "18px 20px", borderRadius: 16, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 12px", fontWeight: 600 }}>
                Reviews from workers
              </p>
              {myRatings.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {myRatings.slice(-5).reverse().map((r) => (
                    <div key={r.id} style={{ paddingBottom: 12, borderBottom: "1px solid var(--color-line)" }}>
                      <div style={{ color: "#f59e0b", fontSize: 14, marginBottom: 4 }}>
                        {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                      </div>
                      <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: "0 0 4px", lineHeight: 1.5 }}>{r.review}</p>
                      <p style={{ fontSize: 10, color: "var(--color-ink-mute)", margin: 0 }}>{r.gigTitle}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--color-ink-mute)", margin: 0, lineHeight: 1.5 }}>
                  No reviews yet. Workers can leave a review after a gig is completed.
                </p>
              )}
            </div>

            <div style={{ padding: "16px 18px", borderRadius: 16, background: "var(--color-muted)", fontSize: 12, color: "var(--color-ink-mute)", lineHeight: 1.5 }}>
              Demo profile — real profiles include full assignment history and verified payment records.
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Mobile layout
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px 0" }}>
        <button
          onClick={() => router.back()}
          style={{ fontSize: 13, color: "var(--color-ink-mute)", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 500 }}
        >
          ← Back
        </button>
      </div>

      {/* Hero card */}
      <div style={{ padding: "16px 16px 14px", borderBottom: "1px solid var(--color-line)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: avBg, color: avFg, display: "grid", placeItems: "center", fontSize: 17, fontWeight: 800, flexShrink: 0 }}>
            {ini}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 19, margin: "0 0 2px", letterSpacing: "-0.02em" }}>{profile.name}</h1>
            <p style={{ fontSize: 12, color: "var(--color-ink-mute)", margin: 0 }}>{profile.headline}</p>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: "#dcfce7", color: "#166534", letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>
            Singpass ✓
          </span>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-ink-soft)", lineHeight: 1.5, margin: "0 0 6px" }}>{bio.bio}</p>
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: 0 }}>📍 {bio.location}</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[
            { label: "Raised", value: totalRaised },
            { label: "Fulfilled", value: fulfilledCount },
            { label: "Hired", value: workersHired },
          ].map((s) => (
            <div key={s.label} style={{ padding: "10px 12px", borderRadius: 12, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--color-ink)", margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 9, color: "var(--color-ink-mute)", margin: "2px 0 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Trust panel */}
        <div style={{ borderRadius: 16, background: "var(--color-ink)", color: "var(--color-surface)", padding: 16 }}>
          <p style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 700, margin: "0 0 8px" }}>Requestor trust</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: "-0.04em" }}>{fulfilledPct}</span>
            <span style={{ fontSize: 14, opacity: 0.4 }}>% fulfilled</span>
          </div>
          <div style={{ height: 5, borderRadius: 999, background: "oklch(100% 0 0 / 0.12)", overflow: "hidden", marginBottom: 10 }}>
            <div style={{ height: "100%", width: `${fulfilledPct}%`, background: "linear-gradient(90deg, var(--color-accent), #4ade80)", borderRadius: 999 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {[
              { label: "Singpass", value: "L2 ✓", ok: true },
              { label: "Escrow", value: "SGD ✓", ok: true },
              { label: "Raised", value: `${totalRaised} gigs`, ok: true },
              { label: "Member since", value: bio.memberSince, ok: true },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "oklch(100% 0 0 / 0.6)" }}>{item.label}</span>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: item.ok ? "#4ade80" : "oklch(100% 0 0 / 0.35)" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: 0, fontWeight: 600 }}>Reviews from workers</p>
            {avgStars !== null && (
              <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>★ {avgStars}</span>
            )}
          </div>
          {myRatings.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {myRatings.slice(-3).reverse().map((r) => (
                <div key={r.id} style={{ paddingBottom: 10, borderBottom: "1px solid var(--color-line)" }}>
                  <div style={{ color: "#f59e0b", fontSize: 13, marginBottom: 3 }}>
                    {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: "0 0 3px", lineHeight: 1.5 }}>{r.review}</p>
                  <p style={{ fontSize: 10, color: "var(--color-ink-mute)", margin: 0 }}>{r.gigTitle}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--color-ink-mute)", margin: 0, lineHeight: 1.5 }}>
              No reviews yet — complete a gig to receive your first review.
            </p>
          )}
        </div>

        {/* Recent assignments */}
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 8px", fontWeight: 600 }}>
            Recent assignments
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {GIGS.slice(0, 5).map((g) => {
              const isFulfilled = fulfilledGigIds.has(g.id);
              return (
                <div
                  key={g.id}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)", cursor: "pointer" }}
                  onClick={() => router.push(`/quick-demo/gig/${g.id}`)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, margin: "0 0 1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.title}</p>
                    <p style={{ fontSize: 10, color: "var(--color-ink-mute)", margin: 0 }}>{g.category} · {g.budget}</p>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: isFulfilled ? "#dcfce7" : "var(--color-accent-soft)", color: isFulfilled ? "#166534" : "var(--color-accent-ink)", flexShrink: 0 }}>
                    {isFulfilled ? "Done" : "Active"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
