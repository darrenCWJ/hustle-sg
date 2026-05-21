"use client";

import { useTransition } from "react";
import { markCompleted } from "../rate/actions";

export function MarkCompletedButton({ applicationId }: { applicationId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => markCompleted(applicationId))}
      disabled={pending}
      style={{
        width: "100%",
        padding: "9px 14px",
        borderRadius: 999,
        background: pending ? "var(--color-muted)" : "#7c3aed",
        color: pending ? "var(--color-ink-mute)" : "#fff",
        fontSize: 13,
        fontWeight: 700,
        border: "none",
        cursor: pending ? "default" : "pointer",
      }}
    >
      {pending ? "Updating…" : "Mark as completed"}
    </button>
  );
}
