import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChecklistStepper } from "./ChecklistStepper";

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
          mock submission — so you know exactly what&apos;s waiting when you&apos;re ready to go full-time.
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

      <ChecklistStepper initial={initial as any} loggedIn={Boolean(user)} />
    </main>
  );
}
