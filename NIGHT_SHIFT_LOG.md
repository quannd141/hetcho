# Night Shift Log — Run #5 (Sprint 4+ tech debt)

**Date**: 2026-05-20
**Branch**: `night-shift/ui-demo-20260516` (continuation)
**Mode**: NIGHT_SHIFT_MODE=true (mock + local Postgres OK)

## Budget
- Max stories: 6
- Max time/story: 25 min
- Max retries: 3

## Stories

- [x] S1 Fix 4 TZ-fragile tests in demo-tenants.test.ts → fixed at domain layer via shared tz helpers (commit 24fec7c)
- [x] S2 Unit tests for GetAvailabilitySlotsUseCase → 9 tests (commit d71fd62)
- [x] S3 Working hours validation → merged into S1
- [x] S4 Drizzle repository integration tests (local Postgres) → 7 tests gated by env (commit ba2fc2f)
- [x] S5 Review → proper domain entity + Drizzle repo → entity+port+InMem+Drizzle+migration+route refactor (commit 793a48b)
- [x] S6 Webhook idempotency tests (mock VNPay retry) → 7 tests (commit 3ba3737)

## Skipped (need PH-002/003)
- Real Zalo OA wire
- Real VNPay webhook
- Production deploy

## Result
- 6/6 stories done
- 127 tests pass (was 104) under TZ=UTC and TZ=Asia/Ho_Chi_Minh
- 5 atomic night-shift commits
