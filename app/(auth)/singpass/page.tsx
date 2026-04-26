"use client";

import { useState } from "react";
import Link from "next/link";
import { NRICForm } from "@/components/singpass/NRICForm";

const SP_RED = "#c0392b";

function DiamondBg() {
  return (
    <svg
      aria-hidden
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", opacity: 0.045, pointerEvents: "none", zIndex: 0 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="diamonds" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <polygon points="20,3 37,20 20,37 3,20" fill="none" stroke="#888" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#diamonds)" />
    </svg>
  );
}

function SingpassLogo() {
  return (
    <svg width="120" height="28" viewBox="0 0 120 28" fill="none" aria-label="Singpass">
      {/* The 's' dot is actually an 'i' dot styled specially – approximate with wordmark text */}
      <text x="0" y="22" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700" fill={SP_RED} letterSpacing="-0.5">
        singpass
      </text>
      {/* Red dot over the 'i' */}
      <circle cx="34" cy="4" r="3" fill={SP_RED} />
    </svg>
  );
}

function MascotSvg() {
  return (
    <svg width="80" height="90" viewBox="0 0 80 90" fill="none" aria-hidden>
      {/* Head */}
      <circle cx="40" cy="22" r="16" fill={SP_RED} />
      {/* Hat brim */}
      <rect x="22" y="18" width="36" height="5" rx="2" fill="#8b0000" />
      {/* Hat top */}
      <rect x="29" y="6" width="22" height="14" rx="3" fill="#8b0000" />
      {/* Face */}
      <circle cx="34" cy="24" r="2.5" fill="white" />
      <circle cx="46" cy="24" r="2.5" fill="white" />
      <path d="M34 30 Q40 34 46 30" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Body */}
      <rect x="24" y="40" width="32" height="34" rx="6" fill={SP_RED} />
      {/* Left arm */}
      <rect x="10" y="42" width="14" height="8" rx="4" fill={SP_RED} />
      {/* Right arm */}
      <rect x="56" y="42" width="14" height="8" rx="4" fill={SP_RED} />
      {/* Collar/shirt detail */}
      <path d="M30 40 L40 52 L50 40" stroke="white" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function QRFrame() {
  const size = 180;
  const corner = 22;
  const thick = 5;

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      {/* Corner L-shapes in red */}
      {[
        { top: 0, left: 0, borderTop: thick, borderLeft: thick, borderRight: 0, borderBottom: 0 },
        { top: 0, right: 0, borderTop: thick, borderRight: thick, borderLeft: 0, borderBottom: 0 },
        { bottom: 0, left: 0, borderBottom: thick, borderLeft: thick, borderTop: 0, borderRight: 0 },
        { bottom: 0, right: 0, borderBottom: thick, borderRight: thick, borderTop: 0, borderLeft: 0 },
      ].map((pos, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            width: corner,
            height: corner,
            borderStyle: "solid",
            borderColor: SP_RED,
            ...pos,
          }}
        />
      ))}

      {/* Mock QR content */}
      <div style={{ position: "absolute", inset: 10 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" aria-label="QR code — demo only">
          {/* Three finder patterns */}
          {([[5, 5], [65, 5], [5, 65]] as [number, number][]).map(([x, y], i) => (
            <g key={i}>
              <rect x={x} y={y} width="26" height="26" fill="#111" rx="3" />
              <rect x={x + 3} y={y + 3} width="20" height="20" fill="white" rx="2" />
              <rect x={x + 7} y={y + 7} width="12" height="12" fill="#111" rx="1" />
            </g>
          ))}
          {/* Timing patterns */}
          {Array.from({ length: 8 }, (_, i) => (
            i % 2 === 0
              ? <rect key={`tx${i}`} x={35 + i * 4} y={5} width="3" height="3" fill="#111" />
              : null
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            i % 2 === 0
              ? <rect key={`ty${i}`} x={5} y={35 + i * 4} width="3" height="3" fill="#111" />
              : null
          ))}
          {/* Data modules */}
          {Array.from({ length: 60 }, (_, i) => {
            const col = i % 10;
            const row = Math.floor(i / 10);
            const x = 35 + col * 7;
            const y = 35 + row * 7;
            return (i * 17 + row * 7) % 3 !== 0
              ? <rect key={`m${i}`} x={x} y={y} width="5" height="5" fill="#111" />
              : null;
          })}
          {/* Small info icon in center */}
          <circle cx="50" cy="50" r="9" fill={SP_RED} />
          <text x="50" y="54.5" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="serif">i</text>
        </svg>
      </div>

      {/* Singpass wordmark below QR inside frame */}
      <div style={{
        position: "absolute", bottom: -28, left: 0, right: 0,
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        fontWeight: 700,
        fontSize: 15,
        color: SP_RED,
        letterSpacing: "-0.3px",
      }}>
        s<span style={{ position: "relative" }}>i<span style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: SP_RED, display: "inline-block" }} /></span>ngpass
      </div>
    </div>
  );
}

export default function SingpassPage() {
  const [tab, setTab] = useState<"app" | "password">("app");
  const [scamOpen, setScamOpen] = useState(true);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f5f5f5", position: "relative" }}>
      <DiamondBg />

      {/* Gov.sg masthead */}
      <div style={{ position: "relative", zIndex: 10, background: "#f0f0f0", borderBottom: "1px solid #ddd" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "6px 24px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15 }}>🇸🇬</span>
          <span style={{ fontSize: 12, color: "#555" }}>A Singapore Government Agency Website</span>
          <span style={{ fontSize: 11, color: "#1a5dc0", textDecoration: "underline", cursor: "pointer", marginLeft: 4 }}>
            How to identify ▾
          </span>
        </div>
      </div>

      {/* Scam alert */}
      <div style={{ position: "relative", zIndex: 10, background: "#fff", borderBottom: "1px solid #e8e8e8" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 24px" }}>
          <button
            onClick={() => setScamOpen((v) => !v)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", padding: 0 }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#111" }}>Beware of impersonation scams</span>
            <span style={{ fontSize: 13, color: "#555", marginLeft: 4 }}>{scamOpen ? "▲" : "▼"}</span>
          </button>
          {scamOpen && (
            <p style={{ fontSize: 13, color: "#333", margin: "6px 0 0", lineHeight: 1.55, maxWidth: 760 }}>
              Government officials will NEVER ask you to transfer money or disclose bank log-in details over a phone call.
              Call the 24/7 ScamShield Helpline at <b>1799</b> if you are unsure if something is a scam.
            </p>
          )}
        </div>
      </div>

      {/* Singpass brand header */}
      <div style={{ position: "relative", zIndex: 10, background: "#fff", borderBottom: "1px solid #e5e5e5" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <SingpassLogo />
          <Link href="/" style={{ fontSize: 12.5, color: "#666", textDecoration: "none" }}>
            ← Back to HustleSG
          </Link>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, position: "relative", zIndex: 10 }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "64px 24px 80px",
          display: "grid",
          gridTemplateColumns: "1fr 420px",
          gap: 80,
          alignItems: "center",
        }}>
          {/* Left — plain text + mascot */}
          <div>
            <MascotSvg />
            <h1 style={{
              fontSize: 34,
              fontWeight: 800,
              color: "#111",
              margin: "20px 0 8px",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}>
              Log in with Singpass
            </h1>
            <p style={{ fontSize: 16, color: "#555", margin: 0 }}>
              Your trusted digital identity
            </p>
          </div>

          {/* Right — login card */}
          <div style={{
            background: "#fff",
            borderRadius: 8,
            border: "1px solid #ddd",
            boxShadow: "0 2px 16px rgba(0,0,0,0.09)",
            overflow: "hidden",
          }}>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #eee" }}>
              {(["app", "password"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1,
                    padding: "14px 0",
                    fontSize: 13.5,
                    fontWeight: 600,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    borderBottom: tab === t ? `2.5px solid ${SP_RED}` : "2.5px solid transparent",
                    color: tab === t ? SP_RED : "#888",
                    marginBottom: -1,
                    transition: "color 0.15s, border-color 0.15s",
                  }}
                >
                  {t === "app" ? "Singpass app" : "Password login"}
                </button>
              ))}
            </div>

            <div style={{ padding: "32px 32px 28px" }}>
              {tab === "app" ? (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: "0 0 4px" }}>
                    Scan with Singpass app
                  </p>
                  <p style={{ fontSize: 14, color: "#111", margin: "0 0 28px" }}>
                    to log in
                  </p>

                  <QRFrame />

                  <div style={{ marginTop: 52, paddingTop: 20, borderTop: "1px solid #eee" }}>
                    <a
                      href="#"
                      style={{ display: "block", fontSize: 13.5, color: "#1a5dc0", textDecoration: "underline", marginBottom: 12 }}
                    >
                      Register for Singpass
                    </a>
                    <a
                      href="#"
                      style={{ display: "block", fontSize: 13.5, color: "#1a5dc0", textDecoration: "underline" }}
                    >
                      Download Singpass app
                    </a>
                  </div>
                </div>
              ) : (
                <NRICForm />
              )}
            </div>

            {/* Demo hint */}
            <div style={{ padding: "12px 24px", background: "#fafafa", borderTop: "1px solid #eee", fontSize: 12, color: "#888" }}>
              <b style={{ color: "#555" }}>Demo:</b>{" "}
              {["S1234567D", "S2345678H", "T0123456G"].map((n) => (
                <code key={n} style={{ background: "#eee", padding: "1px 5px", borderRadius: 4, marginRight: 6 }}>{n}</code>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 10, background: "#2d2d2d", color: "rgba(255,255,255,0.55)", padding: "20px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5 }}>
          <div style={{ display: "flex", gap: 20 }}>
            {["Contact us", "Share feedback", "Read FAQs"].map((l) => (
              <a key={l} href="#" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
          <span>© Government of Singapore · Demo application · Not the real Singpass</span>
        </div>
      </footer>
    </div>
  );
}
