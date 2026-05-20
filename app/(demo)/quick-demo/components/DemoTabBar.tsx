"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemo } from "../DemoProvider";

const FREELANCER_TABS = [
  { href: "/quick-demo/feed", label: "Feed" },
  { href: "/quick-demo/applications", label: "Applied" },
  { href: "/quick-demo/messages", label: "Messages" },
];

const EMPLOYER_TABS = [
  { href: "/quick-demo/dashboard", label: "Dashboard" },
  { href: "/quick-demo/messages", label: "Messages" },
];

export function DemoTabBar() {
  const { activeAccount } = useDemo();
  const pathname = usePathname();

  const tabs = activeAccount.role === "employer" ? EMPLOYER_TABS : FREELANCER_TABS;

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        background: "var(--color-surface-raised)",
        borderTop: "1px solid var(--color-line)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        height: "calc(52px + env(safe-area-inset-bottom, 0px))",
        flexShrink: 0,
      }}
    >
      {tabs.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: "8px 16px",
              color: active ? "var(--color-ink)" : "var(--color-ink-mute)",
              fontSize: 12,
              fontWeight: active ? 700 : 500,
              letterSpacing: "0.02em",
              textDecoration: "none",
              position: "relative",
            }}
          >
            {label}
            {active && (
              <span
                style={{
                  position: "absolute",
                  bottom: 6,
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "var(--color-accent)",
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
