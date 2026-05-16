# HếtChờ — Đặt là vào liền

Booking SaaS zero-fee cho tiệm làm đẹp nhỏ ở Việt Nam (salon, spa, nail, gội đầu, barber, massage). Zalo-first, multi-tenant.

## Status

- ✅ Phase 0 — Project Kickoff: PM + BA + Tech Lead → 18 docs in [docs/](docs/)
- ✅ Sprint 0 — Foundation (skeleton + scaffolding) — chạy 1 đêm night-shift
- 🔄 Sprint 1 — Tenant + Auth → planned, sau khi unblock PENDING_HUMAN
- ⏳ Sprint 2-8 → Implementation Plan đầy đủ trong `docs/implementation-plan.md`

## Tech Stack (đã chốt)

- **Frontend + Backend**: Next.js 14 (App Router) + Server Actions (monorepo fullstack)
- **Mobile (khách)**: Zalo Mini App SDK
- **Database**: PostgreSQL 15 (Supabase managed) + Row-Level Security multi-tenant
- **Realtime**: Supabase Realtime (Postgres CDC)
- **ORM**: Drizzle
- **Auth**: Supabase Auth
- **Payment**: VNPay (primary) + MoMo + ZaloPay (Sprint 4+)
- **Notification**: Zalo OA + ZNS
- **Test**: Vitest + Playwright
- **Hosting**: Vercel Pro + Supabase Pro + Upstash Redis + Cloudflare

Chi tiết: [`docs/tech-decision.md`](docs/tech-decision.md), ADR-001 đến ADR-004.

## Setup (lần đầu)

```bash
# 1. Install pnpm 8.15.4
npm install -g pnpm@8.15.4

# 2. Bootstrap (install deps + copy env + build packages)
bash scripts/bootstrap.sh
# Windows:
pwsh scripts/bootstrap.ps1

# 3. Resolve PENDING_HUMAN.md (Supabase, Zalo OA, VNPay accounts)

# 4. Edit .env.local with real credentials

# 5. Run migration
pnpm db:generate
pnpm db:migrate

# 6. Dev
pnpm dev
```

## Cấu trúc Monorepo

```
het-cho/
├── apps/
│   ├── web/                # Dashboard chủ tiệm (Next.js 14)
│   └── mini-app/           # Khách C — Zalo Mini App
├── packages/
│   ├── shared/             # Errors, logger, branded IDs
│   ├── domain/             # Entities + Value Objects + Domain Services (Clean Architecture)
│   ├── application/        # Use cases + Ports (Hexagonal)
│   ├── infrastructure/     # Adapters: Mock + (real Sprint 1+)
│   └── db/                 # Drizzle schema + RLS policies + migrations
├── docs/
│   ├── project-charter.md
│   ├── tech-decision.md
│   ├── implementation-plan.md
│   ├── brd/                # Business Requirements
│   ├── srs/                # Software Requirements
│   ├── adr/                # Architecture Decision Records
│   └── discovery/          # BA Discovery output
├── scripts/
│   └── bootstrap.sh        # First-time setup
├── .github/workflows/
│   └── ci.yml              # Lint + typecheck + test + build
├── CLAUDE.md               # AI agent rules
├── PENDING_HUMAN.md        # Tasks cần founder xử lý
├── PENDING_VERIFY.md       # AI decisions cần founder verify
└── NIGHT_SHIFT_REPORT.md   # Báo cáo night-shift
```

## Scripts

```bash
pnpm dev              # Start all apps (web :3000 + mini-app :3001)
pnpm build            # Build all
pnpm test             # Run Vitest tests across packages
pnpm lint             # ESLint all
pnpm typecheck        # TSC noEmit
pnpm format           # Prettier write

pnpm db:generate      # Drizzle generate migration
pnpm db:migrate       # Apply migration
pnpm db:seed          # Seed demo data
```

## Night-shift Mode

Để chạy agent autonomous mà không gọi API thật:

```bash
NIGHT_SHIFT_MODE=true pnpm dev
```

→ Mock adapters trong `packages/infrastructure/src/mock/*` được dùng thay cho VNPay/Zalo/Email thật.

## Documents

- 📋 [Project Charter](docs/project-charter.md)
- 📄 [BRD v1.0](docs/brd/BRD-v1.0.md)
- 📐 [SRS v1.0](docs/srs/SRS-v1.0.md)
- 🏗️ [Tech Decision](docs/tech-decision.md)
- 🗓️ [Implementation Plan](docs/implementation-plan.md)
- 🔍 [BA Discovery](docs/discovery/00-README.md)

---

**Phát triển bởi Quân Nguyễn — Quality First, Always.**
