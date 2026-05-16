# 🎬 UI Demo Walkthrough — HếtChờ

> **Mục đích**: Anh Quân click-through toàn bộ UI để chốt UX/copy/flow trước khi team chuyển sang phase BE + đăng ký API.
>
> **Mode**: 100% mock data, không gọi BE/Supabase/Zalo/VNPay.
>
> **Branch**: `night-shift/ui-demo-20260516` (off `night-shift/sprint-2-20260516`).

---

## ⚡ Quick Start

```bash
cd "d:/AGEN TEAM/het-cho"

# Terminal 1 — Web (dashboard + landing + public booking)
pnpm --filter @hetcho/web dev
# → http://localhost:3000

# Terminal 2 — Mini App (khách Zalo)
pnpm --filter @hetcho/mini-app dev
# → http://localhost:3001
```

> Cần `pnpm install` lần đầu (xem `scripts/bootstrap.sh`).

---

## 🗺️ Demo path đề xuất (10-15 phút click-through)

### Path 1: Founder onboard tiệm mới (5 phút)

1. http://localhost:3000 → **Landing page** (hero + 3 demo tenants + 6 feature grid)
2. Click **"Bắt đầu miễn phí"** → `/signup`
3. Điền tên/slug/email → **Onboarding stepper 5 bước**:
   - `/onboarding/step-1`: tên + loại tiệm + slug + city + capacity
   - `/onboarding/step-2`: dịch vụ đầu tiên + giá + cọc
   - `/onboarding/step-3`: thợ/KTV đầu + dịch vụ làm được
   - `/onboarding/step-4`: giờ làm + peak windows + cancel policy
   - `/onboarding/step-5`: kết nối Zalo OA (skip OK) → vào dashboard

### Path 2: Chủ tiệm dùng dashboard (5 phút)

Đã onboard xong → vào `/salon-hang/dashboard` (hoặc `mai-spa` / `linh-nail`):

1. **Lịch hôm nay** (`/[slug]/dashboard`): stat cards + grid grouped by staff + day/week toggle + walk-in button
2. **Khách walk-in** (`/[slug]/dashboard/walk-in`): form thêm khách tại quầy (tên + SĐT + dịch vụ + thợ + giờ)
3. **Dịch vụ** (`/[slug]/services`): list 4 dịch vụ với cọc thường/peak → click "Thêm dịch vụ" → form `/services/new`
4. **Thợ / KTV** (`/[slug]/staff`): card grid 3 thợ → click "Thêm người" → form với multi-service checkbox
5. **Khách hàng** (`/[slug]/customers`): list 5 khách với tier badges (⭐ VIP, 💎 CIP, Normal)
   - Click "Chi tiết" → `/customers/[id]`: profile + thống kê + **progress bar liệu trình** + history table + CRM notes
6. **Gói liệu trình** (`/[slug]/packages`): chỉ hiển thị cho spa (Mai Spa) — card grid với sessions/price/sold count
   - `/packages/new`: form tạo gói với savings calculator
7. **Báo cáo** (`/[slug]/reports`): stat cards + **bar chart 7 ngày** + top services + top staff + range toggle (day/week/month)
8. **Marketing** (`/[slug]/marketing`): 4 cards
   - `/marketing/templates`: 5 ZNS template editable
   - `/marketing/recovery`: campaign 30/60/90 ngày với voucher escalation 10→20→30%
9. **Cấu hình** (`/[slug]/settings`): 8 section — info, hours, peak, deposit, cancel, Zalo, payment, GCal

### Path 3: Khách đặt qua Zalo Mini App (3 phút)

Mở http://localhost:3001 (phải `pnpm --filter @hetcho/mini-app dev` chạy):

1. **Home tiệm** (`/tenants/salon-hang`): hero + tenant card + popular services + staff grid
2. Bấm **"Đặt lịch ngay"** → **Chọn dịch vụ** (`/services`)
3. Chọn dịch vụ → **Chọn thợ + ngày + giờ** (`/slot/:serviceId`):
   - Staff cards 2 cột (kể cả "Bất kỳ")
   - Date picker 7 ngày (chip horizontal scroll)
   - 30-min slot grid với badge cao điểm + một số slot "unavailable"
4. Chọn slot peak → bottom bar hiển thị → **Xác nhận** (`/confirm`)
5. Summary: tiệm + chi tiết + customer info + thanh toán (cọc cao điểm) + agreement
6. Bấm "Thanh toán cọc" → alert mock VNPay → về `/my-bookings`
7. **Tab bar** (4 tabs): Tiệm / **Lịch của tôi** / **Liệu trình** / Tài khoản
   - **Lịch của tôi**: upcoming + history với status pills, click vào xem **chi tiết booking**
   - **Liệu trình**: progress bar gói 10 buổi
   - **Tài khoản**: profile + notification toggles + support links

### Path 4: Khách không có Zalo dùng web (1 phút)

http://localhost:3000/salon-hang/book

- Form 5 section: dịch vụ radio + staff + date/time + customer info (SĐT bắt buộc) + agreement
- Promote Mini App "đặt qua Zalo nhanh hơn"
- Submit → `/book/success`: trang xác nhận với booking details + cross-sell OA

---

## 📦 Inventory màn hình (38 routes total)

### Web `apps/web` (28 routes)

| Route | Mục đích | Status |
|-------|----------|--------|
| `/` | Landing page với hero + demo picker + features | ✅ |
| `/login` | Magic link form | ✅ |
| `/signup` | Tenant signup form | ✅ |
| `/onboarding` | Welcome + stepper preview | ✅ |
| `/onboarding/step-1` | Thông tin tiệm | ✅ |
| `/onboarding/step-2` | Dịch vụ đầu tiên | ✅ |
| `/onboarding/step-3` | Thợ / KTV đầu | ✅ |
| `/onboarding/step-4` | Giờ làm + peak + cancel policy | ✅ |
| `/onboarding/step-5` | Zalo OA connect (optional) | ✅ |
| `/[slug]/dashboard` | Lịch hôm nay grid view | ✅ |
| `/[slug]/dashboard/walk-in` | Thêm walk-in customer | ✅ |
| `/[slug]/services` | List dịch vụ | ✅ |
| `/[slug]/services/new` | Tạo dịch vụ | ✅ |
| `/[slug]/services/[id]/edit` | Sửa dịch vụ | ✅ |
| `/[slug]/staff` | Card grid thợ/KTV | ✅ |
| `/[slug]/staff/new` | Tạo thợ | ✅ |
| `/[slug]/customers` | List khách + tier filter | ✅ |
| `/[slug]/customers/[id]` | Customer detail + liệu trình + history | ✅ |
| `/[slug]/packages` | List gói (spa-only) | ✅ |
| `/[slug]/packages/new` | Tạo gói liệu trình | ✅ |
| `/[slug]/reports?range=day/week/month` | Doanh thu + top svc + top staff + chart | ✅ |
| `/[slug]/marketing` | Hub 4 cards | ✅ |
| `/[slug]/marketing/templates` | 5 ZNS template editable | ✅ |
| `/[slug]/marketing/recovery` | Campaign 30/60/90 ngày | ✅ |
| `/[slug]/settings` | 8 sections cấu hình | ✅ |
| `/[slug]/book` | Public booking (không Zalo) | ✅ |
| `/[slug]/book/success` | Xác nhận đặt thành công | ✅ |
| `/api/health` | Health check | ✅ |

### Mini App `apps/mini-app` (8 routes)

| Route | Mục đích | Status |
|-------|----------|--------|
| `/` → `/tenants/salon-hang` | Redirect | ✅ |
| `/tenants/:slug` | Home tiệm + dịch vụ + thợ | ✅ |
| `/tenants/:slug/services` | List dịch vụ | ✅ |
| `/tenants/:slug/slot/:serviceId` | Staff + date + slot picker | ✅ |
| `/tenants/:slug/confirm` | Xác nhận + thanh toán cọc stub | ✅ |
| `/my-bookings` | Upcoming + history | ✅ |
| `/my-bookings/:id` | Booking detail + actions | ✅ |
| `/my-packages` | Liệu trình progress | ✅ |
| `/profile` | Tài khoản + settings | ✅ |

---

## 🎨 Design tokens

- **Brand orange**: `#f97316` (hero, primary button, active nav)
- **Brand dark**: `#c2410c` (hover state, price display)
- **Status colors**:
  - `pending` amber, `confirmed` blue, `checked_in` purple, `in_service` indigo
  - `completed` emerald, `cancelled` slate (line-through), `no_show` rose
- **Tier badges**: ⭐ VIP amber, 💎 CIP blue, Normal slate
- **Peak badge**: orange tag với "cao điểm"

---

## 🚨 Điểm cần anh Quân chốt trước khi BE

### UX quyết định (anh xem rồi gật/lắc)
1. **Onboarding 5 bước** — có ngắn quá không? Có cần thêm bước 6 (upload logo / cover image)?
2. **Walk-in form chỉ tên + SĐT** — có cần email không? (Hiện tại không bắt vì khách walk-in ít cho)
3. **Cancel policy mặc định 24h / 50% fine** — đã ok? Có cần custom per-service?
4. **Tier rule** Normal/CIP/VIP: ≥10 booking = CIP, ≥50 booking + 30tr = VIP. Có hợp lý?
5. **Recovery campaign** 10% / 20% / 30% — voucher có quá cao không?
6. **Mini App tab bar 4 tabs**: Tiệm / Lịch / Liệu trình / Tài khoản. Có muốn đổi cấu trúc?
7. **Public web booking** (`/[slug]/book`) — có promote SMS hay chỉ Zalo?

### Copy/wording check
- "Đặt là vào liền" — tagline OK chưa?
- VN labels cho status: "Chờ cọc", "Khách đến", "Đang làm", "Hoàn tất", "Khách bỏ hẹn" — có muốn đổi?
- Stat card label: "Doanh thu hôm nay" / "No-show" — có dùng tên gọn hơn?
- "Liệu trình" vs "Gói buổi" — chọn tên nào?

### Visual / brand
- Hero background gradient orange — có quá nhạt/đậm?
- Logo placeholder "HếtChờ" text — có cần design logo khác?
- Mini App mobile container fixed 480px — có thay đổi không?

### Missing screens (chốt có cần build không trước BE)
- [ ] **Sprint 7 polish**: 404, 500, error boundary, loading skeletons
- [ ] **Empty states** cho khi mới onboard chưa có gì
- [ ] **Notification settings detail page** (hiện chỉ toggle)
- [ ] **Owner profile page** (đổi password, ảnh, logout)
- [ ] **Mini App auth flow** (Zalo login button, fallback web với SMS OTP)
- [ ] **Confirm dialog** cho destructive actions (xoá dịch vụ, huỷ booking)
- [ ] **Admin/super-admin** (HếtChờ team — quản lý tenants)

---

## 🔧 Sau khi anh chốt UI → checklist next phase

1. **Anh tick** điểm UX/copy chốt (gửi feedback hoặc edit trực tiếp file này).
2. **PENDING_HUMAN.md** → xử lý PH-001 → PH-005 (Supabase, Zalo, VNPay, domain, Vercel/Sentry).
3. Tech Lead dispatch team:
   - **Sprint 1 real-wire**: Supabase Auth + DrizzleRepository thay InMemory*
   - **Sprint 3**: Mini App Zalo SDK auth + real availability API
   - **Sprint 4**: VNPay webhook + cọc real + GCal sync
   - **Sprint 6**: Cron job nhắc T-24h/T-2h + recovery campaign
4. Sau wire → demo lại với data thật trên staging Supabase.

---

## 📊 Cumulative state

- **Branches**: `sprint-0` → `sprint-1` → `sprint-2` → **`ui-demo`** (current)
- **Tests**: 88 (unchanged — không add test cho UI; UI test sẽ ở Sprint 7 với Playwright)
- **UI commits**: 7 (Run #4)
- **Total commits**: 24 (3 sprint + 7 UI + base)
- **Files**: ~150 source files
- **Constraint violations**: 0 — no real API, no remote push, no main touch

---

_Generated by tech-lead dispatch — Run #4 — 2026-05-16_
_HếtChờ — Phát triển bởi Quân Nguyễn — Demo first, build right._
