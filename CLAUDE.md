# HustleSG — project conventions

## Documentation stays current (owner's standing rule)
Whenever a change alters behavior, setup, or security posture, update the
matching doc in the same commit series:
- **README.md** — features, setup, scripts, architecture map, demo script
- **SECURITY.md** — controls, demo-mode boundary, known gaps, deploy checklist
- **IMPROVEMENT_PLAN.md** — the status table at the top (the plan body below it
  is a frozen audit record; don't rewrite it)
- **.env.example** — every new env var, with a comment explaining it

## Database
- Migrations are sequential files in `supabase/migrations/` (`00NN_name.sql`)
  AND must be applied to the remote project (Supabase MCP `apply_migration`).
  Regenerate `lib/supabase/database.types.ts` after schema changes.
- RLS policy rules: use `(select auth.uid())` (never bare `auth.uid()` — it
  runs per row), one policy per command (no `FOR ALL` next to a SELECT
  policy), `to authenticated` unless anonymous read is intentional.
- SECURITY DEFINER functions derive identity from `auth.uid()` inside the
  body and pin `search_path = public`. Never trust client-supplied actor ids.
- `demo_sessions` is intentionally anonymous (demo infra) — don't "fix" it.

## Application code
- Business operations live in `lib/` domain modules (`lib/gigs/post.ts`,
  `lib/applications/apply.ts`); route actions are thin parse-and-redirect
  adapters. Never re-implement an operation per surface — that's how the
  desktop/mobile drift happened.
- Every server action / route handler validates input with Zod `safeParse`;
  runtime checks matter because TS unions are erased.
- Paid/abusable endpoints (AI calls, posting, OTP, OpenCerts, client error
  reports) go through `checkRateLimit` (`lib/security/rate-limit.ts`).
- Server errors → `captureServerError` (lib/observability/errors.ts), not
  bare `console.error`, when the failure matters in production.
- Match-outcome transitions log via `logMatchEvent`.
- Redirect params through `safeNext`; user-supplied URLs through `safeHref`.
- `NEXT_PUBLIC_DEMO_MODE` (lib/config/demo.ts) is the single gate for all
  mock-auth surfaces. The NRIC hash default salt must stay `"hustle-sg"` or
  seeded demo logins break; `isValidNric` is format-only BY DESIGN
  (`isValidNricChecksum` is the real one).

## Verification before done
`npm run typecheck && npm run lint && npm test && npm run build` — all green,
zero lint errors (warnings are the ratcheted `any` backlog; don't add more).
CI also gates `npm audit --audit-level=high`; transitive pins are handled via
`overrides` in package.json (e.g. `ws`).
