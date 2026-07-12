import { createServiceClient } from "@/lib/supabase/server";

/**
 * True when either user has blocked the other. RLS hides the other party's
 * block rows from a normal client, so enforcement checks (e.g. "can this
 * freelancer apply to this employer's gig?") must run with the service role.
 */
export async function isBlockedBetween(userA: string, userB: string): Promise<boolean> {
  const service = createServiceClient();
  const { data, error } = await service
    .from("blocks")
    .select("blocker_id")
    .or(
      `and(blocker_id.eq.${userA},blocked_id.eq.${userB}),` +
        `and(blocker_id.eq.${userB},blocked_id.eq.${userA})`,
    )
    .limit(1);

  if (error) {
    // Fail closed for a safety control: treat lookup failure as blocked and log.
    console.error("[safety] isBlockedBetween", error);
    return true;
  }
  return (data ?? []).length > 0;
}
