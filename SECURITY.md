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
| NRIC existence check | `checkNricExists` (same file) | Always returns `false` (no NRIC oracle) |
| `/accounts` credential list | `app/(marketing)/accounts/page.tsx` | Hard 404 |

`DEMO_MODE` defaults to **on** (`lib/config/demo.ts`) so the demo runs out of
the box. Any non-demo deployment must:

1. Set `NEXT_PUBLIC_DEMO_MODE=false`.
2. Set `NRIC_HASH_SALT` to a per-deployment secret (the default salt is the
   public string `"hustle-sg"`, kept so seeded demo accounts keep working).
3. Wire a real authentication provider (IMPROVEMENT_PLAN.md Phase 3.1) —
   with demo mode off there is **no** login path until one exists.

## Controls in place

- **RPC authorization (C3)** — `decide_application` and `accept_instant_gig`
  derive identity from `auth.uid()` inside the function and are not executable
  by `anon` (migration `0024_rpc_auth_uid.sql`).
- **RLS** — enabled on every table; storage buckets for portfolio, interviews
  and certs are ownership-scoped.
- **No self-serve verification (C4)** — users cannot mark their own
  certifications verified; new certs are always `pending` until a real
  issuer/registry check exists (Phase 2.1).
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

## Known gaps (accepted for the demo)

- Mock auth (above) — the entire identity layer is demo-grade.
- `demo_sessions` table and `demo-videos` bucket have permissive RLS
  (`USING (true)`) — demo infrastructure, do not reuse for real data
  (Phase 4.4 tightens this).
- No messaging/report/block/dispute mechanisms yet (Phase 2–3).
- Certificate "verification" is pending-only; no registry integration yet
  (Phase 2.1).

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
