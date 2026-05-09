"use client";

import { useState } from "react";
import { updateApplicationStatus } from "@/app/(app)/gigs/[id]/actions";

interface Props {
  applicationId: string;
  initialStatus: string;
}

const ACTIONS = [
  { status: "interviewing" as const, label: "Interview", color: "#d97706" },
  { status: "hired" as const, label: "Hire ✓", color: "var(--color-jade)" },
  { status: "rejected" as const, label: "Reject", color: "rgba(239,68,68,0.7)" },
];

export function ApplicantActions({ applicationId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState<string | null>(null);

  if (status === "hired" || status === "rejected") {
    return (
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: status === "hired" ? "var(--color-jade)" : "rgba(239,68,68,0.7)",
          letterSpacing: "0.02em",
        }}
      >
        {status === "hired" ? "✓ Hired" : "✕ Rejected"}
      </span>
    );
  }

  async function handleAction(newStatus: "interviewing" | "hired" | "rejected") {
    setLoading(newStatus);
    await updateApplicationStatus(applicationId, newStatus);
    setStatus(newStatus);
    setLoading(null);
  }

  return (
    <div style={{ display: "flex", gap: 6 }}>
      {ACTIONS.map(({ status: s, label, color }) => (
        <button
          key={s}
          onClick={() => handleAction(s)}
          disabled={loading !== null || status === s}
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            border: `1px solid ${color}`,
            background: status === s ? color : "transparent",
            color: status === s ? "#fff" : color,
            fontSize: 11,
            fontWeight: 700,
            cursor: loading !== null || status === s ? "default" : "pointer",
            opacity: loading === s ? 0.5 : 1,
            WebkitTapHighlightColor: "transparent",
            transition: "background 0.15s, color 0.15s",
          }}
        >
          {loading === s ? "…" : label}
        </button>
      ))}
    </div>
  );
}
