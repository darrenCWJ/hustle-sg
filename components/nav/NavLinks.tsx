"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/gigs", label: "Gigs" },
  { href: "/freelancers", label: "Talent" },
  { href: "/start-a-business", label: "Start a business" },
];

const DEV_ITEMS = [{ href: "/accounts", label: "Test Accounts" }];

const isDev = process.env.NODE_ENV === "development";

export function NavLinks() {
  const pathname = usePathname();
  const items = isDev ? [...NAV_ITEMS, ...DEV_ITEMS] : NAV_ITEMS;

  return (
    <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const isDev = DEV_ITEMS.some((d) => d.href === item.href);
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
              opacity: isDev ? 0.5 : 1,
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
