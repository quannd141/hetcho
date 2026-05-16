# Implementation Plan — HếtChờ

**Phiên bản**: 1.0
**Ngày**: 2026-05-16
**Tham chiếu**: Charter v1.0 §6, Tech Decision v1.0, SRS v1.0

---

## Tổng quan

- **Tổng thời lượng**: 18 tuần (~4.5 tháng) từ Sprint 0 → Public Launch M3.
- **Sprint length**: 2 tuần/sprint, trừ Sprint 0 = 1 tuần và Sprint 7 = 1 tuần.
- **Capacity**: Solo founder ~30h/tuần với AI agent stack tăng tốc.
- **Story points target**: ~25-35 SP/sprint (1 SP = ~2h founder time, AI agent code).

---

## Sprint 0 — Foundation (Tuần 1, 1 tuần)

**Mục tiêu**: Setup hạ tầng + spike risk cao trước build feature.

### Deliverables
- [ ] Monorepo Turborepo + pnpm workspace init
- [ ] `apps/web` Next.js 14 boilerplate + Tailwind + shadcn/ui
- [ ] `apps/mini-app` Zalo Mini App boilerplate + zmp-sdk
- [ ] `packages/db` Drizzle setup + schema initial (tenants, users)
- [ ] `packages/domain` base structure (booking, customer, tenant entities)
- [ ] Supabase project (staging + production) + RLS template
- [ ] Zalo OA Pro account đăng ký cho tiệm pilot đầu tiên (V-006 verify)
- [ ] VNPay sandbox merchant đăng ký (V-003 verify)
- [ ] GitHub Actions CI: lint + typecheck + test
- [ ] Vercel project + preview deploy mỗi PR
- [ ] Domain `hetcho.vn` + Cloudflare DNS
- [ ] Sentry + Better Stack + PostHog account
- [ ] **Spike Zalo Mini App PoC**: login + API call + payment redirect (V-007 verify)
- [ ] **Spike VNPay PoC**: sandbox transaction end-to-end

### Risk gates (block Sprint 1 if not done)
- Zalo Mini App spike thành công (auth + API call).
- VNPay sandbox transaction complete.
- Supabase RLS policy test pass cross-tenant scenario.

### SP estimate: 30

---

## Sprint 1 — Tenant + Auth (Tuần 2-3)

**Mục tiêu**: Chủ tiệm onboard được + login + tạo dịch vụ + thợ.

### User Stories
- US-F2-001: Đăng nhập tenant (Supabase Auth + email magic link)
- US-F2-003: Onboarding wizard — chọn loại tiệm + CRUD dịch vụ + thợ
- AC: Settings page (giờ làm việc, peak hours, deposit rules)

### Deliverables
- [ ] `app/(auth)/login` + magic link email
- [ ] `app/(tenant)/[slug]/settings/` CRUD dịch vụ + thợ
- [ ] `app/(tenant)/[slug]/onboarding/` wizard 5 step
- [ ] Drizzle schema: services, staff, staff_services, customers, working_hours
- [ ] RLS policy cho mọi bảng tenant-scoped
- [ ] Integration test cross-tenant isolation
- [ ] Seed script tạo tiệm demo (1 salon, 1 spa, 1 nail)

### SP estimate: 25

---

## Sprint 2 — Booking Core + Dashboard skeleton (Tuần 4-5)

**Mục tiêu**: Chủ tiệm tạo booking manual + xem lịch ngày/tuần.

### User Stories
- US-F2-002: Dashboard ngày/tuần grid view
- US-F2-004: Xác nhận khách đến (state machine)
- US-F3-002: Dashboard realtime auto-refresh

### Deliverables
- [ ] `app/(tenant)/[slug]/dashboard/` calendar grid (day/week toggle)
- [ ] Drizzle schema: bookings + state machine field
- [ ] `packages/domain/booking/` entity + use case create/cancel/checkin/complete
- [ ] Realtime subscription: Supabase Realtime channel `tenant:<id>:bookings`
- [ ] Manual booking creation từ dashboard (chủ tiệm tự thêm khách walk-in)
- [ ] Booking conflict detection
- [ ] Unit test coverage > 80% cho `booking/` domain
- [ ] E2E test: "Chủ tiệm tạo booking → mark complete"

### SP estimate: 30

---

## Sprint 3 — Mini App + Public Booking (Tuần 6-7)

**Mục tiêu**: Khách đặt được booking qua Zalo Mini App.

### User Stories
- US-F1-001: Khách chọn dịch vụ
- US-F1-002: Khách chọn thợ + giờ
- US-F1-003: Xác nhận booking
- US-F3-001: Realtime slot availability

### Deliverables
- [ ] `apps/mini-app` full flow: list services → select staff → select slot → confirm
- [ ] Zalo auth → map `zalo_id` ↔ `customers` table
- [ ] API `GET /api/public/tenants/:slug/availability` + slot calculation algorithm
- [ ] Realtime slot update qua Supabase Realtime
- [ ] Fallback web booking page `hetcho.vn/<slug>` (cho người không Zalo)
- [ ] Onboarding flow: chủ tiệm copy Mini App link share Zalo OA

### SP estimate: 35

---

## Sprint 4 — Đặt cọc + Google Calendar (Tuần 8-9)

**Mục tiêu**: F6 Đặt cọc giữ chỗ qua VNPay live + F2 sync GCal.

### User Stories
- US-F6-001: Cấu hình cọc theo dịch vụ + slot
- US-F6-002: Khách thanh toán cọc
- US-F6-003: Xử lý cọc khi hoàn tất / no-show
- US-F2-005: Sync Google Calendar 2 chiều

### Deliverables
- [ ] `packages/infrastructure/payment-gateways/vnpay/` adapter
- [ ] `app/api/webhooks/vnpay` callback handler + idempotent reconciliation
- [ ] Settings UI: deposit_normal + deposit_peak + cancel policy
- [ ] Mini App payment redirect → callback → confirm
- [ ] Cron job: auto release slot không trả cọc trong 5 phút
- [ ] Cron job: mark no-show 30 phút quá giờ + cọc về tiệm
- [ ] Google Calendar OAuth + push sync trên mọi booking change
- [ ] Audit log mọi payment event

### 🚩 Milestone M1 — Closed Beta Launch (end Sprint 4, T9)

**Gate criteria**:
- F1, F2, F3, F6 + GCal sync hoạt động.
- ≥ 3 tiệm pilot đồng ý tham gia.
- Production deploy + monitoring active.

### SP estimate: 35

---

## Sprint 5 — Tier + Liệu trình (Tuần 10-11)

**Mục tiêu**: F4 — quản lý khách + gói liệu trình.

### User Stories
- US-F4-001: Tier khách (Normal/CIP/VIP)
- US-F4-002: Tracking liệu trình (gói buổi)

### Deliverables
- [ ] Drizzle schema: packages, package_usages
- [ ] CRUD package từ dashboard
- [ ] Khách mua package flow (manual qua dashboard MVP, Mini App Phase 2)
- [ ] Auto tier upgrade rule (cron daily)
- [ ] Mini App: progress bar liệu trình
- [ ] Cron: T-7 hết hạn gói → ZNS reminder

### SP estimate: 30

---

## Sprint 6 — Reminder + Recovery (Tuần 12-13)

**Mục tiêu**: F5 — auto reminder + recovery campaign.

### User Stories
- US-F5-001: Reminder T-24h và T-2h
- US-F5-002: Recovery campaign 30/60/90 ngày

### Deliverables
- [ ] `packages/infrastructure/notification/zalo/` adapter (OA + ZNS)
- [ ] Cron mỗi giờ: scan booking T-24h, T-2h → send ZNS
- [ ] Cron daily: scan customer 30/60/90 ngày → send OA broadcast
- [ ] Template editor trong dashboard
- [ ] Voucher logic (giảm % theo milestone)
- [ ] Recovery analytics: bao nhiêu sent, replied, re-booked

### 🚩 Milestone M2 — Open Beta (end Sprint 6, T15)

**Gate criteria**:
- Pilot retention ≥ 70% sau 6 tuần Closed Beta.
- Recovery campaign hoạt động (10+ tin nhắn đã gửi tự động).
- Mở rộng 20-50 tiệm.

### SP estimate: 30

---

## Sprint 7 — Pilot Feedback Polish (Tuần 14-15)

**Mục tiêu**: Bug fix + UX improvement từ Closed Beta + lite CRM.

### Deliverables
- [ ] Customer notes (lite CRM — ghi chú dị ứng, sinh nhật).
- [ ] Bug fix list (từ Closed Beta feedback).
- [ ] Mobile UX polish dashboard.
- [ ] Basic reporting: doanh thu ngày/tuần/tháng + top dịch vụ + top thợ.
- [ ] Multi-language ready (i18n setup, ship VI only).
- [ ] Empty states + error states UX.

### SP estimate: 25

---

## Sprint 8 — Hardening + Audit (Tuần 16-17)

**Mục tiêu**: Production readiness.

### Deliverables
- [ ] Skill `security-audit` chạy đầy đủ — fix mọi P0/P1.
- [ ] Skill `production-readiness-audit` checklist pass.
- [ ] Skill `observability-setup` verify alert rule.
- [ ] Load test (Artillery/k6) — 500 concurrent, 50k bookings.
- [ ] Penetration test cross-tenant RLS (skill kiểm thử bảo mật).
- [ ] DR plan: backup test restore Supabase.
- [ ] Document runbook incident-response.
- [ ] Trademark check `HếtChờ` (V-008).
- [ ] PDP compliance audit (V-010).

### 🚩 Milestone M3 — Public Launch (end Sprint 8, T18)

**Gate criteria**:
- production-readiness-audit pass.
- security-audit no P0.
- 99.5% uptime trong 1 tuần test.
- Có ≥ 1 case study tiệm pilot ready cho marketing.

### SP estimate: 30

---

## Phase 2 Roadmap (Post-Launch)

Sau M3 → backlog Phase 2 priority:
1. **Loyalty points** (US-F4 mở rộng) — Q2 2026 (T19-T26).
2. **Prepaid wallet** (gói VIP cả năm) — Q3 2026.
3. **Multi-channel inbox** (Zalo + IG + FB) — Q3 2026 (insight từ Chị Linh Discovery).
4. **Full POS payment** (thanh toán cuối dịch vụ) — Q3-Q4 2026.
5. **CRM nâng cao** + birthday automation — Q4 2026.
6. **Native app iOS/Android** (nếu metrics chứng minh ROI) — 2027.
7. **Multi-location chain** (chuỗi nhiều tiệm) — 2027.
8. **API & integration marketplace** (Misa e-invoice, KiotViet POS) — 2027.

---

## Quality Gates (cross-sprint)

Mỗi sprint trước khi đóng:
- [ ] Lint + typecheck pass
- [ ] Unit test coverage business logic ≥ 80%
- [ ] Integration test happy path pass
- [ ] No P0 bug open
- [ ] Sprint review skill `sprint-end-review` 3 tier (QA + BA + Tech Lead) pass

---

## Risk Tracking

Update weekly trong `docs/risk-log.md` (sẽ tạo Sprint 0):
- TR1-TR8 từ Tech Decision §7
- R1-R7 từ Charter §8
- V-001 đến V-010 từ PENDING_VERIFY.md

---

**Phát triển bởi Quân Nguyễn — Quality First, Always.**
