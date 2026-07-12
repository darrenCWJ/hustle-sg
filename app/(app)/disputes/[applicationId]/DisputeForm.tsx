"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { openDispute, type DisputeInput } from "@/app/actions/disputes";

const REASONS: Array<{ value: DisputeInput["reason"]; label: string }> = [
  { value: "non_payment", label: "Payment issue" },
  { value: "work_quality", label: "Work quality" },
  { value: "no_show", label: "No-show" },
  { value: "scope_change", label: "Scope changed unfairly" },
  { value: "conduct", label: "Unprofessional conduct" },
  { value: "other", label: "Something else" },
];

export function DisputeForm({ applicationId }: { applicationId: string }) {
  const [reason, setReason] = useState<DisputeInput["reason"]>("non_payment");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await openDispute({ applicationId, reason, details });
      if (!res.ok) {
        setError(res.error ?? "Could not open the dispute.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <div style={{ padding: 28, borderRadius: 20, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
      <fieldset style={{ border: "none", margin: 0, padding: 0, marginBottom: 18 }}>
        <legend style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", fontWeight: 600, marginBottom: 10 }}>
          What went wrong?
        </legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {REASONS.map((r) => (
            <label
              key={r.value}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                padding: "7px 12px",
                borderRadius: 999,
                border: `1px solid ${reason === r.value ? "var(--color-ink)" : "var(--color-line)"}`,
                background: reason === r.value ? "var(--color-ink)" : "transparent",
                color: reason === r.value ? "var(--color-surface)" : "var(--color-ink-soft)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <input
                type="radio"
                name="dispute-reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
                style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
              />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label htmlFor="dispute-details" style={{ display: "block", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-mute)", fontWeight: 600, marginBottom: 8 }}>
        What happened?
      </label>
      <textarea
        id="dispute-details"
        value={details}
        onChange={(e) => setDetails(e.target.value.slice(0, 4000))}
        rows={5}
        placeholder="Describe the issue factually — dates, what was agreed, what actually happened. Our team reads this."
        style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--color-line)", background: "var(--color-surface)", fontSize: 14, lineHeight: 1.55, color: "var(--color-ink)", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
      />
      <p style={{ fontSize: 11, color: "var(--color-ink-mute)", margin: "4px 0 16px", textAlign: "right" }}>
        {details.length} / 4000
      </p>

      {error && <p style={{ fontSize: 13, color: "#dc2626", margin: "0 0 14px" }}>{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={pending || details.trim().length < 20}
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 999,
          border: "none",
          background: !pending && details.trim().length >= 20 ? "var(--color-ink)" : "var(--color-muted)",
          color: !pending && details.trim().length >= 20 ? "var(--color-surface)" : "var(--color-ink-mute)",
          fontWeight: 700,
          fontSize: 15,
          cursor: !pending && details.trim().length >= 20 ? "pointer" : "default",
        }}
      >
        {pending ? "Opening…" : "Open dispute"}
      </button>
    </div>
  );
}
