"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { DemoProvider, useDemo } from "./DemoProvider";
import { DemoTabBar } from "./components/DemoTabBar";
import { ViewModeContext, ViewMode, useViewMode } from "./ViewModeContext";
import { PROFILES } from "./data";

// ── Helpers ────────────────────────────────────────────────────────────────────

const AVATAR_HUES = [250, 165, 340, 38, 260, 200, 78, 310];

function avatarHue(name: string) {
  return AVATAR_HUES[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_HUES.length];
}

function initials(name: string) {
  return name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
}

// ── Session chip ───────────────────────────────────────────────────────────────

function SessionChip({ sessionId }: { sessionId: string }) {
  function copy() {
    const url = `${window.location.origin}/quick-demo?s=${sessionId}`;
    navigator.clipboard.writeText(url).catch(() => {});
  }

  return (
    <button
      onClick={copy}
      title="Click to copy shareable link"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 8px",
        borderRadius: 6,
        border: "1px solid var(--color-line)",
        background: "var(--color-surface)",
        cursor: "pointer",
        fontSize: 10,
        fontWeight: 700,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.1em",
        color: "var(--color-ink-soft)",
        flexShrink: 0,
      }}
    >
      {sessionId} 📋
    </button>
  );
}

// ── Mobile top bar ─────────────────────────────────────────────────────────────

function MobileBar() {
  const { activeAccountId, switchAccount, resetDemo, sessionId } = useDemo();
  const { setViewMode } = useViewMode();
  const router = useRouter();

  function handleSwitch(id: string) {
    switchAccount(id);
    const profile = PROFILES.find((p) => p.id === id);
    router.push(profile?.role === "employer" ? "/quick-demo/my-gigs" : "/quick-demo/feed");
  }

  if (!activeAccountId) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        background: "var(--color-surface-raised)",
        borderBottom: "1px solid var(--color-line)",
        flexShrink: 0,
      }}
    >
      {/* Left: DEMO label + Desktop toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
          }}
        >
          DEMO
        </span>
        <button
          onClick={() => setViewMode("desktop")}
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 6,
            border: "1px solid var(--color-accent)",
            background: "var(--color-accent-soft)",
            color: "var(--color-accent)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Desktop
        </button>
      </div>

      {/* Session chip */}
      {sessionId && <SessionChip sessionId={sessionId} />}

      {/* Middle: scrollable avatar strip */}
      <div
        style={{
          display: "flex",
          gap: 5,
          flex: 1,
          overflowX: "auto",
          minWidth: 0,
          scrollbarWidth: "none",
        }}
      >
        {PROFILES.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSwitch(p.id)}
            title={`${p.name} (${p.specialization ?? p.role})`}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border:
                activeAccountId === p.id
                  ? "2px solid var(--color-accent)"
                  : "2px solid var(--color-line)",
              background:
                activeAccountId === p.id
                  ? "var(--color-accent-soft)"
                  : "var(--color-muted)",
              color:
                activeAccountId === p.id
                  ? "var(--color-accent-ink)"
                  : "var(--color-ink-mute)",
              fontSize: 9,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            {p.avatar}
          </button>
        ))}
      </div>

      {/* Right: reset */}
      <button
        onClick={resetDemo}
        style={{
          fontSize: 10,
          fontWeight: 600,
          padding: "3px 8px",
          borderRadius: 6,
          border: "1px solid var(--color-line)",
          background: "transparent",
          color: "var(--color-ink-mute)",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        Reset
      </button>
    </div>
  );
}

// ── Desktop top nav ────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/quick-demo/gigs", label: "Gigs" },
  { href: "/quick-demo/talent", label: "Talent" },
  { href: "/quick-demo/messages", label: "Messages" },
];

function DesktopNav() {
  const { activeAccountId, switchAccount, resetDemo, activeAccount, sessionId } = useDemo();
  const { setViewMode } = useViewMode();
  const router = useRouter();
  const pathname = usePathname();

  function handleSwitch(id: string) {
    switchAccount(id);
    const profile = PROFILES.find((p) => p.id === id);
    router.push(profile?.role === "employer" ? "/quick-demo/my-gigs" : "/quick-demo/feed");
  }

  const isEmployer = activeAccount?.role === "employer";
  const hue = activeAccount ? avatarHue(activeAccount.name) : 250;
  const ini = activeAccount ? initials(activeAccount.name) : "?";

  return (
    <header
      style={{
        borderBottom: "1px solid var(--color-line)",
        background: "var(--color-surface-raised)",
        flexShrink: 0,
      }}
    >
      {/* Gov banner */}
      <div style={{ background: "#f0f0f0", borderBottom: "1px solid #e0e0e0", padding: "3px 0" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
          <span style={{ fontSize: 11, color: "#555" }}>
            A Singapore Government Agency Website
          </span>
        </div>
      </div>

      {/* Main nav row */}
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          height: 56,
          gap: 32,
        }}
      >
        {/* Logo */}
        <Link
          href="/quick-demo"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              background: "var(--color-accent)",
              color: "#fff",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            h
          </span>
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--color-ink)" }}>
            HustleSG
          </span>
        </Link>

        {/* Universal nav links */}
        {activeAccountId && (
          <nav style={{ display: "flex", gap: 2, flex: 1 }}>
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: active ? 700 : 500,
                    color: active ? "var(--color-accent)" : "var(--color-ink-soft)",
                    background: active ? "var(--color-accent-soft)" : "transparent",
                    textDecoration: "none",
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: activeAccountId ? 0 : "auto" }}>
          {/* DEMO label */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-accent)",
            }}
          >
            DEMO
          </span>

          {/* Session chip */}
          {sessionId && <SessionChip sessionId={sessionId} />}

          {activeAccountId && (
            <>
              {/* Account switcher strip */}
              <div style={{ display: "flex", gap: 4, padding: "2px", borderRadius: 999, border: "1px solid var(--color-line)", background: "var(--color-surface)" }}>
                {PROFILES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSwitch(p.id)}
                    title={`${p.name} (${p.specialization ?? p.role})`}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: "none",
                      background:
                        activeAccountId === p.id
                          ? `oklch(78% 0.08 ${avatarHue(p.name)})`
                          : "var(--color-muted)",
                      color:
                        activeAccountId === p.id
                          ? `oklch(22% 0.08 ${avatarHue(p.name)})`
                          : "var(--color-ink-mute)",
                      fontSize: 9,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.15s",
                      outline: activeAccountId === p.id ? "2px solid var(--color-accent)" : "none",
                      outlineOffset: 1,
                    }}
                  >
                    {p.avatar}
                  </button>
                ))}
              </div>

              {/* Active account identity */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: `oklch(78% 0.08 ${hue})`,
                    color: `oklch(22% 0.08 ${hue})`,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {ini}
                </span>
                <div style={{ lineHeight: 1.2 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--color-ink)", whiteSpace: "nowrap" }}>
                    {activeAccount.name}
                  </p>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      padding: "1px 6px",
                      borderRadius: 999,
                      background: isEmployer ? "color-mix(in oklch, var(--color-trust, #3b82f6) 14%, transparent)" : "color-mix(in oklch, var(--color-accent) 14%, transparent)",
                      color: isEmployer ? "var(--color-trust, #3b82f6)" : "var(--color-accent)",
                    }}
                  >
                    {activeAccount.role}
                  </span>
                </div>
              </div>

              {/* Employer post button */}
              {isEmployer && (
                <Link
                  href="/quick-demo/post"
                  style={{
                    padding: "7px 16px",
                    borderRadius: 999,
                    background: "var(--color-ink)",
                    color: "var(--color-surface)",
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  + Post assignment
                </Link>
              )}

              <button
                onClick={resetDemo}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--color-line)",
                  background: "transparent",
                  color: "var(--color-ink-mute)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Reset
              </button>
            </>
          )}

          <button
            onClick={() => setViewMode("mobile")}
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "5px 10px",
              borderRadius: 6,
              border: "1px solid var(--color-accent)",
              background: "var(--color-accent-soft)",
              color: "var(--color-accent)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Mobile
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Shell ──────────────────────────────────────────────────────────────────────

function DemoShell({ children }: { children: React.ReactNode }) {
  const { activeAccountId } = useDemo();
  const { viewMode } = useViewMode();

  if (viewMode === "desktop") {
    return (
      <>
        <DesktopNav />
        <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
      </>
    );
  }

  if (!activeAccountId) {
    return <>{children}</>;
  }

  return (
    <>
      <MobileBar />
      <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
        {children}
      </div>
      <DemoTabBar />
    </>
  );
}

// ── Root layout ────────────────────────────────────────────────────────────────

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("mobile");

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      <DemoProvider>
        <div
          style={{
            height: "100dvh",
            display: "flex",
            flexDirection: "column",
            background: "var(--color-surface)",
            color: "var(--color-ink)",
            overflow: "hidden",
            ...(viewMode === "mobile"
              ? {
                  maxWidth: 430,
                  margin: "0 auto",
                  boxShadow: "0 0 0 1px var(--color-line)",
                }
              : {}),
          }}
        >
          <DemoShell>{children}</DemoShell>
        </div>
      </DemoProvider>
    </ViewModeContext.Provider>
  );
}
