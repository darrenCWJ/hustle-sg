"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";

interface Props {
  displayName: string;
  handle: string;
  role: string;
}

export function UserMenu({ displayName, handle, role }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isEmployer = role === "employer" || role === "both";

  const initials = displayName
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const firstName = displayName.split(" ")[0];

  // Accessible dismissal: close on Escape or a click/tap outside. The trigger is
  // a real <button> so Enter/Space and keyboard focus work natively — the old
  // hover-only behaviour locked out keyboard and touch users entirely.
  useEffect(() => {
    if (!open) return;
    function onDocPointer(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${displayName}`}
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
          style={{ opacity: 0.5, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          aria-label="Account"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: 190,
            background: "var(--color-surface)",
            border: "1px solid var(--color-line)",
            borderRadius: 14,
            boxShadow: "0 8px 32px oklch(0% 0 0 / 0.12)",
            overflow: "hidden",
            zIndex: 100,
          }}
        >
          <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid var(--color-line)" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>{displayName}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--color-ink-mute)", fontFamily: "var(--font-mono)" }}>@{handle}</p>
          </div>

          <div style={{ padding: "6px 0" }} onClick={() => setOpen(false)}>
            <MenuItem href="/dashboard" icon="⊞">Dashboard</MenuItem>
            <MenuItem href="/messages" icon="✉">Messages</MenuItem>
            <MenuItem href={`/profile/${handle}`} icon="◉">My profile</MenuItem>
            {(role === "freelancer" || role === "both") && (
              <MenuItem href="/feed" icon="✦">Matched gigs</MenuItem>
            )}
            {isEmployer && (
              <MenuItem href="/gigs/new" icon="+">Post an assignment</MenuItem>
            )}
          </div>

          <div style={{ borderTop: "1px solid var(--color-line)", padding: "6px 0 4px" }}>
            <form action={signOut} style={{ margin: 0 }}>
              <button
                type="submit"
                role="menuitem"
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
                <span style={{ width: 16, textAlign: "center", opacity: 0.5, fontSize: 12 }}>→</span>
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      role="menuitem"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 16px",
        fontSize: 13,
        fontWeight: 500,
        color: "var(--color-ink)",
        textDecoration: "none",
        transition: "background 0.1s",
      }}
      className="dropdown-item"
    >
      <span style={{ width: 16, textAlign: "center", fontSize: 12, opacity: 0.55 }}>{icon}</span>
      {children}
    </Link>
  );
}
