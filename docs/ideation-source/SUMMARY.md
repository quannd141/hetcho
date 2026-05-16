# HếtChờ — Ideation Summary

**Ngày**: 2026-05-16
**Skill chạy**: `/project-ideation`
**Trạng thái**: ✅ Đủ điều kiện chạy `/project-kickoff`

---

## One-liner

SaaS đặt lịch zero-fee cho **mọi tiệm làm đẹp nhỏ** ở Việt Nam (salon tóc, spa skin care, nail, barber, gội đầu, massage), Zalo-first, multi-tenant — giúp khách đặt lịch đến đúng giờ vào ghế/giường liền, **không còn xếp hàng chờ**.

> **Tagline**: "HếtChờ — Đặt là vào liền."

## Cảm hứng & nguồn

- **Reference**: [clientbookings.co.uk](https://clientbookings.co.uk/) — model zero monthly fee, dùng Google Sheets làm backend, recovery campaign 30/60/90 ngày
- **Pain point gốc**: Tiệm đông khách → khách chờ 30-60 phút → bỏ về → mất doanh thu. Tiệm nhỏ không có ngân sách 200-500k/tháng cho Sapo Salon / GoBeauty → tiếp tục dùng sổ tay + Zalo thủ công

## Bài toán giải quyết (Pain Points)

1. **Xếp hàng chờ** — khách đến tiệm phải đợi 30-60 phút → bỏ về → mất doanh thu (pain CHÍNH, đặt tên brand)
2. **Tiệm nhỏ thiếu công cụ** — chỉ dùng sổ + Zalo, không có dashboard tổng
3. **Booking link Tây fail ở VN** — khách quen inbox Zalo/Facebook, không click form
4. **Quản lý khách quay lại** — đặc biệt khách spa đi theo liệu trình (5-10 buổi), tiệm khó track tiến độ

## Target User (bao trùm)

- **Primary**: Chủ tiệm làm đẹp nhỏ 3-5 ghế/giường/bàn ở thành thị VN (HN, SG, ĐN). Bao gồm:
  - Salon tóc / barber
  - Spa skin care / massage
  - Nail
  - Gội đầu dưỡng sinh
- **Quy mô thị trường**: ~80.000-100.000 tiệm trên cả VN
- **End user (khách)**: Nữ + nam 22-45, đã quen Zalo Mini App, giá trị mỗi lần 100k-5tr

## USP (3 điểm khác biệt)

1. **Zero monthly fee** — dùng Supabase free tier / Google Sheets backend → bền vững model free, vào được phân khúc tiệm 1-3 ghế mà đối thủ không phục vụ
2. **Zalo-first** — đặt lịch qua Zalo OA / Mini App của riêng từng tiệm, không cần app riêng, không cần web
3. **Realtime availability** — khách thấy slot trống giờ nào → đặt đến đúng giờ vào ghế liền (giải pain "chờ 1 tiếng" = tên brand)

## Architecture Model

**Multi-tenant SaaS** (đã chốt):

```
        Platform: HếtChờ (1 brand chung)
                  │
   ┌──────────────┼──────────────┐
   ▼              ▼              ▼
Tiệm ABC       Tiệm XYZ       Tiệm 123
(tenant)       (tenant)       (tenant)
Zalo OA ABC    Zalo OA XYZ    Zalo OA 123
Dashboard      Dashboard      Dashboard
riêng          riêng          riêng
```

- Chủ tiệm login vào `app.hetcho.vn` → dashboard riêng, dữ liệu cách ly tenant
- Khách của Tiệm ABC đặt qua Zalo OA của Tiệm ABC (sub-link tự sinh) hoặc `hetcho.vn/abc`
- Tiệm giữ brand riêng (Salon ABC / Spa ABC), platform là "powered by HếtChờ" ở footer
- Upsell tương lai: gói Pro = custom subdomain (`abc.hetcho.vn`), gói Enterprise = custom domain (`booking.salonabc.vn`)

## Scope MVP (5 feature)

| ID | Feature | Mô tả ngắn |
|----|---------|-----------|
| F1 | **Zalo Mini App booking** | Khách đặt qua Zalo Mini App + web fallback. Chọn dịch vụ → KTV/thợ → giờ → xác nhận |
| F2 | **Dashboard chủ tiệm** | Xem lịch ngày/tuần, xác nhận/đổi/huỷ booking, sync Google Calendar 2 chiều |
| F3 | **Realtime availability** | Khách nhìn slot (ghế/giường/bàn) trống giờ nào → đặt đến đúng giờ vào liền (core USP) |
| F4 | **Customer tier + liệu trình** | Phân hạng VIP/CIP/Normal, ưu tiên slot, ghi nhận "đã làm 3/10 buổi" cho gói liệu trình spa |
| F5 | **Reminder + Recovery Zalo** | Nhắc 24h + 2h trước (giảm no-show). Auto nhắc khách cũ 30/60/90 ngày (mượn ý ClientBookings) |

**Cấu hình linh hoạt theo loại tiệm** (configurable, không hard-code):
- Tiệm tóc: slot = "ghế", thợ = "stylist"
- Spa: slot = "giường/phòng", KTV
- Nail: slot = "bàn nail", thợ nail
- Gội đầu: slot = "ghế", thợ

## Brand & Naming

- **Tên dự án**: `het-cho` (HếtChờ)
- **Tagline**: "Đặt là vào liền"
- **Tông brand**: Tin cậy + đánh thẳng pain point + viral-friendly
- **Ngôn ngữ brand**: Tiếng Việt
- **Đối tượng nhìn tên đầu tiên**: Chủ tiệm (B2B), nhưng tên đủ catchy để khách cuối nhớ ("Tiệm này có HếtChờ", "Đặt qua HếtChờ đi")
- **Lợi thế tên**: Viral từ chính nghĩa từ — chủ tiệm gặp nhau bảo "chuyển sang HếtChờ đi"

## Monetization (chưa chốt — BA Discovery sẽ khảo sát)

Hướng đề xuất giai đoạn này:
- **Phase 1 (0-12 tháng)**: Free hoàn toàn → lấy 3.000-5.000 tiệm làm thị phần (target lớn hơn vì bao trùm cả salon + spa + nail)
- **Phase 2 (sau 12 tháng)**: Một trong 3 model
  - (a) **Freemium** — free 1 ghế/giường, trả phí từ 2 slot (99-299k/tháng)
  - (b) **Add-on** — free core, charge SMS/marketing/custom domain/analytics
  - (c) **Commission** — % nhỏ trên booking thanh toán qua platform

→ BA Discovery cần khảo sát 10-15 chủ tiệm thật (đa dạng loại: salon + spa + nail) để chốt model.

## Competitor cần research kỹ (giao Tech Lead)

| Tên | Phân khúc | Điểm yếu |
|-----|-----------|----------|
| **Sapo Salon** | Salon/spa vừa, 300-500k/tháng | Heavy, đắt cho tiệm 1-3 ghế |
| **GoBeauty** | Spa/salon có app, freemium | Phụ thuộc app riêng, khách không quen download |
| **KiotViet Salon** | POS-first | Booking yếu |
| **Bookingcare** | Y tế/clinic | Không phải tiệm làm đẹp |

→ **Khoảng trống thị trường**: Tiệm 1-3 ghế zero-fee, Zalo-first, đa ngành làm đẹp — chưa ai làm.

## Readiness Verdict

```
✅ Đã rõ — chạy /project-kickoff:
- [x] Pain point & target user rõ (chủ tiệm làm đẹp nhỏ 3-5 slot VN, đa ngành)
- [x] Scope MVP 5 feature cụ thể (F1-F5)
- [x] Brand đã chốt (HếtChờ, VI, B2B-facing, pain-point-direct, viral-friendly)
- [x] Architecture đã chốt (Multi-tenant SaaS)
- [x] Cấu hình linh hoạt theo loại tiệm (salon/spa/nail/barber)

🟡 Để BA Discovery + Tech Lead xử lý sau kickoff:
- [ ] Monetization model cụ thể (a/b/c) — BA khảo sát 10-15 chủ tiệm
- [ ] Stack technical — Tech Lead quyết (gợi ý: Next.js 14 + Supabase + Zalo Mini App SDK)
- [ ] Competitor deep-dive — Tech Lead research
- [ ] Customer Discovery — BA chạy `/customer-discovery` skill (đặc biệt cần khảo sát cả salon + spa + nail để xác nhận giả định "pain chung")
- [ ] BRD + SRS — BA chạy `/requirements-documentation` skill
- [ ] Trademark check — kiểm tra "HếtChờ" + "Het Cho" + "hetcho.vn" trước launch
```

---

**Phát triển bởi Quân Nguyễn — Quality First, Always.**
