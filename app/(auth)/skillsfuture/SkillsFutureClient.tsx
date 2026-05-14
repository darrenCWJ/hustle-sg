"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { importSkillsFutureCert } from "./actions";
import type { SFCert } from "@/lib/skillsfuture/catalog";

const SF_ORANGE = "#e8711a";
const SF_DARK = "#1a1a1a";
const SECTOR_COLORS: Record<string, string> = {
  "Infocomm Technology": "#2563eb",
  "Marketing": "#7c3aed",
  "Education & Training": "#059669",
  "Workplace Safety & Health": "#dc2626",
  "Food & Beverage": "#d97706",
  "Security": "#374151",
  "Retail": "#db2777",
  "Business Management": "#0891b2",
  "Personal Services": "#8b5cf6",
};

function SFLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
        <circle cx="18" cy="18" r="18" fill={SF_ORANGE} />
        <text x="18" y="23" textAnchor="middle" fill="white" fontSize="14" fontWeight="800" fontFamily="Arial, sans-serif">SF</text>
      </svg>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: SF_ORANGE, letterSpacing: "-0.02em", lineHeight: 1.1 }}>SkillsFuture</div>
        <div style={{ fontSize: 10, color: "#666", letterSpacing: "0.04em", lineHeight: 1 }}>MyCerts Portal — Demo</div>
      </div>
    </div>
  );
}

function CertCard({
  cert,
  alreadyImported,
}: {
  cert: SFCert;
  alreadyImported: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(alreadyImported);
  const [error, setError] = useState<string | null>(null);

  const sectorColor = SECTOR_COLORS[cert.sector] ?? "#6b7280";

  const handleImport = () => {
    setError(null);
    startTransition(async () => {
      const res = await importSkillsFutureCert(cert.id);
      if (res.ok) {
        setDone(true);
      } else {
        if (res.error === "Already imported") {
          setDone(true);
        } else {
          setError(res.error);
        }
      }
    });
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 8,
        padding: "20px 20px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        opacity: done ? 0.75 : 1,
      }}
    >
      {/* Sector badge */}
      <div>
        <span
          style={{
            display: "inline-block",
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "0.04em",
            padding: "2px 8px",
            borderRadius: 999,
            background: sectorColor + "18",
            color: sectorColor,
          }}
        >
          {cert.sector}
        </span>
      </div>

      {/* Title */}
      <p style={{ fontSize: 14.5, fontWeight: 700, color: SF_DARK, margin: 0, lineHeight: 1.35 }}>
        {cert.title}
      </p>

      {/* Issuer + kind */}
      <p style={{ fontSize: 12.5, color: "#666", margin: 0 }}>
        {cert.issuer} ·{" "}
        <span style={{ textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>{cert.kind}</span>
      </p>

      {/* Skills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
        {cert.skills.slice(0, 4).map((s) => (
          <span
            key={s}
            style={{
              fontSize: 11,
              background: "#f5f5f5",
              color: "#555",
              padding: "2px 7px",
              borderRadius: 999,
              border: "1px solid #e8e8e8",
            }}
          >
            {s}
          </span>
        ))}
        {cert.skills.length > 4 && (
          <span style={{ fontSize: 11, color: "#aaa", padding: "2px 0" }}>
            +{cert.skills.length - 4}
          </span>
        )}
      </div>

      {/* Action row */}
      <div style={{ marginTop: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11.5, color: "#999" }}>
          Issued {new Date(cert.issued_at).toLocaleDateString("en-SG", { month: "short", year: "numeric" })}
        </span>
        {done ? (
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "#059669",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <circle cx="7" cy="7" r="7" fill="#059669" />
              <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Imported
          </span>
        ) : (
          <button
            type="button"
            onClick={handleImport}
            disabled={isPending}
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              padding: "6px 14px",
              borderRadius: 5,
              border: "none",
              background: isPending ? "#f0f0f0" : SF_ORANGE,
              color: isPending ? "#999" : "#fff",
              cursor: isPending ? "default" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {isPending ? "Importing…" : "Import to HustleSG"}
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>{error}</p>}
    </div>
  );
}

interface Props {
  catalog: SFCert[];
  importedTitles: string[];
}

export function SkillsFutureClient({ catalog, importedTitles }: Props) {
  const [scamOpen, setScamOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All");

  const sectors = ["All", ...Array.from(new Set(catalog.map((c) => c.sector))).sort()];

  const filtered = catalog.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.issuer.toLowerCase().includes(search.toLowerCase()) ||
      c.sector.toLowerCase().includes(search.toLowerCase());
    const matchSector = sector === "All" || c.sector === sector;
    return matchSearch && matchSector;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", flexDirection: "column" }}>
      {/* Gov masthead */}
      <div style={{ background: "#f0f0f0", borderBottom: "1px solid #ddd" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "6px 24px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15 }}>🇸🇬</span>
          <span style={{ fontSize: 12, color: "#555" }}>A Singapore Government Agency Website</span>
        </div>
      </div>

      {/* Scam alert */}
      <div style={{ background: "#fff8f0", borderBottom: "1px solid #fde8d0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 24px" }}>
          <button
            onClick={() => setScamOpen((v) => !v)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0, width: "100%", textAlign: "left" }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 700, color: SF_DARK }}>Beware of SkillsFuture impersonation scams</span>
            <span style={{ fontSize: 13, color: "#888", marginLeft: 4 }}>{scamOpen ? "▲" : "▼"}</span>
          </button>
          {scamOpen && (
            <p style={{ fontSize: 13, color: "#555", margin: "6px 0 0", lineHeight: 1.55, maxWidth: 760 }}>
              SkillsFuture Singapore will never ask you for your credit card details to claim SkillsFuture Credits.
              Call our helpline at <b>6785 5785</b> if you suspect a scam.
            </p>
          )}
        </div>
      </div>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e5e5" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <SFLogo />
          <Link href="/profile/edit#certifications" style={{ fontSize: 12.5, color: "#666", textDecoration: "none" }}>
            ← Back to profile
          </Link>
        </div>
      </div>

      {/* Hero strip */}
      <div style={{ background: `linear-gradient(135deg, ${SF_ORANGE} 0%, #c0570e 100%)`, color: "#fff", padding: "36px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>My SkillsFuture Certificates</h1>
          <p style={{ margin: "8px 0 0", opacity: 0.85, fontSize: 14.5 }}>
            View and import your verified WSQ & accreditation certificates to your HustleSG profile.
          </p>
          <div style={{ marginTop: 20 }}>
            <input
              type="search"
              placeholder="Search certificates, issuers, sectors…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                maxWidth: 440,
                padding: "10px 16px",
                borderRadius: 6,
                border: "none",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: 1100, margin: "0 auto", padding: "32px 24px", width: "100%", boxSizing: "border-box" }}>
        {/* Sector filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {sectors.map((s) => (
            <button
              key={s}
              onClick={() => setSector(s)}
              style={{
                padding: "5px 14px",
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: sector === s ? 700 : 500,
                border: `1.5px solid ${sector === s ? SF_ORANGE : "#ddd"}`,
                background: sector === s ? SF_ORANGE : "#fff",
                color: sector === s ? "#fff" : "#555",
                cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Cert grid */}
        {filtered.length === 0 ? (
          <p style={{ color: "#999", fontSize: 14 }}>No certificates match your search.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {filtered.map((cert) => (
              <CertCard
                key={cert.id}
                cert={cert}
                alreadyImported={importedTitles.includes(cert.title)}
              />
            ))}
          </div>
        )}

        <p style={{ marginTop: 40, fontSize: 12, color: "#aaa", textAlign: "center" }}>
          Demo application · Certificates shown are fictional · Not the real SkillsFuture MyCerts portal
        </p>
      </div>

      {/* Footer */}
      <footer style={{ background: "#2d2d2d", color: "rgba(255,255,255,0.5)", padding: "20px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5 }}>
          <div style={{ display: "flex", gap: 20 }}>
            {["Contact us", "Privacy statement", "Terms of use"].map((l) => (
              <a key={l} href="#" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
          <span>© SkillsFuture Singapore · Demo only</span>
        </div>
      </footer>
    </div>
  );
}
