# HustleSG

Singapore-first gig platform for verified side hustlers. Mock Singpass identity, WSQ/university credential verification, AI-matched gigs with distance-aware scoring, instant gig board with push notifications, async video interviews, and a guided path to registering your own company.

## Stack

- **Next.js 15** (App Router, RSC, Server Actions) + **React 19**
- **Supabase** (Postgres + Auth + Storage + pgvector)
- **OpenAI** `text-embedding-3-small` for profile/gig embeddings
- **Anthropic Claude Haiku 4.5** for certification parsing
- **Web Push / VAPID** for push notifications when phone is closed
- **Tailwind CSS** with a custom OKLCH palette + editorial typography
- **Vitest** + **Playwright** for tests

## Features

| Flow | What it does |
|---|---|
| Mock Singpass login | NRIC format validation, deterministic Supabase Auth session per SHA-256 hash, mock MyInfo prefill for 4 demo identities |
| Profile + portfolio bento | Bento-grid public profile with video, website, writeup cells. Direct-to-storage signed uploads |
| Certification verification | Upload + paste-text; Claude Haiku extracts issuer/title/skills; whitelist-based verified badge for NUS, NTU, SMU, SkillsFuture SG, and others |
| AI role matching | pgvector cosine similarity on 1536-dim embeddings. Hybrid scoring: skill gigs = 80% cosine + 20% distance; no-skill gigs (dog walking, errands) = 30% cosine + 70% distance |
| Distance-aware feed | Haversine distance computed in Postgres, no PostGIS. Linear decay 1.0 → 0.0 over 15 km. Distance badge shown on every feed card |
| Silent geolocation capture | On first feed visit, browser location is captured silently and persisted to the profile. Updates match scoring automatically |
| Instant gig board | Time-urgent gigs (now / today / weekend) with one-tap accept. Push notifications sent to top-matched nearby freelancers when a new instant gig is posted |
| Web push notifications | Service worker + VAPID. Permission requested automatically during onboarding for freelancers. Notifications delivered even when the app is closed |
| 3D vector map | Server-side PCA reduces 1536-dim embeddings to 3D. Interactive Three.js globe shows where profiles and gigs cluster in semantic space. Revalidates every 30 s |
| Async video interview | Employer posts 1–3 questions; applicant records `MediaRecorder` → signed upload to private bucket |
| Employer rehire / direct offer | Employers can send direct offers to previously hired freelancers from their dashboard |
| Application deadlines | Gigs show a "Closed" badge past their deadline. `npm run extend-deadlines` keeps all open gigs live for demos |
| Entrepreneur onboarding | 4-stage checklist: decide entity type → reserve name → mock-ACRA register → post-reg guidance (CPF, GST, banks, bookkeeping) |
| Test accounts page | `/accounts` lists all 22 seeded identities with computed login credentials and quick links to demo pages |

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:you@example.com
PINECONE_API_KEY=          # optional — Pinecone sync only
PINECONE_INDEX=            # optional
```

### Database

```bash
npx supabase db push
```

Or run migrations manually in the Supabase SQL Editor in order from `0001_init.sql` to `0013_profile_location.sql`.

### Seed

```bash
npm run seed          # 12 freelancers + 5 employers + 16 gigs + embeddings
npx tsx lib/db/seed-personal.ts   # 5 residents + 12 regular + 18 instant gigs
npm run extend-deadlines          # set all open gig deadlines to end of month
```

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
├── (marketing)/                 Landing, vector map, test accounts page
├── (auth)/singpass/             Mock Singpass flow
├── (auth)/onboarding/           Post-login role picker + push permission prompt
├── (app)/feed/                  AI + distance matched gigs, silent geolocation capture
├── (app)/instant/               Instant gig board (now / today / weekend)
├── (app)/gigs/                  Browse + detail + post
├── (app)/dashboard/             Employer dashboard, rehire, direct offers
├── (app)/interviews/[id]/       Record / review async interviews
├── (app)/profile/               Public + edit
└── api/push/subscribe/          Web Push subscription endpoint

lib/
├── ai/                          Embeddings, hybrid distance+vector match, cert parser
├── singpass/                    NRIC format validation + mock MyInfo data
├── push/                        VAPID push notification dispatch
├── entrepreneur/                SG entity facts + reserved-term check
├── supabase/                    Client/server/service clients + hand-written types
└── db/                          Seed fixtures + runners + deadline updater

supabase/migrations/             SQL schema, pgvector, RLS, haversine helpers
components/
├── location/GeolocationCapture  Silent browser location → profile
├── notifications/               Push toggle + auto-subscribe on onboarding
├── nav/, profile/, gig/, video/ Feature-scoped components
styles/tokens.css                OKLCH palette, editorial type scale
```

## Seeded identities

All 22 test accounts are listed at `/accounts`. Quick reference:

| NRIC | Handle | Role |
|------|--------|------|
| S1111111A | aisha_ml | ML Engineer |
| S2222222B | jun_wei | Full-stack |
| S3333333C | nadia_ux | UX Designer |
| S4444444D | ravi_motion | Motion Designer |
| S5555555E | priya_tutor | H2 Tutor |
| S6666666F | marcus_psle | PSLE Tutor |
| T0111111G | siti_emcee | Emcee |
| T0222222H | jasmine_events | Event Coord |
| S7777777I | jayden_video | Videographer |
| S8888888J | chef_hafiz | Caterer |
| S9090909K | eden_tiktok | TikTok Creator |
| S1010101L | zara_copy | Copywriter |
| M1001001A | techsg_ventures | Employer |
| M2002002B | nova_studio | Employer |
| M3003003C | brightmind | Employer |
| M4004004D | sunrise_events | Employer |
| M5005005E | kopicraft | Employer |
| S9012345I | lim_amk | Resident (AMK) |
| S8765432Z | rajan_bv | Resident (Bishan) |
| S7654321F | tan_sengkang | Resident (Sengkang) |
| S6543210B | aaron_cl | Resident (Clementi) |
| S5432109J | siti_bd | Resident (Bedok) |

## Demo script

1. Visit `/accounts` → pick any freelancer identity
2. Go to `/singpass` → Password login tab → enter the NRIC → log in
3. Feed loads at `/feed` with AI + distance ranked gigs and match % badges
4. Log in as `M1001001A` (employer) in a second tab → post a new gig
5. The first account receives a push notification (if browser permission was granted during onboarding)
6. Visit `/vector-map` → see all profiles and gigs as dots in 3D semantic space
7. Visit `/instant` → view time-urgent gigs with urgency badges
8. Any time: `/start-a-business` → sole-prop vs Pte Ltd wizard

**Fresh account flow:**
1. `/singpass` → enter any NRIC like `S1234567A` + your name
2. Pick role → browser asks for notification permission
3. Your profile embedding is generated immediately — you appear on `/vector-map`
4. When any employer posts a matching gig, you receive a push notification

## Security notes

- NRICs are hashed (SHA-256 + salt `hustle-sg`). Raw NRIC never persisted.
- All tables have RLS. Storage buckets have per-user prefix policies.
- Interview responses live in a private bucket. Employer playback uses short-lived signed URLs.
- No raw API keys in client code. All AI calls run server-side.
- Mock Singpass is NOT real identity verification. Not for production use.
