# @hetcho/mini-app — Zalo Mini App

## Status
- Sprint 0: skeleton + routing + API client (web fallback chạy được standalone)
- Sprint 3: implement full Zalo SDK auth + payment redirect

## Limit hiện tại

- ❌ Zalo Mini App SDK (`zmp-sdk`, `zmp-ui`) **chưa wire up** — đang dùng react-router cho web preview.
- ❌ Zalo OAuth (`zmp.getUserInfo()`) chưa implement.
- ❌ Mini App ID + Secret cần đăng ký Zalo Mini App Developer Portal trước khi `zmp-cli dev` chạy được.

Xem `PENDING_HUMAN.md` PH-002 cho block hiện tại.

## Dev (web mode standalone)

```bash
pnpm --filter @hetcho/mini-app dev
# → http://localhost:3001
```

## Cấu trúc

```
src/
├── app.tsx                    # Router root
├── main.tsx                   # ReactDOM mount
├── pages/
│   ├── home.page.tsx          # Tenant landing
│   ├── select-service.page.tsx
│   ├── select-slot.page.tsx
│   └── confirm.page.tsx       # TODO Sprint 3
└── services/
    └── api.client.ts          # Gọi web app API (cùng monorepo)
```
