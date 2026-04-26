"use client";

import { useState } from "react";
import { decideApplication } from "./actions";

interface Props {
  applicationId: string;
  currentStatus: string;
}

export function DecisionButtons({ applicationId, currentStatus }: Props) {
  const [pending, setPending] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(decision: "hired" | "shortlisted" | "rejected") {
    setPending(decision);
    setError(null);
    const res = await decideApplication(applicationId, decision);
    setPending(null);
    if (res?.error) {
      setError(res.error);
    } else {
      setDone(decision);
    }
  }

  if (done) {
    const labels: Record<string, string> = {
      hired: "Hired — applicant has been notified.",
      shortlisted: "Shortlisted — applicant has been notified.",
      rejected: "Declined — applicant has been notified.",
    };
    return (
      <p className="text-sm font-semibold" style={{ color: done === "rejected" ? "var(--color-plum)" : "var(--color-jade)" }}>
        {labels[done]}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        disabled={!!pending}
        onClick={() => handle("hired")}
        className="rounded-pill px-5 py-2.5 text-sm font-semibold text-white"
        style={{ background: "var(--color-jade)", opacity: pending === "hired" ? 0.6 : 1 }}
      >
        {pending === "hired" ? "Hiring…" : "Hire"}
      </button>
      <button
        disabled={!!pending}
        onClick={() => handle("shortlisted")}
        className="rounded-pill px-5 py-2.5 text-sm font-semibold text-white"
        style={{ background: "var(--color-trust)", opacity: pending === "shortlisted" ? 0.6 : 1 }}
      >
        {pending === "shortlisted" ? "Shortlisting…" : "Shortlist"}
      </button>
      <button
        disabled={!!pending}
        onClick={() => handle("rejected")}
        className="rounded-pill px-5 py-2.5 text-sm font-semibold border border-line"
        style={{ background: "transparent", color: "var(--color-plum)", opacity: pending === "rejected" ? 0.6 : 1 }}
      >
        {pending === "rejected" ? "Declining…" : "Decline"}
      </button>
      {error && <p className="w-full text-xs text-plum mt-1">{error}</p>}
    </div>
  );
}
