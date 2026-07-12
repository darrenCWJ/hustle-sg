"use client";

import { useEffect } from "react";

// Catches errors thrown in the root layout itself, where the normal error.tsx
// boundary cannot render. Must provide its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en-SG">
      <body
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#faf9f7",
          color: "#1a1a1a",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#6b6b6b", margin: "0 0 24px", lineHeight: 1.5 }}>
            The app hit an unexpected error. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              borderRadius: 100,
              background: "#1a1a1a",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
