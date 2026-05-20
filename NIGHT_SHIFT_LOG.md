# Night Shift Log — Run #6 (Sprint 4 mock-doable)

**Date**: 2026-05-20
**Branch**: `night-shift/ui-demo-20260516` (continuation)
**Mode**: NIGHT_SHIFT_MODE=true (mock + local Postgres OK, no remote push, no live API)
**Trigger**: user typed "next sprint" after Run #5

## Budget
- Max stories: 4
- Max time/story: 30 min
- Max retries: 3

## Stories

- [x] S1 AutoReleaseStalePendingUseCase + cron `/api/cron/auto-release` → 6 tests (commit 0721b88)
- [x] S2 AutoMarkNoShowUseCase + cron `/api/cron/no-show` → 6 tests (commit 0721b88, bundled)
- [x] S3 VNPay HMAC-SHA512 signature + VnpayPaymentGateway adapter → 19 tests (commit 22b8c0f)

## Skipped (need founder credentials)
- VNPay sandbox real-wire (PH-003) — adapter ready, container still on MockPaymentGateway
- Google Calendar sync (PH-007) — needs OAuth client
- Supabase DrizzleRepo swap (PH-001) — already swappable via USE_REAL_DB env

## Result
- 3/3 stories done
- 158 tests pass (was 127) under TZ=UTC and TZ=Asia/Ho_Chi_Minh
- 2 atomic night-shift commits
