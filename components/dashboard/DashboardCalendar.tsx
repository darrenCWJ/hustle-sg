"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { saveAvailability } from "@/app/actions/availability";

export interface RecommendedGig {
  id: string;
  title: string;
  category: string | null;
  budget_cents: number | null;
  budget_kind: string;
  location: string | null;
  is_instant: boolean;
  instant_urgency: string | null;
  starts_at: string | null;
  duration_label: string | null;
  overlap_skills?: string[];
  start_time?: string | null;
  end_time?: string | null;
  days_of_week?: number[] | null;
}

export interface BookedGig {
  id: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  days_of_week: number[] | null;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_SLOTS: number[][] = [
  [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1],
  [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const STORAGE_KEY = "hustlesg_availability";

// 25 time boundary points: 8:00am → 8:00pm in 30-min steps
const HALF_HOURS = Array.from({ length: 25 }, (_, i) => {
  const total = 8 * 60 + i * 30;
  const h = Math.floor(total / 60);
  const m = total % 60;
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h > 12 ? h - 12 : h;
  return { label: `${h12}:${m.toString().padStart(2, "0")}${ampm}`, slot: i };
});

const TIME_BLOCKS = [
  { label: "Morning",   sub: "8am–12pm", from: 0,  to: 8  },
  { label: "Afternoon", sub: "12pm–6pm", from: 8,  to: 20 },
  { label: "Evening",   sub: "6pm–8pm",  from: 20, to: 24 },
  { label: "All day",   sub: "8am–8pm",  from: 0,  to: 24 },
];

// Amber preview color (warm, distinct from jade/accent)
const PREVIEW_COLOR      = "oklch(72% 0.18 55)";
const PREVIEW_COLOR_SOFT = "oklch(92% 0.07 55)";
const PREVIEW_COLOR_INK  = "oklch(30% 0.1 55)";

function loadLocalSlots(): number[][] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveLocalSlots(slots: number[][]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(slots)); } catch {}
}

function getTodayCol(): number {
  return (new Date().getDay() + 6) % 7;
}

function getGigDayCol(gig: RecommendedGig): number | null {
  if (gig.is_instant) {
    const today = getTodayCol();
    if (gig.instant_urgency === "now" || gig.instant_urgency === "today") return today;
    if (gig.instant_urgency === "weekend") return 5;
  }
  if (gig.starts_at) {
    const start = new Date(gig.starts_at);
    const today = new Date();
    const todayCol = getTodayCol();
    const monday = new Date(today);
    monday.setDate(today.getDate() - todayCol);
    monday.setHours(0, 0, 0, 0);
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    if (start >= monday && start < nextMonday) {
      return (start.getDay() + 6) % 7;
    }
  }
  return null;
}

function gigMatchesSchedule(gig: RecommendedGig, slots: number[][]): boolean {
  const col = getGigDayCol(gig);
  if (col === null) return slots.flat().some(v => v === 1);
  return slots[col]?.some(v => v === 1) ?? false;
}

function formatBudget(cents: number | null, kind: string): string {
  if (!cents) return "Negotiable";
  const sgd = Math.round(cents / 100);
  return `S$${sgd.toLocaleString()}${kind === "hourly" ? "/hr" : ""}`;
}

function gigDateLabel(gig: RecommendedGig): string {
  if (gig.is_instant) {
    if (gig.instant_urgency === "now") return "Needed NOW";
    if (gig.instant_urgency === "today") return "Today";
    if (gig.instant_urgency === "weekend") return "This weekend";
    return "Instant";
  }
  if (gig.starts_at) {
    return new Date(gig.starts_at).toLocaleDateString("en-SG", { day: "numeric", month: "short" });
  }
  return "ASAP";
}

function timeLabel(si: number): string {
  const h = Math.floor(8 + si / 2);
  const m = si % 2 === 1 ? "30" : "";
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h > 12 ? h - 12 : h;
  return `${h12}${m ? `:${m}` : ""}${ampm}`;
}

function slotColor(v: number, editMode: boolean): string {
  if (v === 2) return "var(--color-accent)";
  if (v === 1) return editMode ? "var(--color-jade)" : "var(--color-jade-soft)";
  return "var(--color-muted)";
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function slotFromTime(t: string): number {
  return Math.max(0, Math.floor((timeToMinutes(t) - 480) / 30));
}

function slotFromTimeEnd(t: string): number {
  return Math.min(24, Math.ceil((timeToMinutes(t) - 480) / 30));
}

type PresetKey = "weekdays9to5" | "weekends" | "all" | "clear";

function applyPreset(preset: PresetKey, current: number[][], bookedMask: boolean[][]): number[][] {
  const next = current.map(d => [...d]);
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row < 24; row++) {
      if (bookedMask[col][row]) continue;
      if (preset === "clear") {
        next[col][row] = 0;
      } else if (preset === "all") {
        next[col][row] = 1;
      } else if (preset === "weekdays9to5") {
        next[col][row] = (col < 5 && row >= 2 && row <= 18) ? 1 : 0;
      } else if (preset === "weekends") {
        next[col][row] = col >= 5 ? 1 : 0;
      }
    }
  }
  return next;
}

function applyRangeToDay(col: number, from: number, to: number, current: number[][], booked: boolean[][]): number[][] {
  const next = current.map(d => [...d]);
  for (let row = from; row < Math.min(to, 24); row++) {
    if (!booked[col][row]) next[col][row] = 1;
  }
  return next;
}

function clearDaySlots(col: number, current: number[][], booked: boolean[][]): number[][] {
  const next = current.map(d => [...d]);
  for (let row = 0; row < 24; row++) {
    if (!booked[col][row]) next[col][row] = 0;
  }
  return next;
}

// Compute which calendar cells a recommended gig would occupy
interface GigHighlight {
  cols: number[];      // which day columns (a gig may recur on multiple days)
  fromSlot: number;
  toSlot: number;
  hasTime: boolean;   // false = only day known, not exact hours
}

function computeGigHighlight(gig: RecommendedGig): GigHighlight | null {
  // Determine which day columns this gig occupies
  let cols: number[] = [];

  if (gig.days_of_week && gig.days_of_week.length > 0) {
    cols = gig.days_of_week.filter(d => d >= 0 && d <= 6);
  } else {
    const col = getGigDayCol(gig);
    if (col !== null) cols = [col];
  }

  if (cols.length === 0) return null;

  const hasTime = !!(gig.start_time && gig.end_time);
  const fromSlot = gig.start_time ? slotFromTime(gig.start_time) : 0;
  const toSlot   = gig.end_time   ? slotFromTimeEnd(gig.end_time) : 24;

  return { cols, fromSlot, toSlot, hasTime };
}

interface Props {
  initialSlots?: number[][] | null;
  authenticated?: boolean;
  recommendedGigs?: RecommendedGig[];
  bookedGigs?: BookedGig[];
}

export function DashboardCalendar({ initialSlots, authenticated, recommendedGigs, bookedGigs }: Props) {
  const bookedMask = useMemo<boolean[][]>(() => {
    const mask: boolean[][] = Array.from({ length: 7 }, () => Array(24).fill(false));
    for (const gig of (bookedGigs ?? [])) {
      if (!gig.start_time || !gig.end_time || !gig.days_of_week?.length) continue;
      const startMin = timeToMinutes(gig.start_time);
      const endMin   = timeToMinutes(gig.end_time);
      const startSlot = Math.max(0, Math.floor((startMin - 480) / 30));
      const endSlot   = Math.min(23, Math.ceil((endMin - 480) / 30) - 1);
      for (const day of gig.days_of_week) {
        if (day < 0 || day > 6) continue;
        for (let s = startSlot; s <= endSlot; s++) mask[day][s] = true;
      }
    }
    return mask;
  }, [bookedGigs]);

  const [userSlots, setUserSlots] = useState<number[][]>(() => {
    if (initialSlots) return initialSlots;
    if (typeof window !== "undefined") return loadLocalSlots() ?? DEFAULT_SLOTS.map(d => [...d]);
    return DEFAULT_SLOTS.map(d => [...d]);
  });
  const [editMode,    setEditMode]    = useState(false);
  const [hovered,     setHovered]     = useState<{ row: number; col: number } | null>(null);
  const [saving,      setSaving]      = useState(false);
  const [activeDay,   setActiveDay]   = useState<number | null>(null);
  const [customFrom,  setCustomFrom]  = useState(2);
  const [customTo,    setCustomTo]    = useState(18);
  const [hoveredGigId, setHoveredGigId] = useState<string | null>(null);

  const isDragging = useRef(false);
  const dragValue  = useRef<0 | 1>(1);
  const saveTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    saveLocalSlots(userSlots);
    if (!authenticated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await saveAvailability(userSlots);
      setSaving(false);
    }, 1200);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [userSlots, authenticated]);

  useEffect(() => {
    const up = () => { isDragging.current = false; };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  useEffect(() => {
    if (!editMode) setActiveDay(null);
  }, [editMode]);

  const toggleSlot = useCallback((col: number, row: number, val: 0 | 1) => {
    setUserSlots(prev => {
      if (bookedMask[col][row]) return prev;
      const next = prev.map(d => [...d]);
      next[col][row] = val;
      return next;
    });
  }, [bookedMask]);

  const startDrag = (col: number, row: number) => {
    if (!editMode || bookedMask[col][row]) return;
    const newVal: 0 | 1 = userSlots[col][row] === 1 ? 0 : 1;
    dragValue.current  = newVal;
    isDragging.current = true;
    toggleSlot(col, row, newVal);
  };

  const onDragOver = (col: number, row: number) => {
    if (!editMode || !isDragging.current || bookedMask[col][row]) return;
    toggleSlot(col, row, dragValue.current);
  };

  const gigs = recommendedGigs ?? [];

  // Pre-compute highlight info for the hovered gig
  const gigHighlight = useMemo<GigHighlight | null>(() => {
    if (!hoveredGigId) return null;
    const gig = gigs.find(g => g.id === hoveredGigId);
    return gig ? computeGigHighlight(gig) : null;
  }, [hoveredGigId, gigs]);

  const freeCount  = userSlots.flat().filter(v => v === 1).length;
  const matchCount = gigs.filter(g => gigMatchesSchedule(g, userSlots)).length;

  // Is a given cell (col, row) inside the preview highlight?
  const isPreviewSlot = (col: number, row: number): boolean => {
    if (!gigHighlight) return false;
    return gigHighlight.cols.includes(col) && row >= gigHighlight.fromSlot && row < gigHighlight.toSlot;
  };

  // Is this column a preview day (has preview slots in it)?
  const isPreviewCol = (col: number): boolean => {
    return !!gigHighlight?.cols.includes(col);
  };

  const selectStyle: React.CSSProperties = {
    padding: "4px 7px",
    borderRadius: 6,
    border: "1px solid var(--color-line)",
    background: "var(--color-surface)",
    color: "var(--color-ink)",
    fontSize: 11,
    cursor: "pointer",
    outline: "none",
    fontFamily: "var(--font-mono)",
  };

  return (
    <section>
      {/* ── Availability calendar ── */}
      <div style={{
        padding: "20px 22px",
        borderRadius: 20,
        background: "var(--color-surface-raised)",
        border: `1px solid ${editMode ? "var(--color-jade)" : "var(--color-line)"}`,
        transition: "border-color 0.2s",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: 0, letterSpacing: "-0.02em" }}>
              Your week
            </h2>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: editMode ? "var(--color-jade-ink)" : "var(--color-ink-mute)", fontFamily: editMode ? "var(--font-mono)" : undefined }}>
              {editMode
                ? "Click a day to set hours · drag cells to fine-tune"
                : `${freeCount} free slot${freeCount !== 1 ? "s" : ""} · ${matchCount} gig${matchCount !== 1 ? "s" : ""} fit your schedule`}
            </p>
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {editMode && (
              <>
                {([
                  ["Weekdays 9–5", "weekdays9to5"],
                  ["Weekends",     "weekends"],
                  ["All days",     "all"],
                  ["Clear",        "clear"],
                ] as [string, PresetKey][]).map(([label, preset]) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setUserSlots(s => applyPreset(preset, s, bookedMask))}
                    style={{ padding: "5px 11px", borderRadius: 999, fontSize: 11, fontWeight: 600, border: "1px solid var(--color-line)", background: "var(--color-surface)", color: "var(--color-ink-soft)", cursor: "pointer" }}
                  >
                    {label}
                  </button>
                ))}
              </>
            )}
            {saving && (
              <span style={{ fontSize: 10, color: "var(--color-jade-ink)", fontFamily: "var(--font-mono)" }}>saving…</span>
            )}
            <button
              type="button"
              onClick={() => { setEditMode(v => !v); setHovered(null); }}
              style={{ padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", background: editMode ? "var(--color-jade)" : "var(--color-muted)", color: editMode ? "white" : "var(--color-ink)", border: "none", transition: "background 0.15s, color 0.15s" }}
            >
              {editMode ? "✓ Done" : "Edit availability"}
            </button>
          </div>
        </div>

        {/* Day time-range panel */}
        {editMode && activeDay !== null && (
          <div style={{
            marginBottom: 10,
            padding: "10px 14px",
            borderRadius: 10,
            background: "var(--color-jade-soft)",
            border: "1px solid oklch(from var(--color-jade) l c h / 0.3)",
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-jade-ink)", minWidth: 76 }}>
              {DAYS_FULL[activeDay]}
            </span>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", flex: 1 }}>
              <button
                type="button"
                onClick={() => setUserSlots(prev => clearDaySlots(activeDay, prev, bookedMask))}
                style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid var(--color-line)", background: "var(--color-surface)", color: "var(--color-ink-soft)" }}
              >
                Clear
              </button>
              {TIME_BLOCKS.map(b => (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => setUserSlots(prev => applyRangeToDay(activeDay, b.from, b.to, prev, bookedMask))}
                  style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid oklch(from var(--color-jade) l c h / 0.4)", background: "var(--color-surface)", color: "var(--color-jade-ink)" }}
                >
                  {b.label}{" "}
                  <span style={{ opacity: 0.6, fontWeight: 400 }}>{b.sub}</span>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <select value={customFrom} onChange={e => setCustomFrom(+e.target.value)} style={selectStyle}>
                {HALF_HOURS.slice(0, 24).map(h => (
                  <option key={h.slot} value={h.slot}>{h.label}</option>
                ))}
              </select>
              <span style={{ fontSize: 11, color: "var(--color-ink-mute)" }}>→</span>
              <select value={customTo} onChange={e => setCustomTo(+e.target.value)} style={selectStyle}>
                {HALF_HOURS.slice(1).map(h => (
                  <option key={h.slot} value={h.slot}>{h.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (customFrom < customTo) {
                    setUserSlots(prev => applyRangeToDay(activeDay, customFrom, customTo, prev, bookedMask));
                  }
                }}
                style={{ padding: "4px 11px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none", background: "var(--color-jade)", color: "white" }}
              >
                + Add
              </button>
            </div>
          </div>
        )}

        {/* Gig preview banner — shown when hovering a gig card */}
        {gigHighlight && (() => {
          const gig = gigs.find(g => g.id === hoveredGigId)!;
          const dayNames = gigHighlight.cols.map(c => DAYS[c]).join(", ");
          const timeRange = gigHighlight.hasTime
            ? `${timeLabel(gigHighlight.fromSlot)} – ${timeLabel(gigHighlight.toSlot)}`
            : "time TBD";
          return (
            <div style={{
              marginBottom: 10,
              padding: "8px 14px",
              borderRadius: 10,
              background: PREVIEW_COLOR_SOFT,
              border: `1px solid ${PREVIEW_COLOR}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              animation: "fadeUp 0.15s var(--ease-out-expo) both",
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: PREVIEW_COLOR_INK }}>
                Previewing:
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: PREVIEW_COLOR_INK, flex: 1 }}>
                {gig.title}
              </span>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: PREVIEW_COLOR_INK, opacity: 0.8 }}>
                {dayNames} · {timeRange}
              </span>
              {gig.duration_label && (
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: PREVIEW_COLOR, color: "white" }}>
                  {gig.duration_label}
                </span>
              )}
            </div>
          );
        })()}

        {/* Grid */}
        <div
          style={{ display: "grid", gridTemplateColumns: "28px repeat(7, 1fr)", gap: 2, userSelect: "none" }}
          onMouseLeave={() => { if (!editMode) setHovered(null); }}
        >
          {/* Day header row */}
          <div />
          {DAYS.map((d, di) => {
            const colHasFree  = userSlots[di].some(v => v === 1);
            const isActive    = editMode && activeDay === di;
            const isPreview   = !editMode && isPreviewCol(di);
            return (
              <button
                key={d}
                type="button"
                onClick={() => editMode && setActiveDay(prev => prev === di ? null : di)}
                title={editMode ? `Set hours for ${DAYS_FULL[di]}` : undefined}
                style={{
                  textAlign: "center",
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: isActive
                    ? "var(--color-jade-ink)"
                    : isPreview
                      ? PREVIEW_COLOR_INK
                      : colHasFree ? "var(--color-ink)" : "var(--color-ink-mute)",
                  paddingBottom: 5,
                  paddingTop: 3,
                  cursor: editMode ? "pointer" : "default",
                  background: isActive
                    ? "var(--color-jade-soft)"
                    : isPreview
                      ? PREVIEW_COLOR_SOFT
                      : "none",
                  border: isActive
                    ? "1px solid oklch(from var(--color-jade) l c h / 0.4)"
                    : isPreview
                      ? `1px solid ${PREVIEW_COLOR}`
                      : "1px solid transparent",
                  transition: "color 0.15s, background 0.15s",
                  borderRadius: 6,
                }}
              >
                {d}
              </button>
            );
          })}

          {/* Slot rows */}
          {Array.from({ length: 24 }).map((_, si) => {
            const showLabel = si % 4 === 0;
            const hour      = 8 + Math.floor(si / 2);
            const isHovRow  = !editMode && hovered?.row === si;
            return (
              <React.Fragment key={`row-${si}`}>
                <div style={{
                  fontSize: 8,
                  textAlign: "right",
                  paddingRight: 4,
                  lineHeight: 1,
                  paddingTop: 1,
                  color: isHovRow ? "var(--color-ink)" : "var(--color-ink-mute)",
                  fontWeight: isHovRow ? 700 : 400,
                  transition: "color 0.1s",
                  visibility: showLabel ? "visible" : "hidden",
                }}>
                  {showLabel ? `${hour}` : ""}
                </div>
                {userSlots.map((day, di) => {
                  const v           = bookedMask[di][si] ? 2 : day[si];
                  const locked      = bookedMask[di][si];
                  const isActiveCol = editMode && activeDay === di;
                  const isEditHov   = editMode && hovered?.row === si && hovered?.col === di && !locked;
                  const isCellHov   = !editMode && hovered?.row === si && hovered?.col === di;
                  const sameRow     = !editMode && hovered?.row === si && hovered?.col !== di;
                  const sameCol     = !editMode && hovered?.col === di && hovered?.row !== si;
                  const isPrev      = !editMode && isPreviewSlot(di, si);
                  // Day-only preview (no exact time): softer tint on the whole column
                  const isColOnlyPrev = !editMode && isPreviewCol(di) && !gigHighlight?.hasTime;

                  let bg: string;
                  if (isPrev && !locked) {
                    bg = v === 1 ? PREVIEW_COLOR : "oklch(84% 0.12 55)";
                  } else if (isColOnlyPrev && !locked) {
                    bg = v === 1 ? "var(--color-jade-soft)" : PREVIEW_COLOR_SOFT;
                  } else if (isEditHov) {
                    bg = v === 1 ? "oklch(45% 0.14 165)" : "oklch(55% 0.06 240)";
                  } else {
                    bg = slotColor(v, editMode);
                  }

                  return (
                    <div
                      key={`${di}-${si}`}
                      onMouseEnter={() => {
                        setHovered({ row: si, col: di });
                        if (editMode && !locked) onDragOver(di, si);
                      }}
                      onMouseDown={() => startDrag(di, si)}
                      style={{
                        height: 8,
                        borderRadius: 2,
                        background: bg,
                        opacity: isPrev
                          ? 1
                          : isCellHov ? 1 : sameRow || sameCol ? (v === 0 ? 0.55 : 0.85) : v === 0 ? (editMode ? 0.5 : 0.35) : 1,
                        transform: isCellHov ? "scaleY(1.6)" : isPrev ? "scaleY(1.1)" : "none",
                        outline: isCellHov ? `2px solid ${v === 2 ? "var(--color-accent)" : "var(--color-jade)"}` : isPrev ? `1px solid ${PREVIEW_COLOR}` : "none",
                        outlineOffset: 1,
                        transition: editMode ? "background 0.07s" : "opacity 0.12s, transform 0.12s, background 0.15s",
                        cursor: editMode ? (locked ? "not-allowed" : "pointer") : "default",
                        position: "relative",
                        zIndex: isPrev ? 3 : isCellHov ? 2 : 1,
                      }}
                    />
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>

        {/* Legend + tooltip bar */}
        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {([["Busy", "var(--color-muted)", 0.35], ["Free", "var(--color-jade-soft)", 1], ["Booked gig", "var(--color-accent)", 1]] as [string, string, number][]).map(([l, bg, op]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: bg, opacity: op, display: "inline-block" }} />
                <span style={{ fontSize: 11, color: "var(--color-ink-soft)" }}>{l}</span>
              </div>
            ))}
            {gigHighlight && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: PREVIEW_COLOR, display: "inline-block" }} />
                <span style={{ fontSize: 11, color: "var(--color-ink-soft)" }}>Gig preview</span>
              </div>
            )}
          </div>
          {hovered && !editMode && !gigHighlight && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 12px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 11, animation: "fadeUp 0.12s var(--ease-out-expo) both" }}>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)", fontWeight: 700 }}>{DAYS[hovered.col]}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{timeLabel(hovered.row)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Profile-matched gig cards ── */}
      {gigs.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, gap: 10 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, letterSpacing: "-0.02em" }}>
                Recommended for you
              </h3>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--color-ink-soft)" }}>
                Matched to your profile · hover a card to preview it in your calendar
              </p>
            </div>
            <Link href="/gigs" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink-soft)", flexShrink: 0, textDecoration: "none" }}>
              Browse all →
            </Link>
          </div>

          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 10, scrollSnapType: "x mandatory" }}>
            {gigs.map((g) => {
              const fits        = gigMatchesSchedule(g, userSlots);
              const isInstant   = g.is_instant;
              const overlaps    = (g.overlap_skills ?? []).slice(0, 3);
              const isHovering  = hoveredGigId === g.id;
              const highlight   = computeGigHighlight(g);
              const showTimeTag = !!(g.start_time && g.end_time);

              return (
                <div
                  key={g.id}
                  onMouseEnter={() => setHoveredGigId(g.id)}
                  onMouseLeave={() => setHoveredGigId(null)}
                  style={{
                    minWidth: 215,
                    maxWidth: 235,
                    flexShrink: 0,
                    padding: "14px 16px",
                    borderRadius: 16,
                    background: isHovering ? PREVIEW_COLOR_SOFT : "var(--color-surface-raised)",
                    border: isHovering
                      ? `2px solid ${PREVIEW_COLOR}`
                      : fits
                        ? "1.5px solid oklch(from var(--color-jade) l c h / 0.5)"
                        : "1px solid var(--color-line)",
                    scrollSnapAlign: "start",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    cursor: "default",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                >
                  <div>
                    {isInstant && (
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)", display: "block", marginBottom: 3 }}>
                        ⚡ {gigDateLabel(g)}
                      </span>
                    )}
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13, lineHeight: 1.35 }}>{g.title}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--color-ink-mute)" }}>
                      {[g.category, g.location].filter(Boolean).join(" · ") || "General"}
                    </p>
                  </div>

                  {/* Time + duration badge */}
                  {(showTimeTag || g.duration_label) && (
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {showTimeTag && (
                        <span style={{ fontSize: 9.5, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: isHovering ? PREVIEW_COLOR : "var(--color-muted)", color: isHovering ? "white" : "var(--color-ink-soft)", fontFamily: "var(--font-mono)", transition: "background 0.15s, color 0.15s" }}>
                          {timeLabel(slotFromTime(g.start_time!))} – {timeLabel(slotFromTimeEnd(g.end_time!))}
                        </span>
                      )}
                      {g.duration_label && (
                        <span style={{ fontSize: 9.5, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)" }}>
                          {g.duration_label}
                        </span>
                      )}
                      {highlight && (
                        <span style={{ fontSize: 9.5, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "var(--color-muted)", color: "var(--color-ink-soft)" }}>
                          {highlight.cols.map(c => DAYS[c]).join(", ")}
                        </span>
                      )}
                    </div>
                  )}

                  {overlaps.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {overlaps.map(sk => (
                        <span key={sk} style={{ fontSize: 9.5, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "var(--color-jade-soft)", color: "var(--color-jade-ink)" }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", gap: 8 }}>
                    <div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--color-ink)" }}>
                        {formatBudget(g.budget_cents, g.budget_kind)}
                      </span>
                      {fits && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                          <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--color-jade)", display: "inline-block" }} />
                          <span style={{ fontSize: 9.5, color: "var(--color-jade-ink)", fontWeight: 600 }}>Fits schedule</span>
                        </div>
                      )}
                    </div>
                    <Link
                      href={isInstant ? "/instant" : `/gigs/${g.id}`}
                      style={{ fontSize: 11, fontWeight: 700, padding: "5px 13px", borderRadius: 999, background: isInstant ? "var(--color-accent)" : "var(--color-ink)", color: isInstant ? "oklch(22% 0.08 38)" : "var(--color-surface)", whiteSpace: "nowrap", textDecoration: "none", flexShrink: 0 }}
                    >
                      {isInstant ? "⚡ Now" : "Apply →"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
