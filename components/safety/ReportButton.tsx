"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { submitReport, type ReportInput } from "@/app/actions/safety";

const REASONS: Array<{ value: ReportInput["reason"]; label: string }> = [
  { value: "scam", label: "Scam or fraud" },
  { value: "harassment", label: "Harassment or abuse" },
  { value: "fake_listing", label: "Fake or misleading listing" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Something else" },
];

interface ReportButtonProps {
  targetKind: ReportInput["targetKind"];
  targetId: string;
  /** Shown in the dialog title, e.g. a display name or gig title. */
  targetLabel: string;
}

export function ReportButton({ targetKind, targetId, targetLabel }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportInput["reason"]>("scam");
  const [details, setDetails] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocPointer(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await submitReport({ targetKind, targetId, reason, details });
      if (!res.ok) {
        setError(res.error ?? "Could not submit the report.");
        return;
      }
      setDone(
        res.alreadyReported
          ? "You've already reported this — it's in the queue."
          : "Report received. Thanks for flagging it.",
      );
    });
  };

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="text-xs px-2.5 py-1 rounded-pill border border-line text-ink-soft hover:border-ink hover:text-ink transition"
      >
        ⚑ Report
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={`Report ${targetLabel}`}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 50,
            width: 300,
            padding: 16,
            borderRadius: 14,
            border: "1px solid var(--color-line)",
            background: "var(--color-surface)",
            boxShadow: "0 12px 32px oklch(0% 0 0 / 0.12)",
          }}
        >
          {done ? (
            <p style={{ margin: 0, fontSize: 13, color: "var(--color-jade-ink)" }}>{done}</p>
          ) : (
            <>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600 }}>
                Report {targetLabel}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                {REASONS.map((r) => (
                  <label
                    key={r.value}
                    style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                    />
                    {r.label}
                  </label>
                ))}
              </div>
              <label htmlFor="report-details" style={{ display: "block", fontSize: 11, color: "var(--color-ink-mute)", marginBottom: 4 }}>
                Details (optional)
              </label>
              <textarea
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, 2000))}
                rows={3}
                placeholder="What happened?"
                style={{
                  width: "100%",
                  fontSize: 13,
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid var(--color-line)",
                  background: "var(--color-surface)",
                  color: "var(--color-ink)",
                  resize: "vertical",
                }}
              />
              {error && (
                <p style={{ margin: "8px 0 0", fontSize: 12, color: "#b91c1c" }}>{error}</p>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={submit}
                  disabled={pending}
                  className="text-xs px-3 py-1.5 rounded-pill bg-ink text-surface font-semibold hover:bg-accent-ink transition disabled:opacity-60"
                >
                  {pending ? "Sending…" : "Submit report"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-xs px-3 py-1.5 rounded-pill border border-line text-ink-soft hover:text-ink transition"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
