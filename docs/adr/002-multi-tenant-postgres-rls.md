# ADR-002: Multi-tenant qua Postgres Row-Level Security

## Status
✅ Accepted — 2026-05-16

## Context
HếtChờ là multi-tenant SaaS — mỗi tiệm là 1 tenant, dữ liệu phải hoàn toàn cách ly. 3 chiến lược thường gặp:

1. **Database per tenant** — mỗi tiệm 1 DB riêng.
2. **Schema per tenant** — 1 DB, mỗi tiệm 1 Postgres schema.
3. **Shared schema + tenant_id column + RLS** — 1 DB 1 schema, isolation bằng RLS.

Constraint: 50-500 tenant, solo founder, Supabase managed.

## Decision

**Chiến lược 3 — Shared schema + `tenant_id` column + Postgres RLS**.

Áp dụng:
- Mọi bảng business có cột `tenant_id UUID NOT NULL REFERENCES tenants(id)`.
- Mỗi bảng enable RLS với policy: `tenant_id = (auth.jwt() ->> 'tenant_id')::uuid`.
- Khi user login → JWT chứa `tenant_id` claim → mọi query Supabase tự enforce.
- Super-admin (Founder operations) dùng `service_role` key bypass RLS — chỉ dùng từ server, không expose client.

## Consequences

### Tích cực
- Scale tốt cho 500-5000 tenant trên 1 DB.
- Migration đơn giản (1 schema thay đổi cho tất cả tenant).
- Cost-effective: 1 Supabase Pro = đủ cho năm đầu.
- RLS enforce ở DB layer → app code không cần `WHERE tenant_id = ?` mỗi query (giảm bug leak).

### Tiêu cực
- **Rủi ro cực cao nếu RLS policy sai** → leak cross-tenant. Mitigation:
  - Test integration với 2 tenant: tạo data tenant A, đăng nhập tenant B, query → phải EMPTY.
  - Security audit Sprint 8 trước Public Launch.
  - Code review checklist riêng cho mọi table mới.
- Backup/restore chỉ ở mức DB, không thể export 1 tenant duy nhất → cần custom export script `scripts/export-tenant.ts`.
- "Noisy neighbor": 1 tenant query nặng có thể slow tenant khác. Mitigation: monitor query, add index, cache aggressive.

### Migration path (nếu phải đổi)
- Nếu sau Phase 2 cần per-tenant DB (enterprise customer): dùng Supabase branching để tách. Schema giống nhau → migration tool standard.
