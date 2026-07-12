# HustleSG — Refactoring & Improvement Plan

> **Status (2026-07-13): IMPLEMENTED.** All phases landed except externally-gated items.
> Audience: whoever takes this codebase from hackathon POC toward a real, shippable product.
> Basis: four grounded audits (architecture, security, code quality/testing, product/UX), cross-validated against the source.

## Implementation status

| Phase | Status | Notes |
|---|---|---|
| 0 — Stop the bleeding | ✅ Done | C1–C5 closed; deps patched; SECURITY.md; migrations 0024–0025 |
| 1 — Foundation | ✅ Done | Generated DB types, ESLint, env module, Zod boundaries, error boundaries + first-party error store (`app_errors`, `/admin/errors`), NRIC checksum, rate limits, CI |
| 2 — Trust & safety | ✅ Done | 2.1: **OpenCerts verification** (instant, registry-backed) + manual admin review queue; 2.2 double-blind reviews + pg_cron reminders; 2.3 report/block (enforced in matching, lists, apply, messaging); 2.4 disputes; 2.5 `/admin` surface |
| 3 — Core product | ✅ Done | 3.1 email-OTP interim auth (real Singpass OIDC needs gov onboarding); 3.2 resolved as documented off-platform stance (Stripe needs keys); 3.3 Realtime messaging; 3.4 lifecycle controls; 3.5 applicant triage |
| 4 — Consolidation | ✅ Done | Shared post/apply domain functions, embedding cache, RLS rebuild (initplan + one policy per command), demo hardening, mobile route holes, indexes. 4.3 file-splitting deferred as cosmetic |
| 5 — UX & consent | ✅ Done | Priming cards, real form labels, honest onboarding, a11y on core controls |
| 6 — Matching | 🟡 Instrumented | `match_events` records apply→hire→rate outcomes; tuning waits on real usage data |

Remaining (externally gated): Stripe escrow, real Singpass/MyInfo OIDC, Sentry (optional — first-party store exists), Supabase dashboard toggles (leaked-password protection, custom SMTP). Open engineering: Playwright money-path e2e, oversized-file splits.

---

*The original plan follows, unchanged, as the audit record.*

---

## 1. What this app is (and is meant to be)

**HustleSG** is a Singapore-first gig marketplace that connects **verified side-hustlers (freelancers)** with **employers** posting short jobs. Its intended differentiators — the things that would make it more than "yet another gig board" — are:

1. **Verified identity** — mock Singpass / MyInfo login, so both sides know who they're dealing with.
2. **Verified credentials** — upload a WSQ / university cert, Claude extracts issuer + skills, a whitelist grants a "Verified" badge.
3. **AI + distance matching** — pgvector cosine similarity blended with Haversine distance; skill gigs weight skills 80/20, errand gigs weight distance 30/70.
4. **Instant gig board** — time-urgent jobs with one-tap accept and **web-push** alerts to nearby matched freelancers even when the app is closed.
5. **Async video interviews** — employer posts questions, applicant records answers to a private bucket.
6. **Entrepreneur on-ramp** — a guided path from "side hustle" to registering a real SG company (sole-prop vs Pte Ltd, ACRA, CPF, GST).

The stack is modern and sensible: Next.js 15 (App Router, RSC, Server Actions), React 19, Supabase (Postgres + Auth + Storage + pgvector), OpenAI embeddings, Anthropic Claude Haiku, Web Push/VAPID, Tailwind with an OKLCH design-token palette.

### The one theme that runs through every finding

**The product promises trust it does not yet enforce.** The marketing copy and UI assert Singpass-verified identity, WSQ-checked credentials, **SGD escrow, a 14-day dispute window, and IRAS-ready receipts** — but in the code, identity is a deterministic hash of a public national ID, "verified" badges are self-declared, and **there is no payment, escrow, or dispute system at all**. Closing that promise-vs-reality gap — either by building the control or by removing the claim — is the spine of this plan.

This is normal for a hackathon build and nothing here is a criticism of shipping fast. But every item below exists because a **real user** — a freelancer trusting the badge, an employer trusting the identity, either party trusting "payment protected" — would be misled or exposed today.

---

## 2. Critique — the honest state of the app

### 2.1 What is genuinely good (keep and build on)

- **The outcome loop is closed.** Application status changes write a `notifications` row on every transition, and freelancers see a real 5-step progress track (`app/(app)/applications/page.tsx`). Many POCs drop this; this one nails it.
- **Empty states are excellent** — nearly every list (applications, applicants, feed per-filter, instant, dashboards, profile sections, notifications, mobile swipe deck) has tailored copy plus a CTA. This is the best-executed dimension.
- **Consistent server/client structure** in `(app)`: RSC `page.tsx` for data-fetching, colocated `actions.ts`, client leaf components for interactivity. Good bones to refactor on.
- **TypeScript `strict: true`** and **`tsc --noEmit` passes clean**.
- **RLS is enabled on every real table** from `0003_rls.sql` onward, and the correct policies use `auth.uid()`. The core storage buckets (portfolio, interviews, certs) are ownership-scoped.
- **Thoughtful details**: embeddings client has retry/backoff; `VideoRecorder` has real camera-error handling; the AI matching concept (hybrid vector + distance) is legitimately interesting.

### 2.2 Critical problems (block any shared/public deployment)

| # | Problem | Evidence | Why it matters |
|---|---|---|---|
| **C1** | `/accounts` publicly renders every seeded user's derived **login email + password** in plaintext | `app/(marketing)/accounts/page.tsx` (unauthenticated route) | The page *is* the auth database. Anyone who loads it logs in as anyone. |
| **C2** | Auth credentials are a **deterministic function of a public national ID + a hardcoded salt** (`"hustle-sg"`) | `lib/singpass/nric.ts:14-33`, `app/(auth)/singpass/actions.ts:34-42` | NRIC checksums are public/enumerable; anyone can compute a target's exact email+password **offline**, no interaction, no rate limit. `checkNricExists` is also an NRIC-existence oracle (PDPA-relevant). |
| **C3** | `decide_application` / `accept_instant_gig` RPCs are `security definer` and trust a **client-supplied actor/user ID** instead of `auth.uid()` | `supabase/migrations/0006_full_poc.sql:127-237`, `0018_*.sql` | Directly callable via Supabase REST with the public anon key. Attacker can hire/reject applicants on gigs they don't own, or force-"hire" any user for any instant gig. Bypasses the whole RLS layer. |
| **C4** | "Verified" credential badge is **self-declared** | `app/(app)/profile/edit/actions.ts:120-180,238-257`, `CertificationsEditor.tsx:126-141` | A "Mark verified" button sets `verified:true` on the user's own cert with no evidence check; typing issuer="NUS" auto-verifies. Verified certs feed the ranking embedding and trust score. The platform's headline value signal is fully forgeable. |
| **C5** | Payment/escrow/dispute claims with **no implementation behind them** | `app/(app)/gigs/[id]/page.tsx:613-617`, `TrustPanel`, `profile/[handle]/page.tsx:216-217` | UI states "Payment held in SGD escrow · 14-day dispute window · IRAS-ready receipts" as always-true. None exists in code. This is a trust and potential-deception risk. |

### 2.3 High-severity problems

- **Security:** open redirect via unvalidated `next` param (`m/singpass` → `redirect(next)`); stored XSS via `javascript:` URI in portfolio links (`z.string().url()` doesn't restrict scheme); no file size/type limits on the three core upload buckets; **vulnerable Next.js version** with published middleware-bypass CVEs (and middleware is the app's auth gate); **no rate limiting anywhere** (AI cost abuse, push spam).
- **Quality:** `npm run lint` is **broken** — no ESLint config exists, so `next lint` drops into an interactive wizard and has effectively never run. **`isValidNric` never checks the NRIC checksum** (only the shape), so its unit test currently **fails** on `main`. The Supabase client is **untyped** (no `Database` generic), which is the root cause of **~90 `any`/`as any`** casts. **No `error.tsx` anywhere** across 52 routes; only 4 have `loading.tsx`.
- **Product/UX:** **no messaging** (a hiring marketplace where the two parties can't talk); **no reporting/blocking/dispute**; **silent geolocation capture** (writes coordinates to the profile with no priming) and **auto push-permission request** (burns the one-shot OS prompt, trains users to "Block"); **desktop `(app)` pages are not responsive** (hard-coded multi-column grids, no media queries) and the `/m` mobile route group is **missing** `interviews`, `rate`, `profile/edit`, `onboarding` — so a mobile-subdomain user **can't record an interview or leave a rating**, the two flagship features.

### 2.4 Structural / architecture problems

- **Triple implementation of the same product.** Desktop `(app)`, mobile `(mobile)/m`, and a fully client-only `(demo)/quick-demo` (**~10,400 lines**) each re-implement gigs/feed/apply/interview/rate. Business logic has already **drifted** — `postGigMobile` silently drops skills, interview questions, rehire offers, and deadlines vs `postGig`.
- **No data-access layer.** Every page/action writes raw `.from("table")` chains inline. **49 `createServiceClient()` (RLS-bypass) call sites**, each independently deciding when to bypass RLS.
- **Hand-written Supabase types** (`lib/supabase/types.ts`) drifting from 23 migrations (e.g. `MatchGigRow.distance_km`).
- **Duplicated status-mutation logic** — `decide_application` RPC vs a hand-rolled `updateApplicationStatus` both mutate `applications.status` with separate auth + notification copy.
- **Missing indexes** on hot query paths: `gigs(is_instant, status)`, `gigs(category)`, `gigs(employer_id, status)`, `applications(gig_id, status)`, `ratings(to_id)`.
- **Overly-permissive RLS** on `demo_sessions` and the `demo-videos` bucket (`USING (true)`, no ownership scoping).
- **No caching** for embeddings/cert-parsing — every profile save re-embeds (paid call).
- **Files over 400 lines**: `SwipeCardDeck.tsx` (800), `DashboardCalendar.tsx` (772), `profile/[handle]/page.tsx` (634), `gigs/[id]/page.tsx` (631), and more.
- **Test coverage ~15-20%** — matching/scoring weights, Haversine, cert whitelist, and every server action are untested; E2E is smoke-only (no sign-in / apply / hire / rate flow).

---

## 3. Guiding principles for the rework

1. **Truth in advertising is a P0 control.** Any claim the UI makes about safety (verified, escrow, dispute, insured) must be backed by a real mechanism or removed. This is both an ethics and a legal (PDPA / consumer-protection) requirement.
2. **Never trust the client — enforce at the database.** Authorization belongs in RLS and `auth.uid()`-based checks, not in parameters the client passes. The Next.js app is one of many possible callers of the Supabase REST API.
3. **Validate at every boundary.** Zod `.safeParse` on every server action and route handler; the TypeScript signature is not a runtime guard.
4. **One implementation, many surfaces.** Collapse desktop/mobile/demo onto shared domain modules + responsive components. Duplication is where the drift bugs live.
5. **Degrade gracefully.** Error boundaries, loading states, honest empty states, and logged (not swallowed) failures everywhere.
6. **Consent is opt-in and primed.** Location and push are requested in context, explained, and user-triggered — never silently.
7. **Measure before optimizing matching.** Instrument apply→hire outcomes before retraining the ranking model.

---

## 4. The plan — phased implementation

Each phase is independently shippable and ordered by risk. **Phase 0 is mandatory before the app is exposed to anyone but the developer.** Effort estimates assume one experienced full-stack dev; `S` ≈ <½ day, `M` ≈ 1-2 days, `L` ≈ 3-5 days.

---

### Phase 0 — Stop the bleeding (security + honesty) · target: 2-3 days

Do this before any deploy, demo link, or shared URL.

**0.1 Gate or delete the credential-dump page (C1)** · `S`
- Delete `app/(marketing)/accounts/page.tsx`, or gate behind `process.env.NEXT_PUBLIC_DEMO_MODE === "true"` **and** `NODE_ENV !== "production"`.
- Add it to a middleware denylist that hard-404s in production.

**0.2 Fix the two IDOR RPCs (C3)** · `M`
- New migration `00XX_rpc_auth_uid.sql`: `create or replace` both functions to derive identity **inside** the function from `auth.uid()`, and remove the `p_actor_id` / `p_user_id` parameters.
  - `decide_application`: `if v_app.employer_id <> auth.uid() then raise exception 'not authorised'`.
  - `accept_instant_gig`: insert with `applicant_id = auth.uid()`, not a passed id.
- `REVOKE ALL ... FROM anon;` and `GRANT EXECUTE ... TO authenticated;` on both.
- Update call sites `app/(app)/interviews/[id]/actions.ts:16-20` and `app/actions/gigs.ts:17-20` to drop the id argument.
- Add an RLS/RPC regression test (see 6.4).

**0.3 Gate the mock-Singpass auth scheme behind an explicit demo flag (C2)** · `M`
- Wrap `mockSingpassSignIn`, `checkNricExists`, and the derived-credential path so they **throw/no-op unless `DEMO_MODE`** is set. In any non-demo build, the only login path should be a real provider (Phase 3.1) — never NRIC-derived passwords.
- Move the salt to `process.env.NRIC_HASH_SALT` (per-deployment secret) so it is at least not the public string `"hustle-sg"` in staging.
- Rate-limit / remove `checkNricExists` (the existence oracle).

**0.4 Truth-in-advertising sweep (C4/C5)** · `M`
- Remove or relabel every unearned trust claim until the real control exists:
  - "Payment held in SGD escrow / 14-day dispute window / IRAS-ready receipts" (`gigs/[id]/page.tsx:613-617`, `TrustPanel`) → remove, or replace with "Payments handled off-platform" until Phase 3.2.
  - "Payment escrow — SGD protected" hardcoded `ok:true` on profiles → remove.
  - "Verified" cert badge → relabel to **"Issuer self-reported"** and stop feeding self-declared certs into the ranking embedding until Phase 2.1.
  - Hardcoded match-breakdown numbers ("Portfolio 0.91 / Skills 0.88") and pre-verification "✓ Singpass verified" → show real values or nothing.

**0.5 Kill the self-serve verify button (C4)** · `S`
- Remove the "Mark verified" button (`CertificationsEditor.tsx:126-141`) and the `verifyCertification` self-write, or require a server-side issuer/registry check first.

**0.6 Patch dependencies (H4)** · `S`
- `npm audit fix`; upgrade `next` to the patched release on the 15.x line; update `form-data`, `ws`. Add `npm audit --audit-level=high` to CI.

**0.7 Close the two web vulns** · `S`
- Open redirect: validate `next` is a same-origin relative path (`next.startsWith("/") && !next.startsWith("//")`) at read time in `m/singpass/page.tsx` and `onboarding`.
- `javascript:` XSS: tighten the portfolio URL schema to `.refine(u => /^https?:\/\//i.test(u))` and re-check scheme at render in `PortfolioBento.tsx`.

**0.8 Add upload limits (H3)** · `S`
- New migration adding `file_size_limit` + `allowed_mime_types` to `portfolio-media`, `interview-responses`, `certifications` (match the pattern already used for `demo-videos`).
- Validate `contentType` + declared size in `app/api/storage/sign/route.ts` before minting the signed URL.

**Exit criteria:** no public credential exposure; RPCs enforce `auth.uid()`; no unearned trust claims in the UI; deps patched; open-redirect/XSS/upload-limit fixed. Add a `SECURITY.md` documenting the demo-mode boundary.

---

### Phase 1 — Engineering foundation & controls · target: 1 week

Make the codebase safe to change and safe to run.

**1.1 Generated Supabase types** · `M`
- `supabase gen types typescript --linked > lib/supabase/database.types.ts`; pass `<Database>` to both client factories; replace `lib/supabase/types.ts` with `Tables<"x">` / `Row` aliases. Eliminates ~90 `any` casts and the drift risk. Add `gen types` to CI to fail on drift.

**1.2 Restore lint** · `S`
- Add `eslint.config.mjs` extending `next/core-web-vitals` + `@typescript-eslint`; fix or ratchet existing violations; wire `npm run lint` into CI.

**1.3 Validated env module** · `S`
- Single `lib/env.ts` that zod-parses all env vars once at import and throws with a clear message; replace ad-hoc `process.env.X!` and the silent `"placeholder.supabase.co"` fallback. Add `import "server-only"` to the service-client module.

**1.4 Zod at every boundary** · `M`
- Add `.safeParse` schemas to every server action and route handler that takes external input, returning `{ ok, error }`. Priority: `updateApplicationStatus`, `submitRating`, `createInstantGig`, `app/api/storage/sign`, `app/api/push/subscribe`, `singpass` actions.

**1.5 Error handling & observability** · `M`
- Add `app/error.tsx` + `app/global-error.tsx` + branded `not-found.tsx`; add `error.tsx` per route group and `loading.tsx` to the ~48 routes missing one.
- Replace bare `.catch(() => {})` (7+ sites in `profile/edit/actions.ts`, plus `instant.ts:53` `return []` on error) with logged failures.
- Wrap the unguarded `JSON.parse` in `cert-parser.ts:82` and its second call site (`demo/actions.ts:15`) in try/catch.
- Wire **Sentry** (or equivalent) for server + client error tracking.

**1.6 Fix NRIC validation + its test** · `S`
- Implement the real SG NRIC checksum in `isValidNric`; the existing failing test (`tests/unit/nric.test.ts:21`) documents the expected behavior. Get the suite green.

**1.7 Rate limiting** · `M`
- Add a limiter (Upstash Ratelimit, or a Postgres token-bucket) keyed by `user.id` in front of all AI-invoking actions (`suggestSkills`, `addCertification`/`parseCertText`, embedding regeneration) and `push/subscribe`. Daily caps on cert-parse/embedding per user.

**1.8 CI gate** · `S`
- GitHub Actions: `typecheck` + `lint` + `test` + `audit` + `supabase gen types` diff check on every PR. Block merge on red.

**Exit criteria:** typed DB client, green lint + tests in CI, validated env, error boundaries live, errors logged not swallowed, rate limits on paid/abusable endpoints.

---

### Phase 2 — Trust & safety (the product's actual moat) · target: 1-2 weeks

**2.1 Real credential verification** · `L`
- Replace self-declared verification with one (ideally staged) of:
  1. **SkillsFuture / WSQ registry lookup** (the real integration the product implies) — server-side call, cache result, store `verification_method: "registry"` + evidence ref.
  2. **Manual review queue** — a separate admin surface (see 2.5) where staff approve/reject cert submissions; badge only granted on approval.
  3. **Document OCR + issuer cross-check** with a server-side confidence threshold.
- Harden `parseCertText` against prompt injection: strict system prompt, treat pasted text as untrusted data, use structured/tool output instead of `indexOf("{")` slicing, add retry (match `embeddings.ts`).
- Only registry/human-verified certs feed the ranking embedding.

**2.2 Two-way ratings & reviews, done right** · `M`
- Double-blind reveal (neither party sees the other's review until both submit or a deadline passes) to prevent retaliation; reminders; a "new / unproven" signal on zero-review profiles.
- Let the **freelancer** also trigger completion / rating so the loop isn't unilaterally gated by the employer.

**2.3 Reporting & blocking** · `M`
- `reports` table (reporter, target type user/gig/review, reason, status) + report UI on profiles, gigs, reviews; block-user capability that hides content and prevents application/messaging.

**2.4 Dispute path** · `M`
- Minimal `disputes` table + flow tied to a completed gig, with a status machine (open → under_review → resolved) and an admin queue. Only surface the "dispute window" copy once this exists.

**2.5 Admin / moderation surface** · `M`
- A separate, role-gated internal app/route (not reachable from normal user nav) for the verification queue, report triage, and disputes. Enforce via a dedicated admin role + RLS, ideally on a separate deployment/subdomain.

**Exit criteria:** the "verified," "reviewed," and "dispute-protected" claims are all real; bad actors can be reported, blocked, and adjudicated.

---

### Phase 3 — Core product gaps · target: 2-3 weeks

**3.1 Real authentication** · `L`
- Real Singpass/MyInfo OIDC (or, as an interim, Supabase email OTP / OAuth) replacing NRIC-derived credentials for non-demo builds. Keep the demo shim strictly behind `DEMO_MODE`.

**3.2 Payments & escrow** · `L`
- Stripe (Connect for payouts) with funds held until gig completion, a real dispute hold, and receipts — **or** a clear, permanent "payments handled off-platform" stance. Do not re-introduce the escrow copy without this.

**3.3 In-app messaging** · `L`
- Supabase Realtime channels scoped to an application/gig; unlock on shortlist or hire. This is the single biggest journey hole for real users.

**3.4 Application lifecycle controls** · `M`
- Freelancer **withdraw application**; employer **edit/delete gig** (currently only close, which auto-rejects everyone); fix misleading close-gig notification copy ("moved forward with other candidates" even on cancel); reconcile the "record if shortlisted" vs "record on apply" contradiction.

**3.5 Applicant triage** · `M`
- Turn the static status-count pills on `applicants/page.tsx` into real filters; add search/sort; paginate beyond `.limit(200)`.

**Exit criteria:** users can authenticate for real, communicate, transact (or are honestly told they can't), and control their own pipeline.

---

### Phase 4 — Architecture consolidation · target: 2-3 weeks (can overlap 2/3)

**4.1 Extract a domain layer** · `L`
- `lib/gigs/`, `lib/applications/`, `lib/profiles/` modules owning "apply to gig," "create gig," "decide application," "post rating." Desktop + mobile actions become thin adapters. Kills the `applyToGig`/`mobileApplyToGig` and `postGig`/`postGigMobile` duplication and the drift.
- Introduce a light repository/data-access module so raw `.from(...)` chains and the 49 `createServiceClient()` sites route through audited functions with a single documented RLS-bypass boundary.

**4.2 Collapse the three front-ends** · `L`
- Make the desktop `(app)` layouts responsive (replace inline hard-coded grids with token-driven, media-query/`clamp()` layouts) and add user-agent routing so phones on the apex domain get the mobile experience.
- Fill the `/m` route holes (`interviews`, `rate`, `profile/edit`, `onboarding`) so mobile users can record interviews and rate — or, preferably, retire the parallel `/m` tree in favor of one responsive app.
- Decide the fate of `(demo)/quick-demo` (10.4k LOC): either keep it strictly isolated and frozen, or rebuild the demo on seeded real data + real components. Do not grow it.

**4.3 Split oversized files** · `M`
- Extract pure logic from `DashboardCalendar.tsx` (date/slot math), `gigs/[id]/page.tsx`, `profile/[handle]/page.tsx`, `SwipeCardDeck.tsx` into tested `lib/` helpers + presentational components (<400 lines each).

**4.4 Data-layer hygiene** · `M`
- Add the missing indexes (§2.4); tighten `demo_sessions` / `demo-videos` RLS to per-session scoping; extract the triplicated hybrid-scoring SQL into one `hybrid_gig_score(...)` function; name the magic numbers (`0.8/0.2/0.3/0.7/15.0`, the two divergent `MIN_SCORE` 0.50/0.55).
- Add an embedding cache (hash the embedding input; skip the OpenAI call when unchanged).
- Remove the dead `@pinecone-database/pinecone` dependency (seed-only).

**Exit criteria:** one source of truth per business operation; responsive single app; indexed hot paths; no file >400 lines in runtime code.

---

### Phase 5 — UX, accessibility & consent · target: 1 week (fold in earlier where cheap)

**5.1 Consent priming** · `S`
- Replace silent geolocation (`GeolocationCapture.tsx`) and auto push (`PushAutoSubscribe.tsx`) with contextual priming cards ("See gigs near you" / "Get alerted when matched") that the user taps to trigger the OS prompt. The good explicit toggles (`NotificationsToggle`, `MobilePushToggle`) already exist — stop burning the one-shot prompt before them.

**5.2 Accessibility fixes** (highest-traffic controls first) · `M`
- `UserMenu` open on click with `aria-expanded`/`aria-haspopup` + keyboard (currently mouse-only → core nav unreachable for keyboard/touch).
- Star rating: `aria-label` per star + radiogroup semantics (`RateForm.tsx`).
- Replace placeholder-only labels with real `<label>`s on the desktop gig form and cert editor (the mobile form already does this right).
- Add captions/transcript for interview videos, or drop the "auto-transcribed" claim.

**5.3 Onboarding honesty & flow** · `S`
- Turn the static "steps" checklist into a live progress tracker with completion state; remove the manual "Skip to feed" dead-end; stop showing fabricated match/verification numbers to brand-new users.

**Exit criteria:** WCAG basics on core controls; consent is opt-in and primed; onboarding reflects the user's real state.

---

### Phase 6 — Matching quality & data (once there's signal) · target: ongoing

- Instrument apply→hire→rating outcomes; only then move from a single profile embedding toward a **two-tower user×gig model** trained on outcomes.
- Add explicit stacking filters (location, budget, category) on top of vector search; cold-start skills questionnaire; freshness decay on gigs.
- Add pgvector index tuning and revisit the 15 km linear decay with real distance-to-apply data.

---

## 5. Suggested sequencing & milestones

| Milestone | Contains | Gate |
|---|---|---|
| **M0 — Safe to share** | Phase 0 | No public credential leak, RPCs enforce `auth.uid()`, no unearned claims, deps patched |
| **M1 — Safe to change** | Phase 1 | Typed DB, green CI (lint+test+typecheck+audit), error boundaries, rate limits |
| **M2 — Trustworthy** | Phase 2 | Real verification, honest reviews, report/block/dispute + admin queue |
| **M3 — Complete product** | Phase 3 | Real auth, payments-or-honesty, messaging, lifecycle controls |
| **M4 — Maintainable** | Phase 4 | One implementation, responsive, indexed, no giant files |
| **M5 — Polished** | Phase 5-6 | Consent primed, a11y, matching instrumented |

Phases 2, 3, and 4 can run partly in parallel across contributors; 0 and 1 are strictly first.

---

## 6. Testing & quality strategy (cross-cutting)

Current coverage is ~15-20% with a **failing suite** and **smoke-only E2E**. Target the 80% bar from the team standards, weighted toward the money path and the trust logic.

1. **Unit** — NRIC checksum (fix + test), cert issuer whitelist, `parseCertText` with **adversarial malformed-JSON + prompt-injection fixtures**, extracted hybrid-scoring formula, Haversine, all extracted `lib/` domain functions.
2. **Integration** — every server action via `.safeParse` happy/sad paths; RLS policy tests (a user cannot read/write another user's rows); **RPC authorization tests** proving `decide_application`/`accept_instant_gig` reject a spoofed identity (regression for C3).
3. **E2E (Playwright)** — the full money path: sign-in → apply → employer shortlist → interview record → hire → rate; plus post-gig and withdraw. Add visual-regression at 320/375/768/1024/1440 and automated a11y checks (per the web testing standard).
4. **Security regression** — keep C1-C5 as explicit tests/checks so they can't silently return.
5. **CI** — block merge on typecheck, lint, unit+integration, `npm audit --audit-level=high`, and a types-drift check.

---

## 7. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Someone deploys current `main` to a public URL as-is | Med | Critical (account takeover, data exposure) | Phase 0 first; add a deploy checklist gating on M0 |
| "Escrow/verified" copy relied on by a real user before the control exists | Med | High (trust/legal) | Phase 0.4 truth sweep is P0, not P2 |
| Refactor breaks the working demo mid-hackathon | Med | Med | Land Phase 0 as small isolated PRs; keep demo-mode flag; CI gate |
| PDPA exposure from NRIC-derived, publicly-salted hashing | Med | High | Phase 0.3 gate + Phase 3.1 real auth; per-deployment secret salt meanwhile |
| Type generation surfaces latent runtime bugs hidden by `any` | High | Med (good pain) | Do 1.1 early, fix revealed bugs before feature work |

---

## 8. Immediate next actions (this week)

1. Land **Phase 0** as a stack of small PRs (0.1 → 0.8), each independently reviewable.
2. Add `SECURITY.md` + a deploy checklist that refuses production without M0.
3. Turn on CI with typecheck + a green test suite (fix NRIC checksum to unblock).
4. Decide the product's stance on **payments** (build Stripe vs "off-platform") and **auth** (real provider vs demo-only) — these two decisions shape Phases 2-3 and should be made now, not mid-build.

---

*Every file/line reference above was drawn from a code-grounded audit; the two highest-stakes findings (NRIC-derived credentials in `lib/singpass/nric.ts`, and the client-trusted RPC identity in `supabase/migrations/0006_full_poc.sql`) were re-verified directly against source while writing this plan.*
