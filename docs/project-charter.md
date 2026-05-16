# Project Charter — HếtChờ

**Phiên bản**: 1.0
**Ngày phát hành**: 2026-05-16
**Người phê duyệt**: Quân Nguyễn (Solo founder)
**Người soạn**: AI Project Manager (skill `project-kickoff`)
**Nguồn input**: `docs/ideation-source/SUMMARY.md` (đã chạy `/project-ideation` cùng ngày) + cuộc trao đổi PM-Q1→Q5 ngày 2026-05-16
**Trạng thái**: ✅ PM sign-off — chuyển Phase 2 BA Discovery

---

## 1. Tổng quan & Tagline

**Tên dự án**: HếtChờ (`het-cho`)
**Tagline**: "Đặt là vào liền."
**One-liner**: SaaS đặt lịch zero-fee cho mọi tiệm làm đẹp nhỏ ở Việt Nam (salon tóc, spa, nail, barber, gội đầu, massage). Zalo-first, multi-tenant. Giúp khách đặt lịch đến đúng giờ vào ghế/giường liền — không còn xếp hàng chờ 30-60 phút.

**Cảm hứng tham chiếu**: [clientbookings.co.uk](https://clientbookings.co.uk/) (model zero-fee, recovery campaign 30/60/90 ngày).

---

## 2. Vấn đề & End-user

### 2.1 Pain Points (ưu tiên giảm dần)
1. **Xếp hàng chờ** — khách đến tiệm phải đợi 30-60 phút → bỏ về → mất doanh thu *(pain CHÍNH, đặt tên brand)*
2. **No-show** — khách đặt rồi không đến → tiệm trống slot cao điểm → cần đặt cọc giữ chỗ
3. **Tiệm nhỏ thiếu công cụ** — chỉ dùng sổ + Zalo, không có dashboard tổng
4. **Booking link Tây fail ở VN** — khách quen inbox Zalo, không click form
5. **Khó track liệu trình** — đặc biệt khách spa đi 5-10 buổi liên tiếp

### 2.2 End-user kép

| Persona | Vai trò | Đặc điểm |
|---------|--------|----------|
| **Chủ tiệm / lễ tân** (B) | Decision maker, daily operator | Không rành tech, dùng điện thoại > laptop, quản 3-5 ghế/giường/bàn |
| **Khách hàng cuối** (C) | Người đặt lịch + đến làm dịch vụ | Nữ + nam 22-45, quen Zalo Mini App, giá trị mỗi lần 100k-5tr |

### 2.3 Target market
- Tiệm 1-3 ghế/giường/bàn ở thành thị VN (HN, SG, ĐN), đa ngành làm đẹp.
- Tổng thị trường ~80.000-100.000 tiệm trên cả VN.

---

## 3. Mục tiêu Dự án

- [ ] **G1**: Giải quyết pain "khách chờ lâu" cho ≥ 50 tiệm pilot trong 6 tháng đầu sau Public Launch (đo qua retention 70% sau 3 tháng dùng thử).
- [ ] **G2**: Validate model **zero-fee + Zalo-first** ở thị trường VN — cụ thể: ≥ 30% tiệm pilot tự rủ tiệm khác dùng (viral organic).
- [ ] **G3**: Build foundation kỹ thuật cho phép thêm payment/wallet/loyalty ở Phase 2 mà không phải viết lại core.
- [ ] **G4**: Có ≥ 1 case study tiệm pilot thật (số liệu before/after) làm marketing material trước Open Beta.

---

## 4. Phạm vi MVP — Phương án Hợp nhất (đã chốt)

> **Quyết định scope (PM-Q2)**: Hợp nhất Ideation Summary 5 feature + thêm "Đặt cọc giữ chỗ" để chống no-show. Loyalty / VIP prepaid wallet / full payment processing → **Phase 2** (sau Public Launch).

### 4.1 In Scope MVP (6 feature)

| ID | Feature | Mô tả ngắn | Pain giải quyết |
|----|---------|-----------|-----------------|
| **F1** | Zalo Mini App booking | Khách đặt qua Zalo Mini App + web fallback. Chọn dịch vụ → thợ/KTV → giờ → xác nhận. | Pain #3 (booking link Tây fail) |
| **F2** | Dashboard chủ tiệm | Web app responsive. Xem lịch ngày/tuần, xác nhận/đổi/huỷ booking. Sync Google Calendar 2 chiều. | Pain #3 (thiếu công cụ) |
| **F3** | Realtime availability | Khách thấy slot trống real-time (theo ghế/giường/bàn), đặt → vào ghế đúng giờ. | **Pain #1 (xếp hàng — core USP)** |
| **F4** | Customer tier + liệu trình | Phân hạng VIP/CIP/Normal (ưu tiên slot), track "đã làm 3/10 buổi" cho gói liệu trình spa. | Pain #5 (track liệu trình) |
| **F5** | Reminder + Recovery Zalo | Nhắc 24h + 2h trước (giảm no-show). Auto nhắc khách cũ 30/60/90 ngày (mượn ClientBookings). | Pain #2 (no-show) + retention |
| **F6** | 🆕 Đặt cọc giữ chỗ | Khách đặt slot cao điểm → trả cọc qua VNPay/MoMo/ZaloPay (50k-200k). Tiệm xác nhận xong → cọc về ví tiệm. Khách đến đúng giờ → trừ vào tổng bill. No-show → tiệm giữ cọc. | Pain #2 (no-show, scope mới add) |

**Cấu hình linh hoạt theo loại tiệm**:
- Tóc/barber/gội đầu: slot = "ghế", người = "stylist/thợ"
- Spa/massage: slot = "giường/phòng", người = "KTV"
- Nail: slot = "bàn nail", người = "thợ nail"

### 4.2 Out of Scope MVP (rõ ràng để tránh scope creep)

⛔ **Không build MVP — dời Phase 2 (sau Public Launch tháng 4.5):**
- Loyalty / tích điểm hệ thống
- Gói VIP trả trước cả năm, trừ dần (prepaid wallet)
- Full payment processing tại quầy (POS thanh toán cuối dịch vụ)
- CRM mini nâng cao (sinh nhật, ghi chú dị ứng, lifetime value)
- Báo cáo doanh thu nâng cao (P&L, profit margin theo thợ)
- App native iOS/Android riêng (Zalo Mini App đủ cho MVP)
- Custom subdomain `abc.hetcho.vn` (gói Pro Phase 2)

---

## 5. Architecture đã chốt

**Mô hình**: Multi-tenant SaaS.

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

- Tiệm login `app.hetcho.vn`, dữ liệu cách ly tenant.
- Khách đặt qua Zalo OA tiệm hoặc `hetcho.vn/<slug>`.
- Footer: "powered by HếtChờ".

→ **Stack chi tiết Tech Lead quyết Phase 4** (gợi ý từ Ideation: Next.js 14 + Supabase + Zalo Mini App SDK).

---

## 6. Timeline & Milestones

> **Release strategy chốt**: 🅒 Closed Beta → Open Beta → Public Launch (PM-Q3).

| Phase | Tuần | Milestone | Sản phẩm chính | Trạng thái gate |
|-------|------|-----------|----------------|-----------------|
| Sprint 0 | T1 | **Foundation** | Repo, CI, infra base, design tokens, Supabase project, Zalo OA tài khoản | — |
| Sprint 1-2 | T2-5 | **Core Queue + Dashboard** | F2 Dashboard + F3 Realtime availability | — |
| Sprint 3-4 | T6-9 | **Booking + Cọc** | F1 Zalo Mini App + F6 Đặt cọc giữ chỗ + sync Google Calendar | — |
| 🚩 **M1** | **Cuối T9** | **🟢 Closed Beta Launch** | Mời 3-5 tiệm pilot dùng thật (miễn phí 100%) | **Gate**: phải có ≥ 3 tiệm đồng ý tham gia |
| Sprint 5-6 | T10-13 | **Tier + Recovery** | F4 Customer tier + liệu trình + F5 Reminder/Recovery campaign | — |
| Sprint 7 | T14-15 | **CRM lite + Polish** | Bug fix từ pilot feedback, customer notes nhẹ, multi-language nếu cần | — |
| 🚩 **M2** | **Cuối T15** | **🟡 Open Beta** | Mở rộng 20-50 tiệm; vẫn miễn phí | **Gate**: pilot retention ≥ 70% |
| Sprint 8 | T16-17 | **Hardening** | Load test, security audit (skill `security-audit`), observability (`observability-setup`), production-readiness-audit | — |
| 🚩 **M3** | **T18 (~4.5 tháng)** | **🔴 Public Launch** | Mở toàn thị trường VN; miễn phí 12 tháng đầu | **Gate**: production-readiness-audit pass |

**Phase 2** (sau M3, T19+): Payment full + prepaid VIP + loyalty + CRM nâng cao — không bind timeline trong charter này.

---

## 7. Ràng buộc đã xác định

### 7.1 Resources (PM-Q4)
- **Team**: 🅓 **Solo founder + AI agent stack tăng tốc** (Quân Nguyễn). Tận dụng Claude Code + repo skills của Quân Nguyễn (`senior-developer`, `night-shift`, `tdd`, scaffolding template).
- **Ngân sách infra**: 🅒 **5-20 triệu/tháng** sẵn sàng đầu tư (Supabase Pro, Vercel Pro, VNPay/MoMo merchant fee, Zalo OA Pro nếu cần).
- **Build mode**: Build từ đầu, không tích hợp hệ thống POS/máy in bill có sẵn.

### 7.2 Compliance (PM-Q4e — deferred)
- ✅ Payment **PHẢI** qua cổng có giấy phép NHNN (VNPay / MoMo / ZaloPay) — mặc định.
- ⚠️ Hóa đơn điện tử / kết nối thuế: **deferred** ("tính sau") — flag để BA review lại khi viết SRS Phase 3 cho F6.
- ✅ Bảo vệ dữ liệu cá nhân khách: tuân thủ Nghị định 13/2023/NĐ-CP (PDP) — Tech Lead phải plan từ Phase 4.
- ⚠️ **Trademark check** "HếtChờ" + "Het Cho" + `hetcho.vn` — phải làm trước Public Launch M3.

### 7.3 Technical
- Stack chính do Tech Lead quyết Phase 4 (gợi ý Next.js + Supabase + Zalo Mini App).
- Mobile-first cho cả khách lẫn chủ tiệm.
- Realtime queue (F3) → cần WebSocket/SSE/Supabase Realtime ngay từ Sprint 1.

---

## 8. Rủi ro & Mitigation

| # | Rủi ro | Khả năng | Impact | Mitigation |
|---|--------|---------|--------|-----------|
| R1 | **Solo founder × 6 feature × 4.5 tháng** = quá tải, dễ trễ | **Cao** | Cao | Tận dụng AI agent + scaffolding Quân Nguyễn. Mỗi sprint cuối checkpoint kỹ. Sẵn sàng đẩy 1 feature ra Phase 2 nếu T9 chưa xong F1-F3. |
| R2 | **Zalo Mini App SDK** có quirks chưa lường hết (review approval, OA chính chủ, payment in-app) | TB | Cao | Sprint 0 phải spike PoC Zalo Mini App + đăng ký OA chính chủ ngay. Block nào không vượt qua → ghi PENDING_HUMAN. |
| R3 | **Đặt cọc qua VNPay/MoMo** cần merchant account + KYC doanh nghiệp | TB | Cao | Đăng ký song song Sprint 0-1. Tích hợp sandbox trước, swap production khi có account. |
| R4 | **Tiệm pilot từ chối thử** (chủ tiệm bận, không tin tech) | TB | TB | BA Discovery phải tuyển 5-7 tiệm "warm" có quan hệ trước, không cold pitch. |
| R5 | **Khách Zalo không chịu đặt cọc** (chưa quen trả tiền trước) | TB | TB | F6 đặt cọc chỉ apply slot cao điểm (T7-CN, lễ Tết), slot thường giữ free booking. UX phải explain rõ "trừ vào tổng bill, không mất tiền". |
| R6 | **Cạnh tranh Sapo Salon / GoBeauty** push giá xuống | Thấp | TB | Zero-fee 12 tháng đầu = moat. Khoảng trống thị trường tiệm 1-3 ghế chưa ai phục vụ. |
| R7 | **Tên "HếtChờ" trademark conflict** | Thấp | Cao | Check trước T15 (trước Open Beta). |

---

## 9. Định nghĩa Thành công (PM-Q5)

> **Anh trả lời "có khách là được"** — em chuyển thành KPI đo được:

**Sau 6 tháng kể từ Public Launch (M3)**:
- 🎯 **Primary**: ≥ **50 tiệm active** (active = có booking thật trong 30 ngày gần nhất).
- 🎯 **Retention**: ≥ **70%** tiệm pilot Closed Beta tiếp tục dùng sau 3 tháng dùng thử.
- 🎯 **Khách**: ≥ **5.000 booking** đã thực hiện qua nền tảng.
- 📊 **Bonus**: ≥ **30%** tiệm pilot tự rủ tiệm khác dùng (viral organic).

> 💰 **Doanh thu chưa là KPI MVP** — Zero-fee 12 tháng đầu. Doanh thu là KPI Phase 2.

---

## 10. Monetization (deferred to BA Discovery)

> **Ideation đã hint** 3 hướng — BA Discovery sẽ khảo sát 10-15 chủ tiệm thật để chốt:
- (a) **Freemium** — free 1 ghế/giường, trả phí từ 2 slot (99-299k/tháng)
- (b) **Add-on** — free core, charge SMS / marketing / custom domain / analytics
- (c) **Commission** — % nhỏ trên booking thanh toán qua platform

→ Quyết định sau Closed Beta (M1) khi có data thật.

---

## 11. Bước tiếp theo

✅ **Phase 1 PM — hoàn tất.**

**Chuyển Phase 2 BA Discovery** (skill `customer-discovery`):
- Stakeholder map + RACI
- Interview plan (5-7 chủ tiệm × đa dạng: salon + spa + nail + barber)
- Workshop (nếu cần)
- As-Is / To-Be flow
- Pain points & opportunities map

**Output Phase 2 dự kiến**: 5 file trong `docs/discovery/`:
1. `01-stakeholders.md`
2. `02-interview-script.md`
3. `interviews/<persona>-<date>.md` (5-7 files)
4. `03-flow-as-is.md`
5. `04-flow-to-be.md`
6. `05-opportunities.md`

**Gate trước Phase 3**: Founder review + chốt monetization direction.

---

**Phát triển bởi Quân Nguyễn — Quality First, Always.**
