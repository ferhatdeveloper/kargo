# AGENTS.md

## Cursor Cloud specific instructions

### Repository layout

- Ürün adı: **Kargom Kapında** (rakip marka adları UI’da kullanılmaz).
- **`portal/`** — Kargom Kapında müşteri paneli (React 19, Vite 8, Mantine 9, React Router 7).
- **`db/`** — PostgreSQL + PostgREST.

### Services

| Service | Required | Port | Notes |
|---------|----------|------|--------|
| Vite dev server (`portal`) | Yes (for UI work) | 5173 | `/api` → PostgREST (`vite.config.ts`) |
| PostgreSQL + PostgREST | Yes (API) | 5433 / 3100 | `make db-up` (RetailEX ile çakışmaz) |

### Commands (from repo root)

All commands run inside `portal/` — see root `README.md`.

- **Install:** `npm ci`
- **Dev:** `npm run dev` → http://localhost:5173/auth/login
- **Lint:** `npm run lint`
- **Build:** `npm run build`
- **Test:** `npm run test` (vitest), `npm run test:smoke` (PostgREST, DB gerekir)

### Environment

- **API:** yalnızca PostgREST — `portal/.env`: `VITE_API_BACKEND=postgrest`, `VITE_API_BASE_URL=/api` (bkz. `.env.example`)
- Yerel giriş: `demo@kargomkapinda.local` / `Demo123!` (`docker compose up -d` gerekir)
- Oturum token’larını repoya commit etmeyin.

### Veritabanı (PostgreSQL + PostgREST)

- Demo: `demo@kargomkapinda.local` / `Demo123!`
- PostgREST 12: JWT `request.jwt.claims` (`auth_user_id()`)

### Hello-world / smoke test

1. `cd portal && npm run dev`
2. `/auth/login` — Kargom Kapında markası; dil TR/EN seçici ile değişir
3. Yerel DB: `make db-up` + `POST /rpc/auth_login`

### tmux

`portal-vite-dev` oturumu için `npm run dev`.
