# AGENTS.md

## Cursor Cloud specific instructions

### Repository layout

- **`main`** branch currently contains only a stub README; the runnable app lives on **`cursor/stocado-portal-clone-3859`** (or whichever branch has `portal/`). Check out that branch before developing.
- **`portal/`** — Stocado-style customer portal (React 19, Vite 8, Mantine 9, React Router 7).

### Services

| Service | Required | Port | Notes |
|---------|----------|------|--------|
| Vite dev server (`portal`) | Yes (for UI work) | 5173 | Proxies `/api` → `https://api.kargopaneli.com/v1` |
| Backend API | External | — | No local API; uses live `api.kargopaneli.com` via proxy |

### Commands (from repo root)

All commands run inside `portal/` — see root `README.md` for the same scripts.

- **Install:** `npm ci` (preferred; `package-lock.json` present)
- **Dev:** `npm run dev` → http://localhost:5173/tr/auth/login
- **Lint:** `npm run lint` — may report existing `react-hooks/set-state-in-effect` in `AuthContext.tsx` (build still passes)
- **Build:** `npm run build`
- **Preview prod build:** `npm run preview`

### Environment

- Copy `portal/.env.example` to `portal/.env` if needed. Leave `VITE_API_BASE_URL` empty to use the Vite dev proxy (default).
- Do not commit credentials or session tokens.

### Veritabanı (PostgreSQL + PostgREST)

- `docker compose up -d` — Postgres `:5432`, PostgREST `:3000`
- Migrations: `db/migrations/*.sql` (init container’da otomatik)
- Demo: `demo@stocado.local` / `Demo123!`
- PostgREST 12 JWT: `auth_user_id()` `request.jwt.claims` JSON kullanır (`013_jwt_claims_postgrest12.sql`)

### Hello-world / smoke test

1. `cd portal && npm run dev`
2. Open `/tr/auth/login` — login form and Stocado-style copy should render.
3. Optional: log in with valid kargopaneli credentials to reach `/tr/accounts/:id/dashboard` (requires live API and user secrets; not required for UI-only setup).

### tmux

Use a named session (e.g. `portal-vite-dev`) for long-running `npm run dev`; attach with `tmux -f /exec-daemon/tmux.portal.conf attach-session -t portal-vite-dev`.
