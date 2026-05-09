import { createClient } from "@/lib/supabase/server";
import { fetchTodayInstantGigs } from "@/app/actions/instant";
import { InstantPageClient } from "./InstantPageClient";

export default async function InstantPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isEmployer = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isEmployer = profile?.role === "employer" || profile?.role === "both";
  }

  const initialGigs = await fetchTodayInstantGigs(user?.id);

  return (
    <InstantPageClient
      isLoggedIn={!!user}
      isEmployer={isEmployer}
      initialGigs={initialGigs}
    />
  );
}
