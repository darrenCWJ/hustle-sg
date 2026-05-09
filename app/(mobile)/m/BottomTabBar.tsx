"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Search, FileText, Bell, User, Briefcase, Users, Plus } from "lucide-react";
import { switchToWorkerMode, switchToEmployerMode } from "./mode-actions";

const WORKER_TABS = [
  { href: "/m/feed", icon: Zap, label: "Feed" },
  { href: "/m/browse", icon: Search, label: "Browse" },
  { href: "/m/applications", icon: FileText, label: "Applied" },
  { href: "/m/notifications", icon: Bell, label: "Alerts" },
  { href: "/m/profile", icon: User, label: "Profile" },
];

const EMPLOYER_TABS = [
  { href: "/m/employer/gigs", icon: Briefcase, label: "My Gigs" },
  { href: "/m/employer/applicants", icon: Users, label: "Applicants" },
  { href: "/m/employer/post", icon: Plus, label: "Post" },
  { href: "/m/notifications", icon: Bell, label: "Alerts" },
  { href: "/m/profile", icon: User, label: "Profile" },
];

interface Props {
  mode: "worker" | "employer";
  canToggle: boolean;
}

export function BottomTabBar({ mode, canToggle }: Props) {
  const pathname = usePathname();

  if (pathname === "/m/singpass") return null;

  const isEmployerPath = pathname.startsWith("/m/employer/");
  const activeMode: "worker" | "employer" = isEmployerPath ? "employer" : mode;
  const tabs = activeMode === "employer" ? EMPLOYER_TABS : WORKER_TABS;

  return (
    <div style={{ flexShrink: 0 }}>
      {canToggle && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "6px 16px 0",
            background: "var(--color-surface-raised)",
            borderTop: "1px solid var(--color-line)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              background: "var(--color-muted)",
              borderRadius: 999,
              padding: 3,
              gap: 2,
            }}
          >
            <form action={switchToWorkerMode} style={{ margin: 0 }}>
              <button
                type="submit"
                style={{
                  padding: "4px 14px",
                  borderRadius: 999,
                  border: "none",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                  WebkitTapHighlightColor: "transparent",
                  background: activeMode === "worker" ? "var(--color-ink)" : "transparent",
                  color: activeMode === "worker" ? "var(--color-surface)" : "var(--color-ink-mute)",
                }}
              >
                Worker
              </button>
            </form>
            <form action={switchToEmployerMode} style={{ margin: 0 }}>
              <button
                type="submit"
                style={{
                  padding: "4px 14px",
                  borderRadius: 999,
                  border: "none",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                  WebkitTapHighlightColor: "transparent",
                  background: activeMode === "employer" ? "var(--color-ink)" : "transparent",
                  color: activeMode === "employer" ? "var(--color-surface)" : "var(--color-ink-mute)",
                }}
              >
                Employer
              </button>
            </form>
          </div>
        </div>
      )}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          background: "var(--color-surface-raised)",
          borderTop: canToggle ? "none" : "1px solid var(--color-line)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          height: "calc(58px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/m" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "6px 12px",
                color: active ? "var(--color-ink)" : "var(--color-ink-mute)",
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                letterSpacing: "0.02em",
                textDecoration: "none",
                transition: "color 0.12s",
                WebkitTapHighlightColor: "transparent",
                minWidth: 52,
                justifyContent: "center",
              }}
            >
              <span style={{ position: "relative" }}>
                <Icon size={21} strokeWidth={active ? 2.4 : 1.7} />
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: -5,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "var(--color-accent)",
                    }}
                  />
                )}
              </span>
              <span style={{ marginTop: 4 }}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
