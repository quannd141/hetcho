# 🌙 Night Shift Report — 2026-05-20 (Run #7)

**Sprint context**: Sprint 5 mock-doable slice (Tier + Liệu trình — F4)
**Branch**: `night-shift/ui-demo-20260516` (continuation, 35 commits)
**Mode**: NIGHT_SHIFT_MODE — mock + local Postgres, no remote push
**Trigger**: user typed "next sprint" after Run #6

> Run #5/#6 reports preserved in git at commits `2014f8c` (Run #5) and `bf22373` (Run #6).

---

## Summary

✅ **Done**: 3 / 4 planned stories (S4 Drizzle defer was a self-call — see Decisions)
🟡 **Partial**: 0
⏸️ **Deferred**: Drizzle PackageRepository (needs schema migration + integration tests + founder review)
🧪 **Tests**: 158 → **183 passing (+25 net new)**, 7 Drizzle integration skipped
   - Final: **183/183** under both `TZ=UTC` and `TZ=Asia/Ho_Chi_Minh` ✅

## Done Stories

| Story | Commit | What |
|---|---|---|
| S1 Package + PackageUsage entities | `efb01b7…` (HEAD~1) | `Package` (catalog: tenant-scoped, name/totalSessions/priceVnd/validityDays, deactivate invariant) + `PackageUsage` (purchased instance: sessionsTotal/remaining, expiresAt = purchasedAt + validityDays, status `active`/`expired`/`depleted`, consumeSession invariants — throws on expired/depleted/double-consume by same booking). Repository ports defined. `PackageUsageId` branded type added. 14 entity tests cover validation matrix, state transitions, idempotency. |
| S2 InMemory repos + use cases | (same commit) | `InMemoryPackageRepository` (findById/findByTenant({activeOnly})/findByService) + `InMemoryPackageUsageRepository` (findById/findActiveForCustomer/findExpiringSoon). 3 use cases: `BuyPackageUseCase` (price override for discount), `ConsumePackageSessionUseCase` (audit + state check), `NotifyExpiringPackagesUseCase` (audit-event-driven — ZNS dispatch is a subscriber, not a direct dep). 11 use-case tests cover happy paths + cross-tenant + double-consume + window filters. |
| S3 Cron endpoint + container wire | (same commit) | `GET /api/cron/package-expiring[?windowDays=7]` iterates tenants, returns `{ totalNotified, perTenant: [...] }`. Container now exposes `packages`, `packageUsages`, `packageDeps`. |

## Verification

- `TZ=UTC pnpm vitest run` → **183 PASS / 7 skipped** ✅
- `TZ=Asia/Ho_Chi_Minh pnpm vitest run` → **183 PASS / 7 skipped** ✅
- `pnpm --filter @hetcho/web exec tsc --noEmit` → 7 pre-existing errors in unrelated files (walk-in/page.tsx, customer-session.ts, booking.actions.ts — all pre-Run #7). **No new typecheck errors from this run's changes.**

### Newly-callable HTTP routes
- `GET /api/cron/package-expiring[?windowDays=7]` — daily expiring notifier

## Skipped / Deferred

- **S4 Drizzle PackageRepository** (intentional defer). Existing schema in `packages/db/src/schema/packages.ts` has `customer_packages` and `package_usages` tables but they're missing 3 columns the new domain entity stores: `sessionsTotal`, `pricePaidVnd`, `status` (enum active/expired/depleted). Also the existing `package_usages` table is a per-booking consumption log table; my entity stores `consumedBookingIds` inline as an array — choosing between **(a)** keep normalized table and write 2-table repo, or **(b)** drop `package_usages` and use a JSONB column, is a design call best made awake with founder. **Recommended path**: option (b) — JSONB simpler, RLS easier, and no real users yet.
- Mini App progress bar UI (Sprint 7 per plan)
- Auto-tier-recompute cron — `Customer.recordBooking` already auto-tiers; the cron in the plan is a "retroactive recompute" safety-net, not load-bearing
- Real Zalo OA / VNPay / GCal wiring (PH-002/003/007 still blocked)

## 3-Gate Sprint Review

**Not run tonight** — Sprint 5 only ~40% complete (mock-doable slice + Drizzle deferred). Sprint 4 sprint-end-review still pending (was implicitly closed at Run #6 by 158/158 green tests across both TZ).

## Khuyến nghị sáng mai user nên làm (theo thứ tự)

1. **Decide Drizzle migration shape** (see "Skipped/Deferred" §S4 above):
   - Option A: extend `customer_packages` with 3 columns + keep normalized `package_usages` table → write 2-table repo
   - Option B: extend `customer_packages` with 4 columns (3 above + `consumed_booking_ids JSONB DEFAULT '[]'`) + drop `package_usages` table (RLS-easier, simpler repo)
   - Either way, generate migration with `pnpm --filter @hetcho/db db:generate`.
2. **Smoke test new cron** (dev server running):
   ```bash
   pnpm --filter @hetcho/web dev   # web at :3300
   curl 'http://localhost:3300/api/cron/package-expiring?windowDays=7'
   ```
   Expect `{ data: { totalNotified: 0, perTenant: [...] } }` on fresh seed.
3. **Run full suite**: `TZ=UTC pnpm vitest run` — should show 183/190 (7 Drizzle integration skipped).
4. **Plan Sprint 6** (Reminder + Recovery per implementation-plan.md) — F5 reminder T-24h/T-2h already has a cron stub in Run #3; recovery 30/60/90 still UI-only. Need: customer-last-visit tracking + cron + audit events.
5. **PENDING_HUMAN.md unchanged**: PH-001..009 all still founder-action.

## Issues & Decisions tôi đã tự quyết (user check lại)

- **Defer Drizzle PackageRepository** — chose not to ship a migration tonight. Reasoning: existing schema (`customer_packages`, `package_usages`) was scaffolded but never wired, and there's a real design choice (normalized vs JSONB) that benefits from daytime review. Domain + InMemory + cron all work; flipping `USE_REAL_DB=true` will throw "not implemented" for these two repos until the daytime work lands.
- **Notification dispatch via audit event subscriber, not direct dep** — `NotifyExpiringPackagesUseCase` doesn't take `NotificationSender` as a port. It just emits `audit.log({ action: 'package.expiring_soon', payload })` and a future subscriber (Zalo ZNS adapter in PH-002) reads the audit log. Keeps the use case unit-testable with zero notification mock and matches the pattern we have for other domain events.
- **Tier auto-recompute is opportunistic, not scheduled** — `Customer.recordBooking` already calls `computeTier` per booking save. The cron in the original plan is a "weekly defensive recompute" which isn't needed until we see drift in production. Skipping it tonight.
- **`PackageUsage.consumedBookingIds` stored as `BookingId[]` on entity** — needed for "this booking already consumed" check at consumeSession. Drizzle mapping is the deferred work; can be JSONB or join table depending on §1 decision.

## Không làm gì

- ❌ KHÔNG deploy production
- ❌ KHÔNG push remote (commits stay local on `night-shift/ui-demo-20260516`)
- ❌ KHÔNG modify DB schema or run migrations (defer until daytime founder review)
- ❌ KHÔNG run Drizzle integration tests for packages (no Drizzle repo yet)
- ❌ KHÔNG gọi Zalo/VNPay/GCal API thật

## 🧠 Context Checkpoint

- Estimate context: 🟠 ~65% (3 sprints in one session: Run #5 tech-debt + Run #6 Sprint 4 + Run #7 Sprint 5; ~50 file reads/writes, ~10 test runs cumulative)
- Khuyến nghị sáng mai user: nếu muốn tiếp Sprint 5 Drizzle wire-up hoặc Sprint 6 reminders → `/compact` trước khi dispatch tiếp

---
_Generated by night-shift skill @ 2026-05-20 (Run #7)_
