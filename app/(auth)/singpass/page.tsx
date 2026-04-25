"use client";

import { useState } from "react";
import Link from "next/link";
import { NRICForm } from "@/components/singpass/NRICForm";

const SP_RED = "#f4333d";

function DiamondPattern() {
  return (
    <svg
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07, pointerEvents: "none" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="diamonds" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <polygon points="14,2 26,14 14,26 2,14" fill="none" stroke={SP_RED} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#diamonds)" />
    </svg>
  );
}

function ScamBanner({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div style={{ background: "#fff3cd", borderBottom: "1px solid #e0c068" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "8px 20px" }}>
        <button
          onClick={onToggle}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#7a5c00" }}>⚠ Beware of phishing sites</span>
          <span style={{ fontSize: 12, color: "#7a5c00", marginLeft: "auto" }}>{open ? "▲" : "▼"}</span>
        </button>
        {open && (
          <p style={{ fontSize: 12, color: "#7a5c00", margin: "6px 0 4px", lineHeight: 1.5 }}>
            The official Singpass website is <b>singpass.gov.sg</b>. Do not enter your login credentials on any other site.
            This is a demo application. Do not use your real Singpass credentials here.
          </p>
        )}
      </div>
    </div>
  );
}

export default function SingpassPage({}: { searchParams?: Promise<{ next?: string }> }) {
  const [tab, setTab] = useState<"app" | "password">("app");
  const [scamOpen, setScamOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f5f5f5" }}>
      {/* Gov.sg masthead */}
      <div style={{ background: "#f0f0f0", borderBottom: "1px solid #ddd" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "6px 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="20" height="13" viewBox="0 0 20 13" aria-hidden>
            <rect width="20" height="4.3" fill="#EF3340" />
            <rect y="4.3" width="20" height="4.3" fill="#fff" />
            <rect y="8.6" width="20" height="4.4" fill="#EF3340" />
          </svg>
          <span style={{ fontSize: 12, color: "#555" }}>A Singapore Government Agency Website</span>
          <span style={{ fontSize: 11, color: "#1a5dc0", textDecoration: "underline", cursor: "pointer", marginLeft: 4 }}>
            How to identify ▾
          </span>
        </div>
      </div>

      {/* Scam banner */}
      <ScamBanner open={scamOpen} onToggle={() => setScamOpen((v) => !v)} />

      {/* Singpass brand header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e5e5" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: SP_RED,
                  display: "grid", placeItems: "center",
                  color: "#fff", fontWeight: 900, fontSize: 16, letterSpacing: "-0.05em",
                }}
              >
                sp
              </div>
              <span style={{ fontWeight: 700, fontSize: 18, color: "#333", letterSpacing: "-0.02em" }}>Singpass</span>
            </div>
          </div>
          <Link href="/" style={{ fontSize: 13, color: "#555", textDecoration: "none" }}>
            ← Back to HustleSG
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", maxWidth: 960, margin: "0 auto", width: "100%", padding: "48px 20px", gap: 48, alignItems: "start" }}>

        {/* Left hero */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              borderRadius: 20,
              background: SP_RED,
              padding: "40px 36px 36px",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              minHeight: 420,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <DiamondPattern />
            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Mascot placeholder */}
              <div
                style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  display: "grid", placeItems: "center",
                  fontSize: 36, marginBottom: 24,
                }}
                aria-hidden
              >
                🦁
              </div>
              <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.05, margin: "0 0 16px", letterSpacing: "-0.03em" }}>
                Your trusted<br />digital identity.
              </h1>
              <p style={{ fontSize: 14.5, opacity: 0.9, lineHeight: 1.6, margin: 0, maxWidth: 300 }}>
                Log in to HustleSG with Singpass to verify your identity and unlock trusted gig opportunities.
              </p>
            </div>
            <div
              style={{
                position: "relative", zIndex: 1,
                marginTop: 32,
                padding: "14px 18px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              <p style={{ fontSize: 12, opacity: 0.85, margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                HustleSG · Verified access
              </p>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0, lineHeight: 1.45 }}>
                Only your identity hash is stored — no NRIC, no face scan data.
              </p>
            </div>
          </div>
        </div>

        {/* Right card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            border: "1px solid #e5e5e5",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "28px 28px 0" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#222", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
              Log in with Singpass
            </h2>
            <p style={{ fontSize: 13, color: "#777", margin: "0 0 24px" }}>
              Use your Singpass App or NRIC &amp; Password.
            </p>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "2px solid #eee", marginBottom: 24 }}>
              {(["app", "password"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    fontSize: 13,
                    fontWeight: 600,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    borderBottom: tab === t ? `2px solid ${SP_RED}` : "2px solid transparent",
                    color: tab === t ? SP_RED : "#888",
                    marginBottom: -2,
                    transition: "color 0.15s, border-color 0.15s",
                  }}
                >
                  {t === "app" ? "Singpass App" : "Password login"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: "0 28px 28px" }}>
            {tab === "app" ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ fontSize: 13, color: "#555", marginBottom: 20, lineHeight: 1.5 }}>
                  Scan the QR code with your Singpass app to log in.
                </p>
                {/* Mock QR */}
                <div
                  style={{
                    width: 160, height: 160, margin: "0 auto 20px",
                    border: "2px solid #ddd",
                    borderRadius: 12,
                    display: "grid", placeItems: "center",
                    background: "#fafafa",
                    color: "#bbb",
                    fontSize: 12,
                    gap: 0,
                  }}
                >
                  <svg width="100" height="100" viewBox="0 0 100 100" aria-label="Mock QR code">
                    {/* QR finder patterns */}
                    {[[5, 5], [70, 5], [5, 70]].map(([x, y], i) => (
                      <g key={i}>
                        <rect x={x} y={y} width="25" height="25" fill="#222" rx="3" />
                        <rect x={x + 3} y={y + 3} width="19" height="19" fill="#fff" rx="2" />
                        <rect x={x + 6} y={y + 6} width="13" height="13" fill="#222" rx="1" />
                      </g>
                    ))}
                    {/* Random dot fill */}
                    {Array.from({ length: 32 }, (_, i) => {
                      const px = 36 + (i % 8) * 8;
                      const py = 5 + Math.floor(i / 8) * 8;
                      return i % 3 !== 0 ? <rect key={`d${i}`} x={px} y={py} width="5" height="5" fill="#222" /> : null;
                    })}
                    {Array.from({ length: 20 }, (_, i) => {
                      const px = 36 + (i % 5) * 10;
                      const py = 42 + Math.floor(i / 5) * 10;
                      return i % 2 === 0 ? <rect key={`e${i}`} x={px} y={py} width="5" height="5" fill="#222" /> : null;
                    })}
                  </svg>
                </div>
                <p style={{ fontSize: 12, color: "#888" }}>
                  QR refreshes every 3 minutes
                </p>
                <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #eee" }}>
                  <button
                    onClick={() => setTab("password")}
                    style={{ fontSize: 13, color: SP_RED, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                  >
                    Use password instead →
                  </button>
                </div>
              </div>
            ) : (
              <NRICForm />
            )}
          </div>

          {/* Demo helper */}
          <div
            style={{
              padding: "14px 28px",
              background: "#f9f9f9",
              borderTop: "1px solid #eee",
              fontSize: 12,
              color: "#888",
            }}
          >
            <b style={{ color: "#555" }}>Demo:</b> Use{" "}
            <code style={{ background: "#eee", padding: "1px 5px", borderRadius: 4 }}>S1234567D</code>,{" "}
            <code style={{ background: "#eee", padding: "1px 5px", borderRadius: 4 }}>S2345678H</code>, or{" "}
            <code style={{ background: "#eee", padding: "1px 5px", borderRadius: 4 }}>T0123456G</code>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          background: "#1a1a1a",
          color: "rgba(255,255,255,0.5)",
          padding: "20px",
          textAlign: "center",
          fontSize: 11,
        }}
      >
        <p style={{ margin: 0 }}>
          © 2024 Government Technology Agency of Singapore · This is a demo application · Not the real Singpass
        </p>
      </footer>
    </div>
  );
}
