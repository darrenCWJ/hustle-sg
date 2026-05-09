import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { NavLinks } from "./NavLinks";

export async function SiteNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profileRes, notifsRes] = await Promise.all([
    user
      ? supabase.from("profiles").select("handle, display_name").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
    user
      ? supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("read_at", null)
      : Promise.resolve({ count: 0 }),
  ]);
  const profile = profileRes.data;
  const unreadCount = notifsRes.count ?? 0;

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

          <NavLinks />

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {profile ? (
              <>
                {/* Notifications bell */}
                <Link
                  href="/notifications"
                  aria-label={`${unreadCount} unread notifications`}
                  style={{ position: "relative", display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--color-line)", background: "transparent" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span style={{
                      position: "absolute",
                      top: -3, right: -3,
                      minWidth: 16, height: 16,
                      borderRadius: 999,
                      background: "oklch(52% 0.22 25)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      display: "grid",
                      placeItems: "center",
                      padding: "0 3px",
                      lineHeight: 1,
                    }}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
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
                <form action={signOut}>
                  <button
                    type="submit"
                    style={{
                      padding: "8px 14px",
                      borderRadius: 999,
                      background: "transparent",
                      border: "1px solid var(--color-line)",
                      color: "var(--color-ink-soft)",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/singpass"
                  style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink-soft)", padding: "6px 10px" }}
                >
                  Log in / Sign up
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
