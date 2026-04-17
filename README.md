# Hustle SG

Singapore-first gig platform for verified side hustlers. Singpass-style identity, WSQ/university credential verification, portfolio videos, async video interviews, AI-matched gigs, and a guided path to registering your own company.

## Stack

- **Next.js 15** (App Router, RSC, Server Actions) + **React 19**
- **Supabase** (Postgres + Auth + Storage + pgvector)
- **OpenAI** `text-embedding-3-small` for profile/gig embeddings
- **Anthropic Claude Haiku 4.5** for certification parsing
- **Tailwind CSS** with a custom OKLCH palette + editorial typography
- **Vitest** + **Playwright** for tests

## Features

| Flow | What it does |
|---|---|
| Mock Singpass login | SG NRIC checksum validation, face-scan animation over `MediaDevices.getUserMedia`, deterministic Supabase Auth session per hash |
| Profile + portfolio bento | Bento-grid public profile with video, website, writeup cells. Direct-to-storage signed uploads |
| Certification verification | Upload + paste-text; Claude extracts issuer/title/skills; whitelist-based verified badge |
| AI role matching | pgvector cosine similarity on 1536-dim embeddings. Profile + gig embeddings regenerated on save |
| Async video interview | Employer posts 1–3 questions; applicant records `MediaRecorder` → signed upload to private bucket |
| Entrepreneur onboarding | 4-stage checklist: decide entity type → reserve name → mock-ACRA register → post-reg guidance (CPF, GST, banks, bookkeeping) |

## Setup

```bash
npm install --legacy-peer-deps
cp .env.example .env.local
# Fill in:
#   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
#   OPENAI_API_KEY
#   ANTHROPIC_API_KEY
```

### Database

In the Supabase SQL Editor, run the migrations in order:

```
supabase/migrations/0001_init.sql
supabase/migrations/0002_pgvector.sql
supabase/migrations/0003_rls.sql
supabase/migrations/0004_storage_buckets.sql
```

### Seed

```bash
npm run seed
```

This creates 10 freelancers + 4 employers + 12 gigs with computed embeddings. Demo NRICs:

- `S1234567D` — Arif, product designer
- `S2345678H` — Priya, tuition teacher
- `S3456789A` — Wei Jie, full-stack dev
- `T0123456G` — Siti, emcee

### Dev

```bash
npm run dev
```

### Tests

```bash
npm test                # Vitest unit tests
npx playwright install  # first time only
npm run e2e             # Playwright smoke tests (requires dev server)
```

## Architecture

```
app/
├── (marketing)/                 Landing + entrepreneur guide
├── (auth)/singpass/             Mock Singpass flow
├── (auth)/onboarding/           Post-login onboarding
├── (app)/feed/                  AI-matched gigs
├── (app)/gigs/                  Browse + detail + post
├── (app)/interviews/[id]/       Record / review async interviews
├── (app)/profile/               Public + edit
└── api/storage/sign/            Signed upload URL endpoint

lib/
├── ai/                          Embeddings, vector match, cert parser
├── singpass/                    NRIC validation + mock MyInfo data
├── entrepreneur/                SG entity facts + reserved-term check
├── supabase/                    Client/server/service clients
└── db/                          Seed fixtures + runner

supabase/migrations/             SQL schema + pgvector + RLS
styles/tokens.css                OKLCH palette, editorial type
components/                      Organised by feature: profile, gig, video, singpass
tests/                           unit (Vitest), e2e (Playwright)
```

## Demo script

1. Visit `/` → click *Get verified with Singpass*
2. Enter `S1234567D` → camera prompt appears → scan animation → land on `/onboarding`
3. Click *Finish your profile* → profile prefilled from mock MyInfo
4. Navigate to `/feed` → AI-ranked gigs with "X% match" and skill overlap tooltip
5. Open a gig → *Apply* → record short video answers
6. In another session, log in as `M1023456L` (employer `kopitiam_co`) → *Dashboard* → review applicant video
7. Any time: `/start-a-business` → walk through sole-prop vs Pte Ltd, mock-reserve a name, mock-register for a fake UEN

## Security notes

- NRICs are hashed (SHA-256 + salt). Raw NRIC never persisted.
- All tables have RLS. Storage buckets have per-user prefix policies.
- Interview responses live in a private bucket. Employer playback uses short-lived signed URLs.
- No raw API keys in client code. All AI calls run server-side.
- Mock Singpass is NOT real identity verification and is disabled in any production deployment.
