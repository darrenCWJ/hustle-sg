"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Search, ClipboardList, Bell, User, Briefcase, Plus, Timer } from "lucide-react";
import { useDemo } from "../DemoProvider";

const WORKER_TABS = [
  { href: "/quick-demo/feed",         icon: Zap,           label: "Feed"    },
  { href: "/quick-demo/gigs",         icon: Search,        label: "Browse"  },
  { href: "/quick-demo/applications", icon: ClipboardList, label: "Applied" },
  { href: "/quick-demo/messages",     icon: Bell,          label: "Messages"},
  { href: "/quick-demo/profile",      icon: User,          label: "Profile" },
];

const EMPLOYER_TABS = [
  { href: "/quick-demo/my-gigs", icon: Briefcase, label: "My Gigs" },
  { href: "/quick-demo/instant", icon: Timer, label: "Instant" },
  { href: "/quick-demo/post", icon: Plus, label: "Post" },
  { href: "/quick-demo/messages", icon: Bell, label: "Messages" },
  { href: "/quick-demo/profile", icon: User, label: "Profile" },
];

export function DemoTabBar() {
  const { activeAccount, applications } = useDemo();
  const pathname = usePathname();

  const tabs = activeAccount.role === "employer" ? EMPLOYER_TABS : WORKER_TABS;

  const messagesBadge = activeAccount.role === "freelancer"
    ? applications.filter((a) => a.freelancerId === activeAccount.id && a.status === "offered").length
    : 0;

  const appliedBadge = activeAccount.role === "freelancer"
    ? applications.filter((a) => a.freelancerId === activeAccount.id && a.status === "shortlisted").length
    : 0;

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        background: "var(--color-surface-raised)",
        borderTop: "1px solid var(--color-line)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        height: "calc(58px + env(safe-area-inset-bottom, 0px))",
        flexShrink: 0,
      }}
    >
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== "/quick-demo" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 10px",
              color: active ? "var(--color-ink)" : "var(--color-ink-mute)",
              fontSize: 10,
              fontWeight: active ? 700 : 500,
              letterSpacing: "0.02em",
              textDecoration: "none",
              transition: "color 0.12s",
              WebkitTapHighlightColor: "transparent",
              minWidth: 48,
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
              {href === "/quick-demo/applications" && appliedBadge > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -6,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 999,
                    background: "#f59e0b",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 3px",
                    lineHeight: 1,
                  }}
                >
                  {appliedBadge}
                </span>
              )}
              {href === "/quick-demo/messages" && messagesBadge > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -6,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 999,
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 3px",
                    lineHeight: 1,
                  }}
                >
                  {messagesBadge}
                </span>
              )}
            </span>
            <span style={{ marginTop: 4 }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
