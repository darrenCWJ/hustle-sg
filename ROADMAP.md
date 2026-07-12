# HustleSG — Forward Roadmap

> The original [IMPROVEMENT_PLAN.md](IMPROVEMENT_PLAN.md) phases (0–6) are
> implemented. This document is the living plan for what comes next, in
> priority order. Update it when items land (see CLAUDE.md docs rule).

## Now (this iteration)

- [x] **Fraud model evaluation loop** — admin verdicts on flagged pairs become
  ground-truth labels; precision / recall / F1 computed against them; tunable
  score weights + alert threshold, all managed in the admin UI (no code, no
  SQL). Retune guidance surfaces automatically when F1 degrades.
- [x] **Admin manageability** — `/admin/settings`: view current admins,
  promote/revoke by handle (first admin still via SQL — someone must bootstrap),
  fraud model controls. Every queue (reports, certs, disputes, errors, fraud)
  is button-driven.
- [x] **Enforcement teeth** — ratings between a *confirmed*-fraud pair stop
  counting toward public averages and employer track records.

## Next (high value, no external dependencies)

- [x] **E2E money-path test** — `tests/e2e/money-path.spec.ts`: post → apply →
  shortlist → message → hire → complete → double-blind mutual rate, driven
  through the real UI with two browser contexts. Passing (~30s).
- [x] **Availability-aware push targeting** — instant AND regular gig alerts
  skip freelancers whose calendar says they're busy (users without a calendar
  are never penalised); feed ranking gives fitting gigs a small ordering boost.
- [x] **Dashboard calendar consistency** — `DashboardCalendar` now uses the
  shared hour/duration fit helper, so calendar, feed badge and push targeting
  all agree.
- [x] **Repost polish** — reposts carry the schedule *shape* (days, working
  window, duration, cadence) but never dates or deadlines.
- [x] **Admin fraud actions, phase 2** — confirming a pair suspends them from
  matching with each other (migration 0042, lifted automatically if re-marked
  legitimate), and both parties are notified with an appeal path.

## Later (needs data, accounts, or product decisions)

- [ ] **Learned fraud model** — replace the weighted score with a trained
  classifier once labeled verdicts reach a meaningful volume (~100+). The
  evaluation harness (labels, F1 tracking, threshold management) already
  exists, so this is a model swap, not a rebuild. `match_events` +
  `fraud_reviews` are the training set.
- [ ] **Matching quality (Phase 6)** — two-tower ranking trained on
  `match_events` outcomes; freshness decay; cold-start questionnaire.
- [ ] **Payments** — Stripe Connect escrow (needs account + keys) or keep the
  documented off-platform stance.
- [ ] **Real Singpass/MyInfo OIDC** — needs government onboarding; email OTP
  remains the interim.
- [ ] **Front-end consolidation** — retire `/m` in favour of one responsive
  app. ~~Split the two oversized components~~ done: pure grid math lives in
  `lib/availability/calendar-grid.ts` (tested), the deck in
  `deck-utils.ts` + `GigCard` + `EmptyDeck` + `DeckOverlays`, the calendar in
  `DashboardCalendar` + `CalendarGigCards`.
- [ ] **Ops** — Sentry DSN (optional; first-party store exists), custom SMTP,
  leaked-password toggle (Supabase dashboard). CI has an opt-in E2E job:
  set repo variable `RUN_E2E=true` + `E2E_SUPABASE_URL` /
  `E2E_SUPABASE_ANON_KEY` secrets.

## Model health playbook (for non-technical admins)

`/admin/fraud` shows the numbers; here's how to read them:

- **Precision** — of the pairs the model flagged, how many did you confirm as
  real fraud? Low precision = too many false alarms → raise the threshold or
  lower a noisy signal's weight.
- **Recall** — of the fraud you confirmed, how much did the model flag on its
  own? Low recall = it misses rings → lower the threshold or raise weights.
- **F1** — the balance of both (harmonic mean). **Rule of thumb: with 10+
  labeled pairs, F1 below 0.6 means the current weights no longer describe
  real behaviour — retune weights/threshold in the settings panel. If tuning
  can't recover F1, the model needs a rebuild (see "Learned fraud model").**
- Every verdict you record makes the evaluation more trustworthy and becomes
  training data for the future learned model.
