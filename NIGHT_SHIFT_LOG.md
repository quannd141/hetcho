# Night Shift Log — Run #8 (Sprint 6 mock-doable: Reminder + Recovery — F5)

**Date**: 2026-05-20
**Branch**: `night-shift/ui-demo-20260516` (continuation, 36 commits)
**Mode**: NIGHT_SHIFT_MODE=true (mock + local Postgres OK, no remote push, no live API)
**Trigger**: user typed "next sprint" after Run #7

## Budget
- Max stories: 5
- Max time/story: 30 min
- Max retries: 3

## Stories

- [x] S1 `Customer.lastVisitAt` (nullable, monotonic) + `recordVisit(at)` + 4 new tests
- [x] S2 `FindCustomersForRecoveryUseCase` (audit-event-driven, 30/60/90 ±1 day) + 5 use-case tests
- [x] S3 `GET /api/cron/recovery[?buckets=30,60,90&toleranceDays=1]` cron route
- [x] S4 Wire `customer.recordVisit(at)` into `CompleteBookingUseCase` (inside UoW, idempotent via monotonic guard)
- [ ] S5 Idempotent reminders use case — **deferred** (existing `/api/cron/reminders` works; extracting to UC + idempotency via audit-lookup needs design call — keep as-is for now)

## Skipped
- Drizzle migration for `last_visit_at` column on `customers` table — same defer reasoning as Run #7 (needs founder daytime review)
- Reminder UC extraction (Sprint 7 polish)

## Result
- 4/4 selected stories done (S5 explicitly out of scope tonight)
- 183 → **192 tests pass** under both `TZ=UTC` and `TZ=Asia/Ho_Chi_Minh`
- 1 atomic night-shift commit
