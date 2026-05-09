"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Freelancer {
  id: string;
  handle: string;
  displayName: string;
  headline: string | null;
  singpassVerified: boolean;
  verifiedCertCount: number;
  skills: string[];
  matchScore: number | null;
}

interface Gig {
  id: string;
  title: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ScoreBadge({ score }: { score: number }) {
  const hue =
    score >= 80 ? "165" : score >= 60 ? "38" : score >= 40 ? "38" : "25";
  const bg =
    score >= 80
      ? "var(--color-jade-soft)"
      : score >= 60
        ? "var(--color-accent-soft)"
        : "var(--color-muted)";
  const fg =
    score >= 80
      ? "var(--color-jade-ink)"
      : score >= 60
        ? "var(--color-accent-ink)"
        : "var(--color-ink-soft)";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "end",
        gap: 3,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: bg,
          color: fg,
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-display)",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        {score}
      </div>
      <span
        style={{
          fontSize: 9,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-ink-mute)",
          fontWeight: 600,
        }}
      >
        match
      </span>
    </div>
  );
}

function FreelancerCard({
  f,
  rank,
}: {
  f: Freelancer;
  rank?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const ini = initials(f.displayName);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 20,
        borderRadius: 18,
        background: "var(--color-surface-raised)",
        border: `1px solid ${hovered ? "var(--color-ink)" : "var(--color-line)"}`,
        transform: hovered ? "translateY(-1px)" : "none",
        boxShadow: hovered ? "var(--shadow-lift)" : "none",
        transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
      }}
    >
      {rank !== undefined && rank <= 3 && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background:
              rank === 1
                ? "oklch(78% 0.15 85)"
                : rank === 2
                  ? "oklch(75% 0.04 210)"
                  : "oklch(72% 0.08 38)",
            color: rank === 1 ? "oklch(28% 0.1 85)" : "oklch(25% 0.05 210)",
            display: "grid",
            placeItems: "center",
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          {rank}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
        <span
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "oklch(78% 0.08 250)",
            color: "oklch(22% 0.08 250)",
            display: "grid",
            placeItems: "center",
            fontSize: 16,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {ini}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
              {f.displayName}
            </p>
            {f.singpassVerified && (
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 7px",
                  borderRadius: 999,
                  background: "var(--color-jade-soft)",
                  color: "var(--color-jade-ink)",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Singpass ✓
              </span>
            )}
          </div>
          {f.headline && (
            <p
              style={{
                margin: "3px 0 0",
                fontSize: 12.5,
                color: "var(--color-ink-soft)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {f.headline}
            </p>
          )}
          {f.verifiedCertCount > 0 && (
            <p
              style={{
                margin: "3px 0 0",
                fontSize: 11,
                color: "var(--color-trust)",
                fontWeight: 600,
              }}
            >
              {f.verifiedCertCount} verified credential
              {f.verifiedCertCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {f.matchScore !== null && <ScoreBadge score={f.matchScore} />}
      </div>

      {f.skills.length > 0 && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {f.skills.slice(0, 5).map((s) => (
            <span
              key={s}
              style={{
                fontSize: 11,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "3px 9px",
                borderRadius: 999,
                background: "var(--color-muted)",
                color: "var(--color-ink-soft)",
                fontWeight: 600,
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <Link
        href={`/profile/${f.handle}`}
        style={{
          padding: "7px 0",
          borderRadius: 999,
          border: "1px solid var(--color-line)",
          fontSize: 12,
          fontWeight: 600,
          textAlign: "center",
          color: "var(--color-ink)",
          display: "block",
        }}
      >
        View profile →
      </Link>
    </article>
  );
}

export function FreelancersClient({
  freelancers,
  myGigs,
  activeGigId,
  initialQ,
  initialVerified,
}: {
  freelancers: Freelancer[];
  myGigs: Gig[];
  activeGigId: string | null;
  initialQ: string;
  initialVerified: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(initialQ);
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerified);
  const isMatchMode = Boolean(activeGigId);

  function navigate(gigId: string | null) {
    const params = new URLSearchParams();
    if (gigId) params.set("gig_id", gigId);
    if (q) params.set("q", q);
    if (verifiedOnly) params.set("verified", "true");
    startTransition(() => {
      router.push(`${pathname}${params.size ? "?" + params.toString() : ""}`);
    });
  }

  const filtered = useMemo(() => {
    let list = freelancers;
    if (q) {
      const lq = q.toLowerCase();
      list = list.filter(
        (f) =>
          f.displayName.toLowerCase().includes(lq) ||
          f.headline?.toLowerCase().includes(lq) ||
          f.skills.some((s) => s.toLowerCase().includes(lq)),
      );
    }
    if (verifiedOnly) {
      list = list.filter((f) => f.singpassVerified);
    }
    // If match mode, sort by score; otherwise keep order
    if (isMatchMode) {
      list = [...list].sort(
        (a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0),
      );
    }
    return list;
  }, [freelancers, q, verifiedOnly, isMatchMode]);

  const activeGig = myGigs.find((g) => g.id === activeGigId);

  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
      <header
        style={{
          marginBottom: 32,
        }}
      >
        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: "var(--color-ink-soft)",
            margin: "0 0 8px",
          }}
        >
          {isMatchMode
            ? `AI Match · ${activeGig?.title ?? "your gig"}`
            : `Browse · ${freelancers.length} freelancers`}
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.2rem, 3.5vw, 3.8rem)",
            margin: 0,
            lineHeight: 0.98,
            letterSpacing: "-0.035em",
          }}
        >
          {isMatchMode ? (
            <>
              AI-ranked talent for{" "}
              <span style={{ color: "var(--color-accent-ink)" }}>
                {activeGig?.title ?? "your gig"}
              </span>
            </>
          ) : (
            <>
              Find verified{" "}
              <span style={{ color: "var(--color-accent-ink)" }}>talent</span>.
            </>
          )}
        </h1>
      </header>

      {/* Controls bar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 28,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, skill…"
          style={{
            flex: "1 1 220px",
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid var(--color-line)",
            background: "var(--color-surface-raised)",
            fontSize: 13,
            color: "var(--color-ink)",
            outline: "none",
          }}
        />

        <button
          onClick={() => setVerifiedOnly((v) => !v)}
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            border: `1px solid ${verifiedOnly ? "var(--color-jade-ink)" : "var(--color-line)"}`,
            background: verifiedOnly ? "var(--color-jade-soft)" : "var(--color-surface-raised)",
            color: verifiedOnly ? "var(--color-jade-ink)" : "var(--color-ink-soft)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          Singpass verified only {verifiedOnly ? "✓" : ""}
        </button>

        {myGigs.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-ink-soft)",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              AI match for:
            </span>
            <select
              value={activeGigId ?? ""}
              onChange={(e) => navigate(e.target.value || null)}
              style={{
                padding: "9px 12px",
                borderRadius: 12,
                border: `1px solid ${isMatchMode ? "var(--color-accent-ink)" : "var(--color-line)"}`,
                background: isMatchMode
                  ? "var(--color-accent-soft)"
                  : "var(--color-surface-raised)",
                color: isMatchMode
                  ? "var(--color-accent-ink)"
                  : "var(--color-ink)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <option value="">— Select a gig —</option>
              {myGigs.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
            {isMatchMode && (
              <button
                onClick={() => navigate(null)}
                style={{
                  padding: "9px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--color-line)",
                  background: "transparent",
                  color: "var(--color-ink-soft)",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Clear ×
              </button>
            )}
          </div>
        )}

        {isPending && (
          <span
            style={{
              fontSize: 12,
              color: "var(--color-ink-soft)",
              fontStyle: "italic",
            }}
          >
            Matching…
          </span>
        )}
      </div>

      {/* Match mode banner */}
      {isMatchMode && (
        <div
          style={{
            padding: "14px 20px",
            borderRadius: 14,
            background: "var(--color-accent-soft)",
            color: "var(--color-accent-ink)",
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 16 }}>✦</span>
          <span>
            Freelancers ranked by AI embedding similarity to{" "}
            <b>{activeGig?.title}</b>. Scores above 80 indicate strong fit.
          </span>
        </div>
      )}

      {/* Results count */}
      <p
        style={{
          margin: "0 0 18px",
          fontSize: 13,
          color: "var(--color-ink-soft)",
        }}
      >
        <b
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-ink)",
          }}
        >
          {filtered.length}
        </b>{" "}
        freelancer{filtered.length !== 1 ? "s" : ""}
        {verifiedOnly && " · Singpass verified"}
      </p>

      {filtered.length === 0 ? (
        <div
          style={{
            padding: 60,
            borderRadius: 20,
            border: "1px dashed var(--color-line)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              margin: 0,
            }}
          >
            No freelancers match those filters.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {filtered.map((f, i) => (
            <FreelancerCard
              key={f.id}
              f={f}
              rank={isMatchMode ? i + 1 : undefined}
            />
          ))}
        </div>
      )}
    </main>
  );
}
