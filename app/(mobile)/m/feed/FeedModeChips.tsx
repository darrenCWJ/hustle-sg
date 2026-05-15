"use client";

import { useRouter, useSearchParams } from "next/navigation";

const MODES = [
  { key: "all", label: "Best Match" },
  { key: "nearby", label: "Nearby Now" },
] as const;

export type FeedMode = (typeof MODES)[number]["key"];

export function FeedModeChips() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = (searchParams.get("mode") as FeedMode) || "all";

  const setMode = (mode: FeedMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (mode === "all") {
      params.delete("mode");
    } else {
      params.set("mode", mode);
    }
    const qs = params.toString();
    router.replace(`/m/feed${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  return (
    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
      {MODES.map((m) => {
        const isActive = active === m.key;
        return (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            style={{
              padding: "5px 14px",
              borderRadius: 999,
              border: `1.5px solid ${isActive ? "var(--color-ink)" : "var(--color-line)"}`,
              background: isActive ? "var(--color-ink)" : "transparent",
              color: isActive ? "var(--color-surface)" : "var(--color-ink-soft)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {m.key === "nearby" && "\u{1F4CD} "}{m.label}
          </button>
        );
      })}
    </div>
  );
}
