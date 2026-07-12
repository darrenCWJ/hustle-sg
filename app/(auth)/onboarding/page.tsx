import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/security/safe-redirect";
import { OnboardingFlow } from "./OnboardingFlow";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding");

  // Real completion state (Phase 5.3): the checklist reflects what the user
  // has actually done instead of rendering a static to-do list.
  const [{ data: profile }, portfolio, certs, gigs] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, headline, bio, singpass_verified_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("portfolio_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("certifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("gigs")
      .select("id", { count: "exact", head: true })
      .eq("employer_id", user.id),
  ]);

  const { next } = await searchParams;

  return (
    <main className="min-h-screen grid place-items-center px-6 py-20">
      <OnboardingFlow
        displayName={profile?.display_name ?? "friend"}
        next={safeNext(next, "/feed")}
        singpassVerified={Boolean(profile?.singpass_verified_at)}
        completed={{
          profile: Boolean(profile?.headline || profile?.bio),
          portfolio: (portfolio.count ?? 0) > 0,
          cert: (certs.count ?? 0) > 0,
          gig: (gigs.count ?? 0) > 0,
        }}
      />
    </main>
  );
}
