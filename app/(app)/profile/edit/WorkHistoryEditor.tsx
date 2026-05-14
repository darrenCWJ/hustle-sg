"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addWorkHistory, deleteWorkHistory } from "./actions";
import type { WorkHistory } from "@/lib/supabase/types";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(ym: string | null, isCurrent: boolean): string {
  if (isCurrent) return "Present";
  if (!ym) return "";
  const [y, m] = ym.split("-");
  return `${MONTHS[parseInt(m) - 1]} ${y}`;
}

function MonthYearPicker({ name, label, required = true }: { name: string; label: string; required?: boolean }) {
  const now = new Date();
  const years = Array.from({ length: 40 }, (_, i) => now.getFullYear() - i);

  return (
    <div>
      <span className="text-sm font-medium block mb-1">{label}</span>
      <div className="flex gap-2">
        <select
          name={`${name}_month`}
          required={required}
          className="flex-1 rounded-xl border border-line px-3 py-2.5 bg-surface text-sm"
          defaultValue=""
        >
          <option value="" disabled>Month</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
          ))}
        </select>
        <select
          name={`${name}_year`}
          required={required}
          className="flex-1 rounded-xl border border-line px-3 py-2.5 bg-surface text-sm"
          defaultValue=""
        >
          <option value="" disabled>Year</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function WorkHistoryEditor({ items }: { items: WorkHistory[] }) {
  const router = useRouter();
  const [isCurrent, setIsCurrent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    // Combine month+year selects into YYYY-MM strings
    const sm = fd.get("start_date_month") as string;
    const sy = fd.get("start_date_year") as string;
    if (!sm || !sy) { setError("Select a start month and year."); return; }
    fd.set("start_date", `${sy}-${sm}`);

    if (!isCurrent) {
      const em = fd.get("end_date_month") as string;
      const ey = fd.get("end_date_year") as string;
      if (!em || !ey) { setError("Select an end month and year, or tick 'Currently here'."); return; }
      fd.set("end_date", `${ey}-${em}`);
    }

    fd.set("is_current", String(isCurrent));

    startTransition(async () => {
      const res = await addWorkHistory(fd);
      if (!res.ok) { setError(res.error); return; }
      form.reset();
      setIsCurrent(false);
      router.refresh();
    });
  };

  return (
    <div id="work-history" className="scroll-mt-24">
      <h2 className="font-display text-display-md mb-6">Work History</h2>

      {/* Existing entries */}
      {items.length > 0 && (
        <ul className="space-y-3 mb-8">
          {items
            .sort((a, b) => b.start_date.localeCompare(a.start_date))
            .map((item) => (
              <li
                key={item.id}
                className="flex gap-4 rounded-card border border-line p-4 bg-surface-raised"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold leading-tight">{item.title}</p>
                      <p className="text-sm text-ink-soft">{item.company}</p>
                    </div>
                    <p
                      style={{ fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}
                      className="text-xs text-ink-mute mt-0.5 shrink-0"
                    >
                      {formatDate(item.start_date, false)} – {formatDate(item.end_date, item.is_current)}
                    </p>
                  </div>
                  {item.description && (
                    <p className="text-sm text-ink-soft mt-1.5 line-clamp-2">{item.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  className="text-xs text-ink-soft hover:text-accent transition shrink-0 self-start mt-0.5"
                  onClick={() => {
                    startTransition(async () => {
                      await deleteWorkHistory(item.id);
                      router.refresh();
                    });
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
        </ul>
      )}

      {/* Add form */}
      <div className="rounded-card bg-surface-raised border border-line p-6">
        <p className="text-sm font-semibold mb-4">Add a role</p>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Company</span>
              <input
                name="company"
                required
                placeholder="e.g. Grab, GovTech, NUS"
                className="mt-1 w-full rounded-xl border border-line px-4 py-2.5 bg-surface text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Job title</span>
              <input
                name="title"
                required
                placeholder="e.g. Product Designer"
                className="mt-1 w-full rounded-xl border border-line px-4 py-2.5 bg-surface text-sm"
              />
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <MonthYearPicker name="start_date" label="Start date" />
            {!isCurrent && <MonthYearPicker name="end_date" label="End date" />}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">I currently work here</span>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Description <span className="text-ink-mute font-normal">(optional)</span></span>
            <textarea
              name="description"
              rows={2}
              placeholder="Key responsibilities or achievements in 1–2 sentences"
              className="mt-1 w-full rounded-xl border border-line px-4 py-2.5 bg-surface text-sm resize-none"
            />
          </label>

          {error && <p className="text-sm text-accent">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="rounded-pill bg-ink text-surface px-5 py-2 font-semibold text-sm disabled:opacity-40"
          >
            {isPending ? "Adding…" : "Add role"}
          </button>
        </form>
      </div>
    </div>
  );
}
