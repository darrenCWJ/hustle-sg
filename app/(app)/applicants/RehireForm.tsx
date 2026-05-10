"use client";

import { useState } from "react";
import Link from "next/link";
import { sendDirectOffer } from "./actions";

interface Props {
  workerId: string;
  workerName: string;
  openGigs: { id: string; title: string }[];
}

export function RehireForm({ workerId, workerName, openGigs }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [selectedGig, setSelectedGig] = useState(openGigs[0]?.id ?? "");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  if (openGigs.length === 0) {
    return (
      <Link
        href="/gigs/new"
        style={{
          display: "inline-block",
          padding: "6px 14px",
          borderRadius: 999,
          border: "1px solid var(--color-line)",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--color-ink-soft)",
        }}
      >
        Post a gig first →
      </Link>
    );
  }

  if (result?.ok) {
    return (
      <p style={{ fontSize: 12, color: "var(--color-trust)", fontWeight: 600, margin: 0 }}>
        Offer sent to {workerName} ✓
      </p>
    );
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{
          padding: "6px 14px",
          borderRadius: 999,
          border: "1px solid var(--color-line)",
          background: "transparent",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          color: "var(--color-ink)",
        }}
      >
        Rehire ↩
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
      <select
        value={selectedGig}
        onChange={(e) => setSelectedGig(e.target.value)}
        style={{
          padding: "7px 10px",
          borderRadius: 10,
          border: "1px solid var(--color-line)",
          background: "var(--color-surface)",
          fontSize: 13,
          color: "var(--color-ink)",
          cursor: "pointer",
        }}
      >
        {openGigs.map((g) => (
          <option key={g.id} value={g.id}>
            {g.title}
          </option>
        ))}
      </select>
      {result?.error && (
        <p style={{ fontSize: 12, color: "#e55", margin: 0 }}>{result.error}</p>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          disabled={pending || !selectedGig}
          onClick={async () => {
            setPending(true);
            const res = await sendDirectOffer(workerId, selectedGig);
            setResult(res);
            setPending(false);
          }}
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            background: "var(--color-ink)",
            color: "var(--color-surface)",
            fontSize: 12,
            fontWeight: 600,
            cursor: pending ? "wait" : "pointer",
            border: "none",
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? "Sending…" : "Send offer"}
        </button>
        <button
          onClick={() => {
            setExpanded(false);
            setResult(null);
          }}
          style={{
            padding: "6px 12px",
            borderRadius: 999,
            border: "1px solid var(--color-line)",
            background: "transparent",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            color: "var(--color-ink-soft)",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
