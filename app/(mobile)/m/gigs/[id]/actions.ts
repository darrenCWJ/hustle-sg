"use server";

import { applyToGigCore } from "@/lib/applications/apply";

// Thin adapter over the shared domain function (Phase 4.1). The previous
// standalone implementation had drifted from the desktop one (no open/deadline
// guard, no cover note) — the core now owns all of that.
export async function mobileApplyToGig(
  gigId: string,
): Promise<{ ok: boolean; error?: string; alreadyApplied?: boolean }> {
  const result = await applyToGigCore(gigId);
  return {
    ok: result.ok,
    error: result.error,
    alreadyApplied: result.alreadyApplied,
  };
}
