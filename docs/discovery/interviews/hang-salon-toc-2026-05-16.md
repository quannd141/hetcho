# Interview — Chị Hằng (Salon tóc 3 ghế, Q.Bình Thạnh)

**Date**: 2026-05-16 (synthetic)
**Mode**: 🅓 Synthetic — Public data + persona simulation
**Persona**: Chủ tiệm tóc tầm trung, 35t, dùng Zalo + sổ
**Confidence**: 🟡 60% (verify real ≥ 1 user trước M1)

---

## Setup

- **Tiệm**: Salon Hằng Hair, Q.BT, 3 ghế, 2 stylist (1 senior 8 năm + 1 junior 2 năm), 1 phụ.
- **Doanh thu**: 80-120tr/tháng. Peak T7-CN: 30-40 khách/2 ngày.
- **Khách**: Chủ yếu nữ 25-45, dịch vụ tóc 200k-1.5tr/lần.
- **Tool hiện tại**: Sổ lịch giấy + Zalo OA + 1 group Facebook khách cũ.

---

## Quote (verbatim — synthetic)

> 💬 *"Cuối tuần đông quá, có lần 4 chị ngồi chờ rồi 2 chị bỏ. Tiếc lắm em — mỗi đầu tóc 500k-700k, mất luôn 1 triệu."*

> 💬 *"Em xài Zalo OA mà nhiều lúc khách nhắn lúc 11h đêm, sáng dậy 7h em mới trả thì khách inbox tiệm khác rồi. Mất."*

> 💬 *"Sổ tay thì em quen rồi. Sapo có người giới thiệu mà 350k/tháng đắt vậy em không xài. Tiền đó mua dầu xả tốt cho khách còn hơn."*

> 💬 *"No-show ít em — khách tóc thường tới. Spa thì em không biết, chứ tóc khoảng 5%."*

> 💬 *"Cọc hả? Em ngại — khách tóc đại đa số quen biết, mình đòi cọc thì kì. Trừ khi T7 CN khách lạ đặt thì OK."*

---

## Pain Points đã xác nhận (theo priority chị Hằng)

| Pain | Mức độ khó chịu (1-10) | Hệ quả |
|------|----------------------|--------|
| Khách chờ peak T7-CN → bỏ về | **9** | Mất 5-15tr/tháng |
| Zalo trả chậm → mất khách trước book | **7** | 2-3 booking/ngày |
| Trùng lịch / khít quá → khách sau giận | 5 | 1-2 lần/tuần |
| No-show | 3 | 5%, không quá đau |
| Track liệu trình | N/A | Tóc không có liệu trình dài |

---

## Reaction về MVP HếtChờ (sau pitch 1 phút)

| Feature | Reaction (1-5) | Note |
|---------|---------------|------|
| F1 Zalo Mini App booking | **5** | "Hay, em test ngay được không?" |
| F2 Dashboard ngày | 4 | "Có app điện thoại không?" → mobile-first cần |
| F3 Realtime availability | **5** | "Khách thấy còn ghế 14h là click luôn → em đỡ trả tin nhắn." |
| F4 Tier + liệu trình | 3 | "VIP có chứ liệu trình tóc ít. Nhưng ai trung thành cho VIP đẹp." |
| F5 Reminder + Recovery | **5** | "Recovery hay! Khách 60 ngày em quên là quên luôn." |
| F6 Đặt cọc | **3** | "Slot peak T7-CN OK. Slot thường thì kì." → CONFIRM design "configurable" |

---

## Willingness to pay

- **Free 12 tháng đầu**: 😊 "Hỏi tu? Em xài liền."
- **99k/tháng sau 12 tháng**: 😐 "Tùy hiệu quả. Nếu tăng được 5tr doanh thu thì 99k OK."
- **199k/tháng**: 😟 "Hơi cao. Em cân nhắc."
- **5% commission booking**: 😡 "Không. Tiền của khách em mà."

→ **Insight**: Subscription < commission ở phân khúc này.

---

## Surprises

1. **Chị Hằng phân biệt rõ slot "thường" vs "cao điểm"** — F6 cọc phải configurable theo time-of-week + service.
2. **Chị Hằng MUỐN MOBILE app cho chủ tiệm**, không phải web. → Tech Lead cân nhắc PWA hoặc Zalo Mini App cho chủ tiệm.
3. **Recovery 60-90 ngày là pain rất rõ** — synthesis Ideation Summary đúng.
4. Cọc với khách "quen" thì kì — văn hóa VN. Default OFF cho khách returning, ON cho new customer slot cao điểm.

---

## Snowball recruitment

> 💬 *"Tiệm Mai Anh ở Q.7 nail có 4 bàn, em quen. Em giới thiệu cho."*

→ Pre-recruit cho real interview wave 1.
