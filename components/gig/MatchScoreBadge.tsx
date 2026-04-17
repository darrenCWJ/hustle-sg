"use client";

import { useState } from "react";

export function MatchScoreBadge({
  score,
  overlap,
}: {
  score: number;
  overlap: string[];
}) {
  const [open, setOpen] = useState(false);
  const pct = Math.max(0, Math.min(100, Math.round(score * 100)));
  const tone =
    pct >= 85 ? "bg-accent text-ink" : pct >= 70 ? "bg-accent-soft text-accent-ink" : "bg-trust-soft text-trust";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        className={`${tone} rounded-pill px-2.5 py-1 text-xs font-bold tracking-wider`}
      >
        {pct}% match
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-line bg-surface-raised shadow-lift p-3 z-20 text-left">
          <p className="text-xs font-semibold">Why this matched</p>
          {overlap.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-1.5 text-xs">
              {overlap.map((s) => (
                <li
                  key={s}
                  className="rounded-pill bg-trust-soft text-trust px-2 py-0.5"
                >
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-ink-soft mt-1">Based on semantic similarity across your portfolio, certs, and bio.</p>
          )}
        </div>
      )}
    </div>
  );
}
