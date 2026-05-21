# Night Shift Log — Run #9 (Sprint 7 mock-doable: notification templates + Mini App package detail)

**Date**: 2026-05-21
**Branch**: `night-shift/ui-demo-20260516` (continuation, 37 commits)
**Mode**: NIGHT_SHIFT_MODE=true (mock + local Postgres OK, no remote push, no live API)
**Trigger**: user said "3. Plan Sprint 7" then chốt Q1-Q4

## Budget
- Max stories: 6
- Max time/story: 30 min
- Max retries: 3

## Stories

- [x] S4-prep `audit.list()` port method + `MockAuditLogger.list()` + 5 tests (filter tenant/action/date/limit/sort)
- [x] S3+S5 `NotificationTemplate` domain entity (handlebars-style `{{var}}`, nested paths, mutations) + 16 entity tests
- [x] S3+S5 `NotificationTemplateRepository` port + `InMemoryNotificationTemplateRepository` + 5 repo tests
- [x] S3+S5 `SaveTemplateUseCase` (upsert by trigger) + `GetTemplatesByTenantUseCase` + 8 use-case tests
- [x] S2 Mini App `/my-packages/:id` package detail page (timeline of consumed sessions, low-stock warning, smart CTA)
- [x] S1 enhance: 3 demo packages instead of 1, click-through to detail

## Skipped / Deferred

- **S6 Customer detail page** — UI shell already exists from Run #4 ui-demo (`apps/web/.../customers/[id]/page.tsx` with mock history + tier badge + package progress). Real backend wiring needs `GetCustomerDetailUseCase` + `findCompletedByCustomer` on booking repo. Out of scope tonight.
- **Drizzle migration** `notification_templates` table + `last_visit_at` column + `packages`/`package_usages` tables (now 4 pending migrations) — needs founder daytime review batched together
- **Audit-log subscriber adapters** that actually dispatch via ZNS reading these templates — needs Zalo OA verified (PH-002)
- **Wire admin/marketing/templates UI to real backend** — UI shells use hardcoded TEMPLATES const; swap to use case call deferred to user (template editor needs `'use server'` action + form state — design call)

## Result
- 5/6 selected stories done (S6 already largely existed as UI shell)
- 192 → **226 tests pass** under both `TZ=UTC` and `TZ=Asia/Ho_Chi_Minh` (+34 net new)
- 1 atomic night-shift commit
