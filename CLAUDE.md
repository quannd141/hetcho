# CLAUDE.md - Hướng dẫn cho AI Agents (Quân Nguyễn)

## 📋 Bối cảnh dự án (ĐỌC TRƯỚC TIÊN)

> **Trạng thái**: Đã hoàn thành `/project-ideation` ngày 2026-05-16. **KHÔNG hỏi lại user** các thông tin dưới đây — đã chốt rồi. Chỉ tiến vào phần chưa biết (architecture chi tiết, tech stack, timeline, sprint plan...).

### Tên & one-liner
- **Tên**: HếtChờ (`het-cho`)
- **Tagline**: "Đặt là vào liền"
- **One-liner**: SaaS đặt lịch zero-fee cho mọi tiệm làm đẹp nhỏ VN (salon tóc + spa skin care + nail + barber + gội đầu + massage), Zalo-first, multi-tenant. Brand đánh thẳng pain "xếp hàng chờ".

### Reference & cảm hứng
[clientbookings.co.uk](https://clientbookings.co.uk/) — Zero monthly fee, dùng Google Sheets làm backend, recovery campaign 30/60/90 ngày.

### Target user
- **Primary**: Chủ tiệm làm đẹp nhỏ 3-5 ghế/giường/bàn ở thành thị VN (HN, SG, ĐN). Bao trùm: salon tóc, spa, nail, barber, gội đầu, massage.
- **Quy mô**: ~80.000-100.000 tiệm cả VN
- **End user (khách của tiệm)**: Nữ + nam 22-45, đã quen Zalo Mini App

### Pain points
1. **Xếp hàng chờ** — khách chờ 30-60 phút → bỏ về → mất doanh thu (= tên brand)
2. Tiệm nhỏ thiếu công cụ quản lý (chỉ dùng sổ + Zalo)
3. Booking link Tây fail ở VN vì khách quen inbox Zalo/Facebook
4. Khó track liệu trình spa (khách đi 5-10 buổi)

### USP (3 điểm khác biệt)
1. **Zero monthly fee** — Supabase free tier / Google Sheets backend → bền vững free model
2. **Zalo-first** — Mini App + OA, không cần app riêng, không cần web
3. **Realtime availability** — khách thấy slot trống giờ nào, đặt đến đúng giờ vào liền

### Architecture (đã chốt)
**Multi-tenant SaaS** — 1 platform `app.hetcho.vn`, mỗi tiệm là tenant với Zalo OA + dashboard riêng. Tiệm giữ brand riêng, platform "powered by HếtChờ" ở footer. Upsell: gói Pro = custom subdomain, Enterprise = custom domain.

### Scope MVP (đã chốt — KHÔNG cần PM hỏi lại)
| ID | Feature |
|----|---------|
| F1 | Zalo Mini App booking (+ web fallback) |
| F2 | Dashboard chủ tiệm + sync Google Calendar |
| F3 | Realtime availability (slot trống = vào liền) |
| F4 | Customer tier (VIP/CIP/Normal) + liệu trình tracking |
| F5 | Reminder Zalo 24h+2h + Recovery 30/60/90 ngày |

**Cấu hình linh hoạt theo loại tiệm**:
- Tiệm tóc: slot = "ghế", thợ = "stylist"
- Spa: slot = "giường/phòng", KTV
- Nail: slot = "bàn nail"
- Gội đầu: slot = "ghế"

### Brand
- Tông: Tin cậy + đánh thẳng pain + viral-friendly
- Ngôn ngữ: Tiếng Việt
- Persona đầu tiên thấy tên: Chủ tiệm (B2B), nhưng tên đủ catchy để khách cuối nhớ

### Đã chốt
- ✅ Tên + tagline
- ✅ Target user (broad: cả salon + spa + nail)
- ✅ USP + competitor positioning
- ✅ Architecture model (Multi-tenant SaaS)
- ✅ MVP feature list (F1-F5)
- ✅ Cấu hình linh hoạt theo loại tiệm

### Còn TODO (giao PM → BA → Tech Lead)
- [ ] **Monetization model + pricing** — BA khảo sát 10-15 chủ tiệm (a) freemium / (b) add-on / (c) commission
- [ ] **Tech stack** — gợi ý Next.js 14 + Supabase + Zalo Mini App SDK, cần Tech Lead chốt
- [ ] **Competitor deep-dive** — Sapo Salon, GoBeauty, KiotViet Salon
- [ ] **Sprint plan + timeline**
- [ ] **BRD + SRS** — BA chạy `/customer-discovery` (khảo sát đa loại tiệm) + `/requirements-documentation`

> 📄 **Chi tiết đầy đủ**: [`docs/ideation-source/SUMMARY.md`](docs/ideation-source/SUMMARY.md) — đọc file này trước khi hỏi user bất kỳ thông tin nào về scope/target/USP/feature.

---

## Giới thiệu về Công ty & Dự án
Chúng tôi là **Quân Nguyễn** – một công ty phần mềm chuyên nghiệp chuyên phát triển ứng dụng web/mobile, hệ thống doanh nghiệp và sản phẩm SaaS.
Mọi dự án đều tuân thủ quy trình phát triển chuyên nghiệp: Clean Code, TDD/BDD, Code Review nghiêm ngặt, CI/CD tự động và tài liệu đầy đủ.

**Mục tiêu chính khi làm việc với dự án này:**
- Viết code sạch, dễ bảo trì, dễ mở rộng (maintainable & scalable).
- Tuân thủ nghiêm ngặt coding standards và architecture đã định.
- Luôn ưu tiên chất lượng > tốc độ.
- Mọi thay đổi phải có test tương ứng (unit/integration nếu áp dụng).
- Không bao giờ commit code có lỗi hoặc không theo convention.

## ⚙️ Tech Stack Dự án

> ⚠️ **Mỗi dòng phải là 1 lựa chọn cụ thể**, không phải "X hoặc Y" — AI bối rối khi gặp slash-choice. Install script (`starter/install.sh`/`install.ps1`) sẽ điền vào lúc bootstrap. Khi thêm dependency mới (ví dụ thêm message queue) → update mục này TRƯỚC khi viết code dùng nó.

> **Đã chốt Phase 4 Tech Decision (2026-05-16)**. Chi tiết rationale + alternatives đã cân nhắc → [docs/tech-decision.md](docs/tech-decision.md). ADR chính: [001 Monorepo Next.js](docs/adr/001-monorepo-nextjs-route-handler.md), [002 Multi-tenant RLS](docs/adr/002-multi-tenant-postgres-rls.md), [003 Realtime Supabase](docs/adr/003-realtime-supabase.md), [004 Clean Architecture folders](docs/adr/004-clean-architecture-folders.md).

- **Frontend language**: TypeScript 5
- **Frontend framework**: Next.js 14 (App Router) + Tailwind CSS 3 + shadcn/ui
- **Mobile (Khách)**: Zalo Mini App SDK (zmp-sdk) — Charter Zalo-first
- **Backend language**: TypeScript 5
- **Backend framework**: Next.js 14 Route Handler + Server Actions (monorepo fullstack — xem ADR-001)
- **Monorepo**: pnpm workspace + Turborepo
- **Primary database**: PostgreSQL 15 (Supabase managed)
- **Multi-tenancy**: Postgres Row-Level Security bằng `tenant_id` (xem ADR-002)
- **Cache**: Upstash Redis (serverless)
- **ORM / Migration**: Drizzle ORM (Postgres flavor)
- **Validation**: Zod 3 (shared FE+BE schema)
- **Realtime**: Supabase Realtime (Postgres CDC over WebSocket — xem ADR-003)
- **Auth**: Supabase Auth (magic link email + Zalo custom provider)
- **Payment**: VNPay (primary) — MoMo + ZaloPay (Sprint 4+)
- **Notification**: Zalo OA Broadcast (promotion) + ZNS (transactional)
- **Test runner**: Vitest (unit + integration) + Playwright (E2E)
- **Linter / Formatter**: ESLint 9 + Prettier 3
- **CI/CD**: GitHub Actions + Vercel auto-deploy
- **Container (dev)**: pnpm workspace + Turborepo (không cần Docker local)
- **Orchestration (prod)**: Vercel Pro (web/api) + Supabase Pro (DB/Auth/Realtime/Storage)
- **Error monitoring**: Sentry
- **Logs / Uptime**: Better Stack (Logtail + Uptime)
- **Product analytics**: PostHog Cloud (EU)
- **Email**: Resend (magic link only)
- **Object storage**: Supabase Storage (S3-compatible)
- **DNS / CDN**: Cloudflare Free (DNS) + Vercel Edge

## Quy trình Làm việc Bắt buộc (YOU MUST FOLLOW)

### Bước 1 – Trước khi viết bất kỳ code nào
1. Đọc file này (CLAUDE.md) và các file trong `.claude/rules/`.
2. Đọc skill tương ứng với vai trò đang thực hiện trong `.claude/skills/`.
3. Hiểu yêu cầu → Phân tích tác động → Đề xuất giải pháp → Xác nhận với người dùng nếu cần.

### Bước 2 – Coding Standards
- Naming: `camelCase` cho JS/TS, `snake_case` cho Python, `PascalCase` cho class/interface.
- Mọi function/method phải có type hints và JSDoc/Docstring ngắn gọn.
- Giới hạn độ dài function < 50 dòng (trừ trường hợp đặc biệt có giải thích).
- Không dùng `any` / `var` / magic number. Luôn dùng `const` / `readonly` khi có thể.
- Error handling: dùng custom error classes và structured logging.

### Bước 3 – Testing
- Viết test trước hoặc song song với code (TDD khuyến khích).
- Coverage tối thiểu 80% cho business logic.
- Test phải độc lập, không phụ thuộc môi trường hoặc thứ tự chạy.

### Bước 4 – Security & Best Practices
- Không hard-code secret, API key → dùng environment variables.
- Validate tất cả input từ user/external.
- Dùng dependency injection ở mọi nơi có thể.
- Log thông tin nhạy cảm phải được mask.

### Bước 5 – Hoàn thành task
1. Self-review code trước khi trả kết quả.
2. Gợi ý commit message theo Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`...).
3. Gợi ý cải tiến nếu phát hiện technical debt.

## Cấu trúc Dự án Chuẩn

```
project-root/
├── src/
│   ├── modules/          # Feature modules (DDD style)
│   ├── shared/           # Shared utilities, helpers, base classes
│   ├── infrastructure/   # DB, cache, external services adapters
│   └── main.ts / main.py
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── adr/              # Architecture Decision Records
│   └── api/              # API documentation
├── .claude/
│   ├── rules/            # Quy tắc chi tiết theo loại file
│   └── skills/           # Skills cho từng vai trò AI
├── scripts/              # Helper scripts (deploy, migration...)
├── docker/               # Dockerfiles & compose
├── .github/workflows/    # CI/CD GitHub Actions
├── CLAUDE.md             # File này
├── AGENTS.md             # Định nghĩa các AI Agent
├── TEAM.md               # Cấu trúc team & quy trình
├── CHANGELOG.md          # Lịch sử thay đổi
└── README.md
```

## Lệnh Thường Dùng

```bash
# Lint & Format
npm run lint          # ESLint
npm run format        # Prettier
ruff check .          # Python lint
black .               # Python format

# Test
npm test              # Jest
npm run test:watch    # Jest watch mode
npm run test:cov      # Jest + coverage
pytest                # Python
pytest --cov=src      # Python + coverage

# Build & Dev
npm run dev           # Dev server
npm run build         # Production build
docker compose up -d  # Khởi động local environment

# Database
npm run db:migrate    # Chạy migration
npm run db:seed       # Seed dữ liệu test
npm run db:reset      # Reset database (local only)
```

## Cách AI Agents Phải Làm Việc

- **Luôn đọc file này trước** mọi hành động.
- Đọc skill phù hợp trong `.claude/skills/` trước khi bắt đầu task.
- Nếu không chắc về architecture hoặc convention → Hỏi lại hoặc tham khảo `docs/adr/`.
- Ưu tiên **modular code**, **SOLID principles**, **Domain-Driven Design** (nếu áp dụng).
- Không giả định — nếu yêu cầu mơ hồ, hãy hỏi lại trước khi implement.

## Chọn Skill — Thứ tự Ưu tiên

Kho v4.0:
- `.claude/skills/` — **45 skill auto-discoverable** (AI capabilities)
- `.claude/runbooks/` — **5 runbook** (playbook con người follow khi đối mặt tình huống thật)
- `.claude/skills-archive/` — 875 skill archived, restore khi cần

> **Bắt đầu**: xem `.claude/skills/INDEX.md` để tra skill theo phase công việc.

### 3 nhóm skill chính

1. **Custom Quân Nguyễn (23)** — VI, theo rules Quân Nguyễn. Ưu tiên cao nhất.
2. **obra/superpowers (8)** — MIT, methodology
3. **anthropic/skills (8)** — Apache 2.0, tooling

**Misc (6):** `ui-ux-pro-max`, `changelog-generator`, `domain-name-brainstormer`, `image-enhancer`, etc.

> Chi tiết + license: [.claude/skills/IMPORTED_SKILLS.md](.claude/skills/IMPORTED_SKILLS.md)

### Quy tắc deploy production

Khi deploy prod **PHẢI** mở runbook tương ứng (không bỏ qua):
1. **[`deployment-pipeline`](.claude/runbooks/deployment-pipeline/SKILL.md)** — Master 5-phase, mỗi lần deploy
2. **[`database-migration-safety`](.claude/runbooks/database-migration-safety/SKILL.md)** — Khi có migration
3. **[`incident-response`](.claude/runbooks/incident-response/SKILL.md)** — Khi prod gãy
4. **[`observability-setup`](.claude/runbooks/observability-setup/SKILL.md)** — Setup 1 lần (Sprint 0-1)
5. **[`production-readiness-audit`](.claude/runbooks/production-readiness-audit/SKILL.md)** — Trước launch (Sprint 11)

→ Đây là kết quả từ học hỏi 2 dự án trước (snap-post, vn-product-hunter) — deploy không có process = mất giờ + lỗi.

---

**Phát triển bởi Quân Nguyễn — Quality First, Always.**
Phiên bản: 4.0.0-rc.1 | Cập nhật: 2026-05-13 | Repo Git + sync automation + runbooks tách + INDEX
