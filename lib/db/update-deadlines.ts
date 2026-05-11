// Set applications_close_at = end of current month (SGT) on all gigs that have no deadline.
// Run: npx tsx lib/db/update-deadlines.ts

import { config as loadEnv } from "dotenv";
import path from "node:path";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function endOfMonthSgt(): Date {
  const now = new Date();
  // Last moment of the current month in SGT (UTC+8)
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // 0-indexed
  // First day of next month at 00:00 SGT = previous day at 16:00 UTC
  const firstOfNext = new Date(Date.UTC(year, month + 1, 1, 16, 0, 0)); // 00:00 SGT next month
  // One second before that = 23:59:59 SGT last day of this month
  return new Date(firstOfNext.getTime() - 1000);
}

async function main() {
  const deadline = endOfMonthSgt();
  console.log(`Setting deadline: ${deadline.toISOString()} (${deadline.toLocaleString("en-SG", { timeZone: "Asia/Singapore" })} SGT)`);

  // Update all open gigs with no deadline
  const { data, error } = await admin
    .from("gigs")
    .update({ applications_close_at: deadline.toISOString() })
    .eq("status", "open")
    .is("applications_close_at", null)
    .select("id, title");

  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }

  console.log(`\nUpdated ${data?.length ?? 0} gig(s):`);
  for (const g of data ?? []) {
    console.log(`  → ${g.title}`);
  }

  // Also extend any gigs whose deadline has already passed
  const { data: expired, error: expiredErr } = await admin
    .from("gigs")
    .update({ applications_close_at: deadline.toISOString() })
    .eq("status", "open")
    .lt("applications_close_at", new Date().toISOString())
    .select("id, title");

  if (expiredErr) {
    console.error("Error updating expired:", expiredErr.message);
  } else if (expired?.length) {
    console.log(`\nExtended ${expired.length} expired gig(s):`);
    for (const g of expired) {
      console.log(`  → ${g.title}`);
    }
  }

  console.log("\nDone.");
}

main();
