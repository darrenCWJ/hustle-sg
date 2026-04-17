# Hustle SG — Next session hand-off

## Current state (end of 2026-04-18 session)

- Full stack built: Next.js 15 + Supabase + OpenAI embeddings + Claude Haiku cert parser
- 13 routes compile clean, production build green, 15/15 unit tests pass
- User confirmed `npm run dev` works locally
- Supabase project exists, 4 migrations applied, seed likely run
- **Not yet deployed.** No Vercel/Supabase-hosted production URL

## Demo NRICs (valid SG checksums)

| NRIC | Role | Handle |
|---|---|---|
| `S1234567D` | Freelancer · product designer | `arif_rahman` |
| `S2345678H` | Freelancer · tuition teacher | `priya_sg` |
| `S3456789A` | Freelancer · full-stack dev | `weijie` |
| `T0123456G` | Freelancer · emcee | `siti_mc` |
| `M1023456L` | Employer · F&B | `kopitiam_co` |
| `M2023457U` | Employer · design studio | `nova_studio` |

## Known gaps

- **No Anthropic key yet** — Claude cert parsing falls back to whitelist-only verification (still works). Add `ANTHROPIC_API_KEY` later for real extraction from pasted cert text.
- **Video recorder uses WebM** — Safari support is spotty; works fine in Chrome/Firefox.
- **No real Singpass** — mock only, marked as such in UI copy.
- **No payments** — mock "Paid via Hustle" UI only.
- **No messaging/chat** — applications only, no DM flow.
- **No email** — no verification/notification emails.
- **Bento layout on mobile** — simplified to 2-col, not yet perfect on narrow screens.

## Critical files if you need to onboard quickly

| Path | What it does |
|---|---|
| `app/(marketing)/page.tsx` | Landing hero + bento |
| `app/(auth)/singpass/*` | Mock Singpass flow + NRICForm/FaceScanMock |
| `app/(app)/profile/edit/*` | Profile edit, portfolio uploader, cert editor |
| `app/(app)/feed/page.tsx` | AI-matched gig feed |
| `app/(app)/interviews/[id]/*` | Async video interview |
| `app/(marketing)/start-a-business/*` | Entrepreneur guide |
| `lib/singpass/nric.ts` | SG NRIC checksum validation |
| `lib/ai/embeddings.ts` + `lib/ai/match.ts` | Vector match via pgvector RPCs |
| `lib/ai/cert-parser.ts` | Claude Haiku cert extraction |
| `lib/entrepreneur/entities.ts` | Sole-prop vs Pte Ltd SG facts |
| `lib/db/seed.ts` + `lib/db/fixtures.ts` | Seed script (10 freelancers, 4 employers, 12 gigs) |
| `supabase/migrations/0001-0004_*.sql` | Schema + pgvector + RLS + storage buckets |

## Feedback log (add items here as you get them)

### To address next session
- [ ] _Add feedback items here when received._

### Ideas raised but not yet decided
- [ ] _Add maybe-items here._

## Suggested improvements (unprompted)

### Trust / verification
- Singpass MyInfo sandbox integration (real NRIC validation via government API)
- SkillsFuture Singapore API for live WSQ cert verification
- ACRA BizFile API for real name availability checks
- Fraud signals: dupe NRIC hash, dupe email patterns, dupe bank account

### Matching quality
- Replace profile embedding with a two-tower model: user × gig trained on applications→hire outcomes
- Add explicit filters (location, budget, category) that stack on top of vector search
- Cold-start: give new users a skills questionnaire to seed their embedding
- Freshness boost: decay gigs over time

### UX polish
- Skeleton loaders on feed/profile (currently nothing while SSR)
- Optimistic UI on apply + cert add
- Real-time notifications via Supabase Realtime on new applications / interview responses
- Mobile bento grid — proper responsive tokens, not just 2-col collapse
- Dark-mode audit (tokens exist but haven't been stress-tested)

### Product
- Messaging/chat (Supabase Realtime channels)
- Ratings + reviews (two-way) after a gig closes
- Saved searches + email digests (daily matched gigs)
- Referral program (Singapore loves kopi-money rewards)
- Group gigs — hire a team for events

### Ops / infra
- Stripe Connect for real SGD payouts (escrow until gig completion)
- Transactional email via Resend or Postmark
- Sentry for error tracking
- Supabase database backups + point-in-time recovery
- Rate limiting on upload endpoints (currently open to auth'd users with no throttle)

### Code quality
- Replace hand-written `lib/supabase/types.ts` with `supabase gen types typescript` output
- Add Playwright E2E tests that cover the full apply-interview flow (current tests are smoke-only)
- Coverage report + CI gate at 80%
- Zod at every API boundary (route handlers currently only validate some)

## Deployment quick-ref

Vercel + Supabase Cloud. Env vars to set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY` (optional)
- `NEXT_PUBLIC_APP_URL` — set to the Vercel production URL post-deploy

Add the Vercel production origin to Supabase **Auth → URL Configuration → Site URL** and **Redirect URLs**.
