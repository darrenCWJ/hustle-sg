import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { matchGigsForUser } from "@/lib/ai/match";
import { FeedClientPage } from "./FeedClientPage";
import { loadSavedGigIds } from "@/app/actions/gigs";
import { GeolocationCapture } from "@/components/location/GeolocationCapture";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/singpass?next=/feed");

  const [matches, savedIds, profileData] = await Promise.all([
    matchGigsForUser(user.id, 18),
    loadSavedGigIds(),
    supabase.from("profiles").select("lat, lon").eq("id", user.id).single(),
  ]);

  const hasLocation = !!(profileData.data?.lat && profileData.data?.lon);

  return (
    <>
      <GeolocationCapture hasLocation={hasLocation} />
      <FeedClientPage matches={matches} initialSavedIds={savedIds} />
    </>
  );
}
