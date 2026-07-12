"use client";

import { useState, useTransition } from "react";
import { updateGig, deleteGig } from "../actions";

interface EditGigFormProps {
  gigId: string;
  hasApplicants: boolean;
  initial: {
    title: string;
    description: string;
    skills: string;
    location: string;
    category: string;
    budgetSgd: number;
    budgetKind: string;
    closeAtLocal: string; // datetime-local value in SGT, "" if none
  };
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 12,
  border: "1px solid var(--color-line)",
  background: "var(--color-surface)",
  color: "var(--color-ink)",
  fontSize: 14,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--color-ink-mute)",
  fontWeight: 600,
  marginBottom: 6,
};

export function EditGigForm({ gigId, hasApplicants, initial }: EditGigFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      // On success updateGig redirects; we only see a return value on failure.
      const res = await updateGig(gigId, formData);
      if (res && !res.ok) setError(res.error ?? "Could not save changes.");
    });
  };

  const onDelete = () => {
    if (!window.confirm("Delete this gig? This cannot be undone.")) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteGig(gigId);
      if (res && !res.ok) setError(res.error ?? "Could not delete the gig.");
    });
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <label htmlFor="edit-title" style={labelStyle}>Title</label>
        <input id="edit-title" name="title" defaultValue={initial.title} required minLength={3} maxLength={160} style={inputStyle} />
      </div>

      <div>
        <label htmlFor="edit-description" style={labelStyle}>Description</label>
        <textarea id="edit-description" name="description" defaultValue={initial.description} required minLength={10} rows={7} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }} />
      </div>

      <div>
        <label htmlFor="edit-skills" style={labelStyle}>Skills (comma-separated)</label>
        <input id="edit-skills" name="skills_required" defaultValue={initial.skills} placeholder="e.g. barista, latte art" style={inputStyle} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label htmlFor="edit-location" style={labelStyle}>Location</label>
          <input id="edit-location" name="location" defaultValue={initial.location} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="edit-category" style={labelStyle}>Category</label>
          <input id="edit-category" name="category" defaultValue={initial.category} style={inputStyle} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label htmlFor="edit-budget" style={labelStyle}>Budget (SGD)</label>
          <input id="edit-budget" name="budget_sgd" type="number" min={0} step="1" defaultValue={initial.budgetSgd} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="edit-budget-kind" style={labelStyle}>Budget type</label>
          <select id="edit-budget-kind" name="budget_kind" defaultValue={initial.budgetKind} style={inputStyle}>
            <option value="fixed">Fixed</option>
            <option value="hourly">Hourly</option>
            <option value="project">Whole project</option>
            <option value="milestone">Per milestone</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="edit-close-at" style={labelStyle}>Application deadline (SGT, optional)</label>
        <input id="edit-close-at" name="applications_close_at" type="datetime-local" defaultValue={initial.closeAtLocal} style={inputStyle} />
        <p style={{ fontSize: 11.5, color: "var(--color-ink-mute)", margin: "6px 0 0" }}>
          Leave empty to keep applications open until you close the gig.
        </p>
      </div>

      {error && <p style={{ fontSize: 13, color: "#dc2626", margin: 0 }}>{error}</p>}

      <button
        type="submit"
        disabled={pending}
        style={{
          padding: 14,
          borderRadius: 999,
          border: "none",
          background: pending ? "var(--color-muted)" : "var(--color-ink)",
          color: pending ? "var(--color-ink-mute)" : "var(--color-surface)",
          fontWeight: 700,
          fontSize: 15,
          cursor: pending ? "default" : "pointer",
        }}
      >
        {pending ? "Saving…" : "Save changes"}
      </button>

      <div style={{ borderTop: "1px solid var(--color-line)", paddingTop: 18, marginTop: 6 }}>
        {hasApplicants ? (
          <p style={{ fontSize: 12.5, color: "var(--color-ink-mute)", margin: 0 }}>
            This gig has applicants, so it can&apos;t be deleted — close it from the
            applicants page instead and everyone will be notified.
          </p>
        ) : (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            style={{
              padding: "9px 18px",
              borderRadius: 999,
              border: "1px solid #dc2626",
              background: "transparent",
              color: "#dc2626",
              fontWeight: 600,
              fontSize: 13,
              cursor: pending ? "default" : "pointer",
            }}
          >
            Delete gig
          </button>
        )}
      </div>
    </form>
  );
}
