import Link from "next/link";

export default function Landing() {
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line grain">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 lg:pt-28 lg:pb-36 relative">
          <p className="text-xs uppercase tracking-[0.25em] text-accent-ink/80 font-semibold">
            Side hustles · Singapore · Verified
          </p>
          <h1 className="font-display text-display-xl mt-6 leading-[0.92] tracking-[-0.025em] max-w-[14ch]">
            Your side hustle,{" "}
            <span className="italic text-accent-ink">actually</span> verified.
          </h1>
          <p className="mt-8 max-w-xl text-body-lg text-ink-soft">
            The Singapore-first marketplace for freelancers. Singpass identity,
            WSQ and university cert checks, portfolio videos, async video
            interviews — and when you&apos;re ready, we walk you through
            registering your own company.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/singpass"
              className="rounded-pill bg-ink text-surface px-6 py-3 font-semibold hover:bg-accent-ink transition"
            >
              Get verified with Singpass
            </Link>
            <Link
              href="/gigs"
              className="rounded-pill bg-surface-raised border border-line px-6 py-3 font-semibold hover:border-ink transition"
            >
              Browse open gigs
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs uppercase tracking-widest text-ink-soft">
            <TrustMark>Mock Singpass</TrustMark>
            <TrustMark>SkillsFuture-aware</TrustMark>
            <TrustMark>NUS · NTU · SMU · SIT</TrustMark>
            <TrustMark>ACRA guide included</TrustMark>
          </div>
        </div>

        {/* Editorial sidecaption */}
        <aside className="absolute right-6 top-20 hidden lg:flex flex-col items-end text-right max-w-[200px] text-xs text-ink-soft uppercase tracking-widest">
          <span className="text-accent-ink">Vol. 01</span>
          <span>For the 200,000+</span>
          <span>SG side-hustlers</span>
        </aside>
      </section>

      {/* BENTO FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between mb-10 gap-6">
          <h2 className="font-display text-display-md max-w-lg">
            Four pillars. One trusted platform.
          </h2>
          <p className="text-ink-soft max-w-sm text-sm">
            Fiverr and Upwork don&apos;t speak our local rules — CPF, WSQ, ACRA,
            IRAS tax brackets. We do.
          </p>
        </div>

        <div className="bento">
          {/* Singpass + AI matching */}
          <article className="cell-lg tall rounded-card bg-ink text-surface p-8 relative overflow-hidden grain">
            <p className="text-xs uppercase tracking-widest text-accent">01 · Verified identity</p>
            <h3 className="font-display text-display-md mt-4 leading-tight">
              Singpass-verified,<br />AI-matched.
            </h3>
            <p className="mt-4 text-surface/70 max-w-md">
              Log in with a Singpass-style flow. We embed your profile into a
              vector index, then surface gigs that match your certifications and
              portfolio — not just your keyword hits.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-3 text-xs">
              <Stat label="Identity" value="SHA-256 hashed" />
              <Stat label="Matching" value="Cosine · 1536d" />
              <Stat label="Latency" value="~120ms p95" />
              <Stat label="Index" value="pgvector / ivfflat" />
            </div>
          </article>

          {/* Portfolio videos */}
          <article className="cell-md rounded-card bg-accent text-ink p-8 relative overflow-hidden">
            <p className="text-xs uppercase tracking-widest opacity-70">02 · Portfolio video</p>
            <h3 className="font-display text-3xl mt-4 leading-tight">
              90 seconds of&nbsp;<em>you</em>.
            </h3>
            <p className="mt-3 text-ink/80 text-sm">
              Show the tuition class, the pasar malam booth, the Figma walkthrough.
              Raw and real is the new resume.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {["tuition", "design", "mc"].map((t) => (
                <div key={t} className="aspect-video rounded-xl bg-ink/20 grid place-items-center text-xs uppercase">
                  {t}
                </div>
              ))}
            </div>
          </article>

          {/* Certifications */}
          <article className="cell-md rounded-card bg-surface-raised border border-line p-8">
            <p className="text-xs uppercase tracking-widest text-ink-soft">03 · Credentials</p>
            <h3 className="font-display text-3xl mt-4 leading-tight">
              WSQ, <span className="italic">verified</span>.
            </h3>
            <p className="mt-3 text-ink-soft text-sm">
              Upload a cert, we extract and match it. Recognised issuers get a
              blue pill on your profile.
            </p>
            <ul className="mt-6 flex flex-wrap gap-1.5 text-xs">
              {["SkillsFuture SG", "NUS", "NTU", "SMU", "SIT", "IES", "SCS", "ACSM"].map((i) => (
                <li key={i} className="rounded-pill bg-trust-soft text-trust px-3 py-1 font-medium">
                  {i}
                </li>
              ))}
            </ul>
          </article>

          {/* Video interview */}
          <article className="cell-md rounded-card bg-surface-raised border border-line p-8">
            <p className="text-xs uppercase tracking-widest text-ink-soft">04 · Async interview</p>
            <h3 className="font-display text-3xl mt-4 leading-tight">
              Say it. Don&apos;t type it.
            </h3>
            <p className="mt-3 text-ink-soft text-sm">
              Employers post 1–3 questions. You record 90s answers on your own
              time. No Zoom scheduling gymnastics.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
              <span className="font-mono tracking-widest">REC · 00:47</span>
            </div>
          </article>

          {/* Entrepreneur */}
          <article className="cell-md rounded-card bg-ink text-surface p-8 overflow-hidden">
            <p className="text-xs uppercase tracking-widest text-accent">05 · Go full-time</p>
            <h3 className="font-display text-3xl mt-4 leading-tight">
              From side to CEO.
            </h3>
            <p className="mt-3 text-surface/70 text-sm">
              When you&apos;re ready, we walk you through ACRA BizFile, CPF
              self-employed contributions, GST thresholds, and bank picks.
            </p>
            <ol className="mt-5 text-xs space-y-1 text-surface/80">
              <li>1. Decide (sole-prop vs Pte Ltd)</li>
              <li>2. Reserve your company name</li>
              <li>3. Mock-register via ACRA</li>
              <li>4. Post-reg: CPF, GST, banking</li>
            </ol>
          </article>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-card bg-ink text-surface p-10 lg:p-16 relative overflow-hidden grain">
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs uppercase tracking-widest text-accent">One more thing</p>
            <h2 className="font-display text-display-lg mt-4 leading-[0.95]">
              Your hustle deserves<br />infrastructure that respects it.
            </h2>
            <p className="mt-6 text-surface/70">
              Sign up with mock Singpass in under 20 seconds. Demo NRICs provided.
            </p>
            <Link
              href="/singpass"
              className="mt-8 inline-block rounded-pill bg-accent text-ink px-6 py-3 font-semibold hover:bg-surface transition"
            >
              Start now — it&apos;s free →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-surface/10 p-3">
      <p className="text-[10px] uppercase tracking-widest text-surface/50">{label}</p>
      <p className="font-mono text-sm mt-1">{value}</p>
    </div>
  );
}

function TrustMark({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}
