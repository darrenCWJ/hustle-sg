import { notFound } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { computeTrustScore } from "@/lib/trust/score";
import Link from "next/link";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const supabase = await createClient();
  const service = createServiceClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle)
    .maybeSingle();
  if (!profile) notFound();

  const [{ data: certs }, { data: items }, { data: hiredApps }] = await Promise.all([
    supabase
      .from("certifications")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("portfolio_items")
      .select("*")
      .eq("user_id", profile.id)
      .order("display_order"),
    service
      .from("applications")
      .select("id, created_at, gigs(id, title, employer_id)")
      .eq("applicant_id", profile.id)
      .eq("status", "hired")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === profile.id;

  const verified = Boolean(profile.singpass_verified_at);
  const verifiedCerts = (certs ?? []).filter((c: any) => c.verified_at);
  const totalCerts = (certs ?? []).length;
  const hiredCount = (hiredApps ?? []).length;

  const trust = computeTrustScore({
    singpassVerified: verified,
    verifiedCertCount: verifiedCerts.length,
    portfolioItemCount: (items ?? []).length,
    hiredCount,
  });

  // Aggregate top skills from all certs' extracted_skills
  const allSkills = (certs ?? []).flatMap((c: any) => c.extracted_skills ?? []);
  const skillFreq = allSkills.reduce((acc: Record<string, number>, s: string) => {
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topSkills = Object.entries(skillFreq)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 6)
    .map(([skill]) => skill);

  const initials = (profile.display_name ?? "?")
    .split(" ")
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 28px 60px" }}>
      {/* ── HERO ── */}
      <section style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 36, alignItems: "end", marginBottom: 60 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            {verified && (
              <span className="pill" style={{ background: "var(--color-trust-soft)", color: "var(--color-trust)" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path d="M1.5 5 4 7.5 8.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Singpass verified
              </span>
            )}
            <span style={{ fontSize: 12, color: "var(--color-ink-soft)", fontFamily: "var(--font-mono)" }}>
              @{profile.handle}
            </span>
            {profile.location && (
              <span style={{ fontSize: 12, color: "var(--color-ink-mute)" }}>· {profile.location}</span>
            )}
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 6vw, 5.5rem)", margin: "0 0 12px", lineHeight: 0.94, letterSpacing: "-0.04em" }}>
            {profile.display_name}
          </h1>

          {profile.headline && (
            <p style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--color-ink-soft)", margin: "0 0 18px", letterSpacing: "-0.015em" }}>
              {profile.headline}
            </p>
          )}

          {profile.bio && (
            <p style={{ fontSize: 15, color: "var(--color-ink-soft)", maxWidth: 540, lineHeight: 1.6, margin: "0 0 22px" }}>
              {profile.bio}
            </p>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {isOwner ? (
              <Link href="/profile/edit" style={{ padding: "9px 18px", borderRadius: 999, border: "1px solid var(--color-line)", fontSize: 13, fontWeight: 600 }}>
                Edit profile
              </Link>
            ) : (
              <>
                <Link href="/singpass" style={{ padding: "9px 18px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 13, fontWeight: 600 }}>
                  Hire for a gig
                </Link>
                <Link href="/gigs/new" style={{ padding: "9px 18px", borderRadius: 999, border: "1px solid var(--color-line)", fontSize: 13, fontWeight: 600 }}>
                  Post an assignment
                </Link>
              </>
            )}
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 28, marginTop: 28, flexWrap: "wrap" }}>
            {[
              ["Credentials", `${totalCerts}`, "uploaded"],
              ["Verified", `${verifiedCerts.length}`, `of ${totalCerts}`],
              ["Portfolio", `${(items ?? []).length}`, "items"],
              ["Completed", `${hiredCount}`, "gigs"],
            ].map(([k, v, s]) => (
              <div key={k}>
                <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-ink-soft)", margin: 0 }}>{k}</p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: "4px 0 0", letterSpacing: "-0.03em", lineHeight: 1 }}>{v}</p>
                <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "2px 0 0" }}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Panel */}
        <aside className="grain" style={{ borderRadius: 22, background: "var(--color-ink)", color: "var(--color-surface)", padding: 26, position: "relative", overflow: "hidden" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 600, margin: "0 0 10px" }}>
            Trust panel
          </p>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: "0 0 18px", letterSpacing: "-0.025em" }}>
            Verified on gig work
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Singpass identity", ok: verified, badge: verified ? "L2 identity" : "Not verified" },
              { label: "MyInfo prefill", ok: verified, badge: verified ? "synced" : "pending" },
              { label: "WSQ / degree certs", ok: verifiedCerts.length > 0, badge: `${verifiedCerts.length} of ${totalCerts}` },
              { label: "Completed gigs", ok: hiredCount > 0, badge: hiredCount > 0 ? `${hiredCount} done` : "None yet" },
            ].map(({ label, ok, badge }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", background: ok ? "var(--color-jade)" : "oklch(100% 0 0 / 0.2)", display: "grid", placeItems: "center", fontSize: 9, color: "white", fontWeight: 700 }}>
                    {ok ? "✓" : "–"}
                  </span>
                  {label}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "oklch(100% 0 0 / 0.6)" }}>{badge}</span>
              </div>
            ))}
          </div>

          {/* Trust score */}
          <div style={{ marginTop: 22, padding: 14, borderRadius: 12, background: "oklch(100% 0 0 / 0.06)" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-accent)", margin: 0 }}>Trust score</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 44, letterSpacing: "-0.035em", lineHeight: 1 }}>
                {trust.score}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "oklch(100% 0 0 / 0.6)" }}>
                / 100 · {trust.percentile}
              </span>
            </div>
            <div style={{ marginTop: 10, height: 5, borderRadius: 999, background: "oklch(100% 0 0 / 0.12)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${trust.score}%`, background: "var(--color-accent)", borderRadius: 999, transition: "width 0.8s var(--ease-out-expo)" }} />
            </div>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
              {trust.breakdown.filter(b => b.points > 0).map(b => (
                <div key={b.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "oklch(100% 0 0 / 0.5)" }}>
                  <span>{b.label}</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>+{b.points}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 11.5, color: "oklch(100% 0 0 / 0.55)", margin: "14px 0 0", lineHeight: 1.5 }}>
            Employers see this panel before contacting. High trust moves applications to the top of the stack.
          </p>
        </aside>
      </section>

      {/* ── Portfolio ── */}
      {items && items.length > 0 && (
        <section style={{ marginBottom: 70 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 38, margin: 0, letterSpacing: "-0.03em" }}>Portfolio</h2>
            <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>{items.length} items</span>
          </div>
          <div className="bento">
            {items.map((item: any, idx: number) => {
              const cellClass = idx === 0 ? "cell-lg tall" : idx % 3 === 0 ? "cell-lg" : "cell-md";
              return <PortfolioCell key={item.id} item={item} cellClass={cellClass} />;
            })}
          </div>
        </section>
      )}

      {/* ── What they work on (from cert skills) ── */}
      {topSkills.length > 0 && (
        <section style={{ marginBottom: 70 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 38, margin: "0 0 20px", letterSpacing: "-0.03em" }}>
            What {profile.display_name?.split(" ")[0] ?? "they"} works on
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {topSkills.map((skill) => (
              <span
                key={skill}
                style={{
                  padding: "10px 20px",
                  borderRadius: 999,
                  background: "var(--color-accent-soft)",
                  color: "var(--color-accent-ink)",
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Gig work history ── */}
      <section style={{ marginBottom: 70 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 38, margin: "0 0 24px", letterSpacing: "-0.03em" }}>
          Gig history
        </h2>
        {hiredApps && hiredApps.length > 0 ? (
          <div style={{ position: "relative", paddingLeft: 24 }}>
            <div style={{ position: "absolute", left: 5, top: 6, bottom: 0, width: 2, background: "var(--color-line)" }} />
            {hiredApps.map((a: any, i: number) => {
              const gig = a.gigs;
              const dateStr = new Date(a.created_at).toLocaleDateString("en-SG", { month: "short", year: "numeric" });
              return (
                <div key={a.id} style={{ position: "relative", marginBottom: 24, paddingLeft: 20 }}>
                  <span style={{ position: "absolute", left: -22, top: 6, width: 12, height: 12, borderRadius: "50%", background: i === 0 ? "var(--color-ink)" : "var(--color-surface)", border: "2px solid var(--color-ink)" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10 }}>
                    <div>
                      <h4 style={{ fontFamily: "var(--font-display)", fontSize: 18, margin: 0, letterSpacing: "-0.02em" }}>
                        {gig?.title ?? "Completed gig"}
                      </h4>
                      <p style={{ fontSize: 12, color: "var(--color-ink-mute)", margin: "4px 0 0", fontFamily: "var(--font-mono)" }}>
                        Hired via HustleSG
                      </p>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-mute)", whiteSpace: "nowrap" }}>{dateStr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: "32px 24px", borderRadius: 18, border: "1px dashed var(--color-line)", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: 0 }}>
              {isOwner
                ? "No completed gigs yet. Apply to assignments to build your track record."
                : `${profile.display_name?.split(" ")[0] ?? "They"} hasn't completed gigs on HustleSG yet.`}
            </p>
            {isOwner && (
              <Link href="/gigs" style={{ display: "inline-block", marginTop: 12, padding: "8px 16px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 13, fontWeight: 600 }}>
                Browse assignments →
              </Link>
            )}
          </div>
        )}
      </section>

      {/* ── Credentials ── */}
      <section style={{ marginBottom: 70 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 38, margin: 0, letterSpacing: "-0.03em" }}>Credentials</h2>
          {totalCerts > 0 && (
            <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>
              <b style={{ color: "var(--color-trust)" }}>{verifiedCerts.length}</b>/{totalCerts} verified
            </span>
          )}
        </div>
        {certs && certs.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
            {certs.map((c: any) => <CertCard key={c.id} cert={c} />)}
          </div>
        ) : (
          <p style={{ color: "var(--color-ink-soft)" }}>
            {isOwner ? (
              <>No credentials yet. <Link href="/profile/edit" style={{ textDecoration: "underline" }}>Add a certificate</Link></>
            ) : (
              "No credentials uploaded yet."
            )}
          </p>
        )}
      </section>
    </main>
  );
}

function PortfolioCell({ item, cellClass }: { item: any; cellClass: string }) {
  if (item.kind === "video") {
    return (
      <div className={cellClass} style={{ borderRadius: 18, overflow: "hidden", position: "relative", background: "oklch(22% 0.02 240)", minHeight: 220, color: "var(--color-surface)" }}>
        <div className="stripes" style={{ position: "absolute", inset: 0, opacity: 0.05 }} />
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
          <span style={{ width: 52, height: 52, borderRadius: "50%", background: "oklch(100% 0 0 / 0.9)", color: "oklch(22% 0.02 240)", display: "grid", placeItems: "center", fontSize: 18 }}>▶</span>
        </div>
        <div style={{ position: "absolute", left: 16, bottom: 14, right: 16 }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, letterSpacing: "-0.02em", color: "white" }}>{item.title}</p>
        </div>
      </div>
    );
  }
  if (item.kind === "writeup") {
    return (
      <article className={cellClass} style={{ borderRadius: 18, padding: 22, background: "var(--color-accent-soft)", color: "var(--color-accent-ink)", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 220 }}>
        <div>
          <p style={{ fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, margin: "0 0 10px" }}>Case study</p>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{item.title}</h4>
          {item.description && <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5, opacity: 0.85 }}>{item.description}</p>}
        </div>
        <span style={{ marginTop: 16, fontSize: 12, fontWeight: 600 }}>Read case →</span>
      </article>
    );
  }
  if (item.kind === "website") {
    return (
      <a className={cellClass} href={item.external_url ?? "#"} target="_blank" rel="noopener noreferrer" style={{ borderRadius: 18, padding: 22, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 220 }}>
        <div>
          <p style={{ fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 10px" }}>Website</p>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 8px", letterSpacing: "-0.02em" }}>{item.title}</h4>
          {item.description && <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: 0 }}>{item.description}</p>}
        </div>
        {item.external_url && <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-soft)" }}>{item.external_url.replace(/^https?:\/\//, "")} ↗</p>}
      </a>
    );
  }
  return (
    <div className={cellClass} style={{ position: "relative", borderRadius: 18, overflow: "hidden", minHeight: 220 }}>
      <div className="stripes" style={{ position: "absolute", inset: 0, background: "var(--color-jade-soft)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, oklch(10% 0.04 240 / 0.5), transparent 40%)" }} />
      <div style={{ position: "absolute", left: 16, right: 16, bottom: 14, color: "white" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, letterSpacing: "-0.02em" }}>{item.title}</p>
      </div>
    </div>
  );
}

function CertCard({ cert }: { cert: any }) {
  const isVerified = Boolean(cert.verified_at);
  const bg = isVerified ? "var(--color-trust-soft)" : "oklch(96% 0.04 80)";
  const ink = isVerified ? "var(--color-trust-ink)" : "oklch(35% 0.1 78)";
  const initials = cert.issuer.split(" ").map((w: string) => w[0]).slice(0, 2).join("");
  return (
    <article style={{ padding: 20, borderRadius: 16, background: bg, color: ink, display: "flex", gap: 16, alignItems: "start" }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: "white", display: "grid", placeItems: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 16, color: ink, fontWeight: 700 }}>{initials}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
          <div>
            <p style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0, opacity: 0.75 }}>{cert.issuer}</p>
            <h4 style={{ fontFamily: "var(--font-display)", fontSize: 18, margin: "4px 0 8px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>{cert.title}</h4>
          </div>
          <span className="pill" style={{ background: isVerified ? "var(--color-trust-soft)" : "oklch(94% 0.02 80)", color: isVerified ? "var(--color-trust)" : "oklch(40% 0.1 78)", flexShrink: 0 }}>
            {isVerified ? "Verified" : "Pending"}
          </span>
        </div>
        {cert.extracted_skills && cert.extracted_skills.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {cert.extracted_skills.slice(0, 3).map((s: string) => (
              <span key={s} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "oklch(100% 0 0 / 0.5)", fontWeight: 500 }}>{s}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
