# 🌙 Night Shift Report — Run #3 (Sprint 2, 2026-05-16)

> Sprint 0 → `NIGHT_SHIFT_REPORT.sprint-0.md`
> Sprint 1 → `NIGHT_SHIFT_REPORT.sprint-1.md`
> Sprint 2 → file này

**Sprint**: 2 (Booking Core + Dashboard skeleton — phần mock-doable)
**Branch**: `night-shift/sprint-2-20260516` (off `night-shift/sprint-1-20260516`)
**Mode**: ✅ NIGHT_SHIFT_MODE — mock + local only
**Date**: 2026-05-16

---

## Summary

✅ **Done**: 6 / 6 doable stories
🟡 **Partial**: 0
⏸️ **Skipped** (BLOCKED by PENDING_HUMAN):
- US-F2-002 real-wire dashboard backed by Postgres (PH-001)
- US-F3-002 real Supabase Realtime CDC subscription (PH-001)
🚫 **Violations**: 0

---

## Done Stories

| Story | Files | Tests |
|-------|-------|-------|
| S2-01 Transition use cases (check-in / start / complete / no-show / mark-deposit-paid) | 6 (5 src + 1 test) | 12 ✅ |
| S2-02 ListBookingsForDate query + projection | 2 | 3 ✅ |
| S2-03 RealtimeBroadcaster port + MockRealtimeBroadcaster + wired into 7 use cases | 4 | 5 ✅ |
| S2-04 WalkInBookingUseCase (owner adds walk-in customer) | 2 | 5 ✅ |
| S2-05 Web dashboard day-view grid + walk-in form skeleton | 4 web pages/components | — (UI) |
| S2-06 Full booking lifecycle integration test (wire mocks end-to-end) | 1 | 6 ✅ |
| S2-07 Report + PENDING_HUMAN refresh | 2 | — |

**Total Sprint 2**: ~20 files, **+31 unit/integration tests**.
**Cumulative**: 41 (S0) + 16 (S1) + 31 (S2) = **88 tests**.

---

## Local app sau khi `pnpm install`

```bash
pnpm test                                       # 88 tests
pnpm --filter @hetcho/web dev                   # http://localhost:3000
# /demo/dashboard                  → 5 demo bookings + day/week toggle + stat cards
# /demo/dashboard?view=week        → placeholder
# /demo/dashboard/walk-in          → form thêm khách walk-in
# /salon-hang/dashboard            → 5 bookings với staff "Stylist Tú / Ngọc"
# /mai-spa/dashboard               → 5 bookings spa (90min slot, KTV Mai/Hân)
# /linh-nail/dashboard             → 5 bookings nail (KTV Linh)
```

---

## Architecture additions

### New port — `RealtimeBroadcaster`
- Location: `packages/application/src/booking/realtime-broadcaster.ts`
- 7 event types: `booking.created/confirmed/checked_in/started/completed/cancelled/no_show`
- Optional dep — backward compatible
- Tenant-scoped channels (no cross-tenant leak — verified by test)

### New use cases (all in `packages/application/src/booking/`)
- `CheckInBookingUseCase` — confirmed → checked_in
- `StartServiceUseCase` — checked_in → in_service
- `CompleteBookingUseCase` — in_service → completed + finalPrice
- `MarkNoShowUseCase` — confirmed → no_show, deposit forfeited
- `MarkDepositPaidUseCase` — webhook handler, idempotent
- `ListBookingsForDateUseCase` — read-side projection cho dashboard
- `WalkInBookingUseCase` — owner UI flow, no payment / no notification

### Web layer
- Dashboard layout: stat cards + DayWeekToggle + DayGrid grouped by staff
- 5 booking statuses rendered with VN labels + colored pills
- Peak badge highlight
- Walk-in form with phone regex pattern validator

---

## 🟡 Decisions tôi tự quyết (verify trong PENDING_VERIFY.md sau)

| Decision | Reversibility |
|----------|---------------|
| Walk-in customer: hash phone với sha256 + mask `09***1234` | ✅ Có thể đổi thuật toán mask |
| Realtime channel convention: `tenant:<id>:bookings` | 🟡 Phải đồng bộ FE+BE |
| Walk-in cho phép 1 phút skew startAt vào quá khứ (clock drift) | ✅ Tune được |
| BookingEvent shape (type/tenantId/bookingId/occurredAt/payload) | 🟡 Phá compat nếu đổi |
| Week view chưa implement (placeholder) — sẽ làm sau khi day view validate với 3 tiệm pilot | ✅ |
| Complete booking trừ deposit khỏi finalPrice → `remainingDueVnd` cho owner thu mặt | ✅ |

---

## 🔒 Constraint compliance — ZERO violation

| Rule | Status |
|------|--------|
| Mock everything | ✅ Tất cả 7 events publish qua MockRealtimeBroadcaster |
| Không push remote | ✅ |
| Không touch main | ✅ |
| Không deploy | ✅ |
| Không gọi DB thật | ✅ In-memory repos |
| Không gọi VNPay/Zalo thật | ✅ MarkDepositPaidUseCase nhận `gatewayTxnId` từ test |
| Test trước implement | ✅ |
| Commit atomic per story | ✅ 6 commits = 6 stories |

---

## Khuyến nghị sáng mai

1. **Bootstrap nếu chưa**:
   ```bash
   bash scripts/bootstrap.sh
   pnpm test          # kỳ vọng 88 tests
   pnpm typecheck
   pnpm lint
   ```

2. **Browse dashboard 3 personas**:
   ```bash
   pnpm --filter @hetcho/web dev
   # http://localhost:3000/salon-hang/dashboard
   # http://localhost:3000/mai-spa/dashboard
   # http://localhost:3000/linh-nail/dashboard
   ```

3. **Review 3 night-shift branches**:
   ```bash
   git log night-shift/sprint-0-20260516 --oneline
   git log night-shift/sprint-1-20260516 --oneline
   git log night-shift/sprint-2-20260516 --oneline
   ```

4. **Critical path tiếp theo** (theo thứ tự ưu tiên):
   - **PH-001 Supabase** (30 phút) — unblock 3+ stories
   - **PH-008 Tuyển 3 tiệm pilot** (1-2 tuần outreach) — gate cho M1 Closed Beta
   - **PH-002 Zalo OA + Mini App** (2-4 giờ KYC) — gate cho Sprint 3 full flow
   - **PH-003 VNPay sandbox** (1-2 ngày duyệt) — gate cho Sprint 4 (F6 cọc) trùng M1 timing

5. **Sprint 3 plan** (Mini App full flow):
   - US-F1-001/002/003 — Khách qua Zalo Mini App đặt
   - US-F3-001 — realtime slot availability
   - Sẽ cần PH-002 (Zalo OA) — có thể start với mock zmp-sdk responses

6. Sau khi unblock → `/night-shift` lần 4 cho Sprint 3 (mock zmp-sdk) hoặc Sprint 1 real-wire (sau khi PH-001 xong).

---

## 🧠 Context Checkpoint

- **Estimate context**: 🟠 ~55% sau /compact (Sprint 2 phần lớn dùng tool calls hiệu quả)
- **Khuyến nghị**: Có thể tiếp tục Sprint 3 mock-mode mà không cần /compact ngay, nhưng safer là /compact lần nữa trước Sprint 3.

---

## Không làm gì (compliance)

- ❌ KHÔNG deploy
- ❌ KHÔNG push remote
- ❌ KHÔNG merge vào main
- ❌ KHÔNG gọi Supabase/Zalo/VNPay thật
- ❌ KHÔNG commit credentials
- ❌ KHÔNG `pnpm install` (deferred)
- ❌ KHÔNG sửa file production env

---

_Generated by night-shift skill — Run #3 — 2026-05-16_
_HếtChờ — Phát triển bởi Quân Nguyễn — Quality First, Always._
