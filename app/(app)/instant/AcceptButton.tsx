"use client";

import { useState } from "react";

interface Props {
  gigId: string;
  onAccept: (gigId: string) => Promise<{ ok: boolean; error?: string }>;
}

export function AcceptButton({ gigId, onAccept }: Props) {
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handle() {
    setState("pending");
    const res = await onAccept(gigId);
    if (res.ok) {
      setState("done");
    } else {
      setState("error");
      setErrorMsg(res.error ?? "Something went wrong.");
    }
  }

  if (state === "done") {
    return (
      <span style={{ padding: "7px 16px", borderRadius: 999, background: "var(--color-jade)", color: "white", fontSize: 13, fontWeight: 700, display: "inline-block" }}>
        Accepted ✓
      </span>
    );
  }

  if (state === "error") {
    return (
      <span style={{ fontSize: 12, color: "var(--color-plum)", fontWeight: 600 }}>{errorMsg}</span>
    );
  }

  return (
    <button
      disabled={state === "pending"}
      onClick={handle}
      style={{
        padding: "7px 16px", borderRadius: 999,
        background: state === "pending" ? "var(--color-muted)" : "var(--color-ink)",
        color: state === "pending" ? "var(--color-ink-soft)" : "var(--color-surface)",
        fontSize: 13, fontWeight: 700, border: "none", cursor: state === "pending" ? "wait" : "pointer",
      }}
    >
      {state === "pending" ? "Accepting…" : "Accept"}
    </button>
  );
}
