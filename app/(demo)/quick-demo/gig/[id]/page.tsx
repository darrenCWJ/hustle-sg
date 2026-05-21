"use client";

import { useParams, useRouter } from "next/navigation";
import { useDemo } from "../../DemoProvider";
import { useViewMode } from "../../ViewModeContext";
import { GIGS } from "../../data";

const STATUS_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  applied:     { bg: "var(--color-muted)",      fg: "var(--color-ink-soft)",  label: "Applied"      },
  shortlisted: { bg: "#dcfce7",                 fg: "#166534",                label: "Shortlisted"  },
  accepted:    { bg: "var(--color-ink)",         fg: "var(--color-surface)",   label: "Accepted"     },
  rejected:    { bg: "var(--color-muted)",       fg: "var(--color-ink-mute)",  label: "Not selected" },
};

export default function DemoGigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { activeAccount, applyToGig, applications, getGigsForAccount } = useDemo();
  const { viewMode } = useViewMode();

  const allGigs = getGigsForAccount();
  const gig = allGigs.find((g) => g.id === params.id) ?? GIGS.find((g) => g.id === params.id);

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
  const backHref = viewMode === "desktop" ? "/quick-demo/gigs" : "/quick-demo/gigs";

  const ApplyBar = () => {
    if (activeAccount.role !== "freelancer") return null;
    if (existingApp) {
      const st = STATUS_STYLES[existingApp.status];
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "6px 14px", borderRadius: 999, background: st.bg, color: st.fg, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {st.label}
          </span>
          <button
            onClick={() => router.push(`/quick-demo/messages?app=${existingApp.id}`)}
            style={{ fontSize: 13, fontWeight: 600, padding: "8px 18px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", color: "var(--color-accent)", cursor: "pointer" }}
          >
            Message Employer
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => applyToGig(gig.id)}
        style={{ width: "100%", fontSize: 15, fontWeight: 700, padding: "14px 0", borderRadius: 14, border: "none", background: "var(--color-accent)", color: "#fff", cursor: "pointer" }}
      >
        Apply Now
      </button>
    );
  };

  if (viewMode === "desktop") {
    return (
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "50px 28px 80px" }}>
        <button
          onClick={() => router.push(backHref)}
          style={{ fontSize: 13, color: "var(--color-ink-mute)", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 24, fontWeight: 500 }}
        >
          ← Browse Gigs
        </button>

        {/* Budget */}
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 36, fontWeight: 800, color: "var(--color-ink)" }}>
            {gig.budget}
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, margin: "0 0 12px", letterSpacing: "-0.025em", lineHeight: 1.06, color: "var(--color-ink)" }}>
          {gig.title}
        </h1>

        {/* Employer row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, color: "var(--color-ink-soft)" }}>
            Darren Loh
          </span>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "var(--color-jade-soft, #dcfce7)", color: "var(--color-jade-ink, #166534)", fontWeight: 700 }}>
            ✓ Singpass Verified
          </span>
        </div>

        {/* Location + category */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 28px", flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, color: "var(--color-ink-mute)" }}>
            {gig.category} · {gig.location}
          </span>
          {(gig.headcount ?? 1) > 1 && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "var(--color-accent-soft)", color: "var(--color-accent-ink)" }}>
              {gig.headcount} slots
            </span>
          )}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 10px", fontWeight: 600 }}>
            About this gig
          </p>
          <p style={{ fontSize: 16, color: "var(--color-ink-soft)", lineHeight: 1.6, margin: 0 }}>
            {gig.description}
          </p>
        </div>

        {/* Skills */}
        {gig.skills.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 10px", fontWeight: 600 }}>
              Skills required
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {gig.skills.map((s) => (
                <span key={s} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Apply inline for desktop */}
        <div style={{ marginTop: 32 }}>
          <ApplyBar />
        </div>
      </main>
    );
  }

  // Mobile layout — matches app/(mobile)/m/gigs/[id]/page.tsx
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 96 }}>
        {/* Back nav */}
        <div style={{ padding: "14px 18px 0", display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => router.back()}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--color-ink-mute)", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, padding: 0 }}
          >
            ← Back
          </button>
        </div>

        <div style={{ padding: "20px 20px 0" }}>
          {/* Budget */}
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 30, fontWeight: 800, color: "var(--color-ink)" }}>
              {gig.budget}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: "0 0 10px", letterSpacing: "-0.025em", lineHeight: 1.06, color: "var(--color-ink)" }}>
            {gig.title}
          </h1>

          {/* Employer row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, color: "var(--color-ink-soft)" }}>Darren Loh</span>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "var(--color-jade-soft, #dcfce7)", color: "var(--color-jade-ink, #166534)", fontWeight: 700 }}>
              ✓ Singpass Verified
            </span>
          </div>

          {/* Location + category */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 22px", flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "var(--color-ink-mute)" }}>
              {gig.category} · {gig.location}
            </span>
            {(gig.headcount ?? 1) > 1 && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "var(--color-accent-soft)", color: "var(--color-accent-ink)" }}>
                {gig.headcount} slots
              </span>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: 22 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 8px", fontWeight: 600 }}>
              About this gig
            </p>
            <p style={{ fontSize: 15, color: "var(--color-ink-soft)", lineHeight: 1.6, margin: 0 }}>
              {gig.description}
            </p>
          </div>

          {/* Skills */}
          {gig.skills.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 10px", fontWeight: 600 }}>
                Skills required
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {gig.skills.map((s) => (
                  <span key={s} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom apply bar */}
      {activeAccount.role === "freelancer" && (
        <div style={{ position: "absolute", bottom: "calc(58px + env(safe-area-inset-bottom, 0px))", left: 0, right: 0, padding: "12px 20px", background: "var(--color-surface-raised)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: "1px solid var(--color-line)" }}>
          <ApplyBar />
        </div>
      )}
    </div>
  );
}
