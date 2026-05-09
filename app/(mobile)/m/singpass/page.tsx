import Link from "next/link";
import { NRICForm } from "@/components/singpass/NRICForm";

const SP_RED = "#c0392b";

export default async function MobileSingpassPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = "/m/feed" } = await searchParams;
  const backHref = next.startsWith("/m/") ? next : "/m/feed";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--color-surface)",
        color: "var(--color-ink)",
        overflowY: "auto",
      }}
    >
      {/* Gov.sg masthead */}
      <div
        style={{
          background: "var(--color-muted)",
          borderBottom: "1px solid var(--color-line)",
          padding: "6px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <svg width="16" height="11" viewBox="0 0 53 37" fill="none">
          <path d="M0 0h53v12H0z" fill="#EF0000" />
          <path d="M0 12h53v25H0z" fill="#fff" />
          <circle cx="13" cy="18" r="6" fill="#fff" />
          <circle cx="16" cy="18" r="6" fill="#EF0000" />
          <path d="M22 15l1.5 4.5L27 14l1.5 4.5L30 13" stroke="#fff" strokeWidth="1.5" fill="none" />
        </svg>
        <span
          style={{
            fontSize: 10,
            color: "var(--color-ink-soft)",
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          A <strong style={{ color: "var(--color-ink)" }}>Singapore Government</strong> Agency Website
        </span>
      </div>

      {/* Back nav */}
      <div
        style={{
          padding: "10px 16px",
          flexShrink: 0,
          borderBottom: "1px solid var(--color-line)",
        }}
      >
        <Link
          href={backHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--color-ink-soft)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>←</span>
          Back
        </Link>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "28px 20px 40px",
          gap: 0,
        }}
      >
        {/* Singpass brand header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 14px",
              borderRadius: 10,
              background: "rgba(192,57,43,0.07)",
              border: "1px solid rgba(192,57,43,0.18)",
              marginBottom: 20,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <rect width="24" height="24" rx="6" fill={SP_RED} />
              <path
                d="M7 12.5a5 5 0 0 1 5-5 5 5 0 0 1 5 5v.5H7v-.5Z"
                fill="white"
                opacity="0.9"
              />
              <rect x="8" y="13" width="8" height="5" rx="1.5" fill="white" opacity="0.9" />
            </svg>
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: SP_RED,
                letterSpacing: "-0.01em",
              }}
            >
              Singpass
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--color-ink)",
              margin: "0 0 8px",
              lineHeight: 1.1,
            }}
          >
            Sign in to Hustle
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-ink-soft)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Verified with Singpass to apply to gigs, track your work, and build
            your reputation.
          </p>
        </div>

        {/* NRIC Form */}
        <div
          style={{
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-line)",
            borderRadius: 18,
            padding: "20px 18px",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <NRICForm next={next} />
        </div>

        {/* Privacy note */}
        <p
          style={{
            fontSize: 11,
            color: "var(--color-ink-mute)",
            margin: "20px 0 0",
            lineHeight: 1.55,
            textAlign: "center",
          }}
        >
          By continuing, you agree to Hustle&apos;s Terms of Service and
          Privacy Policy. Singpass verification is for demo purposes only.
        </p>
      </div>
    </div>
  );
}
