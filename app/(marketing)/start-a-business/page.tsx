import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChecklistStepper } from "./ChecklistStepper";
import { ComparisonSection } from "./ComparisonSection";

const BENEFITS = [
  {
    icon: "💸",
    title: "75% tax exemption",
    body: "New companies pay zero tax on the first S$100k of chargeable income for the first 3 years. Corporate tax tops out at 17% — vs personal income tax up to 24%.",
    stat: "Save up to S$17,000/yr",
  },
  {
    icon: "🛡️",
    title: "Protect your assets",
    body: "A Pte Ltd keeps your personal savings, flat, and CPF separate from business debts. As a sole freelancer, you are personally liable for everything.",
    stat: "Limited liability",
  },
  {
    icon: "🏛️",
    title: "Government grants",
    body: "EDG, MRA, CDG, SkillsFuture Enterprise Credit — most grants are only open to registered entities with a UEN. Freelancers are locked out.",
    stat: "Up to S$250k available",
  },
  {
    icon: "🧾",
    title: "Deduct your expenses",
    body: "Laptop, software subscriptions, co-working space, transport, even home office — all claimable against chargeable income once you're registered.",
    stat: "Lower taxable income",
  },
  {
    icon: "📈",
    title: "Win bigger clients",
    body: "Enterprise procurement teams require a UEN on invoices. A registered business signals permanence — clients pay faster and take you more seriously.",
    stat: "Higher rates, shorter terms",
  },
  {
    icon: "🚀",
    title: "Built to scale",
    body: "Issue shares, hire employees, bring on a co-founder, raise funding. None of that is possible as a sole freelancer. Register now and the door stays open.",
    stat: "Raise investment later",
  },
] as const;

export default async function StartABusinessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initial = user
    ? (
        await supabase
          .from("company_registrations")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()
      ).data
    : null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-14">
        <p className="text-xs uppercase tracking-widest text-accent-ink">From side to CEO</p>
        <h1 className="font-display text-display-lg mt-3 leading-[0.95]">
          Register your<br />
          Singapore business.
        </h1>
        <p className="mt-6 max-w-2xl text-ink-soft text-body-lg">
          A guided path through ACRA, IRAS, CPF, and bank account. Real figures,
          guided walkthrough — so you know exactly what&apos;s waiting when you&apos;re ready to go full-time.
        </p>
        {!user && (
          <p className="mt-6 text-sm text-ink-soft">
            <Link href="/singpass" className="underline">
              Log in with Singpass
            </Link>{" "}
            to save your progress.
          </p>
        )}
      </header>

      {/* Benefits */}
      <section className="mb-16">
        <p className="text-xs uppercase tracking-widest text-ink-mute mb-3">Why register</p>
        <h2 className="font-display text-3xl mb-8 leading-tight">
          Stop leaving money<br />on the table.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              style={{
                borderRadius: 18,
                border: "1px solid var(--color-line)",
                background: "var(--color-surface-raised)",
                padding: "22px 24px",
              }}
            >
              <span style={{ fontSize: 28 }}>{b.icon}</span>
              <h3 className="font-display text-xl mt-3 mb-1">{b.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{b.body}</p>
              {b.stat && (
                <p
                  style={{
                    marginTop: 12,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--color-jade-ink)",
                    background: "var(--color-jade-soft)",
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: 999,
                  }}
                >
                  {b.stat}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <ComparisonSection />

      <div style={{ borderTop: "1px solid var(--color-line)", marginBottom: 48 }} />

      <ChecklistStepper initial={initial as any} loggedIn={Boolean(user)} />
    </main>
  );
}
