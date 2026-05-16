# Interview — Chị Mai (Spa Skin care 2 giường, Q.Cầu Giấy HN)

**Date**: 2026-05-16 (synthetic)
**Mode**: 🅓 Synthetic
**Persona**: Chủ spa, 32t, đã thử Sapo Salon → bỏ
**Confidence**: 🟡 60% (verify trước M1)

---

## Setup

- **Tiệm**: Mai Skin Spa, Q.Cầu Giấy HN, 2 giường, 1 KTV chính + 1 phụ.
- **Doanh thu**: 60-100tr/tháng. Khách spa cao cấp 500k-2tr/buổi. Gói liệu trình 5-15tr/gói (5-10 buổi).
- **Tool đã thử**: Sapo Salon 2 tháng (10/2025-12/2025) → bỏ.

---

## Quote (verbatim — synthetic)

> 💬 *"Em mua Sapo Salon 350k/tháng, dùng 2 tháng rồi nghỉ. Giao diện rối, KTV em không xài được, em phải tự update suốt — mất thời gian hơn không có."*

> 💬 *"Khách hứa đến rồi không đến — em mất buổi cao điểm. Có chị mua gói 8 triệu xong làm 3 buổi rồi mất luôn. Em gọi không nghe."*

> 💬 *"200k cọc thì em mới yên tâm. Khách spa đẳng cấp họ không tiếc 200k đâu, chỉ là họ ngại process trả tiền trước."*

> 💬 *"Em cần track buổi liệu trình. Khách hỏi 'em làm mấy buổi rồi' — em không nhớ, lúc nói 5 lúc nói 6, mất uy tín."*

> 💬 *"Zalo OA phải có. Khách spa em 90% qua Zalo. Booking link sapo.vn khách click không nổi."*

---

## Pain Points (theo priority chị Mai)

| Pain | Mức độ (1-10) | Hệ quả |
|------|---------------|--------|
| **No-show + bỏ gói liệu trình** | **10** | Mất 5-10tr/tháng (gói lỡ + buổi peak) |
| **Track liệu trình thủ công** | 8 | Mất uy tín, khách không tin |
| Sapo quá phức tạp | 7 | Đã bỏ, chống công cụ phức tạp |
| Khách chờ | 5 | Spa khách hẹn trước, ít walk-in |
| Trùng lịch | 6 | KTV chỉ có 1, dễ đụng giờ |

→ **So với synthetic Persona 2**: Chị Mai prioritize **liệu trình** > **no-show** > **chờ**. Đảo thứ tự so với salon tóc.

---

## Reaction về MVP (sau pitch)

| Feature | Reaction (1-5) | Note |
|---------|---------------|------|
| F1 Zalo Mini App | **5** | "Phải có Zalo. Khách em không xài app khác." |
| F2 Dashboard ngày | 4 | "Em muốn xem cả gói liệu trình của khách." → tích hợp F4 |
| F3 Realtime availability | 3 | "Spa khách hẹn trước. Realtime ít quan trọng." |
| F4 Tier + liệu trình | **5+** | "Cái này em CẦN. Em trả tiền cho cái này." |
| F5 Reminder + Recovery | **5** | "Recovery 30-60 ngày là lifeblood của spa." |
| F6 Đặt cọc | **5** | "PHẢI có. 200k slot peak, 100k slot thường." → cọc cao hơn salon tóc |

---

## Willingness to pay

- **Free 12 tháng đầu**: 😍 "Em đăng ký liền."
- **199k/tháng sau 12 tháng**: 😊 "OK. Cheaper than Sapo, simpler than Sapo. Em trả."
- **299k/tháng**: 😐 "Cân nhắc. Phải bao gồm SMS marketing."
- **5% commission**: 😡 "Không. Khách spa em VIP, không qua app trả."

→ **Insight**: Spa chấp nhận giá 199-299k cao hơn salon (99-149k). Phải có tier pricing.

---

## Surprises

1. **Liệu trình > chờ** ở spa — Charter đang ưu tiên F3 Realtime (#1) cho ALL tiệm. Cần điều chỉnh: **F4 phải release song song F1-F3 trong MVP**, không để Sprint 5-6 mới làm.
2. **Sapo bỏ vì rối** — không phải đắt. Insight quan trọng cho UX strategy: HếtChờ phải có "Simple Mode" cho chủ tiệm + "Power Mode" cho lễ tân.
3. **Cọc spa = 100-200k, cọc nail = 50k, cọc tóc = 50-100k**. F6 phải configurable theo tier dịch vụ, không chỉ time-of-week.
4. **KTV/thợ không xài được Sapo** — UX cho người dùng phụ phải đơn giản hơn nữa.

---

## Snowball

> 💬 *"Spa Linh Anh, 4 giường, Q.Đống Đa. Chị quen, em giới thiệu được."*
