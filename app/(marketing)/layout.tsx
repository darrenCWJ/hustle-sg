import { SiteNav } from "@/components/nav/SiteNav";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteNav />
      {children}
      <footer
        style={{
          marginTop: 100,
          padding: "60px 28px 40px",
          borderTop: "1px solid var(--color-line)",
          background: "var(--color-surface-raised)",
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 40,
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 30,
                letterSpacing: "-0.025em",
                lineHeight: 1,
              }}
            >
              HustleSG
            </div>
            <p
              style={{
                color: "var(--color-ink-soft)",
                marginTop: 16,
                maxWidth: 340,
                fontSize: 14,
              }}
            >
              Singapore&apos;s verified gig and side-income platform. Built on Singpass
              identity, WSQ credential checks, and AI-powered matching.
            </p>
            <p
              style={{
                marginTop: 22,
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-ink-mute)",
              }}
            >
              🇸🇬 A GovTech product · est. 2025
            </p>
          </div>

          {(
            [
              [
                "Platform",
                [
                  ["Browse assignments", "/gigs"],
                  ["Instant gigs", "/instant"],
                  ["Post an assignment", "/gigs/new"],
                  ["Dashboard", "/dashboard"],
                ],
              ],
              [
                "Verification",
                [
                  ["Singpass identity", "/singpass"],
                  ["WSQ credentials", "/skillsfuture"],
                  ["Video interviews", "/gigs"],
                  ["AI matching", "/gigs"],
                ],
              ],
              [
                "Entrepreneur",
                [
                  ["Start a business", "/start-a-business"],
                  ["Sole-prop vs Pte Ltd", "/start-a-business"],
                  ["CPF for self-employed", "/start-a-business"],
                  ["GST threshold", "/start-a-business"],
                ],
              ],
            ] as [string, [string, string][]][]
          ).map(([head, links]) => (
            <div key={head}>
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "var(--color-ink-soft)",
                  margin: 0,
                }}
              >
                {head}
              </p>
              <ul
                style={{
                  margin: "14px 0 0",
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {links.map(([label, href]) => (
                  <li key={label} style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>
                    <a href={href} className="hover:text-ink transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            maxWidth: 1320,
            margin: "48px auto 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 11.5,
            color: "var(--color-ink-mute)",
            letterSpacing: "0.05em",
          }}
        >
          <span>
            © {new Date().getFullYear()} Government Technology Agency of Singapore · A GovTech
            initiative · gov.sg
          </span>
          <span style={{ fontFamily: "var(--font-mono)" }}>
            AI-powered matching · pgvector 1536-d
          </span>
        </div>
      </footer>
    </>
  );
}
