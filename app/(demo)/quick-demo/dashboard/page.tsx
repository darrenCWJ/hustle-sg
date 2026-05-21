"use client";

import { useRouter } from "next/navigation";
import { useDemo } from "../DemoProvider";
import { useViewMode } from "../ViewModeContext";
import { GIGS, PROFILES } from "../data";

const STATUS_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  applied:     { bg: "var(--color-accent-soft)",   fg: "var(--color-accent-ink)", label: "New"         },
  shortlisted: { bg: "var(--color-jade-soft, #dcfce7)", fg: "#166534",            label: "Shortlisted" },
  accepted:    { bg: "var(--color-ink)",            fg: "var(--color-surface)",    label: "Accepted"    },
  rejected:    { bg: "var(--color-muted)",          fg: "var(--color-ink-mute)",   label: "Rejected"    },
};

const AVATAR_HUES = [250, 165, 340, 38, 260, 200, 78, 310];

function avatarHue(name: string) {
  return AVATAR_HUES[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_HUES.length];
}

const STEPS = ["Applied", "Shortlist", "Accepted"];

function getStep(status: string) {
  if (status === "accepted") return 3;
  if (status === "shortlisted") return 2;
  return 1;
}

// ── Employer desktop ───────────────────────────────────────────────────────────

function EmployerDesktop() {
  const router = useRouter();
  const { getApplicationsForRequestor, updateApplicationStatus, getMessagesForApplication } = useDemo();
  const allApps = getApplicationsForRequestor();

  const totalApps = allApps.length;
  const pending = allApps.filter((a) => a.status === "applied").length;
  const shortlisted = allApps.filter((a) => a.status === "shortlisted").length;
  const accepted = allApps.filter((a) => a.status === "accepted").length;

  const gigsWithApps = GIGS.map((g) => ({
    ...g,
    applicants: allApps.filter((a) => a.gigId === g.id),
  }));

  const recentApps = allApps.slice(0, 8);

  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 40, gap: 20, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 8px" }}>
            Employer dashboard
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 4vw, 4rem)", margin: 0, lineHeight: 0.98, letterSpacing: "-0.035em" }}>
            Your assignments,{" "}
            <span style={{ color: "var(--color-accent-ink)" }}>managed</span>.
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => router.push("/quick-demo/applicants")}
            style={{ padding: "9px 18px", borderRadius: 999, border: "1px solid var(--color-line)", fontSize: 13, fontWeight: 600, background: "transparent", cursor: "pointer" }}
          >
            All applicants
          </button>
          <button
            onClick={() => router.push("/quick-demo/post")}
            style={{ padding: "10px 20px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            + Post assignment
          </button>
        </div>
      </header>

      {/* KPI tiles */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 36 }}>
        {[
          { label: "Open Assignments", value: GIGS.length, sub: "live now", dark: true },
          { label: "Total Applicants", value: totalApps, sub: "across all gigs", dark: false },
          { label: "Pending Review", value: pending, sub: "awaiting decision", dark: false },
          { label: "Accepted", value: accepted, sub: "this session", dark: false },
        ].map(({ label, value, sub, dark }) => (
          <div
            key={label}
            style={{ padding: "22px 24px", borderRadius: 18, background: dark ? "var(--color-ink)" : "var(--color-surface-raised)", border: dark ? "none" : "1px solid var(--color-line)", color: dark ? "var(--color-surface)" : "inherit" }}
          >
            <p style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: dark ? "var(--color-accent)" : "var(--color-ink-soft)", margin: 0, fontWeight: 600 }}>
              {label}
            </p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 44, margin: "6px 0 0", letterSpacing: "-0.04em", lineHeight: 1 }}>
              {value}
            </p>
            <p style={{ fontSize: 12, color: dark ? "oklch(100% 0 0 / 0.5)" : "var(--color-ink-mute)", margin: "4px 0 0", fontFamily: "var(--font-mono)" }}>
              {sub}
            </p>
          </div>
        ))}
      </section>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 24 }}>
        {/* Posted gigs */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: 0, letterSpacing: "-0.025em" }}>
              Posted assignments
            </h2>
            <button
              onClick={() => router.push("/quick-demo/post")}
              style={{ fontSize: 12, color: "var(--color-ink-soft)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
            >
              + New →
            </button>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {gigsWithApps.map((g) => (
              <li key={g.id} style={{ padding: "18px 20px", borderRadius: 14, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14.5, margin: "0 0 3px", color: "var(--color-ink)" }}>{g.title}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--color-ink-mute)" }}>{g.category} · {g.postedAgo}</p>
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "var(--color-jade-soft, #dcfce7)", color: "#166534", whiteSpace: "nowrap" }}>
                    Open
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-soft)" }}>
                    {g.applicants.length} applicant{g.applicants.length !== 1 ? "s" : ""} · {g.budget}
                  </span>
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
        </section>

        {/* Recent applicants */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: 0, letterSpacing: "-0.025em" }}>
              Recent applicants
            </h2>
            <button
              onClick={() => router.push("/quick-demo/applicants")}
              style={{ fontSize: 12, color: "var(--color-ink-soft)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
            >
              View all →
            </button>
          </div>
          {recentApps.length === 0 ? (
            <div style={{ padding: "40px 24px", borderRadius: 18, border: "1px dashed var(--color-line)", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: 0 }}>
                Applicants appear once workers apply to your gigs.
              </p>
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {recentApps.map((a) => {
                const name = a.freelancer?.name ?? "?";
                const hue = avatarHue(name);
                const initials = name.split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase();
                const asc = STATUS_STYLES[a.status] ?? STATUS_STYLES.applied;
                return (
                  <li key={a.id} style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 38, height: 38, borderRadius: "50%", background: `oklch(78% 0.08 ${hue})`, color: `oklch(22% 0.08 ${hue})`, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {initials}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5 }}>{name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-ink-mute)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.gig?.title ?? ""}
                      </p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: asc.bg, color: asc.fg, whiteSpace: "nowrap" }}>
                      {asc.label}
                    </span>
                    <button
                      onClick={() => router.push(`/quick-demo/review/${a.id}`)}
                      style={{ fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      Review →
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

// ── Worker desktop ─────────────────────────────────────────────────────────────

function WorkerDesktop() {
  const router = useRouter();
  const { activeAccount, getApplicationsForAccount } = useDemo();
  const apps = getApplicationsForAccount();

  const active = apps.filter((a) => ["applied", "shortlisted"].includes(a.status)).length;
  const accepted = apps.filter((a) => a.status === "accepted").length;

  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 40, gap: 20, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 8px" }}>
            Worker dashboard
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 4vw, 4rem)", margin: 0, lineHeight: 0.98, letterSpacing: "-0.035em" }}>
            Your gig work,{" "}
            <span style={{ color: "var(--color-accent-ink)" }}>tracked</span>.
          </h1>
        </div>
        <button
          onClick={() => router.push("/quick-demo/gigs")}
          style={{ padding: "10px 20px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          Browse gigs →
        </button>
      </header>

      {/* KPI tiles */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 36 }}>
        <div style={{ padding: "22px 24px", borderRadius: 18, background: "var(--color-ink)", color: "var(--color-surface)" }}>
          <p style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-accent)", margin: 0, fontWeight: 600 }}>
            Applications sent
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 52, margin: "6px 0 0", letterSpacing: "-0.04em", lineHeight: 1 }}>{apps.length}</p>
          <p style={{ fontSize: 12, color: "oklch(100% 0 0 / 0.5)", margin: "4px 0 0", fontFamily: "var(--font-mono)" }}>total</p>
        </div>
        <div style={{ padding: "22px 24px", borderRadius: 18, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
          <p style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-ink-soft)", margin: 0, fontWeight: 600 }}>Active</p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 52, margin: "6px 0 0", letterSpacing: "-0.04em", lineHeight: 1 }}>{active}</p>
          <p style={{ fontSize: 12, color: "var(--color-ink-mute)", margin: "4px 0 0", fontFamily: "var(--font-mono)" }}>in progress</p>
        </div>
        <div style={{ padding: "22px 24px", borderRadius: 18, background: "var(--color-jade-soft, #dcfce7)", border: "1px solid oklch(from #16a34a l c h / 0.3)" }}>
          <p style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#166534", margin: 0, fontWeight: 600 }}>Accepted</p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 52, margin: "6px 0 0", letterSpacing: "-0.04em", lineHeight: 1, color: "#166534" }}>{accepted}</p>
          <p style={{ fontSize: 12, color: "#166534", margin: "4px 0 0", fontFamily: "var(--font-mono)", opacity: 0.7 }}>gigs won</p>
        </div>
      </section>

      {/* Applications + playbook */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: "0 0 16px", letterSpacing: "-0.025em" }}>
            My applications
          </h2>
          {apps.length === 0 ? (
            <div style={{ padding: "40px 24px", borderRadius: 18, border: "1px dashed var(--color-line)", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: "0 0 16px" }}>No applications yet.</p>
              <button onClick={() => router.push("/quick-demo/gigs")} style={{ padding: "9px 18px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
                Browse open gigs →
              </button>
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {apps.map((a) => {
                const gig = GIGS.find((g) => g.id === a.gigId);
                const conf = STATUS_STYLES[a.status] ?? STATUS_STYLES.applied;
                const step = getStep(a.status);
                const isDone = a.status === "rejected";
                return (
                  <li key={a.id} style={{ padding: 16, borderRadius: 14, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)", opacity: isDone ? 0.55 : 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10, marginBottom: isDone ? 0 : 12 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 3px", color: "var(--color-ink)" }}>
                          {gig?.title ?? "Unknown gig"}
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: "var(--color-ink-mute)" }}>
                          {gig?.category} · {gig?.postedAgo}
                        </p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: conf.bg, color: conf.fg, whiteSpace: "nowrap" }}>
                        {conf.label}
                      </span>
                    </div>
                    {!isDone && (
                      <div style={{ display: "grid", gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`, gap: 4 }}>
                        {STEPS.map((s, i) => (
                          <div key={s}>
                            <div style={{ height: 3, borderRadius: 999, background: i < step - 1 ? "var(--color-ink)" : i === step - 1 ? "var(--color-accent)" : "var(--color-muted)" }} />
                            <p style={{ margin: "4px 0 0", fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: i < step ? "var(--color-ink)" : "var(--color-ink-mute)", fontWeight: 600 }}>
                              {s}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Playbook */}
        <div style={{ padding: 28, borderRadius: 22, background: "var(--color-ink)", color: "var(--color-surface)", alignSelf: "start" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 600, margin: "0 0 10px" }}>
            What&apos;s next
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: "0 0 20px", letterSpacing: "-0.025em" }}>
            Your <span style={{ color: "var(--color-accent)" }}>demo</span> playbook.
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { t: "Browse open assignments and find your next gig", cta: "Browse gigs", href: "/quick-demo/gigs", highlight: true },
              { t: "Check your profile details and skills listing", cta: "My profile", href: "/quick-demo/profile", highlight: false },
              { t: "View messages from the employer", cta: "Messages", href: "/quick-demo/messages", highlight: false },
            ].map((s, i) => (
              <li key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 0", borderTop: "1px solid oklch(100% 0 0 / 0.1)" }}>
                <span style={{ fontSize: 13, color: "oklch(100% 0 0 / 0.85)", lineHeight: 1.4 }}>{s.t}</span>
                <button
                  onClick={() => router.push(s.href)}
                  style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 999, background: s.highlight ? "var(--color-accent)" : "oklch(100% 0 0 / 0.12)", color: s.highlight ? "oklch(22% 0.08 38)" : "var(--color-surface)", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  {s.cta}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

// ── Mobile layout (employer) ───────────────────────────────────────────────────

function EmployerMobile() {
  const router = useRouter();
  const { getApplicationsForRequestor, updateApplicationStatus, getMessagesForApplication } = useDemo();
  const allApps = getApplicationsForRequestor();

  const pending = allApps.filter((a) => a.status === "applied").length;
  const shortlisted = allApps.filter((a) => a.status === "shortlisted").length;
  const accepted = allApps.filter((a) => a.status === "accepted").length;

  const gigsWithApps = GIGS.map((gig) => ({
    ...gig,
    applicants: allApps.filter((a) => a.gigId === gig.id),
  })).filter((g) => g.applicants.length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid var(--color-line)", flexShrink: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, letterSpacing: "-0.025em", color: "var(--color-ink)" }}>
          Applicants
        </h1>
        <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "3px 0 0" }}>
          {GIGS.length} posted gigs · {allApps.length} total applications
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px 12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Pending", value: pending, color: "var(--color-accent)" },
            { label: "Shortlisted", value: shortlisted, color: "#16a34a" },
            { label: "Accepted", value: accepted, color: "var(--color-ink)" },
          ].map((kpi) => (
            <div key={kpi.label} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: kpi.color }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 10, color: "var(--color-ink-mute)", marginTop: 2 }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {gigsWithApps.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-mute)", fontSize: 13 }}>
            No applications yet. Switch to a freelancer account and apply to gigs!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {gigsWithApps.map((gig) => (
              <div key={gig.id}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 13, margin: "0 0 8px", color: "var(--color-ink)", letterSpacing: "-0.01em" }}>
                  {gig.title}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {gig.applicants.map((app) => {
                    const freelancer = PROFILES.find((p) => p.id === app.freelancerId);
                    const st = STATUS_STYLES[app.status] ?? STATUS_STYLES.applied;
                    const msgs = getMessagesForApplication(app.id);
                    return (
                      <div key={app.id} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--color-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "var(--color-ink-soft)" }}>
                              {freelancer?.avatar}
                            </div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink)" }}>{freelancer?.name}</div>
                              <div style={{ fontSize: 10, color: "var(--color-ink-mute)" }}>{freelancer?.specialization}</div>
                            </div>
                          </div>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: st.bg, color: st.fg, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {st.label}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {app.status === "applied" && (
                            <>
                              <button onClick={() => updateApplicationStatus(app.id, "shortlisted")} style={{ fontSize: 10, fontWeight: 700, padding: "5px 10px", borderRadius: 6, border: "none", background: "#dcfce7", color: "#166534", cursor: "pointer" }}>Shortlist</button>
                              <button onClick={() => updateApplicationStatus(app.id, "rejected")} style={{ fontSize: 10, fontWeight: 700, padding: "5px 10px", borderRadius: 6, border: "1px solid var(--color-line)", background: "transparent", color: "var(--color-ink-mute)", cursor: "pointer" }}>Reject</button>
                            </>
                          )}
                          {app.status === "shortlisted" && (
                            <button onClick={() => updateApplicationStatus(app.id, "accepted")} style={{ fontSize: 10, fontWeight: 700, padding: "5px 10px", borderRadius: 6, border: "none", background: "var(--color-ink)", color: "var(--color-surface)", cursor: "pointer" }}>Accept</button>
                          )}
                          <button onClick={() => router.push(`/quick-demo/messages?app=${app.id}`)} style={{ fontSize: 10, fontWeight: 600, padding: "5px 10px", borderRadius: 6, border: "1px solid var(--color-line)", background: "transparent", color: "var(--color-accent)", cursor: "pointer" }}>
                            Message{msgs.length > 0 ? ` (${msgs.length})` : ""}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────

export default function DemoDashboardPage() {
  const { activeAccount } = useDemo();
  const { viewMode } = useViewMode();

  if (viewMode === "desktop") {
    return activeAccount.role === "employer" ? <EmployerDesktop /> : <WorkerDesktop />;
  }

  if (activeAccount.role === "employer") return <EmployerMobile />;

  // Worker mobile — redirect to feed
  return <WorkerDesktop />;
}
