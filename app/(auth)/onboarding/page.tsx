import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  if (!user) redirect("/singpass");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const { next } = await searchParams;

  return (
    <main className="min-h-screen grid place-items-center px-6 py-20">
      <OnboardingFlow
        displayName={profile?.display_name ?? "friend"}
        next={next ?? "/feed"}
      />
    </main>
  );
}
