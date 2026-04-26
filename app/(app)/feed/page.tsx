import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { matchGigsForUser } from "@/lib/ai/match";
import { FeedClientPage } from "./FeedClientPage";
import { loadSavedGigIds } from "@/app/actions/gigs";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/singpass?next=/feed");

  const [matches, savedIds] = await Promise.all([
    matchGigsForUser(user.id, 18),
    loadSavedGigIds(),
  ]);

  return <FeedClientPage matches={matches} initialSavedIds={savedIds} />;
}
