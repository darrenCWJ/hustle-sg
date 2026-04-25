import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function SiteNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? (
        await supabase
          .from("profiles")
          .select("handle, display_name")
          .eq("id", user.id)
          .single()
      ).data
    : null;

  return (
    <>
      {/* Gov.sg banner */}
      <div style={{ background: "#f0f0f0", fontSize: 12, color: "#555", borderBottom: "1px solid var(--color-line-soft)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "6px 28px", display: "flex", alignItems: "center", gap: 8 }}>
          <span>🇸🇬</span>
          <span>A Singapore Government Agency Website</span>
          <span style={{ color: "#1a5dc0", textDecoration: "underline", cursor: "pointer", marginLeft: 4, fontSize: 11 }}>
            How to identify ▾
          </span>
        </div>
      </div>

      {/* Main header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 60,
          background: "oklch(from var(--color-surface) l c h / 0.85)",
          backdropFilter: "saturate(140%) blur(10px)",
          WebkitBackdropFilter: "saturate(140%) blur(10px)",
          borderBottom: "1px solid var(--color-line)",
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "14px 28px",
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              aria-hidden
              style={{
                display: "inline-grid",
                placeItems: "center",
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "var(--color-ink)",
                color: "var(--color-accent)",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 18,
              }}
            >
              h
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 20,
                fontWeight: 500,
                letterSpacing: "-0.02em",
              }}
            >
              HustleSG
            </span>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[
              { href: "/feed", label: "My feed" },
              { href: "/gigs", label: "Gigs" },
              { href: "/instant", label: "Instant" },
              { href: "/start-a-business", label: "Start a business" },
              { href: "/dashboard", label: "Dashboard" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "8px 14px",
                  fontSize: 13.5,
                  fontWeight: 500,
                  borderRadius: 999,
                  color: "var(--color-ink-soft)",
                  transition: "color 0.15s",
                }}
                className="hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {profile ? (
              <>
                <Link
                  href={`/profile/${profile.handle}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "5px 12px 5px 5px",
                    borderRadius: 999,
                    background: "var(--color-muted)",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "oklch(78% 0.08 38)",
                      color: "oklch(22% 0.08 38)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {(profile.display_name ?? "?")
                      .split(" ")
                      .map((s: string) => s[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  {profile.display_name?.split(" ")[0]}
                </Link>
                <Link
                  href="/dashboard"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    background: "var(--color-ink)",
                    color: "var(--color-surface)",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/singpass"
                  style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink-soft)", padding: "6px 10px" }}
                >
                  Log in
                </Link>
                <Link
                  href="/singpass"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    background: "var(--color-ink)",
                    color: "var(--color-surface)",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Get verified →
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
