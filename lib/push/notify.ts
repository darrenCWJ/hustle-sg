import webpush from "web-push";
import { createServiceClient } from "@/lib/supabase/server";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL ?? "mailto:admin@hustlesg.com";

// Minimum vector-similarity score (cosine, 1.0 = identical) to notify a
// freelancer of a match. Instant gigs use a slightly lower bar — more urgency,
// cast a wider net; regular gig matches use a higher bar to avoid low-relevance
// notification spam. The two values differ on purpose.
const INSTANT_MATCH_NOTIFY_THRESHOLD = 0.5;
const GIG_MATCH_NOTIFY_THRESHOLD = 0.55;

function getWebPush() {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return null;
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
  return webpush;
}

interface PushPayload {
  title: string;
  body: string;
  url: string;
}

async function sendPushToUser(userId: string, payload: PushPayload, service: ReturnType<typeof createServiceClient>) {
  const wp = getWebPush();
  if (!wp) return;

  const { data: subs } = await service
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!subs?.length) return;

  const json = JSON.stringify(payload);
  await Promise.allSettled(
    subs.map((sub) =>
      wp.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        json,
      ).catch(async (err: any) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await service
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
        }
      }),
    ),
  );
}

export async function notifyInstantGigPosted(gigId: string): Promise<void> {
  const service = createServiceClient();

  const { data: gig } = await service
    .from("gigs")
    .select("title, instant_urgency")
    .eq("id", gigId)
    .single();

  if (!gig) return;

  const urgencyLabel =
    gig.instant_urgency === "now" ? "needed NOW" :
    gig.instant_urgency === "weekend" ? "this weekend" : "today";

  const { data: matches } = await service.rpc("match_users_for_gig", {
    p_gig_id: gigId,
    p_limit: 10,
  });

  if (!matches?.length) return;

  const qualified = (matches as { user_id: string; score: number }[])
    .filter((m) => m.score >= INSTANT_MATCH_NOTIFY_THRESHOLD)
    .slice(0, 8);

  if (!qualified.length) return;

  const payload: PushPayload = {
    title: `Instant gig ${urgencyLabel}`,
    body: `"${gig.title}" — one-tap accept on the Instant board.`,
    url: "/instant",
  };

  await Promise.all(
    qualified.map(async (m) => {
      await service.from("notifications").insert({
        user_id: m.user_id,
        kind: "gig_match",
        title: payload.title,
        body: payload.body,
        link: payload.url,
        data: { gig_id: gigId, instant: true },
      });
      await sendPushToUser(m.user_id, payload, service);
    }),
  );
}

export async function notifyMatchedFreelancers(gigId: string): Promise<void> {
  const service = createServiceClient();

  const { data: gig } = await service
    .from("gigs")
    .select("title, category")
    .eq("id", gigId)
    .single();

  if (!gig) return;

  const { data: matches } = await service.rpc("match_users_for_gig", {
    p_gig_id: gigId,
    p_limit: 10,
  });

  if (!matches?.length) return;

  const qualified = (matches as { user_id: string; score: number }[]).filter(
    (m) => m.score >= GIG_MATCH_NOTIFY_THRESHOLD,
  ).slice(0, 5);

  if (!qualified.length) return;

  const payload: PushPayload = {
    title: "New gig match for you",
    body: `"${gig.title}" — looks like a great fit based on your profile.`,
    url: `/gigs/${gigId}`,
  };

  await Promise.all(
    qualified.map(async (m) => {
      await service.from("notifications").insert({
        user_id: m.user_id,
        kind: "gig_match",
        title: payload.title,
        body: payload.body,
        link: payload.url,
        data: { gig_id: gigId },
      });
      await sendPushToUser(m.user_id, payload, service);
    }),
  );
}
