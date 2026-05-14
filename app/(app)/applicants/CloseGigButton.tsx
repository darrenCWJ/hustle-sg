"use client";

import { useState } from "react";
import { closeGig } from "@/app/(app)/gigs/[id]/actions";

export function CloseGigButton({ gigId }: { gigId: string }) {
  const [state, setState] = useState<"idle" | "confirming" | "loading" | "done">("idle");

  if (state === "done") {
    return (
      <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)" }}>
        Completed ✓
      </span>
    );
  }

  if (state === "confirming") {
    return (
      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>Mark complete?</span>
        <button
          onClick={async () => {
            setState("loading");
            await closeGig(gigId);
            setState("done");
          }}
          style={{ padding: "4px 12px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}
        >
          Yes, close
        </button>
        <button
          onClick={() => setState("idle")}
          style={{ padding: "4px 10px", borderRadius: 999, border: "1px solid var(--color-line)", fontSize: 12, fontWeight: 600, background: "transparent", cursor: "pointer" }}
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setState("confirming")}
      disabled={state === "loading"}
      style={{ padding: "4px 12px", borderRadius: 999, border: "1px solid var(--color-line)", fontSize: 12, fontWeight: 600, background: "transparent", cursor: "pointer", color: "var(--color-ink-soft)" }}
    >
      Mark complete
    </button>
  );
}
