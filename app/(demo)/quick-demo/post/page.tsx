"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "../DemoProvider";
import { useViewMode } from "../ViewModeContext";
import type { DemoGig } from "../data";

const CATEGORIES = [
  { value: "tech", label: "Tech" },
  { value: "design", label: "Design" },
  { value: "content", label: "Content" },
  { value: "marketing", label: "Marketing" },
  { value: "tuition", label: "Tuition" },
  { value: "events", label: "Events" },
  { value: "video", label: "Video / Photography" },
  { value: "admin", label: "Admin / Operations" },
  { value: "logistics", label: "Logistics / Delivery" },
  { value: "other", label: "Other" },
];

export default function DemoPostPage() {
  const router = useRouter();
  const { postGig, activeAccount } = useDemo();
  const { viewMode } = useViewMode();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "tech",
    location: "",
    skills: "",
    budget: "",
    budgetKind: "fixed" as "fixed" | "hourly",
    headcount: 1,
  });
  const [submitted, setSubmitted] = useState(false);

  if (activeAccount.role !== "employer") {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-mute)", fontSize: 14 }}>
        Only employers can post gigs.
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    const gig: Omit<DemoGig, "id"> = {
      title: form.title,
      description: form.description,
      category: form.category,
      location: form.location || "Remote",
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      budget: form.budget
        ? `${form.budget}${form.budgetKind === "hourly" ? "/hr" : " fixed"}`
        : "TBD",
      postedAgo: "just now",
      headcount: form.headcount > 1 ? form.headcount : undefined,
    };

    postGig(gig);
    setSubmitted(true);
    setTimeout(() => router.push("/quick-demo/my-gigs"), 1800);
  }

  const wrapStyle = viewMode === "desktop"
    ? { maxWidth: 720, margin: "0 auto", padding: "50px 28px 80px" }
    : { padding: "16px", overflowY: "auto" as const, height: "100%" };

  if (submitted) {
    return (
      <div style={{ ...wrapStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, minHeight: 300 }}>
        <div style={{ fontSize: 48 }}>🎉</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: 0, letterSpacing: "-0.02em" }}>Gig posted!</h2>
        <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: 0 }}>
          Workers on the other device can now see it in their Feed.
        </p>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: "0 0 8px" }}>
        Post a gig
      </p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: viewMode === "desktop" ? 36 : 24, margin: "0 0 28px", letterSpacing: "-0.025em" }}>
        Describe what you need done.
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Gig title"
          style={{ width: "100%", borderRadius: 12, border: "1px solid var(--color-line)", padding: "12px 16px", background: "var(--color-surface-raised)", fontSize: 14, color: "var(--color-ink)", boxSizing: "border-box" }}
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={5}
          placeholder="Describe scope, deliverables, timeline…"
          style={{ width: "100%", borderRadius: 12, border: "1px solid var(--color-line)", padding: "12px 16px", background: "var(--color-surface-raised)", fontSize: 14, color: "var(--color-ink)", resize: "vertical", boxSizing: "border-box" }}
        />
        <div style={{ display: "grid", gridTemplateColumns: viewMode === "desktop" ? "1fr 1fr" : "1fr", gap: 10 }}>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            style={{ borderRadius: 12, border: "1px solid var(--color-line)", padding: "12px 16px", background: "var(--color-surface-raised)", fontSize: 14, color: "var(--color-ink)" }}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <input
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder="Location (e.g. Tanjong Pagar or Remote)"
            style={{ borderRadius: 12, border: "1px solid var(--color-line)", padding: "12px 16px", background: "var(--color-surface-raised)", fontSize: 14, color: "var(--color-ink)" }}
          />
          <input
            value={form.skills}
            onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
            placeholder="Skills required (comma separated)"
            style={{ borderRadius: 12, border: "1px solid var(--color-line)", padding: "12px 16px", background: "var(--color-surface-raised)", fontSize: 14, color: "var(--color-ink)", gridColumn: viewMode === "desktop" ? "span 2" : undefined }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label style={{ fontSize: 13, color: "var(--color-ink-soft)", whiteSpace: "nowrap" }}>Headcount:</label>
            <button type="button" onClick={() => setForm((f) => ({ ...f, headcount: Math.max(1, f.headcount - 1) }))} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--color-line)", background: "transparent", cursor: "pointer", fontSize: 16 }}>−</button>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, minWidth: 24, textAlign: "center" }}>{form.headcount}</span>
            <button type="button" onClick={() => setForm((f) => ({ ...f, headcount: f.headcount + 1 }))} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--color-line)", background: "transparent", cursor: "pointer", fontSize: 16 }}>+</button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              min={1}
              value={form.budget}
              onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
              placeholder="Budget in S$"
              style={{ flex: 1, borderRadius: 12, border: "1px solid var(--color-line)", padding: "12px 16px", background: "var(--color-surface-raised)", fontSize: 14, color: "var(--color-ink)" }}
            />
            <select
              value={form.budgetKind}
              onChange={(e) => setForm((f) => ({ ...f, budgetKind: e.target.value as "fixed" | "hourly" }))}
              style={{ borderRadius: 12, border: "1px solid var(--color-line)", padding: "12px 14px", background: "var(--color-surface-raised)", fontSize: 14, color: "var(--color-ink)" }}
            >
              <option value="fixed">Fixed</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={!form.title.trim()}
          style={{
            marginTop: 8,
            padding: "13px 28px",
            borderRadius: 999,
            border: "none",
            background: form.title.trim() ? "var(--color-ink)" : "var(--color-muted)",
            color: form.title.trim() ? "var(--color-surface)" : "var(--color-ink-mute)",
            fontSize: 15,
            fontWeight: 700,
            cursor: form.title.trim() ? "pointer" : "default",
            alignSelf: "flex-start",
          }}
        >
          Publish gig →
        </button>
      </form>
    </div>
  );
}
