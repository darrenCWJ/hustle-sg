"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const POSTINGS = [
  { title: "Wedding photography assistant — Sentosa", employer: "Pearl Avenue Studios", cat: "Events", budget: "S$480" },
  { title: "Mandarin translator for legal contracts", employer: "Allen & Gledhill LLP", cat: "Translation", budget: "S$1,800" },
  { title: "P5 Maths tutor (weekly, Bukit Timah)", employer: "Mrs Tan", cat: "Tuition", budget: "S$70/hr" },
  { title: "Mobile app QA — 2-week sprint", employer: "OCBC Digital", cat: "Engineering", budget: "S$3,200" },
  { title: "Hari Raya bazaar booth designer", employer: "Wisma Geylang Serai", cat: "Design", budget: "S$2,400" },
  { title: "Bilingual emcee for D&D night", employer: "Singapore Pools", cat: "Events", budget: "S$900" },
  { title: "Service blueprint review — clinic intake", employer: "Synapse Health", cat: "Design", budget: "S$5,600" },
  { title: "Voiceover artist (Malay) for ad campaign", employer: "Wunderman Thompson", cat: "Video", budget: "S$1,100" },
];

export function NewPostingsStream() {
  const [items, setItems] = useState([POSTINGS[0], POSTINGS[1], POSTINGS[2]]);
  const [cursor, setCursor] = useState(3);

  useEffect(() => {
    const id = setInterval(() => {
      setItems((prev) => [POSTINGS[cursor % POSTINGS.length], ...prev].slice(0, 3));
      setCursor((c) => c + 1);
    }, 3800);
    return () => clearInterval(id);
  }, [cursor]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-ink-soft)", fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-jade)", boxShadow: "0 0 0 4px oklch(from var(--color-jade) l c h / 0.18)" }} />
          New assignments posted
        </span>
        <Link href="/gigs" style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink-soft)", fontWeight: 600 }}>
          View all assignments →
        </Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {items.map((p, i) => (
          <Link
            key={p.title + String(cursor) + String(i)}
            href="/gigs"
            style={{
              display: "block",
              textAlign: "left",
              padding: 14,
              borderRadius: 12,
              border: "1px solid var(--color-line)",
              background: "var(--color-surface)",
              animation: i === 0 ? "fadeUp 0.5s var(--ease-out-expo) both" : "none",
              textDecoration: "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-ink-soft)", fontWeight: 600 }}>{p.cat}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>{p.budget}</span>
            </div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{p.title}</p>
            <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "var(--color-ink-soft)" }}>
              {p.employer} <span style={{ color: "var(--color-trust)" }}>✓</span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
