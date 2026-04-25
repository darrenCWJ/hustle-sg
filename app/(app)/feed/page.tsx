import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { matchGigsForUser } from "@/lib/ai/match";
import { FeedClientPage } from "./FeedClientPage";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/singpass?next=/feed");

  const matches = await matchGigsForUser(user.id, 18);

  return <FeedClientPage matches={matches} />;
}
