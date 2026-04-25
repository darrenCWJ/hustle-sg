import { createClient } from "@/lib/supabase/server";
import { GigsClientPage } from "./GigsClientPage";

export default async function GigsPage() {
  const supabase = await createClient();

  const { data: gigs } = await supabase
    .from("gigs")
    .select("*, employer:profiles!gigs_employer_id_fkey(display_name, singpass_verified_at)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(60);

  return <GigsClientPage gigs={(gigs ?? []) as any} />;
}
