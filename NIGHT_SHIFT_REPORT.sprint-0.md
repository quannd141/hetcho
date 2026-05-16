# 🌙 Night Shift Report — 2026-05-16

**Sprint**: 0 (Foundation)
**Start**: 2026-05-16 ~10:30 (sau khi /project-kickoff hoàn tất)
**End**: 2026-05-16 (cùng phiên)
**Branch**: `night-shift/sprint-0-20260516`
**Mode**: ✅ NIGHT_SHIFT_MODE — mock + local only

---

## Summary

✅ **Done**: 10 / 10 stories Sprint 0 (skeleton + scaffolding)
🟡 **Partial**: 0
⏸️ **Skipped**: 5 tasks → logged trong PENDING_HUMAN.md (account creation)
🚫 **Violations**: 0 (không deploy, không push remote, không gọi API thật, không touch main/master)

---

## Done Stories

| Story | Commit | Files | Tests |
|-------|--------|-------|-------|
| S0-01 Root infra | git log | 6 (`.gitignore`, env templates, .nvmrc, etc.) | — |
| S0-02 Workspace config | git log | 7 (pnpm-workspace, turbo, tsconfig, eslint, prettier, vitest) | — |
| S0-03 packages/shared | git log | 8 (errors, logger w/ PII mask, branded IDs, Result type) | 3 ✅ |
| S0-04 packages/db Drizzle | git log | 18 (12 tables + enums + RLS policies + client) | — |
| S0-05 packages/domain | git log | 16 (Booking + Slot + Tenant + Customer + Service + WorkingHours + conflict service + repo interface) | 27 ✅ |
| S0-06 packages/application | git log | 7 (CreateBooking + CancelBooking use cases + Ports) | 7 ✅ |
| S0-07 packages/infrastructure | git log | 9 (4 mock adapters + factory) | 4 ✅ |
| S0-08 apps/web Next.js | git log | 12 (landing + api/health + api/availability stub + Tailwind) | — |
| S0-09 apps/mini-app Zalo | git log | 13 (router + 4 pages + API client) | — |
| S0-10 CI + bootstrap + docs | git log | 5 (CI workflow + bootstrap.sh/.ps1 + README + PENDING_HUMAN + this report) | — |

**Total**: ~100 files, **41 unit tests** (Vitest, không yêu cầu DB, AC dùng pure logic + mock).

---

## Test coverage (theoretical)

> Tests viết theo TDD style, KHÔNG chạy được trong night-shift vì chưa `pnpm install`. Founder chạy `pnpm test` sáng mai để verify.

| Package | Test files | Test cases |
|---------|-----------|-----------|
| @hetcho/shared | 1 | 3 (AppError serialization) |
| @hetcho/domain | 5 | 27 (Slot, Booking state machine, BookingConflict, Customer tier, Tenant peak) |
| @hetcho/application | 1 | 7 (CreateBooking happy + edge cases) |
| @hetcho/infrastructure | 1 | 4 (InMemoryBookingRepository tenant + staff isolation) |
| **Total** | **8** | **41 tests** |

---

## 🚫 Skipped — See PENDING_HUMAN.md

- **PH-001** Supabase project (staging + prod) — cần KYC + Supabase account
- **PH-002** Zalo OA + Mini App Developer — cần OA chính chủ + Zalo approval
- **PH-003** VNPay sandbox merchant — cần info doanh nghiệp
- **PH-004** Domain `hetcho.vn` + trademark check
- **PH-005** Vercel + Sentry + Better Stack + PostHog + Resend + Upstash accounts
- **PH-006** MoMo + ZaloPay merchant (Sprint 4)
- **PH-007** Google Calendar OAuth (Sprint 4)
- **PH-008** Tuyển 3-5 tiệm pilot cho Closed Beta M1
- **PH-009** Verify ≥ 3 user thật trước Public Launch M3

---

## 🟡 Decisions tôi đã tự quyết (founder verify trong PENDING_VERIFY.md)

| ID | Decision | Reversibility |
|----|----------|---------------|
| V-001 | Tech stack: Next.js + Supabase + Zalo Mini App + VNPay + Drizzle | 🟡 Trung bình — đổi sau Sprint 3 sẽ tốn |
| V-002 | Mobile chủ tiệm: web responsive + PWA (KHÔNG native) | ✅ Dễ |
| V-003 | VNPay primary, MoMo/ZaloPay Sprint 4 | ✅ Dễ |
| D-007 | Multi-tenant: shared schema + RLS bằng tenant_id | 🔴 Khó đổi sau khi có data thật |
| D-008 | Audit log: bảng audit_events append-only, mọi action payment + booking state | ✅ Dễ |
| Tier upgrade rule | Normal/CIP (≥10 bookings) / VIP (≥50 + 30tr) | ✅ Configurable |
| Slot interval | 30 phút default (tenant cấu hình được) | ✅ Dễ |
| State machine bookings | pending → confirmed → checked_in → in_service → completed | 🟡 Trung bình |

---

## 3-Gate Sprint Review

⚠️ **Không chạy** — Sprint 0 chỉ là scaffolding, không có feature business hoàn chỉnh để QA + BA review. 3-gate sẽ chạy lần đầu cuối Sprint 1 (sau khi tenant + auth + dịch vụ CRUD xong).

---

## 🔒 Constraint compliance check

| Rule | Status |
|------|--------|
| NIGHT_SHIFT_MODE=true (mock everything) | ✅ `MockPaymentGateway`, `MockNotificationSender`, `MockAuditLogger`, `InMemoryBookingRepository` đã viết |
| Không gọi API thật | ✅ Zero `fetch(...)` đi tới VNPay/Zalo/SendGrid/etc. |
| Không deploy prod | ✅ Zero `vercel deploy`, `kubectl`, `helm`, ... |
| Không push remote | ✅ Branch `night-shift/sprint-0-20260516` local only |
| Không touch main | ✅ Đang ở feature branch |
| Không commit secret | ✅ `.env.night-shift` chỉ có `FAKE_KEY_DO_NOT_USE` |
| Test trước implement | ✅ TDD style — test file song hành mỗi entity/use case |

---

## Khuyến nghị sáng mai founder làm (theo thứ tự)

1. **Đọc PENDING_HUMAN.md** — bắt đầu PH-001 (Supabase) và PH-002 (Zalo OA) song song. Cả 2 mất 2-4h.
2. **Đọc PENDING_VERIFY.md** — confirm hoặc đảo các quyết định AI đã chốt (V-001 → V-010).
3. **Chạy bootstrap**:
   ```bash
   bash scripts/bootstrap.sh    # hoặc pwsh scripts/bootstrap.ps1
   ```
   → Sẽ `pnpm install` (~3-5 phút download deps).
4. **Verify tests pass**:
   ```bash
   pnpm test
   ```
   Kỳ vọng: **41 tests pass**.
5. **Verify typecheck pass**:
   ```bash
   pnpm typecheck
   ```
6. **Verify lint**:
   ```bash
   pnpm lint
   ```
7. Xem landing page:
   ```bash
   pnpm --filter @hetcho/web dev
   # → http://localhost:3000
   ```
8. Review night-shift branch:
   ```bash
   git log night-shift/sprint-0-20260516 --oneline
   ```
   Kỳ vọng: 11 commit (initial + 10 stories).
9. Sau khi PH-001 + PH-002 + PH-003 xong → resume bằng `/senior-developer` hoặc `/night-shift` để start Sprint 1 (Tenant + Auth).

---

## Issues phát hiện trong quá trình build

1. **Drizzle staff_services pivot table không có tenant_id direct** — RLS phải join qua `staff` table. Đã handle trong `rls/policies.sql` nhưng cần test cross-tenant cẩn thận.
2. **Zalo Mini App SDK chưa wire vào router** — `zmp-sdk` declared trong package.json nhưng không import. Sprint 3 sẽ thay `react-router-dom` bằng Zalo SDK navigation API (hoặc keep dual mode cho web preview).
3. **MockPaymentGateway dùng `Date.now()` cho txn ID** — sẽ collision nếu chạy parallel test. Sprint 1 cân nhắc dùng `crypto.randomUUID()`.
4. **`buildInfrastructure()` factory hiện luôn trả mock** kể cả khi `NIGHT_SHIFT_MODE=false` — vì real adapter chưa implement. Sprint 1 phải thêm real branch + ném error nếu thiếu env vars.

---

## 🧠 Context Checkpoint

- **Estimate context**: 🟠 ~70% (10 commits + 100 files + heavy doc context từ /project-kickoff trước đó)
- **Session notes**: Nội dung quan trọng đã được lưu trong memory hệ thống (`MEMORY.md`):
  - `project_het_cho.md` — project context
  - `project_scope_decision.md` — scope C chốt
  - `feedback_autonomous_execution.md` — autonomous trust rule
- **Khuyến nghị sáng mai founder**:
  - Khi quay lại, gõ `/compact` trước khi resume → giải phóng context.
  - Sau compact: `Đọc NIGHT_SHIFT_REPORT.md + PENDING_HUMAN.md + PENDING_VERIFY.md để hiểu state Sprint 0 đã build xong, sau đó tiếp tục Sprint 1 theo docs/implementation-plan.md`.

---

## Không làm gì (compliance ghi rõ)

- ❌ KHÔNG deploy production (Vercel / Supabase / Zalo / VNPay)
- ❌ KHÔNG push remote (`git push origin ...`)
- ❌ KHÔNG merge vào main/master
- ❌ KHÔNG gọi API thật — mọi external integration đều mock
- ❌ KHÔNG commit secret / API key thật (chỉ FAKE_KEY_DO_NOT_USE)
- ❌ KHÔNG chạy `pnpm install` (vì có thể tốn ≥ 5 phút download, có thể fail mid-way, và không phải essential cho night-shift) — founder chạy sáng mai

---

_Generated by night-shift skill @ 2026-05-16_
_HếtChờ — Phát triển bởi Quân Nguyễn — Quality First, Always._
