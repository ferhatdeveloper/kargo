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

### Non-obvious gotchas (deploy/çalıştırma)

- **Docker daemon:** `make db-up` (Postgres + PostgREST) için Docker gerekir. Snapshot'ta Docker kurulu; `docker` komutu "Cannot connect to the Docker daemon" derse `sudo dockerd` ile başlatın (DinD için `/etc/docker/daemon.json` `fuse-overlayfs` + `containerd-snapshotter:false` ile ayarlıdır).
- **JWT secret eşleşmesi (401 tuzağı):** DB, JWT'yi `app.jwt_secret` GUC ile imzalar; bu değer `012_auth_rpc.sql` içinde `kargomkapinda-dev-jwt-secret-min-32-chars!!` olarak sabittir. PostgREST bunu `PGRST_JWT_SECRET` ile doğrular. İkisi eşit değilse `auth_login` (anon) 200 döner ama `auth_me`/`user_accounts_query` gibi authenticated çağrılar **401** alır. `PGRST_JWT_SECRET`'i değiştirirseniz, aynı değeri DB'de de ayarlamanız gerekir (`ALTER DATABASE ... SET app.jwt_secret`). `docker-compose.dokploy.yml`'deki varsayılan `PGRST_JWT_SECRET` bu sabitle eşleşmez — üretimde JWT'yi değiştirirken bu iki tarafı senkron tutun.
- **Dokploy:** Bu repo tek konteynerlik "Application" değil, **Docker Compose** servisi olarak dağıtılmalıdır (`Compose Path: ./docker-compose.dokploy.yml`). Domain'i `kargomkapinda_portal` servisine, port **80**'e bağlayın; Dokploy Traefik etiketleri + `dokploy-network`'ü otomatik enjekte eder (ilk domain sonrası bir kez yeniden deploy gerekebilir).
