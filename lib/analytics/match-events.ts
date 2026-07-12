import { createServiceClient } from "@/lib/supabase/server";
import { captureServerError } from "@/lib/observability/errors";

export type MatchEvent =
  | "apply"
  | "shortlist"
  | "offer"
  | "hire"
  | "reject"
  | "withdraw"
  | "complete"
  | "rate";

/**
 * Phase 6 instrumentation: record apply→hire→rate outcomes so matching can be
 * tuned on real signal later. Fire-and-forget — analytics must never break a
 * user action. `userId` is always the FREELANCER side of the pair.
 */
export function logMatchEvent(input: {
  gigId: string;
  userId: string;
  event: MatchEvent;
  score?: number | null;
}): void {
  const service = createServiceClient();
  void service
    .from("match_events")
    .insert({
      gig_id: input.gigId,
      user_id: input.userId,
      event: input.event,
      score: input.score ?? null,
    })
    .then(({ error }) => {
      if (error) captureServerError("analytics.logMatchEvent", error);
    });
}
