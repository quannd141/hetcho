# ADR-003: Realtime qua Supabase Realtime (Postgres CDC)

## Status
✅ Accepted — 2026-05-16

## Context
Feature F3 (Realtime availability) + dashboard auto-refresh khi có booking mới = core USP của HếtChờ. Cần push update từ DB ra cả Mini App + Dashboard < 500ms.

3 lựa chọn:
1. **Supabase Realtime** — Postgres CDC over WebSocket, built-in Supabase.
2. **Socket.io self-hosted** — flexible, nhưng phải maintain server riêng.
3. **Pusher / Ably** — managed, có phí từ $49/tháng.

## Decision

**Supabase Realtime**.

Cấu hình:
- Enable replication trên bảng `bookings`, `slot_locks`.
- Mini App + Dashboard subscribe channel `tenant:<tenant_id>:bookings`.
- Filter ở client: WHERE date = today (giảm noise).
- Authorization qua RLS — client chỉ thấy event trong tenant của mình.

## Consequences

### Tích cực
- Zero extra infra — đã có Supabase.
- Tự động kế thừa RLS → security guard sẵn.
- Cost: included trong Supabase Pro $25/m.

### Tiêu cực
- Lock-in Supabase. Nếu migrate khỏi Supabase → phải replace bằng Socket.io.
- Free tier giới hạn 200 concurrent connection — đủ MVP nhưng cần monitor.
- Latency phụ thuộc Supabase EU region (đang dùng) → có thể 100-300ms cho user VN. Acceptable cho < 500ms target.

### Mitigation network instability
- Mini App có retry exponential backoff khi mất kết nối.
- Fallback: poll `/api/availability` mỗi 5s nếu WebSocket fail 3 lần.
- Cache slot result 30s qua Upstash Redis → giảm tải DB nếu burst.
