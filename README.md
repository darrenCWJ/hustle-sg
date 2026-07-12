# HustleSG

Singapore-first gig platform for verified side hustlers. AI + distance-matched gigs, real credential verification (OpenCerts + admin review), async video interviews, in-app messaging, double-blind reviews, dispute resolution, an instant gig board with web push, and a guided path to registering your own company.

> **Demo boundary:** authentication ships in two modes. With `NEXT_PUBLIC_DEMO_MODE` on (default), a mock Singpass flow and the `/accounts` credential list make the demo self-serve — this is insecure by design. With it off, those surfaces disappear and email-OTP login (`/login`) is the only path. See [SECURITY.md](SECURITY.md) before deploying anywhere public.

## Stack

- **Next.js 15** (App Router, RSC, Server Actions) + **React 19**
- **Supabase** (Postgres + Auth + Storage + pgvector + Realtime + pg_cron)
- **OpenAI** `text-embedding-3-small` for profile/gig embeddings (hash-cached — unchanged inputs skip the paid call)
- **Anthropic Claude Haiku** for certification text parsing
- **@govtechsg/opencerts-verify** for OpenCerts credential verification
- **Web Push / VAPID** for notifications when the app is closed
- **Tailwind CSS** with a custom OKLCH palette + editorial typography
- **Vitest** (unit) + **Playwright** (e2e) + **ESLint** flat config, gated in CI

## Features

| Flow | What it does |
|---|---|
| Auth (demo) | Mock Singpass: NRIC format check, deterministic session per salted SHA-256 hash, MyInfo prefill for demo identities |
| Auth (non-demo) | Email OTP via Supabase (`/login`); OTP accounts are never shown as identity-verified |
| Credential verification | **OpenCerts**: upload the `.opencert` file — document integrity, issuance status and issuer identity verified server-side; passing docs get the badge instantly. Everything else queues for **manual admin review**. Claude extracts skills from pasted cert text. Self-serve verification does not exist |
| Budget bases | Gigs can be **fixed**, **hourly**, **whole-project**, or **per-milestone** (milestone list collected at posting and shown on the gig page) |
| AI role matching | pgvector cosine on 1536-dim embeddings. Hybrid scoring: skill gigs = 80% cosine + 20% distance; errand gigs = 30% / 70%. Blocked pairs excluded in SQL |
| Distance-aware feed | Haversine in Postgres, linear decay over 15 km, distance badge per card |
| Consent-first permissions | Location and push are requested via tappable priming cards that explain the trade — never silently on page load |
| Instant gig board | Time-urgent gigs (now / today / weekend) with one-tap accept and push fan-out to top-matched nearby freelancers |
| Async video interview | Employer posts 1–3 questions; applicants record on apply (`MediaRecorder` → signed upload to a private bucket) |
| In-app messaging | Realtime threads per application, unlocked at shortlist/offer/hire; inbox with unread badges; block-aware |
| Double-blind reviews | A rating stays hidden until both parties submit or 14 days pass (enforced in RLS). Either party can mark a gig completed. Daily pg_cron reminders |
| Lifecycle controls | Withdraw application, edit/delete gig (delete only with zero applicants), honest close outcomes (filled vs cancelled) |
| Rehire & repost | Direct offers to previous hires when posting (rehire selector) or from the applicants page; **↻ Repost** copies a past gig into the form (fresh timing/deadline required) |
| Availability calendar | Weekly grid on the worker dashboard; the feed marks + boosts gigs that **fit your schedule**; push alerts skip freelancers whose calendar says they're busy |
| Applicant triage | Status filters, search, sort, and true DB pagination on the employer pipeline |
| Trust & safety | Report users/gigs, block users (hidden across matching, lists, applying, messaging), disputes with a state machine |
| Job authenticity | Every gig shows the employer's real track record (gigs filled, distinct hires, worker rating, member since) — first-time posters are flagged honestly |
| Collusion resistance | Rating averages count each rater **once**; repeat hires from one employer count once toward trust; `/admin/fraud` surfaces rating-ring signals (mutual 5★s, zero-message completions, instant ratings). Admin-confirmed pairs' mutual ratings stop counting anywhere |
| Fraud-model evaluation | Admin verdicts are ground-truth labels: **precision / recall / F1** computed live, with plain-language retune guidance; signal weights + alert threshold tunable in the UI (no code). Labels double as training data for a future learned model |
| Action-first dashboards | Both dashboards open with a "needs your attention" strip: offers waiting, interviews, reviews owed, unread messages, disputes — real counts, deep links |
| Admin surface | `/admin` (role-gated, unlinked): report triage, cert review queue, dispute resolution, error log, fraud model (verdicts + tuning + F1), settings (promote/revoke admins by handle — first admin via SQL) |
| Observability | First-party error store — server captures + client error-boundary reports land in `app_errors`, viewable at `/admin/errors` |
| Match instrumentation | Every apply/shortlist/offer/hire/reject/withdraw/complete/rate writes to `match_events` for future ranking work |
| Entrepreneur onboarding | Entity-type wizard → name reservation → mock-ACRA registration → post-reg guidance (CPF, GST, banking) |
| 3D vector map | Server-side PCA to 3D; Three.js view of profiles/gigs in semantic space |

## Setup

```bash
npm install
cp .env.example .env.local   # fill in every variable — comments explain each
```

### Database

Migrations live in `supabase/migrations/` (`0001` → `0042`) and cover schema, RLS, pgvector matching, storage bucket limits, rate limiting, trust & safety tables, messaging, instrumentation, and the pg_cron reminder job.

```bash
npx supabase db push
```

### Seed

```bash
npm run seed                      # 12 freelancers + 5 employers + 16 gigs + embeddings
npx tsx lib/db/seed-personal.ts   # 5 residents + 12 regular + 18 instant gigs
npm run extend-deadlines          # keep open gig deadlines live for demos
```

### Dev & checks

```bash
npm run dev
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm test            # Vitest unit tests
npm run e2e         # Playwright (requires dev server; npx playwright install once)
```

CI (`.github/workflows/ci.yml`) blocks on typecheck, lint, tests, and `npm audit --audit-level=high`.

## Architecture

```
app/
├── (marketing)/                 Landing, vector map, /accounts (demo-only)
├── (auth)/login/                Email OTP (the only login when demo mode is off)
├── (auth)/singpass/             Mock Singpass (demo-only; redirects to /login otherwise)
├── (auth)/onboarding/           Role picker + live completion checklist
├── (app)/feed/                  Matched gigs + consent priming cards
├── (app)/instant/               Instant gig board
├── (app)/gigs/                  Browse, detail, post, edit
├── (app)/applications|applicants/  Both sides of the pipeline (withdraw / triage)
├── (app)/messages/              Realtime inbox + threads
├── (app)/disputes/              Open + track disputes
├── (app)/interviews|rate/       Async video interviews, double-blind reviews
├── (admin)/admin/               Reports, cert review, disputes, errors (role-gated)
├── (mobile)/m/                  Mobile surface (shares domain logic with desktop).
│                                Phones are auto-redirected here by middleware
│                                (UA/client-hint detection; "Use desktop site"
│                                on /m/profile opts out via cookie)
└── api/                         push/subscribe, storage/sign (Zod + same-origin)

lib/
├── gigs/ applications/          Shared domain functions (post, apply) — both surfaces adapt these
├── ai/                          Embeddings (hash-cached), hybrid match, cert parser
├── certs/opencerts.ts           OpenCerts / OpenAttestation verification
├── safety/                      Block checks and list filtering
├── security/                    safeNext, http-only URLs, origin check, rate limiter
├── analytics/match-events.ts    Outcome instrumentation
├── observability/errors.ts      First-party error capture
├── auth/admin.ts                Admin gate
└── supabase/                    Typed clients (generated Database types)
```

## Seeded identities

All demo accounts are listed at `/accounts` (demo mode only). Highlights: `S1111111A` (aisha_ml, freelancer), `M1001001A` (techsg_ventures, employer). Fresh sign-ups work with any format-valid NRIC in demo mode.

## Demo script

1. `/accounts` → pick a freelancer → `/singpass` → log in
2. `/feed` — matched gigs with distance + match badges; tap the priming cards to enable location/push
3. Second tab: log in as `M1001001A` → post a gig → first account gets matched (and pushed, if enabled)
4. Apply → record interview answers → employer shortlists → **message thread unlocks** → offer → hire
5. Either side marks completed → both leave double-blind reviews
6. Upload an `.opencert` file on `/profile/edit` → instant verified badge
7. Admin (after `update profiles set is_admin = true where handle = '...'`): `/admin` for reports, cert queue, disputes, errors

## Security

See [SECURITY.md](SECURITY.md) for the demo-mode boundary, controls in place, accepted gaps, and the production deploy checklist. Short version: RLS everywhere (initplan-optimised, one policy per command), `auth.uid()`-enforced RPCs, rate limits on paid/abusable endpoints, honest UI claims, and no self-serve trust signals.

## Plans

- [IMPROVEMENT_PLAN.md](IMPROVEMENT_PLAN.md) — the original phased overhaul (0–6), all implemented; per-phase status table at the top.
- [ROADMAP.md](ROADMAP.md) — the living forward plan: what's next, what needs external accounts, and the model-health playbook for non-technical admins.
