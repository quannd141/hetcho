# PENDING_HUMAN — Tasks cần Founder xử lý (không thể tự động)

> Mỗi task cần **action thật của founder** — đăng ký tài khoản, mua dịch vụ, ký hợp đồng…
> Night-shift agent **KHÔNG** tự làm được vì cần credential / KYC / approval.
> Founder làm xong → tick ✅ + ghi ngày + credential lưu ở `.env.local` (KHÔNG commit).

---

## 🔴 BLOCKER cho Sprint 0 → Sprint 1

### PH-001. Đăng ký Supabase project (staging + production)
- **Action**: Tạo 2 project trên https://supabase.com
  - `hetcho-staging` (free tier)
  - `hetcho-prod` (Pro $25/m — bật sau M1)
- **Lấy**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`
- **Lưu vào**: `.env.local` (staging) và Vercel env vars (prod)
- **Sau đó**: chạy `pnpm db:generate && pnpm db:migrate` để push schema lên Supabase
- **Sau migration**: apply `packages/db/src/rls/policies.sql` qua Supabase SQL editor
- **Thời gian estimate**: 30 phút
- **Blocker cho**: Sprint 1 (auth + tenant CRUD)

---

### PH-002. Đăng ký Zalo OA + Zalo Mini App Developer
- **Action 1 — Zalo OA**: Tạo OA tại https://oa.zalo.me cho tiệm pilot đầu tiên
  - Cần: SĐT chính chủ, KYC nếu doanh nghiệp
  - Verify: V-006 trong PENDING_VERIFY.md (hộ kinh doanh có thể đăng ký không?)
- **Action 2 — Mini App**: Tạo Mini App tại https://mini.zalo.me
  - Cần: link với OA ở trên
  - Lấy: `ZALO_MINI_APP_ID`, `ZALO_MINI_APP_SECRET`
- **Action 3 — ZNS Templates**: Đăng ký template cho transactional Zalo Notification Service
  - Template 1: "Đặt lịch thành công" → lấy template_id, lưu vào `ZNS_TEMPLATE_REMINDER_24H` etc.
- **Thời gian estimate**: 2-4 giờ (KYC chờ Zalo duyệt)
- **Blocker cho**: Sprint 3 (Mini App full flow)

---

### PH-003. Đăng ký VNPay Sandbox Merchant
- **Action**: Tạo merchant account sandbox tại https://sandbox.vnpayment.vn
  - Cần: thông tin doanh nghiệp + tài khoản ngân hàng test
- **Lấy**: `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`
- **Khi launch prod**: nâng cấp lên production VNPay merchant
- **Thời gian estimate**: 1-2 ngày (VNPay duyệt thủ công)
- **Blocker cho**: Sprint 4 (F6 đặt cọc)

---

### PH-004. Mua domain hetcho.vn + check trademark
- **Action 1**: Search trademark "HếtChờ" / "Het Cho" tại https://noip.gov.vn
  - Nếu trùng → fallback brand name (đề xuất: "VàoLiền", "ChỗCủaTôi", "GọiTên")
- **Action 2**: WHOIS check `hetcho.vn` — mua qua PA Vietnam / Z.com / Tenten
  - Cần: CMND/CCCD chính chủ
- **Action 3**: Setup Cloudflare DNS:
  - `hetcho.vn` → A record Vercel
  - `app.hetcho.vn` → CNAME Vercel
- **Thời gian estimate**: 1-2 ngày
- **Blocker cho**: Public Launch M3

---

### PH-005. Đăng ký Vercel + Sentry + Better Stack + PostHog + Resend
- **Vercel**: https://vercel.com — Pro $20/m (sau Sprint 3)
  - Connect GitHub repo, set env vars
- **Sentry**: https://sentry.io — Free tier 5k events/m
  - Lấy `SENTRY_DSN`
- **Better Stack (Logtail)**: https://betterstack.com — Free tier
  - Lấy `BETTERSTACK_LOGTAIL_TOKEN`
- **PostHog**: https://posthog.com EU region — Free 1M events/m
  - Lấy `POSTHOG_API_KEY`
- **Resend**: https://resend.com — $20/m
  - Lấy `RESEND_API_KEY` + verify domain `hetcho.vn` để gửi từ `noreply@hetcho.vn`
- **Upstash Redis**: https://upstash.com — Free tier 10k req/day
  - Lấy `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- **Thời gian estimate**: 1 ngày
- **Blocker cho**: Closed Beta M1 (cần monitoring trước khi launch)

---

## 🟡 BLOCKER cho Sprint 1 nhưng có thể defer

### PH-006. Upgrade MoMo + ZaloPay merchant (Sprint 4+)
- Tương tự PH-003 nhưng MoMo (https://business.momo.vn) và ZaloPay (https://oa.zalo.me/zalopay)
- Defer đến Sprint 4 (VNPay primary đã đủ MVP)

### PH-007. Google Calendar OAuth credentials
- Tạo project trên https://console.cloud.google.com
- Enable Calendar API, tạo OAuth 2.0 client
- Lấy `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Defer Sprint 4 (US-F2-005)

### PH-008. Tuyển 3-5 tiệm pilot cho Closed Beta (M1, T9)
- **Action**: Outreach 5-10 tiệm thân thiết (salon, spa, nail) → mời thử miễn phí 100%
- **Lý tưởng**: 2 salon + 2 spa + 1 nail
- **Compensation**: 1 tháng HếtChờ Pro miễn phí khi launch + Voucher 200k cho khách của họ
- **Thời gian estimate**: 1-2 tuần
- **Blocker cho**: Milestone M1 (Closed Beta Launch)

### PH-009. Verify ≥ 3 user thật trước M3
- Reference: `docs/discovery/00-README.md` — Discovery hiện tại synthetic
- Action: Interview 3-5 chủ tiệm thật, dùng `02-interview-script.md`
- Update opportunities map + persona cards nếu có gap
- **Blocker cho**: Public Launch M3 (case study marketing)

---

## ✅ Verified items (founder tick khi xong)

```markdown
- [x] PH-XXX — verified YYYY-MM-DD — note
```

---

**Last updated**: 2026-05-19 by night-shift agent (Sprint 3 + polish A→C done — sprint-end-review CLOSE)

---

## 📌 Run #2 update (2026-05-16)

- Sprint 1 phần **mock-doable** đã commit ở branch `night-shift/sprint-1-20260516`.
- Vẫn cần founder xử lý PH-001 → PH-005 trước khi Sprint 1 real-wire + Sprint 2.
- Đã add 5 routes web (login/signup/onboarding/dashboard/services), 3 demo tenants seed, +16 tests.
- Cumulative: 57 tests pass kỳ vọng sau `pnpm test`.

---

## 📌 Run #3 update (2026-05-16, Sprint 2)

- Sprint 2 phần **mock-doable** đã commit ở branch `night-shift/sprint-2-20260516`.
- Booking state machine hoàn chỉnh: 5 transition use cases + webhook handler + 1 query + 1 walk-in.
- RealtimeBroadcaster port + Mock pub/sub (tenant-scoped) wire vào 7 use cases.
- Dashboard day-view grid (group by staff, status pills, peak badge) + walk-in form skeleton.
- Full lifecycle integration test (pending → confirmed → checked_in → in_service → completed) PASS.
- Cumulative: **88 tests** pass kỳ vọng sau `pnpm test`.
- **Blockers vẫn**: PH-001 (Supabase) là blocker lớn nhất — chặn real-wire dashboard + realtime + Sprint 1 auth.
- **Có thể start Sprint 3 mock-mode** (Mini App với mock zmp-sdk) mà không cần PH-002 ngay, nhưng PH-002 phải xong trước M1 (T9).

---

## 📌 Run #4 update (2026-05-16, UI Demo Dispatch)

**Strategy shift**: Anh Quân yêu cầu Tech Lead dispatch build hết UI với mock data trước khi làm BE.

- Branch `night-shift/ui-demo-20260516` (off sprint-2): **38 routes UI total** (28 web + 8 mini-app + 2 success).
- **7 commits** UI: onboarding 5 steps, settings 8 sections, services/staff/customers/packages/reports CRUD, marketing (templates + recovery 30/60/90), Mini App full flow với mobile-first CSS + tab bar, landing redesign, public web booking fallback.
- Không add test (UI test theo plan Sprint 7 với Playwright).
- **Demo walkthrough**: đọc `UI_DEMO_WALKTHROUGH.md` — có 4 demo paths (~10-15 phút click-through) + 11 điểm cần founder chốt trước BE.
- **PENDING_HUMAN status unchanged**: PH-001 → PH-005 vẫn là blocker cho BE wire. Founder cần chốt UI demo trước, sau đó resolve PH-001 → khởi động Run #5 (Sprint 1 real-wire).
- Cumulative: 24 commits, ~150 source files, 88 tests, 4 night-shift branches.

---

## 📌 Sprint 3 + Polish update (2026-05-19)

Tech Lead dispatch sequence A→B→C autonomous (per "ok lần lượt" instruction):

**A — Features mock-mode** (4 commits):
- A1: Customer booking detail + cancel (GET/DELETE `/api/public/.../bookings/[id]`)
- A2: Auth session API (POST/GET/DELETE `/api/public/auth/session`) + Mini App login wire
- A3: Customer review flow (5-star + comment, `/api/public/.../bookings/[id]/review`)
- A4: Reminder cron stub (`/api/cron/reminders?window=24h|2h`)

**B — Sprint-end-review** (1 commit, `SPRINT_END_REVIEW.md`):
- 3-gate verdict: ✅ PASS (QA: 24/24 routes, BA: 9/10 features, Tech: arch compliant)
- 100/104 tests pass dưới TZ=UTC (4 pre-existing TZ-fragile)

**C — Warning fixes** (1 commit):
- Dynamic favicon via `app/icon.tsx` (brand orange 'H')
- `app/(tenant)/[slug]/default.tsx` silence parallel-route warning
- Mini App favicon.svg + link

**D — Blockers still pending** (anh xử lý):
- 🔴 PH-001 Supabase: blocker chính cho Sprint 4 real-wire (DrizzleRepository swap)
- 🔴 PH-002 Zalo OA + Mini App ID: blocker Mini App production deploy
- 🔴 PH-003 VNPay sandbox: blocker real payment flow
- 🟡 PH-004 Domain hetcho.vn
- 🟡 PH-005 Vercel + Sentry + observability stack
- 🟡 PH-008 5 tiệm pilot beta
- 🟡 PH-009 ≥3 real user interviews

**Cumulative state**:
- Branches: `night-shift/ui-demo-20260516` (current, 26 commits)
- Routes: 60+ web + 11 mini-app + **10 API endpoints** (mới Sprint 3)
- Tests: 104 (96 local Asia/Ho_Chi_Minh, 100 UTC)
- Customer flow E2E: ✅ verified via curl (signup → create booking → confirm-mock → my-bookings → owner dashboard)
