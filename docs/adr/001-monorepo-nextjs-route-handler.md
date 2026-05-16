# ADR-001: Monorepo Turborepo + Next.js Route Handler thay vì NestJS

## Status
✅ Accepted — 2026-05-16

## Context
HếtChờ cần ship 6 feature trong 18 tuần với 1 solo founder. Có 3 lựa chọn backend:

1. **Tách FE (Next.js) + BE (NestJS)** — chuẩn enterprise, Quân Nguyễn template default.
2. **Next.js fullstack** với Route Handler + Server Actions — monorepo 1 codebase.
3. **Next.js (FE) + FastAPI Python (BE)** — Python tệp tích cho data/ML sau này.

Constraint: solo founder, 4.5 tháng, không có team backend riêng.

## Decision

Dùng **monorepo Turborepo + pnpm workspace**, BE = Next.js Route Handler + Server Actions.

Cấu trúc:
- `apps/web` — Next.js FE+BE (dashboard chủ tiệm)
- `apps/mini-app` — Zalo Mini App (zmp-sdk)
- `packages/domain` — pure business logic (không phụ thuộc framework)
- `packages/infrastructure` — repository implementation, payment, notification adapters
- `packages/db` — Drizzle schema + migration
- `packages/ui` — shadcn/ui shared components

Clean Architecture vẫn áp dụng qua folder split `domain/` ↔ `infrastructure/` ↔ Next.js (presentation).

## Consequences

### Tích cực
- Deploy 1 lần lên Vercel = đơn giản cho solo.
- Type safety end-to-end qua Server Actions.
- Share code (Zod schemas, domain entities) giữa web + mini-app.
- Tiết kiệm 2-3 tuần so với setup NestJS + tách deploy.

### Tiêu cực
- Khi scale 10+ tiệm × 1000 concurrent → Vercel Function timeout 60s + cold start có thể là bottleneck. **Mitigation**: heavy job offload Upstash QStash; reporting chuyển background.
- Bù lại bằng Postgres function/trigger cho logic critical (e.g., booking conflict check).
- Future migration sang NestJS nếu cần — `domain/` + `infrastructure/` đã isolated nên reusable.

### Trung tính
- Quân Nguyễn rules vẫn áp dụng (Clean Architecture, naming convention) — chỉ thay đổi vị trí "presentation layer" sang Next.js app/ folder.
