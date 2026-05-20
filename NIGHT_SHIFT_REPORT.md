# 🌙 Night Shift Report — 2026-05-20 (Run #6)

**Sprint context**: Sprint 4 mock-doable slice (deposit lifecycle automation + VNPay signature scaffolding)
**Branch**: `night-shift/ui-demo-20260516` (continuation, now 33 commits)
**Mode**: NIGHT_SHIFT_MODE — mock + local Postgres, no remote push
**Trigger**: user typed "next sprint" after Run #5

> Run #5 report content (tech-debt sweep, TZ + Review entity + Drizzle integration + webhook idempotency) preserved in git at commit `2014f8c`.

---

## Summary

✅ **Done**: 3 / 3 stories
🟡 **Partial**: 0
⏸️ **Skipped**: Sprint 4 items needing PH-credentials (VNPay live, GCal OAuth) — adapter scaffold ready, switch happens at container wire-up after PH-003/007.
🧪 **Tests**: 127 → **158 passing (+31 net new)**, 7 Drizzle integration skipped by default
   - Final: **158/158** under both `TZ=UTC` and `TZ=Asia/Ho_Chi_Minh` ✅

## Done Stories

| Story | Commit | What |
|---|---|---|
| S1 Auto-release stale pending | `0721b88` | `AutoReleaseStalePendingUseCase` cancels pending bookings unpaid > timeout (default 5 min). Extends `BookingRepository.findStalePending`. Cron endpoint `GET /api/cron/auto-release[?pendingTimeoutMs=N]` iterates per-tenant. 6 tests: timeout boundary, status filter (skip confirmed), tenant isolation, custom timeout, multi-booking batch, audit + realtime broadcast on cancel. |
| S2 Auto mark no-show | `0721b88` | `AutoMarkNoShowUseCase` transitions confirmed → `no_show` for bookings past start + `graceMinutes` (default 30) with no check-in. Extends `BookingRepository.findUnattendedConfirmed`. Deposit forfeited on entity (shop keeps it). Cron endpoint `GET /api/cron/no-show[?graceMinutes=N]` returns per-tenant counts + total forfeited VND. 6 tests: grace boundary, skip checked-in, tenant isolation, custom grace, depositForfeitedTotalVnd aggregation. |
| S3 VNPay signature + gateway | `22b8c0f` | `vnpay-signature.ts`: `buildSignString` (drop SecureHash{,Type}, drop empty, sort ASC, form-encode), `signVnpayParams` (HMAC-SHA512 hex lower-case), `verifyVnpaySignature` (constant-time, case-insensitive). `VnpayPaymentGateway implements PaymentGateway`: deterministic URL builder, amount ×100, 15-min expiry, `formatVnpayDate` in Asia/Ho_Chi_Minh. 19 tests: sort, drop rules, encoding, sign determinism, round-trip verify, tamper detection (amount + txnRef), wrong secret, missing hash, case-insensitivity, gateway constructor guards, URL signature round-trip, UTC→VN rollover. **Not wired in container yet** — MockPaymentGateway still default; flip happens at PH-003 wire-up. |

## Verification

- `TZ=UTC pnpm vitest run` → **158 PASS / 7 skipped** ✅
- `TZ=Asia/Ho_Chi_Minh pnpm vitest run` → **158 PASS / 7 skipped** ✅
- Drizzle integration suite (7 tests) gated by `INTEGRATION_TESTS=true`; not run this session (no DB schema change).

### New routes verified by tests (functional unit-level)
- `AutoReleaseStalePendingUseCase` — 6 scenarios via in-memory repo
- `AutoMarkNoShowUseCase` — 6 scenarios via in-memory repo
- VNPay sign/verify — 13 scenarios with known vectors
- VNPay gateway — 6 scenarios including tamper resistance

## Skipped

- Real Zalo OA wire (PH-002)
- VNPay sandbox merchant + container flip (PH-003) — adapter is done, just needs env vars + container conditional wiring
- Google Calendar OAuth (PH-007) — not started
- Production deploy / push (always blocked in night-shift)

## 3-Gate Sprint Review

**Not run tonight** — Sprint 4 only ~30% complete (mock-doable slice). The Sprint 3 sprint-end-review CLOSE (2026-05-19) still stands as last gate result. Sprint 4 will close once PH-003 unblocks VNPay live wire + cron schedule on Vercel.

## Khuyến nghị sáng mai user nên làm (theo thứ tự)

1. **Smoke test cron endpoints** (need dev server running):
   ```bash
   pnpm --filter @hetcho/web dev   # web at :3300
   curl 'http://localhost:3300/api/cron/auto-release?pendingTimeoutMs=300000'
   curl 'http://localhost:3300/api/cron/no-show?graceMinutes=30'
   ```
   Both return `{ success: true, data: { totalReleased|totalMarked, perTenant: [...], runAt } }`. Expect 0/0 on a fresh seed.
2. **Review VNPay adapter for spec drift**: read `packages/infrastructure/src/vnpay/vnpay-signature.ts` against latest [VNPay v2 doc](https://sandbox.vnpayment.vn/apis/) — encoding rule (spaces=`+`) and lower-case hex are the two failure modes if VNPay updates spec.
3. **Run full suite**: `TZ=UTC pnpm vitest run` — should show 158/165 (7 Drizzle integration skipped).
4. **Wire VnpayPaymentGateway in container** when PH-003 lands: in `apps/web/src/lib/container.ts`, branch `payment = process.env.VNPAY_TMN_CODE ? new VnpayPaymentGateway({...}) : new MockPaymentGateway()`.
5. **Plan Vercel cron schedule**: add `vercel.json` entries for both crons (e.g. `auto-release` every minute, `no-show` every 5 min) when Sprint 4 closes.
6. **PENDING_HUMAN.md unchanged**: PH-001/002/003/004/005/007/008/009 still founder-action. No new entries tonight.

## Issues & Decisions tôi đã tự quyết (user check lại)

- **`BookingRepository` extended with 2 new query methods** (`findStalePending`, `findUnattendedConfirmed`) instead of generic `findByStatus` — explicit names are clearer for cron callers and let the Drizzle impl pick the best index (`bookings_tenant_status_idx` covers both).
- **Cron endpoints iterate per-tenant in app code**, not in a single cross-tenant SQL — easier to add tenant-level error isolation later (one tenant's failure doesn't block others). Trade-off: more round-trips; acceptable until N tenants > ~100.
- **VnpayPaymentGateway not yet wired in container** — adapter is production-shape but flipping the default in NIGHT_SHIFT_MODE would silently start signing payloads with `FAKE_KEY` env if user forgets to set real `VNPAY_TMN_CODE`. Explicit user action required at PH-003 unblock.
- **Audit logs `actorType: 'system'`** for both auto-release and no-show — distinguishes founder-driven cancels from cron-driven ones in reports/reconciliation.
- **VNPay hex compare is case-insensitive** (gateway has been observed echoing upper-case) but still constant-time — `safeEqualHex` XORs char codes after lower-casing both sides.

## Không làm gì

- ❌ KHÔNG deploy production
- ❌ KHÔNG push remote (commits stay local on `night-shift/ui-demo-20260516`)
- ❌ KHÔNG gọi VNPay sandbox thật (sign-only, no HTTP)
- ❌ KHÔNG flip container default to real VNPay (would need real `VNPAY_HASH_SECRET`)
- ❌ KHÔNG modify migration files (no schema change needed — existing `bookings_tenant_status_idx` covers new queries)

## 🧠 Context Checkpoint

- Estimate context: 🟡 ~45% (3 stories, fresh post-compact session, ~20 file reads/writes, 4 test runs)
- Session continues from Run #5 post-compact
- Khuyến nghị sáng mai user: nếu muốn tiếp Sprint 4 wire-up sau khi resolve PH-003 → `/compact` rồi instruction "wire VNPay container + add vercel cron"

---
_Generated by night-shift skill @ 2026-05-20 (Run #6)_
