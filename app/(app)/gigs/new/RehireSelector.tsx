"use client";

import { useState } from "react";

export interface PreviousHire {
  workerId: string;
  displayName: string;
  handle: string;
  category: string | null;
  gigTitle: string;
}

interface Props {
  previousHires: PreviousHire[];
}

export function RehireSelector({ previousHires }: Props) {
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = category
    ? previousHires.filter((h) => h.category?.toLowerCase() === category.toLowerCase())
    : previousHires;

  // Deduplicate by workerId — show most recent gig per worker
  const seen = new Set<string>();
  const unique = filtered.filter((h) => {
    if (seen.has(h.workerId)) return false;
    seen.add(h.workerId);
    return true;
  });

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (previousHires.length === 0) return null;

  return (
    <div style={{ borderRadius: 16, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-line)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>Send direct offers to previous hires</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-ink-mute)" }}>
            They'll get notified immediately when the gig is published.
          </p>
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setSelected(new Set()); }}
          style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--color-line)", background: "var(--color-surface)", color: "var(--color-ink-soft)", cursor: "pointer" }}
        >
          <option value="">All categories</option>
          {Array.from(new Set(previousHires.map((h) => h.category).filter(Boolean))).sort().map((c) => (
            <option key={c!} value={c!}>{c}</option>
          ))}
        </select>
      </div>

      {unique.length === 0 ? (
        <p style={{ padding: "16px 20px", margin: 0, fontSize: 13, color: "var(--color-ink-mute)" }}>
          No previous hires in this category.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: "10px 12px", margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {unique.map((h) => {
            const isSelected = selected.has(h.workerId);
            const initials = h.displayName.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
            return (
              <li key={h.workerId}>
                <button
                  type="button"
                  onClick={() => toggle(h.workerId)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1.5px solid ${isSelected ? "var(--color-ink)" : "var(--color-line)"}`,
                    background: isSelected ? "var(--color-ink)" : "transparent",
                    color: isSelected ? "var(--color-surface)" : "inherit",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.12s",
                  }}
                >
                  <span style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: isSelected ? "oklch(78% 0.08 38)" : "var(--color-muted)",
                    color: isSelected ? "oklch(22% 0.08 38)" : "var(--color-ink-soft)",
                    display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700,
                  }}>
                    {initials}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{h.displayName}</p>
                    <p style={{ margin: "1px 0 0", fontSize: 11, opacity: 0.65, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      @{h.handle} · hired for "{h.gigTitle}"
                    </p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 999, background: isSelected ? "oklch(100% 0 0 / 0.15)" : "var(--color-muted)", whiteSpace: "nowrap" }}>
                    {isSelected ? "✓ Selected" : "Select"}
                  </span>
                </button>
                {isSelected && (
                  <input type="hidden" name="rehire_worker_ids" value={h.workerId} />
                )}
              </li>
            );
          })}
        </ul>
      )}

      {selected.size > 0 && (
        <div style={{ padding: "10px 20px 14px", borderTop: "1px solid var(--color-line)", fontSize: 12, color: "var(--color-ink-soft)" }}>
          {selected.size} worker{selected.size > 1 ? "s" : ""} will receive a direct offer when you publish.
        </div>
      )}
    </div>
  );
}
