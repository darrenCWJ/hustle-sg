import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MobilePushToggle } from "./MobilePushToggle";

export default async function MobileProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 20,
          padding: 32,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "var(--color-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
          }}
        >
          👤
        </div>
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 26,
              color: "var(--color-ink)",
              margin: "0 0 8px",
              letterSpacing: "-0.025em",
            }}
          >
            Sign in to see your profile
          </h1>
          <p style={{ color: "var(--color-ink-soft)", fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            Verified with Singpass to apply to gigs, track your work, and build your reputation.
          </p>
        </div>
        <Link
          href="/m/singpass?next=/m/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 28px",
            borderRadius: 999,
            background: "var(--color-ink)",
            color: "var(--color-surface)",
            fontSize: 15,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          <span style={{ fontSize: 18 }}>🔐</span>
          Sign in with Singpass
        </Link>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, display_name, headline, bio, role, trust_score, singpass_verified_at, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: certs } = await supabase
    .from("certifications")
    .select("title, issuer, verified_at")
    .eq("profile_id", user.id)
    .limit(5);

  const { data: apps } = await supabase
    .from("applications")
    .select("id, status")
    .eq("applicant_id", user.id);

  const hiredCount = (apps ?? []).filter((a) => a.status === "hired").length;
  const appliedCount = (apps ?? []).length;

  const trustPct = Math.round((profile?.trust_score ?? 0) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      {/* Profile hero */}
      <div
        style={{
          padding: "16px 18px 14px",
          borderBottom: "1px solid var(--color-line)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          {/* Avatar */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: profile?.avatar_url
                ? `url(${profile.avatar_url}) center/cover`
                : "linear-gradient(135deg, var(--color-accent), var(--color-trust))",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
            }}
          >
            {!profile?.avatar_url && (profile?.display_name?.[0]?.toUpperCase() ?? "?")}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  margin: 0,
                  letterSpacing: "-0.02em",
                  color: "var(--color-ink)",
                  lineHeight: 1.1,
                }}
              >
                {profile?.display_name ?? "No name set"}
              </h1>
              {profile?.singpass_verified_at && (
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 7px",
                    borderRadius: 999,
                    background: "var(--color-jade-soft)",
                    color: "var(--color-jade-ink)",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  ✓ Verified
                </span>
              )}
            </div>
            {profile?.headline && (
              <p
                style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.35 }}
              >
                {profile.headline}
              </p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
          }}
        >
          {[
            { label: "Trust", value: `${trustPct}%`, color: trustPct >= 70 ? "var(--color-jade)" : "var(--color-warn)" },
            { label: "Hired", value: hiredCount.toString(), color: "var(--color-trust)" },
            { label: "Applied", value: appliedCount.toString(), color: "var(--color-ink-soft)" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                borderRadius: 12,
                background: "var(--color-muted)",
                border: "1px solid var(--color-line)",
                padding: "10px 12px",
                textAlign: "center",
              }}
            >
              <div
                style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 800, color }}
              >
                {value}
              </div>
              <div style={{ fontSize: 10, color: "var(--color-ink-mute)", marginTop: 2, letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bio */}
      {profile?.bio && (
        <div
          style={{
            padding: "12px 18px",
            borderBottom: "1px solid var(--color-line)",
          }}
        >
          <p
            style={{
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--color-ink-mute)",
              margin: "0 0 6px",
              fontWeight: 600,
            }}
          >
            About
          </p>
          <p
            style={{ fontSize: 13.5, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.55 }}
          >
            {profile.bio}
          </p>
        </div>
      )}

      {/* Certifications */}
      {certs && certs.length > 0 && (
        <div
          style={{
            padding: "12px 18px",
            borderBottom: "1px solid var(--color-line)",
          }}
        >
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
            Certifications
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {certs.map((c, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "var(--color-muted)",
                  border: "1px solid var(--color-line-soft)",
                }}
              >
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>
                    {c.title}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "2px 0 0" }}>
                    {c.issuer}
                  </p>
                </div>
                {c.verified_at && (
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "var(--color-jade-soft)",
                      color: "var(--color-jade-ink)",
                      fontWeight: 700,
                    }}
                  >
                    ✓ Verified
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: "12px 18px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Push notification toggle */}
        <div style={{ marginBottom: 4 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-ink-mute)", margin: "0 0 8px", fontWeight: 600 }}>
            Notifications
          </p>
          <MobilePushToggle />
        </div>
        {profile?.handle && (
          <Link
            href={`/profile/${profile.handle}`}
            style={{
              display: "block",
              padding: "14px 20px",
              borderRadius: 14,
              background: "var(--color-muted)",
              border: "1px solid var(--color-line)",
              color: "var(--color-ink)",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            View full profile →
          </Link>
        )}
        <Link
          href="/profile/edit"
          style={{
            display: "block",
            padding: "14px 20px",
            borderRadius: 14,
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-line-soft)",
            color: "var(--color-ink-soft)",
            fontSize: 14,
            fontWeight: 500,
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          Edit profile
        </Link>
      </div>
    </div>
  );
}
