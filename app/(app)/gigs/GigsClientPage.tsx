"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Gig {
  id: string;
  title: string;
  description: string | null;
  skills_required: string[];
  budget_cents: number;
  budget_kind: string;
  location: string | null;
  category: string | null;
  created_at: string;
  applications_close_at?: string | null;
  employer?: { display_name: string | null; singpass_verified_at: string | null } | null;
  match_score?: number;
}

function formatSgd(cents: number) {
  return `S$${(cents / 100).toLocaleString("en-SG", { minimumFractionDigits: 0 })}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function GigRow({ gig }: { gig: Gig }) {
  const [hovered, setHovered] = useState(false);
  const budget = formatSgd(gig.budget_cents);
  const employerVerified = Boolean(gig.employer?.singpass_verified_at);
  const now = new Date();
  const closeAt = gig.applications_close_at ? new Date(gig.applications_close_at) : null;
  const isClosed = closeAt ? closeAt < now : false;
  const hoursLeft = closeAt && !isClosed ? (closeAt.getTime() - now.getTime()) / 3600000 : null;
  const isClosingSoon = hoursLeft !== null && hoursLeft < 24;

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        padding: 22,
        borderRadius: 18,
        background: "var(--color-surface-raised)",
        border: `1px solid ${hovered ? "var(--color-ink)" : "var(--color-line)"}`,
        display: "grid",
        gridTemplateColumns: "1fr 130px",
        gap: 20,
        alignItems: "start",
        transform: hovered ? "translateY(-1px)" : "none",
        boxShadow: hovered ? "var(--shadow-lift)" : "none",
        transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
      }}
    >
      <Link href={`/gigs/${gig.id}`} style={{ display: "contents" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-ink-soft)", fontWeight: 600 }}>
              {gig.category ?? "Gig"} · {gig.location ?? "Remote"}
            </span>
            <span style={{ fontSize: 11, color: "var(--color-ink-mute)" }}>· {timeAgo(gig.created_at)}</span>
          </div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              margin: "0 0 8px",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              color: "var(--color-ink)",
            }}
          >
            {gig.title}
          </h3>
          {gig.description && (
            <p
              style={{
                fontSize: 13,
                color: "var(--color-ink-soft)",
                margin: "0 0 12px",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              } as React.CSSProperties}
            >
              {gig.description}
            </p>
          )}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {gig.skills_required.slice(0, 5).map((s) => (
              <span
                key={s}
                style={{
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "var(--color-muted)",
                  color: "var(--color-ink-soft)",
                  fontWeight: 600,
                }}
              >
                {s}
              </span>
            ))}
            {gig.employer?.display_name && (
              <span style={{ fontSize: 12, color: "var(--color-ink-soft)", marginLeft: 4 }}>
                {gig.employer.display_name}{" "}
                {employerVerified && (
                  <span style={{ color: "var(--color-trust)" }}>✓</span>
                )}
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "end", gap: 6 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, margin: 0 }}>{budget}</p>
          <p style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink-soft)", margin: 0 }}>
            {gig.budget_kind}
          </p>
          {isClosed && (
            <span style={{
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: 999,
              background: "var(--color-muted)",
              color: "#e55",
            }}>
              Closed
            </span>
          )}
          {isClosingSoon && !isClosed && (
            <span style={{
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 999,
              background: "oklch(96% 0.04 38)",
              color: "oklch(38% 0.12 38)",
              border: "1px solid oklch(88% 0.06 38)",
            }}>
              ⚡ {Math.ceil(hoursLeft!)}h left
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 16,
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-line)",
      }}
    >
      <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-ink-soft)", margin: "0 0 10px" }}>
        {label}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{children}</div>
    </div>
  );
}

function FilterRow({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: "7px 10px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 500,
        background: active ? "var(--color-ink)" : "transparent",
        color: active ? "var(--color-surface)" : "var(--color-ink-soft)",
        transition: "all 0.15s",
        border: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export function GigsClientPage({ gigs }: { gigs: Gig[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [loc, setLoc] = useState("all");
  const [budgetKind, setBudgetKind] = useState<"all" | "fixed" | "hourly">("all");
  const [maxFixed, setMaxFixed] = useState(2000000);
  const [maxHourly, setMaxHourly] = useState(20000);
  const [sort, setSort] = useState("new");

  const cats = Array.from(new Set(gigs.map((g) => g.category).filter(Boolean))) as string[];

  const filtered = useMemo(() => {
    let list = gigs.filter((g) => {
      if (
        q &&
        !(
          g.title.toLowerCase().includes(q.toLowerCase()) ||
          g.skills_required.join(" ").toLowerCase().includes(q.toLowerCase())
        )
      )
        return false;
      if (cat !== "all" && g.category?.toLowerCase() !== cat.toLowerCase()) return false;
      if (loc === "remote" && !g.location?.toLowerCase().includes("remote")) return false;
      if (loc === "inperson" && g.location?.toLowerCase().includes("remote")) return false;
      if (budgetKind !== "all" && g.budget_kind !== budgetKind) return false;
      if (budgetKind === "fixed" && g.budget_cents > maxFixed) return false;
      if (budgetKind === "hourly" && g.budget_cents > maxHourly) return false;
      return true;
    });
    if (sort === "budget") list.sort((a, b) => b.budget_cents - a.budget_cents);
    if (sort === "new") list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }, [gigs, q, cat, loc, budgetKind, maxFixed, maxHourly, sort]);

  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "0 28px", display: "flex", flexDirection: "column", height: "calc(100vh - 84px)", overflow: "hidden" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "end", paddingTop: 50, marginBottom: 30, gap: 20, flexWrap: "wrap", flexShrink: 0 }}>
        <div>
          <div style={{ display: "inline-flex", borderRadius: 999, background: "var(--color-muted)", padding: 3, gap: 2, marginBottom: 14 }}>
            <span style={{ padding: "6px 16px", borderRadius: 999, background: "var(--color-ink)", color: "var(--color-surface)", fontSize: 13, fontWeight: 600 }}>
              Gigs
            </span>
            <Link href="/instant" style={{ padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 500, color: "var(--color-ink-soft)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "oklch(52% 0.22 25)", display: "inline-block" }} />
              Instant
            </Link>
          </div>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-ink-soft)", margin: 0 }}>
            Browse · {gigs.length} open assignments
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 4vw, 4rem)",
              margin: "10px 0 0",
              lineHeight: 0.98,
              letterSpacing: "-0.035em",
            }}
          >
            Every open gig in{" "}
            <span style={{ color: "var(--color-accent-ink)" }}>Singapore</span>, today.
          </h1>
        </div>
        <Link
          href="/gigs/new"
          style={{
            padding: "12px 22px",
            borderRadius: 999,
            background: "var(--color-ink)",
            color: "var(--color-surface)",
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          + Post a gig
        </Link>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 28, flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Filters sidebar */}
        <aside style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, paddingBottom: 80 }}>
          <div
            style={{
              padding: 18,
              borderRadius: 16,
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-line)",
            }}
          >
            <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-ink-soft)", marginBottom: 10 }}>
              Search
            </label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Figma, Next.js, emcee…"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 10,
                border: "1px solid var(--color-line)",
                background: "var(--color-surface)",
                fontSize: 13,
                color: "var(--color-ink)",
                outline: "none",
              }}
            />
          </div>

          <FilterGroup label="Category">
            <FilterRow active={cat === "all"} onClick={() => setCat("all")}>All categories</FilterRow>
            {cats.map((c) => (
              <FilterRow key={c} active={cat === c} onClick={() => setCat(c)}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </FilterRow>
            ))}
          </FilterGroup>

          <FilterGroup label="Location">
            <FilterRow active={loc === "all"} onClick={() => setLoc("all")}>Any location</FilterRow>
            <FilterRow active={loc === "remote"} onClick={() => setLoc("remote")}>Remote</FilterRow>
            <FilterRow active={loc === "inperson"} onClick={() => setLoc("inperson")}>In-person / hybrid</FilterRow>
          </FilterGroup>

          <FilterGroup label="Budget">
            <FilterRow active={budgetKind === "all"} onClick={() => setBudgetKind("all")}>Any type</FilterRow>
            <FilterRow active={budgetKind === "fixed"} onClick={() => setBudgetKind("fixed")}>Fixed price</FilterRow>
            <FilterRow active={budgetKind === "hourly"} onClick={() => setBudgetKind("hourly")}>Hourly rate</FilterRow>
            {budgetKind === "fixed" && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: "var(--color-ink-soft)" }}>Up to</span>
                  <span style={{ fontWeight: 700 }}>S${(maxFixed / 100).toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="2000000"
                  step="10000"
                  value={maxFixed}
                  onChange={(e) => setMaxFixed(parseInt(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--color-accent)" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-soft)", marginTop: 4 }}>
                  <span>S$100</span>
                  <span>S$20k</span>
                </div>
              </div>
            )}
            {budgetKind === "hourly" && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: "var(--color-ink-soft)" }}>Up to</span>
                  <span style={{ fontWeight: 700 }}>S${(maxHourly / 100).toLocaleString()}/hr</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="20000"
                  step="500"
                  value={maxHourly}
                  onChange={(e) => setMaxHourly(parseInt(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--color-accent)" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-soft)", marginTop: 4 }}>
                  <span>S$10/hr</span>
                  <span>S$200/hr</span>
                </div>
              </div>
            )}
          </FilterGroup>
        </aside>

        {/* Results */}
        <div style={{ overflowY: "auto", paddingBottom: 80 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--color-ink-soft)" }}>
              <b style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>{filtered.length}</b> gigs
              {cat !== "all" && <> · {cat}</>}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: 10,
                border: "1px solid var(--color-line)",
                background: "var(--color-surface)",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-ink)",
                cursor: "pointer",
              }}
            >
              <option value="new">Newest</option>
              <option value="budget">Highest budget</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div
              style={{
                padding: 60,
                borderRadius: 20,
                border: "1px dashed var(--color-line)",
                textAlign: "center",
              }}
            >
              <p style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: 0 }}>
                No gigs match those filters.
              </p>
              <p style={{ color: "var(--color-ink-soft)", marginTop: 8 }}>
                Try loosening the budget or clearing the search.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((g) => (
                <GigRow key={g.id} gig={g} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
