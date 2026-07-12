// Demo-mode boundary.
//
// The mock-Singpass sign-in scheme derives Supabase Auth credentials
// deterministically from a public, checksummed NRIC (see lib/singpass/nric.ts).
// That is INSECURE BY DESIGN and exists only for the hackathon demo: anyone who
// knows a valid NRIC can compute the same credentials. The /accounts page, which
// lists those derived credentials, is equally demo-only.
//
// These surfaces are gated behind this flag so a real deployment can disable them
// in one place by setting NEXT_PUBLIC_DEMO_MODE=false, at which point the app must
// use a real authentication provider (see IMPROVEMENT_PLAN.md, Phase 3.1).
//
// Default is ON so the demo keeps working out of the box; opt OUT explicitly.
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

/** Throw if a demo-only feature is reached while demo mode is disabled. */
export function assertDemoMode(feature: string): void {
  if (!DEMO_MODE) {
    throw new Error(
      `${feature} is a demo-only feature and is disabled ` +
        `(NEXT_PUBLIC_DEMO_MODE=false). Wire a real authentication provider ` +
        `before enabling it outside the demo.`,
    );
  }
}
