"use client";

import { useRouter } from "next/navigation";
import { useDemo } from "../DemoProvider";
import { useViewMode } from "../ViewModeContext";
import { GIGS } from "../data";

export default function DemoMyGigsPage() {
  const router = useRouter();
  const { getApplicationsForRequestor } = useDemo();
  const { viewMode } = useViewMode();
  const allApps = getApplicationsForRequestor();

  const gigsWithCounts = GIGS.map((g) => ({
    ...g,
    appCount: allApps.filter((a) => a.gigId === g.id).length,
  }));

  if (viewMode === "desktop") {
    return (
      <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 36, gap: 20, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 8px" }}>
              Employer
            </p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 4vw, 4rem)", margin: 0, lineHeight: 0.98, letterSpacing: "-0.035em" }}>
              Posted <span style={{ color: "var(--color-accent-ink)" }}>assignments</span>.
            </h1>
          </div>
          <button
            onClick={() => router.push("/quick-demo/post")}
            style={{ padding: "10px 22px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            + Post assignment
          </button>
        </header>

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {gigsWithCounts.map((g) => (
            <li key={g.id} style={{ padding: "18px 20px", borderRadius: 14, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 3px", color: "var(--color-ink)" }}>{g.title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--color-ink-mute)" }}>
                    {g.category} · {g.postedAgo}
                  </p>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "var(--color-jade-soft, #dcfce7)", color: "var(--color-jade-ink, #166534)", whiteSpace: "nowrap" }}>
                  Open
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-soft)" }}>
                    {g.appCount} applicant{g.appCount !== 1 ? "s" : ""}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-soft)" }}>
                    {g.budget}
                  </span>
                </div>
                <button
                  onClick={() => router.push(`/quick-demo/applicants?gig=${g.id}`)}
                  style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Applicants →
                </button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  // Mobile
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid var(--color-line)", flexShrink: 0 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 4px", fontWeight: 600 }}>
          Employer
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, letterSpacing: "-0.025em", color: "var(--color-ink)" }}>
          My Gigs
        </h1>
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "3px 0 0" }}>
          {GIGS.length} posted · {allApps.length} total applications
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {gigsWithCounts.map((g) => (
            <div
              key={g.id}
              style={{ padding: "12px 14px", borderRadius: 14, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", boxShadow: "var(--shadow-soft)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 4 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 14, margin: 0, letterSpacing: "-0.01em", color: "var(--color-ink)", flex: 1, marginRight: 8 }}>
                  {g.title}
                </h3>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "var(--color-jade-soft, #dcfce7)", color: "var(--color-jade-ink, #166534)", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>
                  Open
                </span>
              </div>
              <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "0 0 8px" }}>
                {g.budget} · {g.location}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-soft)" }}>
                  {g.appCount} applicant{g.appCount !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => router.push(`/quick-demo/applicants?gig=${g.id}`)}
                  style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--color-line)", background: "transparent", color: "var(--color-accent)", cursor: "pointer" }}
                >
                  Applicants →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
