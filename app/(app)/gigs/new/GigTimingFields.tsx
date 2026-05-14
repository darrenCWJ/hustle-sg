"use client";

import { useState } from "react";

const DURATION_OPTIONS = [
  { value: "less_than_a_day", label: "Less than a day" },
  { value: "1_2_days",        label: "1–2 days" },
  { value: "about_a_week",    label: "About a week" },
  { value: "2_weeks",         label: "2 weeks" },
  { value: "1_month",         label: "1 month" },
  { value: "2_3_months",      label: "2–3 months" },
  { value: "6_months_plus",   label: "6 months+" },
  { value: "ongoing",         label: "Ongoing / recurring" },
  { value: "project_based",   label: "Project-based (until done)" },
];

const CADENCE_OPTIONS = [
  "Once a week",
  "Twice a week",
  "Once a fortnight",
  "Once a month",
  "As needed",
];

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Milestone { name: string; due_date: string }

type EndType = "duration" | "end_date";

export function GigTimingFields() {
  const [asap, setAsap]           = useState(true);
  const [endType, setEndType]     = useState<EndType>("duration");
  const [duration, setDuration]   = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime]     = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);

  function toggleDay(day: number) {
    setDaysOfWeek(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  }

  // Less-than-a-day extras
  const [hours, setHours]         = useState("");

  // Ongoing extras
  const [cadence, setCadence]     = useState(CADENCE_OPTIONS[3]);
  const [ongoingUntil, setOngoingUntil] = useState("");

  // Project-based milestones
  const [milestones, setMilestones] = useState<Milestone[]>([{ name: "", due_date: "" }]);

  function addMilestone() {
    setMilestones((m) => [...m, { name: "", due_date: "" }]);
  }
  function removeMilestone(i: number) {
    setMilestones((m) => m.filter((_, idx) => idx !== i));
  }
  function updateMilestone(i: number, field: keyof Milestone, value: string) {
    setMilestones((m) => m.map((ms, idx) => idx === i ? { ...ms, [field]: value } : ms));
  }

  const validMilestones = milestones.filter((m) => m.name.trim());

  return (
    <div className="space-y-5">
      {/* Start date */}
      <div>
        <label className="text-sm font-medium block mb-1">When does the work start?</label>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none mb-2">
          <input
            type="checkbox"
            checked={asap}
            onChange={(e) => setAsap(e.target.checked)}
            className="accent-ink"
          />
          ASAP
        </label>
        {!asap && (
          <input
            type="date"
            name="starts_at"
            className="w-full rounded-xl border border-line px-4 py-3 bg-surface-raised"
          />
        )}
        {asap && <input type="hidden" name="starts_at" value="" />}
      </div>

      {/* Time of day */}
      <div>
        <label className="text-sm font-medium block mb-2">What time?</label>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label className="text-xs text-ink-soft block mb-1">Start time</label>
            <input
              type="time"
              name="start_time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-xl border border-line px-4 py-3 bg-surface-raised"
            />
          </div>
          <span style={{ paddingBottom: 14, color: "var(--color-ink-mute)", fontSize: 14 }}>→</span>
          <div style={{ flex: 1 }}>
            <label className="text-xs text-ink-soft block mb-1">End time</label>
            <input
              type="time"
              name="end_time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-xl border border-line px-4 py-3 bg-surface-raised"
            />
          </div>
        </div>
      </div>

      {/* Day of week */}
      <div>
        <label className="text-sm font-medium block mb-2">
          Which days?
          {duration === "Ongoing / recurring" && (
            <span className="ml-2 text-xs font-normal text-ink-soft">(select all that apply)</span>
          )}
        </label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {DAYS_SHORT.map((d, i) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(i)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                border: `1.5px solid ${daysOfWeek.includes(i) ? "var(--color-ink)" : "var(--color-line)"}`,
                background: daysOfWeek.includes(i) ? "var(--color-ink)" : "transparent",
                color: daysOfWeek.includes(i) ? "var(--color-surface)" : "var(--color-ink-soft)",
                cursor: "pointer",
              }}
            >
              {d}
            </button>
          ))}
        </div>
        <input type="hidden" name="days_of_week" value={daysOfWeek.join(",")} />
      </div>

      {/* Duration type toggle */}
      <div>
        <label className="text-sm font-medium block mb-2">How long will it take?</label>
        <div className="flex gap-2 mb-3">
          {(["duration", "end_date"] as EndType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setEndType(t)}
              className={`rounded-pill px-3 py-1.5 text-xs font-semibold border transition ${
                endType === t ? "bg-ink text-surface border-ink" : "bg-surface border-line text-ink-soft"
              }`}
            >
              {t === "duration" ? "Duration" : "Specific end date"}
            </button>
          ))}
        </div>

        {endType === "end_date" ? (
          <div className="space-y-1">
            <input
              type="date"
              name="ends_at"
              className="w-full rounded-xl border border-line px-4 py-3 bg-surface-raised"
            />
            <p className="text-xs text-ink-mute">Leave blank if the end date isn't fixed yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <select
              name="duration_label"
              value={duration}
              onChange={(e) => { setDuration(e.target.value); }}
              className="w-full rounded-xl border border-line px-4 py-3 bg-surface-raised text-sm"
            >
              <option value="">Select duration…</option>
              {DURATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.label}>{o.label}</option>
              ))}
            </select>

            {/* ── Less than a day: hours ── */}
            {duration === "Less than a day" && (
              <div style={{ padding: "16px 18px", borderRadius: 12, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft block mb-3">
                  Estimated hours needed
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHours(String(h))}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 600,
                        border: `1.5px solid ${hours === String(h) ? "var(--color-ink)" : "var(--color-line)"}`,
                        background: hours === String(h) ? "var(--color-ink)" : "transparent",
                        color: hours === String(h) ? "var(--color-surface)" : "var(--color-ink-soft)",
                        cursor: "pointer",
                      }}
                    >
                      {h}h
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    max={23}
                    placeholder="Custom"
                    value={![...Array(8)].map((_, i) => String(i + 1)).includes(hours) ? hours : ""}
                    onChange={(e) => setHours(e.target.value)}
                    style={{ width: 80, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--color-line)", background: "var(--color-surface)", fontSize: 13 }}
                  />
                </div>
                <input type="hidden" name="hours_required" value={hours} />
              </div>
            )}

            {/* ── Ongoing: cadence + until ── */}
            {duration === "Ongoing / recurring" && (
              <div style={{ padding: "16px 18px", borderRadius: 12, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)", display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft block mb-2">
                    How often?
                  </label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {CADENCE_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCadence(c)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                          border: `1.5px solid ${cadence === c ? "var(--color-ink)" : "var(--color-line)"}`,
                          background: cadence === c ? "var(--color-ink)" : "transparent",
                          color: cadence === c ? "var(--color-surface)" : "var(--color-ink-soft)",
                          cursor: "pointer",
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="recurrence_cadence" value={cadence} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft block mb-2">
                    Until (optional)
                  </label>
                  <input
                    type="date"
                    name="ends_at"
                    value={ongoingUntil}
                    onChange={(e) => setOngoingUntil(e.target.value)}
                    className="w-full rounded-xl border border-line px-4 py-3 bg-surface"
                  />
                  <p className="text-xs text-ink-mute mt-1">Leave blank if open-ended.</p>
                </div>
              </div>
            )}

            {/* ── Project-based: milestones ── */}
            {duration === "Project-based (until done)" && (
              <div style={{ padding: "16px 18px", borderRadius: 12, background: "var(--color-surface-raised)", border: "1px solid var(--color-line)" }}>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft block mb-3">
                  Milestones
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {milestones.map((ms, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 160px auto", gap: 8, alignItems: "center" }}>
                      <input
                        type="text"
                        placeholder={`Milestone ${i + 1} (e.g. First draft)`}
                        value={ms.name}
                        onChange={(e) => updateMilestone(i, "name", e.target.value)}
                        style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid var(--color-line)", background: "var(--color-surface)", fontSize: 13 }}
                      />
                      <input
                        type="date"
                        value={ms.due_date}
                        onChange={(e) => updateMilestone(i, "due_date", e.target.value)}
                        style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid var(--color-line)", background: "var(--color-surface)", fontSize: 13 }}
                      />
                      {milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMilestone(i)}
                          style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--color-line)", background: "transparent", color: "var(--color-ink-mute)", cursor: "pointer", fontSize: 13 }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addMilestone}
                  style={{ marginTop: 10, padding: "6px 14px", borderRadius: 999, border: "1px dashed var(--color-line)", background: "transparent", fontSize: 12, fontWeight: 600, color: "var(--color-ink-soft)", cursor: "pointer" }}
                >
                  + Add milestone
                </button>
                <input
                  type="hidden"
                  name="milestones_json"
                  value={JSON.stringify(validMilestones)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
