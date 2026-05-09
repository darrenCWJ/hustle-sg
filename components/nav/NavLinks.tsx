"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/gigs", label: "Gigs" },
  { href: "/instant", label: "Instant" },
  { href: "/freelancers", label: "Talent" },
  { href: "/start-a-business", label: "Start a business" },
  { href: "/dashboard", label: "Dashboard" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: "8px 14px",
              fontSize: 13.5,
              fontWeight: active ? 600 : 500,
              borderRadius: 999,
              color: active ? "var(--color-ink)" : "var(--color-ink-soft)",
              background: active ? "var(--color-muted)" : "transparent",
            }}
            className="nav-link"
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
