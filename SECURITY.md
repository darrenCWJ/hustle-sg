# Security — HustleSG

> Status: hackathon demo. **Do not deploy this app to a public URL for real users
> without reading this document.** The controls below map to
> [IMPROVEMENT_PLAN.md](IMPROVEMENT_PLAN.md) findings C1–C5 / H1–H4.

## The demo-mode boundary

HustleSG's authentication is a **mock Singpass flow** that derives Supabase Auth
credentials deterministically from an NRIC (`lib/singpass/nric.ts`). This is
**insecure by design** — anyone who knows a valid NRIC can compute the same
credentials — and exists only so the hackathon demo works without a real
identity provider.

Everything that depends on that scheme is gated behind a single flag:

| Surface | File | Behaviour when `NEXT_PUBLIC_DEMO_MODE=false` |
|---|---|---|
| Mock Singpass sign-in | `app/(auth)/singpass/actions.ts` | Returns an error; no derived-credential login |
| `/singpass` + `/m/singpass` pages | layout/page gates | Redirect to `/login` (email OTP) |
| NRIC existence check | `checkNricExists` (same file) | Always returns `false` (no NRIC oracle) |
| `/accounts` credential list | `app/(marketing)/accounts/page.tsx` | Hard 404 |

`DEMO_MODE` defaults to **on** (`lib/config/demo.ts`) so the demo runs out of
the box. Any non-demo deployment must:

1. Set `NEXT_PUBLIC_DEMO_MODE=false`.
2. Set `NRIC_HASH_SALT` to a per-deployment secret (the default salt is the
   public string `"hustle-sg"`, kept so seeded demo accounts keep working).
3. Authentication outside the demo is **email OTP** (`/login`,
   `app/(auth)/login/` — Supabase `signInWithOtp`, per-address rate limited).
   OTP proves email ownership only: profiles created this way have no
   `singpass_verified_at` and never show identity-verified badges. For
   production, configure custom SMTP in the Supabase dashboard and plan the
   real Singpass/MyInfo OIDC integration (IMPROVEMENT_PLAN.md Phase 3.1).

## Controls in place

- **RPC authorization (C3)** — `decide_application` and `accept_instant_gig`
  derive identity from `auth.uid()` inside the function and are not executable
  by `anon` (migration `0024_rpc_auth_uid.sql`).
- **RLS** — enabled on every table; storage buckets for portfolio, interviews
  and certs are ownership-scoped.
- **No self-serve verification (C4)** — users cannot mark their own
  certifications verified. Two real paths exist: **OpenCerts** documents are
  cryptographically verified server-side (integrity + issuance status +
  issuer identity, `lib/certs/opencerts.ts`) and earn the badge instantly;
  everything else stays `pending` until an admin approves it in the
  `/admin/certs` review queue. Every decision is written to
  `cert_verification_log`.
- **Truth in advertising (C5)** — the UI makes no escrow / dispute-window /
  IRAS-receipt claims; payments are stated as arranged off-platform.
- **Open redirect** — all `next` redirect params pass through
  `lib/security/safe-redirect.ts` (`safeNext`).
- **Link scheme XSS** — portfolio links are restricted to `http(s)` at both
  validation (`lib/security/url.ts`) and render (`PortfolioBento`).
- **Uploads (H3)** — buckets enforce `file_size_limit` + `allowed_mime_types`
  (migration `0025`); `app/api/storage/sign` re-checks type/size before
  minting a signed URL and rejects cross-origin requests.
- **Rate limiting** — AI-invoking actions (cert parse, skill suggest, gig post)
  are throttled per user via a Postgres fixed-window limiter
  (`lib/security/rate-limit.ts`, migration `0027`). Fails open by design: it is
  a cost guard, not an auth control.
- **Security headers** — `next.config.mjs` sets `X-Frame-Options: DENY`,
  `nosniff`, HSTS, referrer policy, and same-origin-only camera/mic/geo.
- **Route handlers** — `push/subscribe` and `storage/sign` validate bodies with
  Zod and reject cross-origin requests (`lib/security/origin.ts`).
- **Trust & safety** — report + block (enforced in SQL matching, list surfaces,
  applying and messaging), double-blind reviews (reveal gate in RLS), disputes
  with admin-only state transitions, and a role-gated `/admin` surface
  (promoted via SQL only, 404s for everyone else).
- **Error visibility** — server captures and client error-boundary reports
  land in the service-role-only `app_errors` table (`/admin/errors`); the
  client reporting action is rate-limited so error loops can't flood it.

## Known gaps (accepted for the demo)

- Mock auth (above) — the demo identity layer is insecure by design; email
  OTP is the non-demo path and proves email ownership only.
- `demo_sessions` has a permissive anonymous policy by design (session-code
  access); it is constrained to the demo's ID format and a 200 KB state cap —
  do not reuse it for real data.
- Payments are off-platform: HustleSG holds no funds, so escrow/dispute-hold
  claims are deliberately absent from the UI.

## Deploy checklist (gate on milestone M0)

- [ ] `NEXT_PUBLIC_DEMO_MODE=false`
- [ ] `NRIC_HASH_SALT` set to a unique secret
- [ ] Real auth provider wired (Phase 3.1)
- [ ] `npm audit --audit-level=high` clean
- [ ] `npm run typecheck && npm run lint && npm test` green
- [ ] Supabase security advisors reviewed (`get_advisors`)
- [ ] Service-role key present only in server env (never `NEXT_PUBLIC_*`)

## Reporting

This is a hackathon project; report issues by opening a GitHub issue on the
repository.
