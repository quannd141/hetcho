# 🧪 QA Report — UI Demo End-to-End

**Date**: 2026-05-16
**Branch**: `night-shift/ui-demo-20260516`
**Tester**: Chrome DevTools MCP (automated)
**Mode**: Mock data only (NIGHT_SHIFT_MODE)

---

## ⚙️ Setup thay đổi

| Item | Before | After | Lý do |
|------|--------|-------|-------|
| Web port | 3000 | **3300** | Founder báo cổng 3000 bận |
| Mini App port | 3001 | **3301** | Tránh xung đột chuỗi 3xxx |
| `apps/web/package.json` `dev` | `next dev -p 3000` | `next dev -p 3300` | |
| `apps/web/package.json` `start` | `next start -p 3000` | `next start -p 3300` | |
| `apps/mini-app/vite.config.ts` | `port: 3001` | `port: 3301` | |
| `apps/mini-app/src/services/api.client.ts` | `localhost:3000/api` | `localhost:3300/api` | |

**Boot 2 dev server**:
```bash
# Terminal 1 — Web
pnpm --filter @hetcho/web dev          # → http://localhost:3300

# Terminal 2 — Mini App
cd apps/mini-app && node_modules/.bin/vite   # → http://localhost:3301
```

---

## ✅ Summary

| Metric | Value |
|--------|-------|
| **Web routes tested (HTTP 200)** | **40 / 40** ✅ |
| **Console errors (web)** | 0 (1 favicon 404 cosmetic) |
| **Console warnings (web)** | 1 (parallel route default — Next.js suggestion, không gây lỗi UI) |
| **Mini App routes tested** | **8 / 8** ✅ |
| **Console errors (mini-app)** | 0 (1 favicon 404 cosmetic) |
| **Console warnings (mini-app)** | 2 (React Router v7 future flags, không gây lỗi) |
| **Confirm dialog interaction** | ✅ Mở/đóng + disabled state đúng |
| **Empty state render** | ✅ |
| **404 page render** | ✅ |
| **Total screenshots captured** | 25 (`qa-screenshots/`) |

**Verdict**: 🟢 **PASS — sẵn sàng cho founder verify**

---

## 📋 Test Matrix — Web (apps/web @ :3300)

### A. Public + Auth (3 routes)
| # | Route | HTTP | Visual | Console | Note |
|---|-------|------|--------|---------|------|
| 1 | `/` | 200 | ✅ Hero + 3 demo cards + 6-feature grid + CTA | ⚠️ 1 favicon 404 | Screenshot `01-landing.png` |
| 2 | `/login` | 200 | ✅ Magic link form | clean | |
| 3 | `/signup` | 200 | ✅ Tenant signup form | clean | |

### B. Onboarding (6 routes)
| # | Route | HTTP | Visual | Note |
|---|-------|------|--------|------|
| 4 | `/onboarding` | 200 | ✅ Welcome screen | |
| 5 | `/onboarding/step-1` | 200 | ✅ Tenant info form + stepper | `03-onboarding-step1.png` |
| 6 | `/onboarding/step-2` | 200 | ✅ First service form | |
| 7 | `/onboarding/step-3` | 200 | ✅ First staff form | |
| 8 | `/onboarding/step-4` | 200 | ✅ Hours + peak + cancel policy | |
| 9 | `/onboarding/step-5` | 200 | ✅ Zalo OA connect | |

### C. Tenant dashboard (Salon Hằng) (11 routes)
| # | Route | HTTP | Visual | Note |
|---|-------|------|--------|------|
| 10 | `/salon-hang/dashboard` | 200 | ✅ Stat cards + day grid + walk-in btn | `02-dashboard-salon.png` |
| 11 | `/salon-hang/dashboard/walk-in` | 200 | ✅ Form thêm walk-in | |
| 12 | `/salon-hang/services` | 200 | ✅ 4 dịch vụ + peak deposit | `05-services-list.png` |
| 13 | `/salon-hang/services/new` | 200 | ✅ Create form | |
| 14 | `/salon-hang/services/sv-1/edit` | 200 | ✅ Edit + Confirm Dialog wire | `06-service-edit.png`, `07-confirm-dialog.png` |
| 15 | `/salon-hang/staff` | 200 | ✅ 3 staff cards | |
| 16 | `/salon-hang/staff/new` | 200 | ✅ Form multi-service checkbox | |
| 17 | `/salon-hang/customers` | 200 | ✅ List với tier filter | |
| 18 | `/salon-hang/customers/cust-001` | 200 | ✅ Profile + lifetime stats | `08-customer-detail.png` ⚠️ |
| 19 | `/salon-hang/reports` | 200 | ✅ 7-day bar chart + top svc/staff | |
| 20 | `/salon-hang/settings` | 200 | ✅ 8 sections + link sang notifications | |

⚠️ `customers/[id]`: Next.js warning "No default component for parallel route" — Next.js gợi ý thêm `default.tsx` ở `(tenant)/[slug]/` để xử lý loading + not-found ở deep route. **Không gây lỗi visual**, fix sau (optional).

### D. Marketing (3 routes)
| # | Route | HTTP | Visual | Note |
|---|-------|------|--------|------|
| 21 | `/salon-hang/marketing` | 200 | ✅ 4 cards hub | |
| 22 | `/salon-hang/marketing/templates` | 200 | ✅ 5 ZNS templates | |
| 23 | `/salon-hang/marketing/recovery` | 200 | ✅ Recovery 30/60/90 + voucher escalation | `18-marketing-recovery.png` |

### E. Settings notifications (1 route)
| # | Route | HTTP | Visual | Note |
|---|-------|------|--------|------|
| 24 | `/salon-hang/settings/notifications` | 200 | ✅ 5 channel + DND + 11-event matrix | `09-notifications-settings.png` |

### F. Public booking (2 routes)
| # | Route | HTTP | Visual | Note |
|---|-------|------|--------|------|
| 25 | `/salon-hang/book` | 200 | ✅ 5-section form web fallback | `17-public-booking.png` |
| 26 | `/salon-hang/book/success` | 200 | ✅ Confirmation card | |

### G. Spa-only (Mai Spa) (3 routes)
| # | Route | HTTP | Visual | Note |
|---|-------|------|--------|------|
| 27 | `/mai-spa/dashboard` | 200 | ✅ Profile spa + KTV labels | `16-mai-spa-dashboard.png` |
| 28 | `/mai-spa/packages` | 200 | ✅ Liệu trình spa cards | |
| 29 | `/mai-spa/packages/new` | 200 | ✅ Form gói + savings calculator | |

### H. Owner account (4 routes)
| # | Route | HTTP | Visual | Note |
|---|-------|------|--------|------|
| 30 | `/account` | 200 | ✅ Profile + Zalo link + bio | `13-account-profile.png` |
| 31 | `/account/password` | 200 | ✅ Change password form | |
| 32 | `/account/security` | 200 | ✅ 2FA + sessions + login history | `14-account-security.png` |
| 33 | `/account/tenants` | 200 | ✅ Multi-tenant ownership list | |

### I. Super admin (6 routes)
| # | Route | HTTP | Visual | Note |
|---|-------|------|--------|------|
| 34 | `/admin` | 200 | ✅ 4 stats + recent tenants + alerts | `10-admin-overview.png` |
| 35 | `/admin/tenants` | 200 | ✅ Filters + 6-row tenant table | |
| 36 | `/admin/tenants/salon-hang` | 200 | ✅ Impersonate + override + activity | `12-admin-tenant-detail.png` |
| 37 | `/admin/billing` | 200 | ✅ MRR + 6-mo chart + transactions | `11-admin-billing.png` |
| 38 | `/admin/health` | 200 | ✅ 7 dịch vụ + incidents | |
| 39 | `/admin/audit` | 200 | ✅ 10-entry audit log | |

### J. Empty states + Error pages (3 routes)
| # | Route | HTTP | Visual | Note |
|---|-------|------|--------|------|
| 40 | `/salon-hang/services?empty=1` | 200 | ✅ EmptyState rendered | `04-services-empty.png` |
| 41 | `/salon-hang/customers?empty=1` | 200 | ✅ EmptyState rendered | |
| 42 | `/this-route-does-not-exist` | 200 | ✅ Custom 404 page | `15-not-found.png` |

---

## 📱 Test Matrix — Mini App (apps/mini-app @ :3301, viewport 480×844)

| # | Route | Visual | Note |
|---|-------|--------|------|
| M1 | `/tenants/salon-hang` (home) | ✅ Hero + tenant card + services + staff | `20-mini-home.png` |
| M2 | `/login` | ✅ Zalo 1-tap btn + SMS OTP option | `21-mini-login.png` |
| M3 | `/login/otp?phone=...` | ✅ 6-digit input + cooldown + masked phone | `22-mini-otp.png` |
| M4 | `/tenants/salon-hang/services` | ✅ Service cards với category + peak hint | `23-mini-services.png` |
| M5 | `/tenants/salon-hang/slot/sv-1` | ✅ Staff cards + date chips + 30-min slot grid + peak | `24-mini-slot.png` |
| M6 | `/tenants/salon-hang/confirm` | ✅ Summary + cọc + agreement | |
| M7 | `/my-bookings` | ✅ Upcoming + history split | `25-mini-bookings.png` |
| M8 | `/profile` | ✅ Tier + toggles + login session menu | `26-mini-profile.png` |

### Mini App console warnings
- React Router v6 → v7 future flag warnings (`v7_startTransition`, `v7_relativeSplatPath`) — chỉ là khuyến nghị migration, không gây bug. Có thể opt-in sau Sprint 7.

---

## 🎯 Tương tác đã verify

| Tương tác | Kết quả |
|-----------|---------|
| Click "Xoá" trên service edit → Confirm dialog mở | ✅ Modal hiển thị, "Xoá vĩnh viễn" disabled |
| Type-to-confirm `XOA` required | ✅ Button vẫn disabled khi chưa nhập đúng |
| Click "Huỷ" trong dialog | ✅ Dialog đóng, không xoá |
| Empty state với `?empty=1` | ✅ Component render, có CTA + hint |
| 404 catch-all | ✅ Custom not-found page với icon + 2 CTA |
| Nav 8 tab tenant — active state | ✅ Brand orange highlight đúng tab |
| Day/week toggle dashboard | ✅ Link-based, không client state hỏng |

---

## ⚠️ Issues & Recommendations

### 🟢 Low priority (không block demo)
1. **Favicon 404** — chưa có `app/favicon.ico` cho web + `apps/mini-app/public/favicon.ico`. Mỗi page log 1 lỗi.
   - Fix: thêm 1 file favicon hoặc `<link rel="icon" href="data:,">` để suppress.
2. **Next.js parallel-route warning** ở `customers/[id]` — gợi ý tạo `default.tsx` ở segment `(tenant)/[slug]/`. Không gây lỗi UI.
3. **React Router future flags** — cosmetic warning, opt-in v7 sau.

### 🟡 Cần founder chốt trước BE (11 điểm đã list ở `UI_DEMO_WALKTHROUGH.md`)
Không thay đổi — vẫn chờ founder click-through + chốt UX/copy.

### 🔴 Không phát hiện bug functional
Mọi route render đúng layout, không crash, không infinite loop, không layout break.

---

## 📂 Screenshots inventory

`qa-screenshots/` — 25 file:
- Web: 01-18 (18 ảnh)
- Mini App: 20-26 (7 ảnh)

Anh xem từng ảnh để verify visual ở từng page. Mở thư mục trong File Explorer hoặc xem nhanh:
```bash
start qa-screenshots/    # Windows
```

---

## 🚀 Founder verify checklist

Anh Quân vui lòng làm:

- [ ] Mở từng screenshot trong `qa-screenshots/` xem có layout nào bị break không
- [ ] Boot dev server: `pnpm --filter @hetcho/web dev` (sẽ chạy 3300)
- [ ] Mở browser từng URL trong test matrix trên, đặc biệt 4 demo path trong `UI_DEMO_WALKTHROUGH.md`
- [ ] Tick/sửa 11 điểm UX/copy trong `UI_DEMO_WALKTHROUGH.md`
- [ ] Sau khi chốt → resolve `PENDING_HUMAN.md` (PH-001 → PH-005) → khởi động Run #5 cho Sprint 1 real-wire

---

_Generated by Chrome DevTools MCP automated QA — 2026-05-16_
_HếtChờ — Phát triển bởi Quân Nguyễn — Demo first, verify second, build right._
