# 🎨 UI Demo Report — Run #4 (Tech Lead Dispatch, 2026-05-16)

> **Strategy shift**: User chỉ đạo "build hết UI với mock data trước → demo click-through → chốt UX → mới làm BE + đăng ký API keys".
>
> Tech Lead nhận instruction → phân rã 11 todo → autonomous dispatch (1 mạch, không hỏi xác nhận).
>
> Sprint 0 → `NIGHT_SHIFT_REPORT.sprint-0.md` · Sprint 1 → `.sprint-1.md` · Sprint 2 → `.sprint-2.md`
> **Demo walkthrough**: `UI_DEMO_WALKTHROUGH.md` ← anh Quân đọc file này trước.

**Branch**: `night-shift/ui-demo-20260516` (off `night-shift/sprint-2-20260516`)
**Mode**: ✅ NIGHT_SHIFT_MODE — mock + local only
**Date**: 2026-05-16
**Run**: #4 + #4b (build hết missing screens)

---

## Summary

✅ **Done**: 11 / 11 UI tasks (Run #4) + **6 / 6 missing-screen tasks (Run #4b)**
🚫 **Violations**: 0
🚫 **Tests added**: 0 (UI test sẽ ở Sprint 7 với Playwright theo plan — không phá quy tắc)

## Run #4b — Missing screens (6 commits)

| Commit | Scope | Files |
|--------|-------|-------|
| `da06f0d` (~) | 404/500/error-boundary + loading skeletons | 6 |
| `e9b6c81` (~) | owner account (profile/password/security/tenants) | 5 |
| `6caece5` | notification settings detail (channels + DND + matrix) | 2 |
| `38ad0d3` (~) | empty states + confirm dialog component | 5 |
| `f31bf12` (~) | Mini App auth flow (Zalo 1-tap + SMS OTP) | 5 |
| `latest` | super-admin panel (5 pages) | 7 |

**Total routes**: 38 → **60 routes** (44 web + 10 mini-app + 6 admin).

---

## Done — 7 commits

| Commit | Scope | Files |
|--------|-------|-------|
| `d6ef728` | onboarding wizard 5 steps with real forms | 7 |
| `9972c62` | settings + services CRUD + staff list/new + TenantShell | 8 |
| `09fca51` | customers + packages + reports pages | 5 |
| `63f179b` | Mini App mobile-first CSS + 4 new pages | 8 |
| `78ae0ab` | Mini App rewrite home/select-slot/confirm + tab-bar | 4 |
| `0f9d609` | Marketing hub + ZNS templates + recovery campaign | 3 |
| `b9971ac` | landing polish + public booking fallback /[slug]/book | 3 |

**Total**: 38 routes (28 web + 8 mini-app + 2 success page).

---

## Phân rã UI groups

### UI-A: Tenant internal pages (web/[slug]/*)

✅ Onboarding 5 steps (`/onboarding/step-{1..5}`) + stepper component
✅ Settings 8 sections (info / hours / peak / deposit / cancel / Zalo / payment / GCal)
✅ Services CRUD: list + new + edit (3 routes)
✅ Staff: card grid + new form (2 routes)
✅ Customers: list with tier filter + detail with progress bar + history (2 routes)
✅ Packages: list + new (spa-only with empty state)
✅ Reports: stat cards + 7-day bar chart + top services + top staff + range toggle
✅ Marketing: hub + templates editor + recovery campaign (3 routes)

### UI-B: Mini App (apps/mini-app, mobile-first)

✅ styles.css: 480px container, brand-orange theme, status pills, peak badges
✅ Tab bar (4 tabs): Tiệm / Lịch của tôi / Liệu trình / Tài khoản
✅ HomePage: hero + tenant card + popular services + staff grid
✅ SelectServicePage: list with category + price
✅ SelectSlotPage: staff cards + 7-day chips + 30-min slot grid (peak highlight)
✅ ConfirmPage: full summary + cọc calculation + agreement + redirect stub
✅ MyBookingsPage: upcoming + history split, status pills
✅ BookingDetailPage: timeline status + payment breakdown + per-status actions
✅ MyPackagesPage: progress bars + remaining
✅ ProfilePage: customer tier + notification toggles + support links

### UI-C: Marketing (F5)

✅ Templates editor with 5 ZNS templates + variable hints
✅ Recovery 30/60/90 with voucher escalation 10→20→30% + funnel stats

### UI-D: Public + landing polish

✅ Landing redesign: hero + demo picker + 6-feature grid + brand CTA strip
✅ Public booking `/[slug]/book`: full form for non-Zalo users
✅ `/[slug]/book/success`: confirmation + OA cross-sell

---

## 🟡 Decisions tự quyết (verify trong UI_DEMO_WALKTHROUGH.md mục "Điểm cần anh Quân chốt")

| Decision | Reversibility |
|----------|---------------|
| Onboarding 5 bước (không phải 6 — bỏ logo upload) | ✅ Có thể thêm step-6 |
| Walk-in form: chỉ tên + SĐT (không email) | ✅ Per-tenant config |
| Tab bar 4 tabs Mini App | ✅ Đổi được |
| Recovery campaign 10/20/30% voucher | ✅ Per-tenant config |
| Tenant nav 8 tabs (Lịch / Dịch vụ / Thợ / Khách / Gói / Báo cáo / Marketing / Cấu hình) | 🟡 Có thể consolidate |
| Mini App fixed 480px container | 🟡 Đổi sang responsive khi Sprint 7 |
| Demo data hard-coded trong `_lib/demo-catalog.ts` (web) + `services/demo-data.ts` (mini-app) | ✅ Swap khi PH-001 |
| Status VN labels: "Chờ cọc / Đã xác nhận / Khách đến / Đang làm / Hoàn tất / Đã huỷ / Khách bỏ hẹn" | 🟡 Founder ưng thì giữ |
| Brand orange #f97316 | 🟡 Đợi brand decision |
| Mọi form dùng `method="get" action="..."` (mock submit) | ✅ Swap server action khi BE ready |

---

## 🔒 Constraint compliance — ZERO violation

| Rule | Status |
|------|--------|
| Mock everything | ✅ Demo data inline, không gọi API |
| Không push remote | ✅ |
| Không touch main | ✅ |
| Không deploy | ✅ |
| Không gọi DB thật | ✅ |
| Không gọi Zalo/VNPay thật | ✅ Stub redirect |
| Commit atomic per UI group | ✅ 7 commits = 4 UI groups |

---

## 📂 Files structure

```
apps/
├── web/
│   └── src/app/
│       ├── page.tsx                          # landing (redesign)
│       ├── (auth)/{login,signup}/page.tsx
│       ├── onboarding/
│       │   ├── _components/stepper.tsx
│       │   ├── page.tsx                      # welcome
│       │   └── step-{1..5}/page.tsx          # 5 steps
│       ├── (tenant)/[slug]/
│       │   ├── _components/tenant-shell.tsx  # shared header + 8-tab nav
│       │   ├── _lib/demo-catalog.ts          # mock data
│       │   ├── dashboard/
│       │   │   ├── _components/{day-grid,day-week-toggle}.tsx
│       │   │   ├── _lib/demo-data.ts
│       │   │   ├── page.tsx
│       │   │   └── walk-in/page.tsx
│       │   ├── services/{,new,[id]/edit}/page.tsx
│       │   ├── staff/{,new}/page.tsx
│       │   ├── customers/{,[id]}/page.tsx
│       │   ├── packages/{,new}/page.tsx
│       │   ├── reports/page.tsx
│       │   ├── marketing/{,templates,recovery}/page.tsx
│       │   └── settings/page.tsx
│       └── (public)/[slug]/book/{,success}/page.tsx
└── mini-app/
    └── src/
        ├── styles.css                        # mobile-first CSS
        ├── app.tsx                           # 8 routes + tab bar
        ├── services/{api.client,demo-data}.ts
        └── pages/
            ├── home.page.tsx
            ├── select-service.page.tsx
            ├── select-slot.page.tsx
            ├── confirm.page.tsx
            ├── my-bookings.page.tsx
            ├── booking-detail.page.tsx
            ├── my-packages.page.tsx
            └── profile.page.tsx
```

---

## Khuyến nghị sáng mai

### 1. Đọc demo walkthrough (5 phút)
```bash
cat UI_DEMO_WALKTHROUGH.md
```
Có 4 demo paths + checklist 11 điểm cần chốt UX/copy.

### 2. Boot 2 dev server (parallel)
```bash
# Terminal 1
pnpm --filter @hetcho/web dev      # → :3000

# Terminal 2
pnpm --filter @hetcho/mini-app dev # → :3001
```

### 3. Click-through theo Path 1 → Path 4 trong walkthrough

### 4. Edit UI_DEMO_WALKTHROUGH.md trực tiếp với ý kiến của anh
Mục "🚨 Điểm cần anh Quân chốt" — tick/sửa từng điểm.

### 5. Sau khi chốt → resolve PENDING_HUMAN.md
PH-001 → PH-005 là blocker cho phase BE. Khi xong → `/night-shift` Run #5 cho Sprint 1 real-wire.

---

## 🧠 Context Checkpoint

- **Estimate context**: 🟠 ~75% (đã build 38 routes + 4 commits Sprint 2 trước đó)
- **Khuyến nghị**: `/compact` trước Run #5

---

## Không làm gì (compliance)

- ❌ KHÔNG deploy
- ❌ KHÔNG push remote
- ❌ KHÔNG merge vào main
- ❌ KHÔNG gọi Supabase/Zalo/VNPay thật
- ❌ KHÔNG commit credentials
- ❌ KHÔNG sửa file production env
- ❌ KHÔNG add real test (UI test theo plan ở Sprint 7 Playwright)

---

_Generated by tech-lead dispatch — Run #4 — 2026-05-16_
_HếtChờ — Phát triển bởi Quân Nguyễn — Demo first, build right._
