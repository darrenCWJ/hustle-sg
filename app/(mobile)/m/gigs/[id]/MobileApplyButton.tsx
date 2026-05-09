"use client";

import Link from "next/link";
import { useState } from "react";
import { mobileApplyToGig } from "./actions";
import { acceptInstantGig } from "@/app/actions/gigs";

interface Props {
  gigId: string;
  isLoggedIn: boolean;
  existingStatus: string | null;
  isInstant: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  applied: "Applied — awaiting review",
  interviewing: "In interview stage",
  shortlisted: "You've been shortlisted!",
  hired: "You got the job!",
  rejected: "Not selected this time",
};

export function MobileApplyButton({ gigId, isLoggedIn, existingStatus, isInstant }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  if (!isLoggedIn) {
    return (
      <Link
        href={`/m/singpass?next=/m/gigs/${gigId}`}
        style={{
          display: "block",
          width: "100%",
          padding: "16px",
          borderRadius: 16,
          background: "var(--color-ink)",
          color: "var(--color-surface)",
          fontSize: 16,
          fontWeight: 700,
          textAlign: "center",
          textDecoration: "none",
        }}
      >
        Sign in to apply
      </Link>
    );
  }

  if (existingStatus) {
    return (
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--color-jade)", margin: 0 }}>
          ✓ {STATUS_LABEL[existingStatus] ?? "Applied"}
        </p>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--color-jade)", margin: 0 }}>
          ✓ {isInstant ? "Accepted!" : "Application sent!"}
        </p>
      </div>
    );
  }

  async function handleApply() {
    setState("loading");
    try {
      if (isInstant) {
        const res = await acceptInstantGig(gigId);
        if (!res.ok) {
          setMsg(res.error ?? "Failed.");
          setState("error");
          return;
        }
      } else {
        const res = await mobileApplyToGig(gigId);
        if (!res.ok) {
          setMsg(res.error ?? "Failed.");
          setState("error");
          return;
        }
      }
      setState("done");
    } catch {
      setMsg("Something went wrong.");
      setState("error");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {state === "error" && (
        <p style={{ fontSize: 13, color: "#dc2626", margin: 0, textAlign: "center" }}>{msg}</p>
      )}
      <button
        onClick={handleApply}
        disabled={state === "loading"}
        style={{
          display: "block",
          width: "100%",
          padding: "16px",
          borderRadius: 16,
          background: state === "loading" ? "var(--color-accent-soft)" : "var(--color-accent)",
          color: state === "loading" ? "var(--color-accent-ink)" : "#fff",
          fontSize: 16,
          fontWeight: 700,
          border: "none",
          cursor: state === "loading" ? "default" : "pointer",
          transition: "background 0.15s",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {state === "loading"
          ? "Applying…"
          : isInstant
            ? "Accept gig instantly ⚡"
            : "Apply now"}
      </button>
    </div>
  );
}
