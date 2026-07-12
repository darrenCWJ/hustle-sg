"use client";

import Link from "next/link";
import { PTR_THRESHOLD } from "./deck-utils";

export type DeckToast = "accepted" | "skipped" | "sign-in";

interface Props {
  isPulling: boolean;
  refreshing: boolean;
  ptrDy: number;
  newGigBanner: boolean;
  toast: DeckToast | null;
}

// Floating chrome above the card stack: pull-to-refresh pill, "new gig"
// banner, and the accept/skip/sign-in toast. Purely presentational.
export function DeckOverlays({ isPulling, refreshing, ptrDy, newGigBanner, toast }: Props) {
  return (
    <>
      {/* Pull-to-refresh indicator */}
      {(isPulling || refreshing) && (
        <div
          style={{
            position: "absolute",
            top: -8,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            padding: "6px 16px",
            borderRadius: 999,
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-line)",
            color: "var(--color-ink-soft)",
            fontSize: 12,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {refreshing ? (
            <>
              <span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span>
              Refreshing…
            </>
          ) : ptrDy >= PTR_THRESHOLD ? (
            "Release to refresh"
          ) : (
            "Pull to refresh"
          )}
        </div>
      )}

      {/* New gig banner */}
      {newGigBanner && (
        <div
          style={{
            position: "absolute",
            top: 6,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            padding: "7px 18px",
            borderRadius: 999,
            background: "#16a34a",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            animation: "slideDown 0.3s ease",
            whiteSpace: "nowrap",
          }}
        >
          ⚡ New gig just posted!
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            padding: "8px 20px",
            borderRadius: 999,
            background:
              toast === "accepted"
                ? "#16a34a"
                : toast === "sign-in"
                  ? "#2563eb"
                  : "var(--color-ink)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.04em",
            pointerEvents: toast === "sign-in" ? "auto" : "none",
            animation: `fadeInOut ${toast === "sign-in" ? "2.2s" : "1.6s"} ease forwards`,
            whiteSpace: "nowrap",
          }}
        >
          {toast === "accepted" ? (
            "✓ Accepted!"
          ) : toast === "sign-in" ? (
            <Link
              href="/m/singpass?next=/m/feed"
              style={{ color: "#fff", textDecoration: "underline" }}
            >
              Sign in to accept gigs →
            </Link>
          ) : (
            "Skipped"
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeInOut {
          0% { opacity:0; transform:translateX(-50%) translateY(-6px); }
          15% { opacity:1; transform:translateX(-50%) translateY(0); }
          75% { opacity:1; }
          100% { opacity:0; }
        }
        @keyframes slideDown {
          from { opacity:0; transform:translateX(-50%) translateY(-10px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </>
  );
}
