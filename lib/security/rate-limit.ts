import { createServiceClient } from "@/lib/supabase/server";

/**
 * Postgres-backed fixed-window rate limiter (migration 0027).
 *
 * Returns true when the action is allowed. Fails OPEN — if the limiter errors
 * (e.g. the migration hasn't been applied yet), it allows the request rather
 * than blocking a legitimate user. The limiter is a cost/abuse guard, not an
 * authentication control, so failing open is the correct trade-off.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  try {
    const service = createServiceClient();
    const { data, error } = await service.rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error("[rate-limit]", error);
      return true;
    }
    return data === true;
  } catch (err) {
    console.error("[rate-limit]", err);
    return true;
  }
}

/** Standard windows for AI-invoking actions. */
export const RATE_LIMITS = {
  certParse: { limit: 20, windowSeconds: 3600 },
  skillSuggest: { limit: 40, windowSeconds: 3600 },
  gigPost: { limit: 30, windowSeconds: 3600 },
} as const;
