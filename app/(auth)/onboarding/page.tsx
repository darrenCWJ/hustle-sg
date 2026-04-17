import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/singpass");

  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, display_name, headline, bio")
    .eq("id", user.id)
    .single();
  const { next } = await searchParams;

  return (
    <main className="min-h-screen grid place-items-center px-6 py-20">
      <div className="w-full max-w-xl">
        <p className="text-xs uppercase tracking-widest text-trust font-semibold">
          ✓ Singpass verified
        </p>
        <h1 className="font-display text-display-md mt-3 mb-6">
          Welcome, {profile?.display_name ?? "friend"}.
        </h1>
        <p className="text-ink-soft mb-10">
          We&apos;ve pre-filled a profile using MyInfo mock data. Next steps:
        </p>

        <div className="space-y-3 mb-10">
          <OnboardingCard
            n={1}
            title="Finish your profile"
            body="Headline, bio, and a real photo — employers screen fast."
            href="/profile/edit"
          />
          <OnboardingCard
            n={2}
            title="Upload one portfolio video"
            body="90 seconds showing what you actually do. Raw and real beats polished."
            href="/profile/edit#portfolio"
          />
          <OnboardingCard
            n={3}
            title="Verify a certification"
            body="WSQ, NUS, NTU, SMU, IES, and others get a verified badge instantly."
            href="/profile/edit#certifications"
          />
        </div>

        <Link
          href={next || "/feed"}
          className="inline-block rounded-xl bg-ink text-surface px-6 py-3 font-semibold hover:bg-accent-ink transition"
        >
          Skip to AI-matched feed →
        </Link>
      </div>
    </main>
  );
}

function OnboardingCard({
  n,
  title,
  body,
  href,
}: {
  n: number;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex gap-4 p-5 rounded-card border border-line bg-surface-raised hover:border-accent hover:-translate-y-0.5 transition-all duration-normal ease-out-expo"
    >
      <div className="shrink-0 h-10 w-10 rounded-full bg-accent-soft text-accent-ink font-display grid place-items-center text-lg">
        {n}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-ink-soft">{body}</p>
      </div>
      <span className="ml-auto text-ink-soft group-hover:text-accent transition">→</span>
    </Link>
  );
}
