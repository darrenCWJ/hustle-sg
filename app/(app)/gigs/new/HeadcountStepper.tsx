"use client";

import { useState } from "react";

export function HeadcountStepper() {
  const [count, setCount] = useState(1);

  return (
    <div className="flex items-center gap-3">
      <label className="text-xs uppercase tracking-widest text-ink-soft font-semibold whitespace-nowrap">
        Freelancers needed
      </label>
      <div className="flex items-center gap-0 rounded-xl border border-line overflow-hidden">
        <button
          type="button"
          disabled={count <= 1}
          onClick={() => setCount((c) => Math.max(1, c - 1))}
          className="w-9 h-9 flex items-center justify-center text-lg font-bold bg-surface-raised hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          −
        </button>
        <span className="w-10 text-center font-mono font-bold text-sm tabular-nums">
          {count}
        </span>
        <button
          type="button"
          disabled={count >= 20}
          onClick={() => setCount((c) => Math.min(20, c + 1))}
          className="w-9 h-9 flex items-center justify-center text-lg font-bold bg-surface-raised hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          +
        </button>
      </div>
      <input type="hidden" name="headcount" value={count} />
    </div>
  );
}
