# Business Requirements Document — HếtChờ

**Phiên bản**: 1.0
**Ngày phát hành**: 2026-05-16
**Tác giả**: AI BA (skill `requirements-documentation`)
**Người duyệt**: Quân Nguyễn (Founder — sponsor signoff cho dự án nội bộ)
**Trạng thái**: ✅ Approved — chuyển SRS

> **Lưu ý**: Dự án nội bộ solo founder → BRD này = founder self-signoff, không cần khách hàng ký. Khi mở rộng (gọi vốn, hợp tác chiến lược) → có thể dùng làm pitch material.

---

## 1. Tóm tắt điều hành (Executive Summary)

**HếtChờ** là nền tảng SaaS đặt lịch zero-fee cho tiệm làm đẹp nhỏ (salon, spa, nail, gội đầu, barber) tại Việt Nam. Sản phẩm hoạt động Zalo-first qua Mini App, hỗ trợ realtime queue, đặt cọc giữ chỗ, tracking liệu trình và recovery campaign — giúp giảm 30-50% walk-out và 50-70% no-show cho tiệm 1-5 ghế/giường/bàn.

**Khoảng trống thị trường**: ~80.000-100.000 tiệm nhỏ Việt Nam chưa được phục vụ bởi Sapo Salon (đắt + phức tạp) hoặc GoBeauty (yêu cầu app riêng). HếtChờ định vị là **"Booksy bản Việt cho tiệm 1-3 ghế"** — miễn phí 12 tháng đầu để build thị phần.

**Outcome 6 tháng sau Public Launch**: 50+ tiệm active, 5.000+ booking, 70%+ retention pilot.

---

## 2. Vấn đề Kinh doanh

### 2.1 Pain Points đã xác nhận (qua Discovery)

| # | Pain | Tần suất | Chi phí cơ hội |
|---|------|----------|----------------|
| BP1 | Khách walk-out vì chờ 20-60 phút cao điểm | Hàng ngày peak (30%) | 5-15 triệu/tháng/tiệm 4 ghế |
| BP2 | No-show booking online | 15-20% booking | 2-6 triệu/tháng/tiệm |
| BP3 | Lễ tân trả Zalo chậm → mất khách trước book | Mỗi giờ | 2-5 booking lost/ngày |
| BP4 | Chủ tiệm không track liệu trình spa | 30% gói bỏ giữa chừng | 3-8 triệu/tháng/spa |
| BP5 | Recovery khách cũ không tự động | 0% được làm | Mất 30-50% LTV |
| BP6 | App quản lý hiện tại (Sapo, GoBeauty) phức tạp + đắt | Tiệm đã thử & bỏ | Tiệm quay lại sổ tay |

### 2.2 Định lượng thiệt hại

> Tiệm trung bình 4 ghế/giường/bàn ở thành thị VN, doanh thu 80-120tr/tháng:
> - **Tổn thất hàng tháng do pain quản lý lịch**: **10-25 triệu/tháng** (15-25% doanh thu)
> - **Tỷ suất giải pháp**: HếtChờ giảm 50% pain = 5-12 triệu/tháng tiết kiệm. Tiệm willing pay 99-299k/tháng (Phase 2).

---

## 3. Mục tiêu Kinh doanh (Business Objectives)

| # | Objective | Đo lường | Deadline |
|---|-----------|----------|----------|
| BO1 | Validate model "Zero-fee + Zalo-first" hợp thị trường VN | ≥ 50 tiệm active sau 6 tháng | T+24 tuần |
| BO2 | Build foundation tech để add payment/loyalty Phase 2 | Modular architecture pass review | T18 (Public Launch) |
| BO3 | Tạo case study marketable từ tiệm pilot | ≥ 1 case study số liệu before/after | T15 (Open Beta) |
| BO4 | Tăng viral organic | ≥ 30% tiệm pilot rủ tiệm khác | T+24 tuần |
| BO5 | Test pricing & monetization Phase 2 | Survey 20+ tiệm pilot ra pricing chốt | T+18 (sau Closed Beta) |

---

## 4. Phạm vi (Scope)

### 4.1 In Scope MVP (6 feature)

| ID | Tên | Mô tả ngắn |
|----|------|------------|
| F1 | Zalo Mini App booking | Khách đặt lịch qua Zalo Mini App tiệm — chọn dịch vụ, thợ, giờ |
| F2 | Dashboard chủ tiệm | Web mobile responsive — quản lý lịch ngày/tuần, xác nhận, hủy, sync Google Calendar |
| F3 | Realtime availability | Khách thấy slot trống real-time, không cần inbox |
| F4 | Customer tier + liệu trình | Phân hạng VIP/CIP/Normal, track buổi liệu trình 5-10 buổi (spa) |
| F5 | Reminder + Recovery Zalo | Auto nhắc T-24h + T-2h. Recovery khách cũ 30/60/90 ngày |
| F6 | Đặt cọc giữ chỗ | Khách trả cọc 50-200k qua VNPay/MoMo cho slot cao điểm, trừ vào tổng bill |

### 4.2 Out of Scope MVP (Phase 2+)

- ⛔ Loyalty system (tích điểm đổi quà)
- ⛔ Gói VIP trả trước cả năm, trừ dần (prepaid wallet)
- ⛔ Full POS payment processing (thanh toán cuối dịch vụ qua app)
- ⛔ CRM nâng cao (sinh nhật, ghi chú dị ứng, lifetime value)
- ⛔ App native iOS/Android riêng
- ⛔ Multi-location chain management (chuỗi nhiều tiệm)
- ⛔ Custom domain `<tiem>.vn` (chỉ subdomain `hetcho.vn/<slug>` MVP)
- ⛔ Unified inbox đa kênh (Zalo + IG + FB)
- ⛔ Hóa đơn điện tử / e-invoice

---

## 5. Stakeholders & Roles

| Stakeholder | Role | Trách nhiệm chính |
|-------------|------|-------------------|
| **Founder (Quân Nguyễn)** | Sponsor + Product Owner + Tech Lead + Dev | Quyết định toàn bộ, build product |
| **AI Agent stack** | Implementation acceleration | Code generation, test, doc |
| **Tiệm pilot (3-5 ban đầu)** | Validation partner | Dùng thử, feedback, case study |
| **Khách cuối tiệm pilot** | End-user | Đặt lịch, trả cọc, đánh giá |
| **Zalo OA Platform** | Channel provider | Cho phép Mini App + Broadcast/ZNS |
| **VNPay/MoMo** | Payment partner | Cổng thanh toán + KYC merchant |

---

## 6. Constraints

### 6.1 Resources
- **Team**: 1 solo founder + AI agent stack
- **Budget infra**: 5-20 triệu/tháng
- **Timeline**: 4.5 tháng từ Sprint 0 → Public Launch

### 6.2 Technical
- Stack do Tech Lead phase 4 quyết (gợi ý: Next.js 14 + Supabase + Zalo Mini App SDK)
- Mobile-first (chủ tiệm + khách)
- Realtime queue qua WebSocket/SSE

### 6.3 Regulatory
- Payment qua cổng có giấy phép NHNN (VNPay/MoMo/ZaloPay)
- Tuân thủ Nghị định 13/2023/NĐ-CP (PDP) cho dữ liệu cá nhân
- Trademark "HếtChờ" + `hetcho.vn` cần check trước M3
- E-invoice tax compliance defer Phase 2

---

## 7. Tiêu chí Thành công (Success Criteria)

| Metric | Target | Tracking |
|--------|--------|----------|
| **Active tiệm** sau 6 tháng từ M3 | ≥ 50 | Dashboard analytics |
| **Pilot retention** sau 3 tháng | ≥ 70% | Cohort analysis |
| **Total booking** qua nền tảng 6 tháng | ≥ 5.000 | DB count |
| **Viral organic** | ≥ 30% tiệm tự rủ tiệm khác | Referral source |
| **No-show reduction** trong tiệm pilot | -50% vs baseline | Pre/post compare |
| **Walk-out reduction** | -50% vs baseline | Pre/post compare |
| **NPS chủ tiệm pilot** | ≥ +40 | Survey tuần 12 |

---

## 8. Rủi ro & Mitigation

> Đầy đủ ở `docs/project-charter.md` §8. Tóm tắt top 3:

1. **R1 (Cao)**: Solo × 6 feature × 4.5 tháng → mitigated bằng AI stack + sẵn sàng đẩy 1 feature ra Phase 2.
2. **R2 (TB-Cao)**: Zalo Mini App SDK quirks → Sprint 0 spike PoC bắt buộc.
3. **R3 (TB-Cao)**: VNPay/MoMo merchant KYC → đăng ký song song Sprint 0-1.

---

## 9. Assumptions

| # | Giả định | Verify ở đâu |
|---|----------|--------------|
| A1 | Chủ tiệm hộ kinh doanh có thể đăng ký Zalo OA chính chủ | Sprint 0 spike (V-006) |
| A2 | Khách Zalo chịu đặt cọc qua MoMo/VNPay | Closed Beta M1 (V-007) |
| A3 | Free 12 tháng đủ ngắn để monetize Phase 2 mà không mất user | Survey Open Beta M2 (V-004) |
| A4 | Synthetic Discovery insight đúng ~70% | Verify ≥ 3 user thật trước M1 |
| A5 | Supabase free tier đủ cho Closed Beta + Open Beta | Sprint 5-6 monitor egress (V-001) |

---

## 10. Approval & Sign-off

| Vai trò | Tên | Ngày | Trạng thái |
|---------|-----|------|-----------|
| Sponsor | Quân Nguyễn | 2026-05-16 | ✅ Self-approved (solo project) |
| BA | AI BA | 2026-05-16 | ✅ Drafted |
| Tech Lead | AI Tech Lead | (next phase) | 🔄 Pending Phase 4 |

---

**Phát triển bởi Quân Nguyễn — Quality First, Always.**
