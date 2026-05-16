# 05 — Opportunities Map (Top Pain + Persona + HMW)

> **Status**: Synthetic Lite. Top 5 pain + 3 persona + How-Might-We.

---

## 1. Top 5 Pain Points (ưu tiên theo Impact × Frequency)

| # | Pain | Persona | Impact ($) | Frequency | Priority |
|---|------|---------|-----------|-----------|----------|
| P1 | **Khách chờ 20-60 phút → bỏ về 30%** | Chủ tiệm + Khách | 5-15tr/tháng | Hàng ngày peak | 🔴 P0 |
| P2 | **No-show booking online 15-20%** | Chủ tiệm | 2-6tr/tháng | Hàng tuần | 🔴 P0 |
| P3 | **Lễ tân trả Zalo chậm 5-30 phút** → mất khách trước book | Lễ tân + Khách | 2-5 booking/ngày | Mỗi giờ | 🟠 P1 |
| P4 | **Trùng lịch / khít quá** giữa khách | Lễ tân + Thợ + Khách | Tiền + cảm xúc | 1-2/ngày | 🟠 P1 |
| P5 | **Khách spa quên liệu trình** (mua 10 buổi, làm 3 buổi rồi quên) | Khách + Chủ tiệm spa | Khách bỏ gói, không quay lại | 30% gói | 🟡 P2 |

---

## 2. Persona Cards (3 persona Lite)

### 👩‍💼 Persona 1 — Chị Hằng, chủ salon tóc 3 ghế

```
Tuổi:        35
Vị trí:      Q.Bình Thạnh, TP.HCM
Quy mô:      Salon tóc 3 ghế, 2 stylist + 1 phụ
Doanh thu:   80-120tr/tháng
Tech:        Zalo, Facebook, sổ tay. Không dùng Excel.
Thiết bị:    iPhone 11
Pain top:    P1 (chờ), P3 (Zalo chậm)
Goal:        Tăng doanh thu peak T7-CN, không phải mua thêm ghế
Quote (synthetic): "Cuối tuần đông quá, có lần 4 khách ngồi chờ rồi 2 chị bỏ. Tiếc lắm em."
Willingness to pay: 99k/tháng OK nếu thấy hiệu quả sau 1 tháng
```

### 👩‍⚕️ Persona 2 — Chị Mai, chủ spa skin care 2 giường

```
Tuổi:        32
Vị trí:      Q.Cầu Giấy, Hà Nội
Quy mô:      Spa 2 giường, 1 mình KTV chính + 1 phụ
Doanh thu:   60-100tr/tháng
Tech:        Đã thử Sapo Salon 2 tháng → bỏ vì giao diện rối + đắt 350k
Thiết bị:    iPhone + iPad cho khách check-in
Pain top:    P2 (no-show, vì khách spa hay đặt lịch trước cả tuần), P5 (liệu trình)
Goal:        Khách mua gói 5-10 buổi xong đi đủ, không bỏ giữa chừng
Quote (synthetic): "Khách hứa đến rồi không đến, em mất buổi cao điểm. 200k cọc thì em mới yên tâm."
Willingness to pay: 199k/tháng nếu tích hợp Zalo + cọc
```

### 💅 Persona 3 — Chị Linh, chủ tiệm nail 4 bàn, gen Z

```
Tuổi:        28
Vị trí:      Đà Nẵng, gần biển
Quy mô:      Nail 4 bàn, 3 thợ nữ trẻ
Doanh thu:   50-90tr/tháng
Tech:        Instagram, TikTok, Zalo. Tự edit video promotion.
Thiết bị:    iPhone 14 Pro
Pain top:    P1 (chờ — vì khách Tiktok kéo về peak), P3 (Zalo + IG cùng lúc)
Goal:        Khách đặt online qua Zalo Mini App → không phải trả DM Instagram + Zalo song song
Quote (synthetic): "Em xài 3 app trả lời khách, mệt lắm. Cứ có cái nào tự động đi cho rảnh."
Willingness to pay: 149k/tháng (giá Spotify family — gen Z mindset)
```

---

## 3. How-Might-We (HMW) — Cho team build

| HMW | Feature MVP solve |
|-----|-------------------|
| HMW giúp khách thấy slot trống real-time mà không cần inbox tiệm? | **F1 + F3** Zalo Mini App + Realtime availability |
| HMW giảm walk-out vì chờ lâu mà không phải tăng số ghế? | **F3** Khách đặt giờ chính xác + nhắc T-2h |
| HMW giảm no-show mà không làm khách cảm thấy bị mất tiền? | **F6** Cọc nhỏ 50k chỉ slot cao điểm, trừ vào bill |
| HMW giúp chủ tiệm thấy realtime ai sắp đến + thợ nào rảnh? | **F2** Dashboard view ngày |
| HMW kéo khách cũ quay lại sau 30/60 ngày tự động? | **F5** Recovery campaign Zalo |
| HMW track liệu trình spa mà cả khách + tiệm cùng nhìn được? | **F4** Customer tier + liệu trình |

---

## 4. Surprises / Insights để Founder lưu ý

1. **Sapo Salon đã thua phân khúc tiệm nhỏ** — chị Mai bỏ sau 2 tháng = signal moat. Lý do bỏ: giao diện rối, không có Zalo integration. **HếtChờ phải đối nghịch: đơn giản + Zalo-native.**
2. **Gen Z founder tiệm nail** (chị Linh) là segment phụ — họ là **early adopter + viral channel** cho HếtChờ (TikTok review). Charter chưa flag — em propose thêm vào marketing strategy Phase 2.
3. **Khách spa willingness to pay cọc cao hơn nail** (200k vs 50k) — vì giá trị dịch vụ cao hơn. **F6 phải cho phép tiệm cấu hình mức cọc theo dịch vụ**, không fix cứng.
4. **Lễ tân là power user thực sự** ở tiệm 5+ ghế — chủ tiệm chỉ approve. Nhưng MVP target tiệm 1-3 ghế (chủ = lễ tân). → Charter đúng scope, nhưng Phase 2 mở rộng phải design lại cho lễ tân persona.
5. **"Chờ 1 tiếng" là cường điệu chủ tiệm dùng để giải thích pain** — thực tế peak chờ 20-40 phút. Tên brand "HếtChờ" vẫn fit, nhưng marketing không nên claim cụ thể "0 phút chờ" → claim "đặt là vào liền slot mình chọn".

---

## 5. Câu hỏi mở (cần verify trước M1 Closed Beta)

- ❓ Chủ tiệm có chịu setup Zalo OA chính chủ không? (cần KYC doanh nghiệp, một số tiệm hộ kinh doanh không có)
- ❓ Khách có chịu trả cọc qua MoMo/VNPay không hay muốn cọc cash khi tới?
- ❓ Pricing 99k vs 199k vs 299k — sweet spot thật sự là gì?
- ❓ Có cần app iOS/Android riêng cho chủ tiệm không, hay web mobile đủ?
- ❓ Multi-thợ-trên-1-slot (VD nail 4 bàn cùng giờ): UX show 4 slot riêng hay 1 slot "còn 4 chỗ"?

→ 5 câu này phải hỏi trong 3+ interview thật trước M1.
