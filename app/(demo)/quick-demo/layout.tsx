"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { DemoProvider, useDemo } from "./DemoProvider";
import { DemoTabBar } from "./components/DemoTabBar";
import { ViewModeContext, ViewMode, useViewMode } from "./ViewModeContext";
import { PROFILES } from "./data";

// ── Thin demo account-switcher bar ─────────────────────────────────────────────

function DemoBar() {
  const { activeAccountId, switchAccount, resetDemo, sessionId } = useDemo();
  const { viewMode, setViewMode } = useViewMode();
  const router = useRouter();

  function handleSwitch(id: string) {
    switchAccount(id);
    const profile = PROFILES.find((p) => p.id === id);
    if (profile?.role === "employer") {
      router.push("/quick-demo/dashboard");
    } else {
      router.push(viewMode === "desktop" ? "/quick-demo/dashboard" : "/quick-demo/feed");
    }
  }

  function copySessionLink() {
    if (!sessionId) return;
    const url = `${window.location.origin}/quick-demo?s=${sessionId}`;
    navigator.clipboard.writeText(url).catch(() => {});
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 12px",
        background: "#1a1a2e",
        flexShrink: 0,
        zIndex: 70,
      }}
    >
      {/* DEMO label + view toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#a78bfa",
          }}
        >
          DEMO
        </span>
        <button
          onClick={() => setViewMode(viewMode === "mobile" ? "desktop" : "mobile")}
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: "2px 7px",
            borderRadius: 4,
            border: "1px solid #a78bfa",
            background: "transparent",
            color: "#a78bfa",
            cursor: "pointer",
            whiteSpace: "nowrap",
            letterSpacing: "0.04em",
          }}
        >
          {viewMode === "mobile" ? "Desktop ↗" : "Mobile ↙"}
        </button>
      </div>

      {/* Session link chip — always visible once a session exists */}
      {sessionId ? (
        <button
          onClick={copySessionLink}
          title="Click to copy shareable link for cross-device demo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            padding: "3px 8px",
            borderRadius: 5,
            border: "1px solid #a78bfa",
            background: "transparent",
            color: "#a78bfa",
            cursor: "pointer",
            letterSpacing: "0.08em",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          📱 {sessionId}
        </button>
      ) : (
        <button
          onClick={() => router.push("/quick-demo")}
          title="Create a session to enable cross-device demo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 5,
            border: "1px solid #334155",
            background: "transparent",
            color: "#475569",
            cursor: "pointer",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          📱 Connect device
        </button>
      )}

      {/* Scrollable avatar strip */}
      <div
        style={{
          display: "flex",
          gap: 4,
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
            title={`${p.name} · ${p.specialization ?? p.role}`}
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              border:
                activeAccountId === p.id
                  ? "2px solid #a78bfa"
                  : "2px solid #334155",
              background:
                activeAccountId === p.id ? "#312e81" : "#1e293b",
              color: activeAccountId === p.id ? "#c4b5fd" : "#64748b",
              fontSize: 8,
              fontWeight: 800,
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

      {/* Reset */}
      {activeAccountId && (
        <button
          onClick={resetDemo}
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: "2px 7px",
            borderRadius: 4,
            border: "1px solid #334155",
            background: "transparent",
            color: "#64748b",
            cursor: "pointer",
            flexShrink: 0,
            letterSpacing: "0.04em",
          }}
        >
          Reset
        </button>
      )}
    </div>
  );
}

// ── Demo user menu (mirrors real UserMenu exactly) ─────────────────────────────

function DemoUserMenu() {
  const { activeAccount, switchAccount } = useDemo();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!activeAccount) return null;

  const initials = activeAccount.name
    .split(" ")
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const firstName = activeAccount.name.split(" ")[0];
  const isEmployer = activeAccount.role === "employer";

  function onMouseEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function onMouseLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        type="button"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 12px 5px 5px",
          borderRadius: 999,
          background: open ? "var(--color-ink)" : "var(--color-muted)",
          color: open ? "var(--color-surface)" : "inherit",
          fontSize: 13,
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
          transition: "background 0.15s, color 0.15s",
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
            flexShrink: 0,
          }}
        >
          {initials}
        </span>
        {firstName}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden
          style={{
            opacity: 0.5,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s",
          }}
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: 200,
            background: "var(--color-surface)",
            border: "1px solid var(--color-line)",
            borderRadius: 14,
            boxShadow: "0 8px 32px oklch(0% 0 0 / 0.12)",
            overflow: "hidden",
            zIndex: 100,
          }}
        >
          <div
            style={{
              padding: "10px 14px 8px",
              borderBottom: "1px solid var(--color-line)",
            }}
          >
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>
              {activeAccount.name}
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 11,
                color: "var(--color-ink-mute)",
              }}
            >
              {activeAccount.specialization ?? activeAccount.role}
            </p>
          </div>

          <div style={{ padding: "6px 0" }}>
            {isEmployer ? (
              <>
                <DropdownItem href="/quick-demo/my-gigs" icon="⊞">
                  My gigs
                </DropdownItem>
                <DropdownItem href="/quick-demo/post" icon="+">
                  Post a gig
                </DropdownItem>
                <DropdownItem href="/quick-demo/dashboard" icon="◎">
                  Dashboard
                </DropdownItem>
              </>
            ) : (
              <>
                <DropdownItem href="/quick-demo/feed" icon="✦">
                  Matched gigs
                </DropdownItem>
                <DropdownItem href="/quick-demo/applications" icon="◉">
                  My applications
                </DropdownItem>
                <DropdownItem href="/quick-demo/profile" icon="◎">
                  My profile
                </DropdownItem>
              </>
            )}
          </div>

          <div
            style={{
              borderTop: "1px solid var(--color-line)",
              padding: "6px 0 4px",
            }}
          >
            <button
              onClick={() => {
                setOpen(false);
                router.push("/quick-demo");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "9px 16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--color-ink-soft)",
                textAlign: "left",
                fontFamily: "inherit",
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: 16,
                  textAlign: "center",
                  opacity: 0.5,
                  fontSize: 12,
                }}
              >
                ↔
              </span>
              Switch account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 16px",
        fontSize: 13,
        fontWeight: 500,
        color: "var(--color-ink)",
        textDecoration: "none",
      }}
      className="dropdown-item"
    >
      <span
        style={{ width: 16, textAlign: "center", fontSize: 12, opacity: 0.55 }}
      >
        {icon}
      </span>
      {children}
    </Link>
  );
}

// ── Demo SiteNav (pixel-matches the real SiteNav) ──────────────────────────────

function DemoSiteNav() {
  const { activeAccountId, activeAccount } = useDemo();
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: "/quick-demo/gigs", label: "Gigs" },
    { href: "/quick-demo/instant", label: "Instant" },
    { href: "/quick-demo/talent", label: "Talent" },
  ];

  return (
    <>
      {/* Gov.sg banner — exact copy */}
      <div
        style={{
          background: "#f0f0f0",
          fontSize: 12,
          color: "#555",
          borderBottom: "1px solid var(--color-line-soft)",
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "6px 28px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>🇸🇬</span>
          <span>A Singapore Government Agency Website</span>
          <span
            style={{
              color: "#1a5dc0",
              textDecoration: "underline",
              cursor: "pointer",
              marginLeft: 4,
              fontSize: 11,
            }}
          >
            How to identify ▾
          </span>
        </div>
      </div>

      {/* Main header — exact copy of SiteNav header styles */}
      <header
        style={{
          background:
            "oklch(from var(--color-surface) l c h / 0.85)",
          backdropFilter: "saturate(140%) blur(10px)",
          WebkitBackdropFilter: "saturate(140%) blur(10px)",
          borderBottom: "1px solid var(--color-line)",
          flexShrink: 0,
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
          {/* Logo — exact copy */}
          <Link
            href="/quick-demo"
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
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

          {/* Nav links — exact copy of NavLinks pill style */}
          <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: "8px 14px",
                    fontSize: 13.5,
                    fontWeight: active ? 600 : 500,
                    borderRadius: 999,
                    color: active
                      ? "var(--color-ink)"
                      : "var(--color-ink-soft)",
                    background: active
                      ? "var(--color-muted)"
                      : "transparent",
                    textDecoration: "none",
                  }}
                  className="nav-link"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {activeAccountId ? (
              <>
                {/* Messages bell (demo) */}
                <Link
                  href="/quick-demo/messages"
                  aria-label="Messages"
                  style={{
                    position: "relative",
                    display: "grid",
                    placeItems: "center",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "1px solid var(--color-line)",
                    background: "transparent",
                    color: "var(--color-ink)",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </Link>
                <DemoUserMenu />
              </>
            ) : (
              <Link
                href="/quick-demo"
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  background: "var(--color-ink)",
                  color: "var(--color-surface)",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Choose account
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

// ── Shell ──────────────────────────────────────────────────────────────────────

function DemoShell({ children }: { children: React.ReactNode }) {
  const { activeAccountId } = useDemo();
  const { viewMode } = useViewMode();

  if (viewMode === "desktop") {
    return (
      <>
        <DemoSiteNav />
        <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
      </>
    );
  }

  // Mobile: phone-frame with bottom tab bar
  return (
    <>
      {activeAccountId && (
        <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
          {children}
        </div>
      )}
      {!activeAccountId && <>{children}</>}
      {activeAccountId && <DemoTabBar />}
    </>
  );
}

// ── Root layout ────────────────────────────────────────────────────────────────

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [viewMode, setViewModeState] = useState<ViewMode>("mobile");

  useEffect(() => {
    const stored = localStorage.getItem("demo-view-mode") as ViewMode | null;
    if (stored === "desktop" || stored === "mobile") setViewModeState(stored);
  }, []);

  function setViewMode(mode: ViewMode) {
    setViewModeState(mode);
    localStorage.setItem("demo-view-mode", mode);
  }

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      <Suspense>
      <DemoProvider>
        {/* DemoBar always sits at the very top, above everything */}
        <div
          style={{
            height: "100dvh",
            display: "flex",
            flexDirection: "column",
            background: "var(--color-surface)",
            color: "var(--color-ink)",
            overflow: "hidden",
          }}
        >
          <DemoBar />

          {/* Inner frame — 430px in mobile, full-width in desktop */}
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              ...(viewMode === "mobile"
                ? {
                    maxWidth: 430,
                    width: "100%",
                    margin: "0 auto",
                    boxShadow: "0 0 0 1px var(--color-line)",
                  }
                : {}),
            }}
          >
            <DemoShell>{children}</DemoShell>
          </div>
        </div>
      </DemoProvider>
      </Suspense>
    </ViewModeContext.Provider>
  );
}
