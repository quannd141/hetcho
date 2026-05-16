# PENDING_VERIFY — HếtChờ

> **Mục đích**: Founder verify các quyết định/giả định mà AI agent đã ghi nhưng chưa chắc 100% đúng.
> **Quy tắc**: Mỗi item phải có **(a)** quyết định AI đã chốt, **(b)** lý do, **(c)** rủi ro nếu sai, **(d)** verify khi nào/cách nào.
> **Update**: Mỗi khi anh verify xong → tick ✅ hoặc đổi quyết định → log lý do.

---

## 🔴 Verify TRƯỚC Sprint 0 (start coding)

### V-001. Tech stack mặc định chưa hỏi anh chốt

- **AI quyết**: Next.js 14 (App Router) + Supabase (Postgres + Auth + Realtime + Storage) + Zalo Mini App SDK + VNPay sandbox + Vercel hosting + Cloudflare R2 storage.
- **Lý do**: Khớp Ideation Summary hint, free tier rộng, solo founder ship nhanh, có realtime built-in.
- **Rủi ro**: Supabase free tier có giới hạn 500MB DB + 5GB egress → đến ~200 tiệm × 1k khách có thể chạm trần, cần upgrade Pro.
- **Verify**: Anh confirm hoặc đề xuất stack khác trong 24h trước Sprint 0 kick.

### V-002. Stack mobile cho chủ tiệm

- **AI quyết**: Web mobile responsive + PWA (installable). KHÔNG build native iOS/Android riêng cho MVP.
- **Lý do**: Solo founder, native = +3-4 tháng. Chủ tiệm dùng web mobile được nếu UX tốt.
- **Rủi ro**: Chị Linh (Gen Z nail) nói "mobile-first không negotiate" — nếu web mobile UX kém, mất segment này.
- **Verify**: UX prototype Sprint 0 test với 2-3 chủ tiệm trước Sprint 1.

### V-003. Payment gateway primary

- **AI quyết**: VNPay là primary cho cọc, MoMo/ZaloPay sẽ thêm Sprint 4.
- **Lý do**: VNPay phổ biến nhất, hỗ trợ đầy đủ card + QR + ATM.
- **Rủi ro**: Chị Linh nói khách gen Z dùng Momo/Zalopay nhiều hơn → có thể sai primary.
- **Verify**: Survey 10 chủ tiệm Pilot khi Closed Beta — "khách của tiệm bạn dùng cái gì nhiều nhất?".

---

## 🟡 Verify TRƯỚC Closed Beta M1 (T9)

### V-004. Pricing strategy Phase 2

- **AI giả lập**: 99k (salon/nail) / 199k (spa) / 299k (multi-location). Hoặc free + 5% commission booking online.
- **Lý do**: 3 synthetic interview cho thấy spectrum này.
- **Rủi ro**: Synthetic không chính xác — 99k có thể quá thấp hoặc quá cao tùy market.
- **Verify**: Hỏi 5-7 chủ tiệm thật ở Closed Beta — câu PM-Q14 trong [02-interview-script.md](docs/discovery/02-interview-script.md).

### V-005. F6 Đặt cọc — cấu hình nào default?

- **AI quyết**: Mặc định OFF cho khách returning, ON cho new customer + slot cao điểm (T7/CN, lễ Tết). Mức cọc configurable 50k-200k tùy dịch vụ.
- **Lý do**: Synthetic interview Chị Hằng nói "đòi cọc khách quen kì lắm".
- **Rủi ro**: Chủ tiệm spa có thể muốn yêu cầu cọc 100% khách cho gói cao cấp.
- **Verify**: Test với 3-5 tiệm pilot, đo no-show rate trước/sau.

### V-006. Zalo OA cho hộ kinh doanh

- **AI giả định**: Tiệm hộ kinh doanh có thể đăng ký Zalo OA chính chủ.
- **Lý do**: Public docs Zalo nói OA support hộ kinh doanh.
- **Rủi ro**: Quy trình KYC thực tế có thể phức tạp, một số tiệm không có giấy phép → block onboarding.
- **Verify**: Sprint 0 spike — anh tự đăng ký 1 Zalo OA cho tiệm pilot đầu tiên, ghi nhận pain.

### V-007. Khách trả cọc — Zalo Mini App in-app payment vs redirect

- **AI quyết**: Sprint 3-4 dùng redirect MoMo/VNPay (Zalo Mini App SDK chưa hỗ trợ in-app payment đầy đủ).
- **Lý do**: In-app payment cần Zalo Pay merchant + Zalo Mini App enterprise tier.
- **Rủi ro**: Redirect ra app khác → khách rơi rớt 20-30%.
- **Verify**: Sprint 0 PoC: test luồng "click pay → redirect → back to Mini App" với 5 user.

---

## 🟢 Verify TRƯỚC Public Launch M3 (T18)

### V-008. Trademark "HếtChờ" + `hetcho.vn`

- **AI flag**: Chưa kiểm tra trademark.
- **Verify**: Trước M3 cần search Cục SHTT VN ([noip.gov.vn](https://noip.gov.vn)) + WHOIS `hetcho.vn`. Đăng ký nếu trùng → fallback brand name.

### V-009. Hóa đơn điện tử + thuế

- **AI defer**: Charter PM-Q4e "tính sau".
- **Verify**: Trước M3, hỏi consultant thuế: tiệm có cần xuất e-invoice qua app không? Nếu có → tích hợp Misa eInvoice hoặc Viettel S-Invoice.

### V-010. Bảo vệ dữ liệu cá nhân (PDP - Nghị định 13/2023)

- **AI quyết**: Implement consent UI + data export + delete khi user request.
- **Verify**: Trước M3, review với legal/lawyer: data flow có cần đăng ký với Bộ TT-TT không (xử lý dữ liệu nhạy cảm)?

---

## ⚪ Quyết định AI đã chọn không hỏi (recap để anh check sau)

| ID | AI quyết định | Có thể đảo ngược? |
|---|---|---|
| D-001 | F4 (liệu trình) đẩy lên Sprint 2-3 thay vì 5-6 vì spa rate 5+ | ✅ Dễ |
| D-002 | "Multi-channel inbox" (Zalo+IG+FB) đưa vào Phase 2, không MVP | ✅ Dễ |
| D-003 | Database: Postgres trên Supabase, không tự host | ✅ Dễ (export Postgres) |
| D-004 | Frontend: Tailwind + shadcn/ui, không Material UI | ✅ Dễ |
| D-005 | Realtime: Supabase Realtime, không Socket.io tự host | 🟡 Trung bình |
| D-006 | Auth: Supabase Auth (email + Zalo OAuth nếu Supabase hỗ trợ) | ✅ Dễ |
| D-007 | Multi-tenant: row-level security (RLS) bằng `tenant_id` column | 🔴 Khó đổi sau khi có data |
| D-008 | Audit log: bảng `audit_events` riêng, append-only, cho mọi action payment | ✅ Dễ |
| D-009 | Reminder Zalo: Zalo OA Broadcast API + ZNS (Zalo Notification Service) cho transactional | 🟡 Phụ thuộc Zalo policy |

---

## Cập nhật khi verify xong

```markdown
### V-XXX. [Title]
- ✅/❌ Verified: <quyết định cuối>
- Date: 2026-MM-DD
- Note: <findings>
```
