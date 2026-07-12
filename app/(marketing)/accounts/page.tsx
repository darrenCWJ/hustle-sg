import { notFound } from "next/navigation";
import { hashNric, mockEmailForHash, mockPasswordForHash } from "@/lib/singpass/nric";
import { FREELANCERS, EMPLOYERS } from "@/lib/db/fixtures";
import { DEMO_MODE } from "@/lib/config/demo";
import { Eyebrow } from "@/components/ui/primitives";
import { Button } from "@/components/ui/interactive";

interface AccountRow {
  nric: string;
  name: string;
  handle: string;
  role: "freelancer" | "employer" | "both";
  headline: string;
  email: string;
  password: string;
  isPrimary?: boolean;
  primaryNote?: string;
}

async function buildRow(
  nric: string,
  name: string,
  handle: string,
  role: "freelancer" | "employer" | "both",
  headline: string,
  isPrimary?: boolean,
  primaryNote?: string,
): Promise<AccountRow> {
  const hash = await hashNric(nric);
  return {
    nric,
    name,
    handle,
    role,
    headline,
    email: mockEmailForHash(hash),
    password: mockPasswordForHash(hash),
    isPrimary,
    primaryNote,
  };
}

const ROLE_COLOR: Record<string, string> = {
  freelancer: "var(--color-accent)",
  employer: "var(--color-trust)",
  both: "var(--color-jade)",
};

function RolePill({ role }: { role: string }) {
  return (
    <span style={{
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.08em",
      padding: "3px 8px",
      borderRadius: 100,
      background: `color-mix(in oklch, ${ROLE_COLOR[role] ?? "var(--color-accent)"} 14%, transparent)`,
      color: ROLE_COLOR[role] ?? "var(--color-accent)",
      textTransform: "uppercase",
    }}>
      {role}
    </span>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      background: "var(--color-surface-sunken)",
      padding: "2px 6px",
      borderRadius: 5,
      letterSpacing: "0.02em",
      userSelect: "all",
    }}>
      {children}
    </span>
  );
}

function PrimaryCard({ account }: { account: AccountRow }) {
  return (
    <div style={{
      borderRadius: 20,
      border: "1px solid var(--color-line)",
      background: "var(--color-surface-raised)",
      padding: 28,
      display: "flex",
      flexDirection: "column",
      gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <RolePill role={account.role} />
            {account.primaryNote && (
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--color-ink-mute)",
                letterSpacing: "0.05em",
              }}>
                {account.primaryNote}
              </span>
            )}
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 2px", letterSpacing: "-0.02em" }}>
            {account.name}
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-mute)", margin: 0 }}>
            @{account.handle}
          </p>
        </div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: 28,
          letterSpacing: "-0.04em",
          color: "var(--color-ink-faint)",
          lineHeight: 1,
        }}>
          {account.nric}
        </div>
      </div>

      <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.5 }}>
        {account.headline}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 4, borderTop: "1px solid var(--color-line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "var(--color-ink-mute)", width: 60, flexShrink: 0 }}>NRIC</span>
          <Mono>{account.nric}</Mono>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "var(--color-ink-mute)", width: 60, flexShrink: 0 }}>Email</span>
          <Mono>{account.email}</Mono>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "var(--color-ink-mute)", width: 60, flexShrink: 0 }}>Password</span>
          <Mono>{account.password}</Mono>
        </div>
      </div>
    </div>
  );
}

function SeededRow({ account }: { account: AccountRow }) {
  return (
    <tr style={{ borderBottom: "1px solid var(--color-line)" }}>
      <td style={{ padding: "12px 14px" }}>
        <RolePill role={account.role} />
      </td>
      <td style={{ padding: "12px 14px" }}>
        <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>{account.name}</p>
        <p style={{ margin: 0, fontSize: 11, color: "var(--color-ink-mute)", fontFamily: "var(--font-mono)" }}>
          @{account.handle}
        </p>
      </td>
      <td style={{ padding: "12px 14px" }}>
        <Mono>{account.nric}</Mono>
      </td>
      <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--color-ink-soft)", maxWidth: 260 }}>
        {account.headline}
      </td>
      <td style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Mono>{account.email}</Mono>
          <Mono>{account.password}</Mono>
        </div>
      </td>
    </tr>
  );
}

export default async function AccountsPage() {
  // This page lists derived login credentials for every seeded identity. It is a
  // demo convenience and a credential dump — never serve it outside the demo.
  if (!DEMO_MODE) notFound();

  const W = { maxWidth: 1320, margin: "0 auto", padding: "0 28px" };

  // Primary demo accounts — have mock MyInfo pre-fill on first login
  const primaryAccounts = await Promise.all([
    buildRow("S1234567D", "Arif Rahman", "arif_rahman", "freelancer",
      "UX designer · WSQ-certified · fintech side projects", true, "mock MyInfo"),
    buildRow("S2345678H", "Priya Krishnan", "priya_sg", "freelancer",
      "Tuition teacher · A-level Maths & Physics · WSQ ACTA", true, "mock MyInfo"),
    buildRow("S3456789A", "Wei Jie Tan", "weijie", "freelancer",
      "Full-stack dev · NUS grad · open to contract", true, "mock MyInfo"),
    buildRow("T0123456G", "Siti Nurhaliza", "siti_mc", "freelancer",
      "Emcee · Event host · Trilingual (EN/Malay/BM)", true, "mock MyInfo"),
  ]);

  // Seeded freelancers — already have full profiles in DB
  const seededFreelancers = await Promise.all(
    FREELANCERS.map((f) =>
      buildRow(f.nric, f.display_name, f.handle, f.role, f.headline)
    )
  );

  // Seeded employers — already have full profiles in DB
  const seededEmployers = await Promise.all(
    EMPLOYERS.map((e) =>
      buildRow(e.nric, e.display_name, e.handle, e.role, e.headline)
    )
  );

  return (
    <main>
      {/* ── Hero ── */}
      <section style={{
        borderBottom: "1px solid var(--color-line)",
        background: "var(--color-surface-raised)",
        padding: "64px 28px 72px",
      }}>
        <div style={W}>
          <Eyebrow tone="accent">Hackathon demo · All test credentials</Eyebrow>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.8rem, 6vw, 6rem)",
            margin: "16px 0 18px",
            letterSpacing: "-0.04em",
            lineHeight: 0.92,
          }}>
            Test accounts.<br />
            <span style={{ color: "var(--color-accent-ink)", fontStyle: "italic" }}>
              Every credential.
            </span>
          </h1>
          <p style={{ fontSize: 16, color: "var(--color-ink-soft)", maxWidth: 560, lineHeight: 1.55, margin: "0 0 32px" }}>
            All accounts use mock Singpass — enter the NRIC at{" "}
            <a href="/singpass" style={{ color: "var(--color-accent-ink)" }}>/singpass</a>
            {" "}and click through the face-scan. No real credentials needed.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Button variant="primary" href="/singpass">Go to Singpass login</Button>
            <Button variant="ghost" href="/quick-demo">Quick Demo (no login)</Button>
          </div>
        </div>
      </section>

      {/* ── Quick nav links ── */}
      <section style={{ borderBottom: "1px solid var(--color-line)", background: "var(--color-surface-sunken)", padding: "0 28px" }}>
        <div style={{ ...W, display: "flex", gap: 0 }}>
          {[
            { label: "Vector Map", href: "/vector-map", desc: "3D skill-space globe" },
            { label: "AI Matching Demo", href: "/demo", desc: "Cosine similarity live" },
            { label: "Cert Parser Demo", href: "/demo#cert", desc: "Claude Haiku extraction" },
            { label: "Singpass Login", href: "/singpass", desc: "Mock NRIC sign-in" },
            { label: "Browse Gigs", href: "/gigs", desc: "Live gig feed" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                padding: "16px 20px",
                borderRight: "1px solid var(--color-line)",
                textDecoration: "none",
                color: "inherit",
                transition: "background 0.15s",
              }}
              className="card-hover"
            >
              <span style={{ fontSize: 13, fontWeight: 600 }}>{link.label}</span>
              <span style={{ fontSize: 11, color: "var(--color-ink-mute)", fontFamily: "var(--font-mono)" }}>
                {link.desc}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ── How to log in ── */}
      <section style={{ ...W, padding: "72px 28px 0" }}>
        <Eyebrow tone="accent">How it works</Eyebrow>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.8rem, 2.5vw, 2.6rem)",
          margin: "12px 0 32px",
          letterSpacing: "-0.03em",
        }}>
          Logging in with mock Singpass
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { step: "01", title: "Go to /singpass", body: "Open the Singpass login page from any \"Log in\" button." },
            { step: "02", title: "Enter the NRIC", body: "Copy any NRIC from this page into the NRIC field. All are pre-validated." },
            { step: "03", title: "Click through face scan", body: "The biometric scan is mocked — just tap \"Complete Scan\"." },
            { step: "04", title: "You're in", body: "First-time NRICs with mock MyInfo get an onboarding wizard. Seeded accounts have full profiles." },
          ].map((s) => (
            <div key={s.step} style={{
              borderRadius: 16,
              border: "1px solid var(--color-line)",
              background: "var(--color-surface-raised)",
              padding: "22px 24px",
            }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--color-accent)",
                letterSpacing: "0.1em",
                display: "block",
                marginBottom: 8,
              }}>
                Step {s.step}
              </span>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 18, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                {s.title}
              </p>
              <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.5 }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Primary demo accounts ── */}
      <section style={{ ...W, padding: "80px 28px 0" }}>
        <Eyebrow tone="accent">Primary demo accounts · mock MyInfo pre-fill</Eyebrow>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.8rem, 2.5vw, 2.6rem)",
          margin: "12px 0 8px",
          letterSpacing: "-0.03em",
        }}>
          Best for onboarding demos
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: "0 0 32px", maxWidth: 520 }}>
          These 4 NRICs have mock MyInfo payloads — onboarding fields are pre-filled with realistic SG profiles so you don&apos;t have to type anything.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {primaryAccounts.map((account) => (
            <PrimaryCard key={account.nric} account={account} />
          ))}
        </div>
      </section>

      {/* ── Seeded accounts ── */}
      <section style={{ ...W, padding: "80px 28px 0" }}>
        <Eyebrow tone="accent">Seeded accounts · full profiles already in DB</Eyebrow>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.8rem, 2.5vw, 2.6rem)",
          margin: "12px 0 8px",
          letterSpacing: "-0.03em",
        }}>
          Ready-to-use profiles
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-ink-soft)", margin: "0 0 28px", maxWidth: 520 }}>
          17 accounts with complete profiles, certifications, and portfolio items seeded into the database. Log in and you land straight on the dashboard.
        </p>

        {/* Freelancers */}
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-mute)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>
          Freelancers ({seededFreelancers.length})
        </p>
        <div style={{ borderRadius: 16, border: "1px solid var(--color-line)", overflow: "hidden", marginBottom: 40 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--color-surface-sunken)", borderBottom: "1px solid var(--color-line)" }}>
                {["Role", "Name / Handle", "NRIC", "Headline", "Email · Password"].map((h) => (
                  <th key={h} style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--color-ink-mute)",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seededFreelancers.map((account) => (
                <SeededRow key={account.nric} account={account} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Employers */}
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-mute)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>
          Employers ({seededEmployers.length})
        </p>
        <div style={{ borderRadius: 16, border: "1px solid var(--color-line)", overflow: "hidden", marginBottom: 40 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--color-surface-sunken)", borderBottom: "1px solid var(--color-line)" }}>
                {["Role", "Name / Handle", "NRIC", "Headline", "Email · Password"].map((h) => (
                  <th key={h} style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--color-ink-mute)",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seededEmployers.map((account) => (
                <SeededRow key={account.nric} account={account} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Feature links ── */}
      <section style={{ ...W, padding: "80px 28px 100px" }}>
        <Eyebrow tone="accent">Pages to explore</Eyebrow>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.8rem, 2.5vw, 2.6rem)",
          margin: "12px 0 28px",
          letterSpacing: "-0.03em",
        }}>
          Key pages & features
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {[
            {
              label: "Vector Map",
              href: "/vector-map",
              hue: 250,
              desc: "Live 3D globe — PCA-projected skill embeddings from every profile and gig. Watch clusters form by domain.",
              badge: "OpenAI · PCA · Three.js",
            },
            {
              label: "AI Matching + Cert Parser",
              href: "/demo",
              hue: 30,
              desc: "Cosine similarity matching demo and Claude Haiku cert extraction — no login needed.",
              badge: "Claude Haiku · Embeddings",
            },
            {
              label: "Gig Feed",
              href: "/gigs",
              hue: 165,
              desc: "Browse open gigs filtered by category, location, and budget. AI-ranked after login.",
              badge: "Live DB",
            },
            {
              label: "Certifications (after login)",
              href: "/singpass",
              hue: 80,
              desc: "Log in and go to Profile → Edit to add/view WSQ, university, and accreditation certs. Claude Haiku extracts skills from certificate text.",
              badge: "Login required",
            },
            {
              label: "Async Interview (after login)",
              href: "/singpass",
              hue: 340,
              desc: "Employers post questions, freelancers record 90-second video answers in their own time.",
              badge: "Login required",
            },
            {
              label: "Employer Dashboard",
              href: "/singpass",
              hue: 200,
              desc: "Log in with any employer NRIC to post gigs, review applicants, and send rehire/direct offers.",
              badge: "Login required",
            },
          ].map((card) => (
            <a
              key={card.href + card.label}
              href={card.href}
              style={{
                display: "block",
                borderRadius: 18,
                border: "1px solid var(--color-line)",
                background: "var(--color-surface-raised)",
                padding: "24px 26px",
                textDecoration: "none",
                color: "inherit",
              }}
              className="card-hover"
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: `oklch(90% 0.06 ${card.hue})`,
                  display: "grid", placeItems: "center",
                  fontSize: 16,
                }}>
                  →
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em", color: `oklch(40% 0.09 ${card.hue})`, textTransform: "uppercase" }}>
                  {card.badge}
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                {card.label}
              </p>
              <p style={{ fontSize: 13, color: "var(--color-ink-soft)", margin: 0, lineHeight: 1.5 }}>
                {card.desc}
              </p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
