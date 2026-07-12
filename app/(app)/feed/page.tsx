import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { matchGigsForUser } from "@/lib/ai/match";
import { gigFitsAvailability, hasAnyAvailability } from "@/lib/availability/fit";
import { FeedClientPage } from "./FeedClientPage";
import { loadSavedGigIds } from "@/app/actions/gigs";
import { GeolocationCapture } from "@/components/location/GeolocationCapture";
import { PushAutoSubscribe } from "@/components/notifications/PushAutoSubscribe";
import { PrimingCards } from "@/components/consent/PrimingCards";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/singpass?next=/feed");

  const [matches, savedIds, profileData, availability] = await Promise.all([
    matchGigsForUser(user.id, 18),
    loadSavedGigIds(),
    supabase.from("profiles").select("lat, lon").eq("id", user.id).single(),
    supabase.from("user_availability").select("slots").eq("user_id", user.id).maybeSingle(),
  ]);

  const hasLocation = !!(profileData.data?.lat && profileData.data?.lon);

  // Availability fit: when the user has marked their weekly calendar (worker
  // dashboard), flag matched gigs whose day + working window sit inside it.
  const slots = (availability.data?.slots as number[][] | null) ?? null;
  const calendarSet = hasAnyAvailability(slots);
  let annotated = matches;
  if (calendarSet && matches.length > 0) {
    const { data: timings } = await supabase
      .from("gigs")
      .select("id, days_of_week, start_time, end_time, starts_at, is_instant, instant_urgency")
      .in("id", matches.map((m) => m.gig_id));
    const timingById = new Map((timings ?? []).map((t) => [t.id, t]));
    annotated = matches.map((m) => {
      const timing = timingById.get(m.gig_id);
      return { ...m, fits_schedule: timing ? gigFitsAvailability(slots!, timing) : null };
    });
  }

  return (
    <>
      {/* Passive re-sync for already-granted permissions… */}
      <PushAutoSubscribe />
      <GeolocationCapture hasLocation={hasLocation} />
      {/* …and explicit, user-tapped priming for first-time opt-in (Phase 5.1). */}
      <PrimingCards hasLocation={hasLocation} />
      <FeedClientPage matches={annotated} initialSavedIds={savedIds} hasAvailability={calendarSet} />
    </>
  );
}
