import { createServiceClient } from "@/lib/supabase/server";

/**
 * Counterparties whose relationship with `userId` an admin has CONFIRMED as
 * fraudulent. Ratings flowing between such a pair are excluded from public
 * averages and track records — the admin verdict has teeth, not just a flag.
 */
export async function getConfirmedFraudCounterparties(userId: string): Promise<Set<string>> {
  const service = createServiceClient();
  const { data, error } = await service
    .from("fraud_reviews")
    .select("employer_id, worker_id")
    .eq("verdict", "confirmed")
    .or(`employer_id.eq.${userId},worker_id.eq.${userId}`);

  if (error) {
    console.error("[fraud] getConfirmedFraudCounterparties", error);
    return new Set();
  }
  const out = new Set<string>();
  for (const row of data ?? []) {
    out.add(row.employer_id === userId ? row.worker_id : row.employer_id);
  }
  return out;
}
