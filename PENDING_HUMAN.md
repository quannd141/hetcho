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

**Last updated**: 2026-05-16 by night-shift agent
