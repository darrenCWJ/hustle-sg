"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { saveAvailability } from "@/app/actions/availability";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DEFAULT_SLOTS: number[][] = [
  [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // Mon
  [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // Tue
  [0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1], // Wed
  [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // Thu
  [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // Fri
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // Sat
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // Sun
];

const STORAGE_KEY = "hustlesg_availability";

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

interface GigOption {
  t: string;
  d: string;
  pay: string;
  cat: string;
  col: number;
  rows: number[];
}

const GIG_POOL: GigOption[] = [
  { t: "Brand shoot (2h)",       d: "Sat 2–4pm",      pay: "S$160", cat: "Design",    col: 5, rows: [12,13,14,15] },
  { t: "Content writing brief",  d: "Thu 5–7pm",      pay: "S$95",  cat: "Writing",   col: 3, rows: [18,19,20,21] },
  { t: "Event helper (3h)",      d: "Sun 9am–noon",   pay: "S$90",  cat: "F&B",       col: 6, rows: [2,3,4,5,6,7] },
  { t: "Figma walkthrough",      d: "Mon 2–3pm",      pay: "S$120", cat: "Design",    col: 0, rows: [12,13] },
  { t: "Copywriting (1h)",       d: "Mon 3–4pm",      pay: "S$80",  cat: "Writing",   col: 0, rows: [14,15] },
  { t: "Tuition (2h)",           d: "Tue 7–9pm",      pay: "S$140", cat: "Education", col: 1, rows: [22,23] },
  { t: "Photo editing",          d: "Wed 7–8pm",      pay: "S$70",  cat: "Design",    col: 2, rows: [22,23] },
  { t: "MC / Emcee (3h)",        d: "Sat 10am–1pm",   pay: "S$300", cat: "Events",    col: 5, rows: [4,5,6,7,8,9] },
  { t: "Social media post",      d: "Sun 2–3pm",      pay: "S$60",  cat: "Writing",   col: 6, rows: [12,13] },
  { t: "Data entry (2h)",        d: "Thu 2–4pm",      pay: "S$60",  cat: "Admin",     col: 3, rows: [12,13,14,15] },
  { t: "Guitar lesson (1h)",     d: "Sun 4–5pm",      pay: "S$80",  cat: "Teaching",  col: 6, rows: [16,17] },
  { t: "Logo design (1h)",       d: "Mon 1–2pm",      pay: "S$100", cat: "Design",    col: 0, rows: [10,11] },
];

function timeLabel(si: number) {
  const h = Math.floor(8 + si / 2);
  const m = si % 2 === 1 ? 30 : 0;
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h > 12 ? h - 12 : h;
  return `${h12}${m ? `:${String(m).padStart(2,"0")}` : ""}${ampm}`;
}

function slotColor(v: number, editMode: boolean) {
  if (v === 2) return "var(--color-accent)";
  if (v === 1) return editMode ? "var(--color-jade)" : "var(--color-jade-soft)";
  return "var(--color-muted)";
}

function statusTextColor(v: number) {
  if (v === 2) return "var(--color-accent)";
  if (v === 1) return "var(--color-jade)";
  return "var(--color-ink-mute)";
}

function statusLabel(v: number) {
  if (v === 2) return "Booked gig";
  if (v === 1) return "Free";
  return "Busy";
}

function gigFits(g: GigOption, slots: number[][]) {
  return g.rows.every(r => slots[g.col][r] === 1);
}

interface Props {
  initialSlots?: number[][] | null;
  authenticated?: boolean;
}

export function DashboardCalendar({ initialSlots, authenticated }: Props) {
  const [userSlots, setUserSlots] = useState<number[][]>(() => {
    if (initialSlots) return initialSlots;
    if (typeof window !== "undefined") return loadLocalSlots() ?? DEFAULT_SLOTS.map(d => [...d]);
    return DEFAULT_SLOTS.map(d => [...d]);
  });
  const [editMode, setEditMode]   = useState(false);
  const [hovered,  setHovered]    = useState<{ row: number; col: number } | null>(null);
  const [gigHover, setGigHover]   = useState<GigOption | null>(null);
  const [saving,   setSaving]     = useState(false);

  const isDragging = useRef(false);
  const dragValue  = useRef<0 | 1>(1);
  const saveTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync to DB (debounced) + localStorage
  useEffect(() => {
    saveLocalSlots(userSlots);
    setGigHover(null);

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

  const toggleSlot = useCallback((col: number, row: number, val: 0 | 1) => {
    setUserSlots(prev => {
      if (prev[col][row] === 2) return prev;
      const next = prev.map(d => [...d]);
      next[col][row] = val;
      return next;
    });
  }, []);

  const startDrag = (col: number, row: number) => {
    if (!editMode || userSlots[col][row] === 2) return;
    const newVal: 0 | 1 = userSlots[col][row] === 1 ? 0 : 1;
    dragValue.current  = newVal;
    isDragging.current = true;
    toggleSlot(col, row, newVal);
  };

  const onDragOver = (col: number, row: number) => {
    if (!editMode || !isDragging.current || userSlots[col][row] === 2) return;
    toggleSlot(col, row, dragValue.current);
  };

  const resetSlots = () => {
    setUserSlots(DEFAULT_SLOTS.map(d => [...d]));
  };

  const matchingGigs = GIG_POOL.filter(g => gigFits(g, userSlots));
  const freeCount    = userSlots.flat().filter(v => v === 1).length;

  const activeCol  = editMode ? null : gigHover?.col  ?? hovered?.col  ?? null;
  const activeRows = editMode ? null :
    gigHover ? new Set(gigHover.rows) :
    hovered  ? new Set([hovered.row]) : null;

  return (
    <section style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>

      {/* ── Calendar ── */}
      <div style={{ padding: 26, borderRadius: 22, background: "var(--color-surface-raised)", border: `1px solid ${editMode ? "var(--color-jade)" : "var(--color-line)"}`, transition: "border-color 0.2s" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: 0, letterSpacing: "-0.02em" }}>
              Your calendar this week
            </h2>
            {editMode && (
              <p style={{ fontSize: 11, color: "var(--color-jade-ink)", margin: "4px 0 0", fontFamily: "var(--font-mono)" }}>
                Click or drag to mark free / busy — booked slots are locked
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            {saving && (
              <span style={{ fontSize: 10, color: "var(--color-ink-mute)", fontFamily: "var(--font-mono)" }}>
                saving…
              </span>
            )}
            {editMode && (
              <button
                onClick={resetSlots}
                style={{ padding: "6px 12px", borderRadius: 999, border: "1px solid var(--color-line)", background: "transparent", fontSize: 12, color: "var(--color-ink-soft)", cursor: "pointer" }}
              >
                Reset
              </button>
            )}
            <button
              onClick={() => { setEditMode(v => !v); setHovered(null); setGigHover(null); }}
              style={{
                padding: "7px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: editMode ? "var(--color-jade)" : "var(--color-muted)",
                color: editMode ? "white" : "var(--color-ink)",
                border: "none",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {editMode ? "✓ Done" : "Edit availability"}
            </button>
          </div>
        </div>

        {/* Grid */}
        <div
          style={{ display: "grid", gridTemplateColumns: "36px repeat(7, 1fr)", gap: 3, userSelect: "none" }}
          onMouseLeave={() => { if (!editMode) setHovered(null); }}
        >
          {/* Day headers */}
          <div />
          {DAYS.map((d, di) => {
            const isActive = !editMode && activeCol === di;
            return (
              <div key={d} style={{
                textAlign: "center", fontSize: 10, fontWeight: isActive ? 800 : 600,
                color: isActive ? "var(--color-ink)" : "var(--color-ink-soft)",
                letterSpacing: "0.06em", textTransform: "uppercase", paddingBottom: 6,
                borderRadius: 4,
                background: isActive ? "var(--color-muted)" : "transparent",
                transition: "color 0.1s, background 0.1s",
              }}>
                {d}
              </div>
            );
          })}

          {/* Slot rows */}
          {Array.from({ length: 24 }).map((_, si) => {
            const hour = 8 + Math.floor(si / 2);
            const isHalf = si % 2 === 1;
            const isActiveRow = !editMode && (activeRows?.has(si) ?? false);

            return (
              <React.Fragment key={`row-${si}`}>
                <div style={{
                  fontSize: 9, textAlign: "right", paddingRight: 6, lineHeight: 1, paddingTop: 2,
                  color: isActiveRow ? "var(--color-ink)" : "var(--color-ink-mute)",
                  fontWeight: isActiveRow ? 700 : 400,
                  transition: "color 0.1s",
                }}>
                  {!isHalf ? `${hour}` : ""}
                </div>

                {userSlots.map((day, di) => {
                  const v        = day[si];
                  const locked   = v === 2;
                  const isThis   = !editMode && hovered?.row === si && hovered?.col === di;
                  const inGig    = !editMode && gigHover ? gigHover.col === di && gigHover.rows.includes(si) : false;
                  const sameRow  = !editMode && !gigHover && hovered?.row === si && hovered?.col !== di;
                  const sameCol  = !editMode && !gigHover && hovered?.col === di && hovered?.row !== si;
                  const highlight = isThis || inGig;
                  const editHover = editMode && hovered?.row === si && hovered?.col === di && !locked;

                  return (
                    <div
                      key={`${di}-${si}`}
                      onMouseEnter={() => {
                        if (editMode) { setHovered({ row: si, col: di }); onDragOver(di, si); }
                        else          { setHovered({ row: si, col: di }); }
                      }}
                      onMouseDown={() => startDrag(di, si)}
                      style={{
                        height: 10, borderRadius: 2,
                        background: editHover && !locked
                          ? (v === 1 ? "oklch(45% 0.14 165)" : "oklch(50% 0.05 240)")
                          : slotColor(v, editMode),
                        opacity: highlight ? 1
                          : sameRow || sameCol ? (v === 0 ? 0.65 : 0.9)
                          : v === 0 ? (editMode ? 0.5 : 0.4) : 1,
                        transform: highlight ? "scaleY(1.7)" : "none",
                        outline: highlight ? `2px solid ${v === 2 ? "var(--color-accent)" : "var(--color-jade)"}` : "none",
                        outlineOffset: 1,
                        boxShadow: highlight
                          ? `0 0 8px 1px ${v === 2 ? "oklch(from var(--color-accent) l c h / 0.4)" : "oklch(from var(--color-jade) l c h / 0.35)"}`
                          : sameCol ? "inset 0 0 0 100px oklch(0% 0 0 / 0.04)" : "none",
                        transition: editMode ? "background 0.08s" : "opacity 0.1s, transform 0.12s, box-shadow 0.12s",
                        cursor: editMode ? (locked ? "not-allowed" : "pointer") : "crosshair",
                        position: "relative", zIndex: highlight ? 2 : 1,
                      }}
                    />
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>

        {/* Info bar */}
        <div style={{ marginTop: 12, minHeight: 32, display: "flex", alignItems: "center" }}>
          {editMode ? (
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--color-jade-ink)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                {freeCount} free half-hour slots
              </span>
              <span style={{ fontSize: 11, color: "var(--color-ink-mute)" }}>·</span>
              <span style={{ fontSize: 11, color: "var(--color-ink-mute)" }}>{matchingGigs.length} gigs match</span>
            </div>
          ) : gigHover ? (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: 999,
              background: "var(--color-jade)", color: "white",
              fontSize: 12, fontWeight: 600,
              animation: "fadeUp 0.15s var(--ease-out-expo) both",
            }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{DAYS[gigHover.col]}</span>
              <span style={{ opacity: 0.7 }}>·</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                {timeLabel(gigHover.rows[0])}–{timeLabel(gigHover.rows[gigHover.rows.length - 1] + 1)}
              </span>
              <span style={{ opacity: 0.7 }}>·</span>
              <span>{gigHover.t}</span>
            </div>
          ) : hovered ? (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: 999,
              background: "var(--color-ink)", color: "oklch(97% 0.012 85)",
              fontSize: 12,
              animation: "fadeUp 0.15s var(--ease-out-expo) both",
            }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-accent)", fontWeight: 700 }}>
                {DAYS[hovered.col]}
              </span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{timeLabel(hovered.row)}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: statusTextColor(userSlots[hovered.col][hovered.row]) }}>
                {statusLabel(userSlots[hovered.col][hovered.row])}
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 16 }}>
              {([
                ["Busy",       "var(--color-muted)",     0.5],
                ["Free",       "var(--color-jade-soft)", 1  ],
                ["Booked gig", "var(--color-accent)",    1  ],
              ] as [string, string, number][]).map(([l, bg, op]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: bg, opacity: op, display: "inline-block" }} />
                  <span style={{ fontSize: 11, color: "var(--color-ink-soft)" }}>{l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Gig recommendations ── */}
      <div
        className="grain"
        style={{ padding: 24, borderRadius: 22, background: "var(--color-ink)", color: "var(--color-surface)" }}
        onMouseLeave={() => setGigHover(null)}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 600, margin: 0 }}>
            Fits your free slots
          </p>
          {editMode && (
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "oklch(100% 0 0 / 0.45)", background: "oklch(100% 0 0 / 0.08)", padding: "2px 8px", borderRadius: 999 }}>
              live
            </span>
          )}
        </div>

        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 18px", letterSpacing: "-0.02em" }}>
          {matchingGigs.length > 0
            ? `${matchingGigs.length} gig${matchingGigs.length === 1 ? "" : "s"} match your gaps.`
            : "No matches yet."}
        </h3>

        {matchingGigs.length === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "oklch(100% 0 0 / 0.5)", lineHeight: 1.55, margin: 0 }}>
              Mark more time as <span style={{ color: "var(--color-jade)", fontWeight: 600 }}>free</span> on your
              calendar to unlock gig recommendations.
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {matchingGigs.map((g, i) => {
              const isActive = gigHover?.t === g.t;
              return (
                <li
                  key={i}
                  onMouseEnter={() => { if (!editMode) { setGigHover(g); setHovered(null); } }}
                  style={{
                    padding: "12px 14px", borderRadius: 14,
                    background: isActive ? "oklch(100% 0 0 / 0.12)" : "oklch(100% 0 0 / 0.06)",
                    border: isActive ? "1px solid oklch(from var(--color-jade) l c h / 0.5)" : "1px solid oklch(100% 0 0 / 0.12)",
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                    cursor: editMode ? "default" : "pointer",
                    transform: isActive ? "translateX(3px)" : "none",
                    transition: "background 0.15s, border-color 0.15s, transform 0.15s",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5 }}>{g.t}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 11, color: "oklch(100% 0 0 / 0.55)" }}>
                      {g.d} · {g.cat}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--color-accent)", whiteSpace: "nowrap" }}>
                      {g.pay}
                    </span>
                    {isActive && (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-jade)", letterSpacing: "0.1em", textTransform: "uppercase", animation: "fadeUp 0.15s both" }}>
                        ↑ on calendar
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
