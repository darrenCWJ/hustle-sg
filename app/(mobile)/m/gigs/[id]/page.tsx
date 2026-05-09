import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MobileApplyButton } from "./MobileApplyButton";

const URGENCY_CONFIG = {
  now: { label: "Right Now", bg: "#dc2626", text: "#fff" },
  today: { label: "Today", bg: "#d97706", text: "#fff" },
  weekend: { label: "Weekend", bg: "#16a34a", text: "#fff" },
};

export default async function MobileGigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: gig } = await supabase
    .from("gigs")
    .select(
      "*, employer:profiles!gigs_employer_id_fkey(id, handle, display_name, headline, singpass_verified_at)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!gig) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let existingStatus: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("applications")
      .select("status")
      .eq("gig_id", id)
      .eq("applicant_id", user.id)
      .maybeSingle();
    existingStatus = data?.status ?? null;
  }

  const employer = Array.isArray(gig.employer) ? gig.employer[0] : gig.employer;
  const uc = gig.is_instant ? URGENCY_CONFIG[gig.instant_urgency as keyof typeof URGENCY_CONFIG] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 96 }}>
        {/* Back nav */}
        <div
          style={{
            padding: "14px 18px 0",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Link
            href={gig.is_instant ? "/m/feed" : "/m/browse"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--color-ink-mute)",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            ← {gig.is_instant ? "Feed" : "Browse"}
          </Link>
          {uc && (
            <span
              style={{
                marginLeft: "auto",
                padding: "3px 10px",
                borderRadius: 999,
                background: uc.bg,
                color: uc.text,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {uc.label}
            </span>
          )}
        </div>

        <div style={{ padding: "20px 20px 0" }}>
          {/* Budget */}
          <div style={{ marginBottom: 12 }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 30,
                fontWeight: 800,
                color: "var(--color-ink)",
              }}
            >
              S${(gig.budget_cents / 100).toFixed(0)}
            </span>
            <span
              style={{
                fontSize: 14,
                color: "var(--color-ink-mute)",
                marginLeft: 8,
              }}
            >
              {gig.budget_kind === "hourly" ? "per hour" : "fixed"}
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              margin: "0 0 10px",
              letterSpacing: "-0.025em",
              lineHeight: 1.06,
              color: "var(--color-ink)",
            }}
          >
            {gig.title}
          </h1>

          {/* Employer row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 14, color: "var(--color-ink-soft)" }}>
              {employer?.display_name ?? "Employer"}
            </span>
            {employer?.singpass_verified_at && (
              <span
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "var(--color-jade-soft)",
                  color: "var(--color-jade-ink)",
                  fontWeight: 700,
                }}
              >
                ✓ Singpass Verified
              </span>
            )}
          </div>

          {/* Location + category */}
          <p
            style={{
              fontSize: 13,
              color: "var(--color-ink-mute)",
              margin: "0 0 22px",
            }}
          >
            {gig.category && `${gig.category} · `}{gig.location ?? "Singapore"}
          </p>

          {/* Description */}
          {gig.description && (
            <div style={{ marginBottom: 22 }}>
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--color-ink-mute)",
                  margin: "0 0 8px",
                  fontWeight: 600,
                }}
              >
                About this gig
              </p>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--color-ink-soft)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {gig.description}
              </p>
            </div>
          )}

          {/* Skills */}
          {gig.skills_required?.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--color-ink-mute)",
                  margin: "0 0 10px",
                  fontWeight: 600,
                }}
              >
                Skills required
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {gig.skills_required.map((s: string) => (
                  <span
                    key={s}
                    style={{
                      fontSize: 11,
                      padding: "5px 12px",
                      borderRadius: 999,
                      background: "var(--color-muted)",
                      color: "var(--color-ink-soft)",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Employer headline */}
          {employer?.headline && (
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                background: "var(--color-muted)",
                border: "1px solid var(--color-line)",
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--color-ink-mute)",
                  margin: "0 0 6px",
                  fontWeight: 600,
                }}
              >
                About the employer
              </p>
              <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.5 }}>
                {employer.headline}
              </p>
              {employer.handle && (
                <Link
                  href={`/profile/${employer.handle}`}
                  style={{ fontSize: 12, color: "var(--color-jade)", fontWeight: 600, marginTop: 8, display: "block" }}
                >
                  View profile →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom apply bar */}
      <div
        style={{
          position: "absolute",
          bottom: 58,
          left: 0,
          right: 0,
          padding: "12px 20px",
          background: "var(--color-surface-raised)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: "1px solid var(--color-line)",
        }}
      >
        <MobileApplyButton
          gigId={gig.id}
          isLoggedIn={!!user}
          existingStatus={existingStatus}
          isInstant={Boolean(gig.is_instant)}
        />
      </div>
    </div>
  );
}
