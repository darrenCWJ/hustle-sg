"use client";

import { useState } from "react";

type GigMode = "approval" | "instant";

export function GigFormSettings() {
  const [mode, setMode] = useState<GigMode>("approval");

  return (
    <div className="rounded-xl border border-line bg-surface-raised p-5 space-y-4">
      <p className="text-xs uppercase tracking-widest text-ink-soft">Gig mode</p>

      {/* Hidden fields that reflect the chosen mode */}
      <input type="hidden" name="requires_employer_approval" value={mode === "approval" ? "true" : "false"} />
      <input type="hidden" name="is_instant" value={mode === "instant" ? "true" : "false"} />

      <div className="space-y-3">
        <label className={`flex items-start gap-3 cursor-pointer rounded-xl border p-4 transition ${mode === "approval" ? "border-ink bg-surface" : "border-line"}`}>
          <input
            type="radio"
            name="gig_mode"
            value="approval"
            checked={mode === "approval"}
            onChange={() => setMode("approval")}
            className="mt-0.5 accent-ink"
          />
          <span className="text-sm">
            <strong>Require employer approval</strong>
            <span className="block text-ink-soft text-xs mt-0.5">
              You manually hire or reject each applicant after reviewing their profile and interview.
            </span>
          </span>
        </label>

        <label className={`flex items-start gap-3 cursor-pointer rounded-xl border p-4 transition ${mode === "instant" ? "border-ink bg-surface" : "border-line"}`}>
          <input
            type="radio"
            name="gig_mode"
            value="instant"
            checked={mode === "instant"}
            onChange={() => setMode("instant")}
            className="mt-0.5 accent-ink"
          />
          <span className="text-sm">
            <strong>Instant gig</strong>
            <span className="block text-ink-soft text-xs mt-0.5">
              Freelancers can accept immediately with no application process.
            </span>
          </span>
        </label>
      </div>

      {mode === "instant" && (
        <div>
          <label className="text-xs text-ink-soft">Urgency</label>
          <select
            name="instant_urgency"
            className="mt-1 w-full rounded-xl border border-line px-4 py-3 bg-surface-raised"
          >
            <option value="now">Now (within the hour)</option>
            <option value="today">Today</option>
            <option value="weekend">This weekend</option>
          </select>
        </div>
      )}

      {mode === "approval" && (
        <div>
          <label className="text-xs text-ink-soft block mb-1">
            Application deadline{" "}
            <span className="opacity-50">(optional — leave blank for no deadline)</span>
          </label>
          <input
            type="datetime-local"
            name="applications_close_at"
            className="w-full rounded-xl border border-line px-4 py-3 bg-surface-raised"
          />
          <p className="text-xs text-ink-mute mt-1">Time is in Singapore time (SGT, UTC+8).</p>
        </div>
      )}
    </div>
  );
}
