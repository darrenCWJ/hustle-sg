import { createClient } from "@/lib/supabase/server";
import { getBlockedCounterparties } from "@/lib/safety/blocks";
import { GigsClientPage } from "./GigsClientPage";

export default async function GigsPage() {
  const supabase = await createClient();

  const { data: gigs } = await supabase
    .from("gigs")
    .select("*, employer:profiles!gigs_employer_id_fkey(display_name, singpass_verified_at)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(60);

  // Blocked pairs don't see each other's gigs on the plain list either
  // (matched surfaces already exclude them in SQL).
  const { data: { user } } = await supabase.auth.getUser();
  const blocked = user ? await getBlockedCounterparties(user.id) : new Set<string>();
  const visibleGigs = (gigs ?? []).filter((g) => !blocked.has(g.employer_id));

  return <GigsClientPage gigs={visibleGigs as any} />;
}
