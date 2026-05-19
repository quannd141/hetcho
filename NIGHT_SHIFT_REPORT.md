# 🌙 Night Shift Report — 2026-05-20 (Run #5)

**Sprint context**: Tech-debt sweep after Sprint 4 BE-Real-Wire
**Branch**: `night-shift/ui-demo-20260516` (continuation, now 31 commits)
**Mode**: NIGHT_SHIFT_MODE — mock + local Postgres only, no remote push

> Earlier night-shift reports archived at `NIGHT_SHIFT_REPORT.sprint-0.md`, `.sprint-1.md`, `.sprint-2.md`. Run #4 UI demo report content is now superseded — see `UI_DEMO_WALKTHROUGH.md` for the demo flow context.

---

## Summary

✅ **Done**: 6 / 6 stories
🟡 **Partial**: 0
⏸️ **Skipped**: 0 (no story tonight needed founder credential)
🧪 **Tests**: 104 → 127 passing (+23 net new), 7 Drizzle integration skipped by default
   - Final count: **127/127** under both `TZ=UTC` and `TZ=Asia/Ho_Chi_Minh` ✅

## Done Stories

| Story | Commit | What |
|---|---|---|
| S1 TZ-fragile fix | `24fec7c` | New `shared/utils/tz.ts` (Intl.DateTimeFormat helpers: `tzWeekday`, `tzHHMM`, `tzYMD`, `tzHHMMToUtc`). Refactored `isWithinWorkingHours`, `Tenant.isPeakSlot`, `GetAvailabilitySlotsUseCase` to use `tenant.timezone`. **4 previously-fragile tests now pass under UTC.** |
| S3 Working hours validation | (merged into S1) | `GetAvailabilitySlots` now correctly enforces `slot ⊆ workingHours` regardless of server TZ. |
| S2 Availability use case tests | `d71fd62` | 9 unit tests: weekday open/close, closed Sunday, peak boundary at 14:00, confirmed booking blocks slots, cancelled/no_show ignored, NotFound, custom slotMinutes, no-overrun for 90-min service. |
| S4 Drizzle repo integration | `ba2fc2f` | 7 tests against local Postgres, gated by `INTEGRATION_TESTS=true` + `DATABASE_URL`. Uses `ffff-` UUID prefix to avoid seed collision; refactored `db/client.ts` to expose `createClientWithHandle({ db, end })`. |
| S5 Review domain entity | `793a48b` | Removed `apps/web/src/lib/reviews-store.ts` (globalThis Map). Added `Review` entity (rating 1-5, comment ≤500), `ReviewRepository` port, `InMemoryReviewRepository`, `DrizzleReviewRepository`, `reviews` schema + migration `0001_fresh_moondragon.sql` (applied to local DB). Route refactored to use container. |
| S6 Webhook idempotency | `3ba3737` | 7 tests on `MarkDepositPaidUseCase`: double-webhook (same txn), rogue duplicate (different txn), late-after-cancel, cross-tenant, ghost booking, overpayment accepted, audit payload preserves `gatewayTxnId`. |

## Verification

- `TZ=UTC pnpm vitest run` → **127 PASS / 7 skipped** ✅
- `TZ=Asia/Ho_Chi_Minh pnpm vitest run` → **127 PASS / 7 skipped** ✅
- `DATABASE_URL=... INTEGRATION_TESTS=true pnpm vitest run drizzle.integration` → **7 PASS** ✅
- `pnpm --filter @hetcho/db db:generate` → emits `0001_fresh_moondragon.sql` cleanly
- `db:migrate` applied to local `hetcho` DB → `reviews` table created with FKs + 2 indexes

## Skipped

None tonight — every planned story was doable without founder credentials.

## 3-Gate Sprint Review

**Not run tonight** — this was a tech-debt sweep, not a sprint close. Sprint 3 sprint-end-review still stands as the most recent gate result (`SPRINT_END_REVIEW.md`, CLOSE on 2026-05-19). The 3 tech-debt carry-overs from that review are now resolved:

- ✅ TZ-fragile demo-tenants tests → fixed at the domain layer (not just test fixtures)
- ✅ GetAvailabilitySlotsUseCase unit tests → 9 tests added
- ✅ Review domain entity → replaces globalThis Map, persistable

## Khuyến nghị sáng mai user nên làm (theo thứ tự)

1. **Review the migration** for safety: `git show 793a48b -- packages/db/drizzle/0001_fresh_moondragon.sql` — sanity-check before any future remote DB application
2. **Verify locally**: `pnpm --filter @hetcho/web dev` (with `USE_REAL_DB=true DATABASE_URL=...`), then test review flow on Mini App
3. **Run full suite**: `TZ=UTC pnpm vitest run` — should show 127/134 (7 Drizzle integration skipped)
4. **Optional integration verification**: `DATABASE_URL=... INTEGRATION_TESTS=true pnpm vitest run drizzle.integration` → 7 PASS
5. **PENDING_HUMAN.md unchanged**: PH-002 (Zalo OA), PH-003 (VNPay), PH-004 (domain), PH-005 (observability), PH-008/009 (pilot users) — still founder-action items. No new pending entries added tonight.

## Issues & Decisions tôi đã tự quyết (user check lại)

- **`drizzle-orm` added to infra package deps** (was implicit via `@hetcho/db`; vitest can't resolve transitive). Same-version `^0.30.10` pinned.
- **`packages/db/client.ts` API extension**: kept `createClient()` returning bare drizzle instance (existing callers untouched); added `createClientWithHandle()` for tests that need to release the pool.
- **Test UUID prefix `ffff-`** for Drizzle integration tests — chosen to not collide with seed prefixes `1111/2222/3333/`.
- **Review entity invariants**: trims whitespace on `comment`, but does NOT enforce one-review-per-booking at the domain layer; enforced by `reviews_booking_idx` UNIQUE index + `onConflictDoUpdate` (last write wins; preserves original `id`/`createdAt` for re-reviews).
- **`Tenant.timezone` getter** added to entity (was only in props). Now read by `Application.create-booking`, `Application.walk-in-booking`, `Application.get-availability-slots` instead of digging into `toJSON()`.

## Không làm gì

- ❌ KHÔNG deploy production
- ❌ KHÔNG push remote (commits stay on local `night-shift/ui-demo-20260516`)
- ❌ KHÔNG gọi API thật (Mock* adapters still in container)
- ❌ KHÔNG DROP DATABASE (guardrail blocked the test-DB cleanup attempt — used row-level cleanup with ffff-prefix UUIDs instead, correct call by the guardrail)
- ❌ KHÔNG commit secrets (.env.local stays gitignored)

## 🧠 Context Checkpoint

- Estimate context: 🟡 ~55% (6 stories, ~30 file reads/writes, ~12 test runs)
- This session is a continuation after `/compact` from a prior compaction
- Khuyến nghị sáng mai user: nếu tiếp tục coding sprint → có thể `/compact` lại trước khi dispatch tiếp

---
_Generated by night-shift skill @ 2026-05-20_
