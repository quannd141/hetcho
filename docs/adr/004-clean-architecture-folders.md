# ADR-004: Clean Architecture qua Folder Structure trong Monorepo

## Status
✅ Accepted — 2026-05-16

## Context
ADR-001 chốt monorepo Next.js fullstack. Nhưng Quân Nguyễn rule (`.claude/rules/architecture.md`) yêu cầu Clean Architecture / DDD: domain logic không phụ thuộc framework. Cần map Clean Architecture lên Next.js structure.

## Decision

Tách 4 layer qua workspace packages + Next.js folders:

```
het-cho/
├── apps/web/app/                  # Presentation (Next.js App Router)
│   ├── (tenant)/[slug]/...
│   └── api/...                    # Route handlers (thin controllers)
├── apps/mini-app/src/             # Presentation (Zalo Mini App)
├── packages/domain/               # ⭐ Domain layer
│   ├── booking/
│   │   ├── entities/booking.ts
│   │   ├── value-objects/slot.ts
│   │   ├── services/booking-conflict.service.ts
│   │   └── repositories.ts        # interface, không implement
│   ├── payment/
│   ├── customer/
│   ├── tenant/
│   └── shared/errors/
├── packages/application/          # ⭐ Application layer
│   ├── booking/
│   │   ├── create-booking.use-case.ts
│   │   ├── cancel-booking.use-case.ts
│   │   └── ...
│   └── payment/
└── packages/infrastructure/       # ⭐ Infrastructure layer
    ├── repositories/              # Drizzle implementations
    ├── payment-gateways/          # VNPay, MoMo adapters
    ├── notification/              # Zalo OA adapter
    └── calendar/                  # Google Calendar adapter
```

### Quy tắc dependency

```
Presentation (Next.js) → Application → Domain
                              ↓
                       Infrastructure → Domain
```

- `domain/` không import gì ngoài chính nó.
- `application/` chỉ import từ `domain/`.
- `infrastructure/` import `domain/` (để implement interface).
- Next.js `app/api/` route handler chỉ gọi `application/` use case.
- **DI**: Mỗi route handler tạo composition root manual (function constructor) — đơn giản hơn IoC container cho solo founder.

## Consequences

### Tích cực
- Test domain logic mà không cần Next.js / DB.
- Refactor framework sau dễ (nếu Next.js → khác).
- Quân Nguyễn rule compliant.

### Tiêu cực
- Overhead 4 layer cho project nhỏ — solo founder dễ bypass shortcut.
  - **Mitigation**: PR template có checkbox "layer rule kiểm tra"; eslint rule custom cấm import `infrastructure` từ `domain`.
- Server Actions Next.js tempting để bỏ qua application layer.
  - **Rule**: Server Action chỉ là thin wrapper gọi use case, KHÔNG chứa business logic.
