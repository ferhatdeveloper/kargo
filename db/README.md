# Kargo Portal — PostgreSQL + PostgREST

Stocado müşteri portalı için tam veritabanı şeması. Tablolar `public` şemasında; API katmanı **PostgREST** ile sunulur.

## Hızlı başlangıç

```bash
# Kök dizinden
docker compose up -d
docker compose ps
```

| Servis     | Port | Açıklama        |
|-----------|------|-----------------|
| PostgreSQL | 5432 | `kargo` / `kargo` |
| PostgREST  | 3000 | REST + OpenAPI  |

**Demo giriş:** `demo@stocado.local` / `Demo123!`

```bash
# Oturum aç
curl -s -X POST http://127.0.0.1:3000/rpc/auth_login \
  -H 'Content-Type: application/json' \
  -d '{"p_email":"demo@stocado.local","p_password":"Demo123!","p_remember":false}'

# JWT ile kargolar (account_id seed sonrası sorgudan alınır)
curl -s http://127.0.0.1:3000/rpc/account_cargos_query \
  -H "Authorization: Bearer <TOKEN>" \
  -H 'Content-Type: application/json' \
  -d '{"p_account_id":"<UUID>","p_page":1,"p_per_page":25}'
```

OpenAPI: http://127.0.0.1:3000/

## Şema özeti

```mermaid
erDiagram
  users ||--o{ account_members : ""
  accounts ||--o{ account_members : ""
  accounts ||--o{ cargos : ""
  accounts ||--o{ products : ""
  accounts ||--o{ invoices : ""
  accounts ||--o{ integrations : ""
  cargo_companies ||--o{ cargos : ""
  cargos ||--o{ cargo_status_events : ""
  cargos ||--o{ cargo_items : ""
  products ||--o{ cargo_items : ""
  accounts ||--o{ returns : ""
  cargos ||--o| pay_on_delivery_records : ""
  accounts ||--o{ market_orders : ""
  integrations ||--o{ market_orders : ""
  accounts ||--o{ support_tickets : ""
  support_tickets ||--o{ ticket_messages : ""
```

## Tablolar (modüller)

| Modül | Tablolar |
|-------|----------|
| **Kimlik** | `users`, `user_sessions`, `password_reset_tokens` |
| **Hesap** | `accounts`, `account_members`, `account_settings`, `pricing_plans`, `account_pricing_plans` |
| **Kargo** | `cargo_companies`, `addresses`, `cargos`, `cargo_status_events`, `cargo_items` |
| **Ürün / İade** | `products`, `returns`, `return_items` |
| **Finans** | `invoices`, `invoice_lines`, `accounting_transactions`, `pay_on_delivery_records` |
| **Pazaryeri** | `integrations`, `market_orders`, `market_order_items` |
| **Destek** | `support_tickets`, `ticket_messages` |
| **Denetim** | `audit.event_log` |

## PostgREST RPC (portal API eşlemesi)

| Portal (mevcut) | PostgREST |
|-----------------|-----------|
| `POST /auth/login` | `POST /rpc/auth_login` |
| `GET /auth/me` | `POST /rpc/auth_me` (+ JWT) |
| `POST /auth/logout` | `POST /rpc/auth_logout` |
| `POST /auth/forgot-password` | `POST /rpc/auth_forgot_password` |
| `POST /users/:id/accounts/query` | `POST /rpc/user_accounts_query` |
| `POST /accounts/:id/cargos/query` | `POST /rpc/account_cargos_query` |
| CRUD | `GET/POST/PATCH/DELETE /{table}` (RLS ile) |

## Güvenlik

- **RLS**: Kullanıcı yalnızca `account_members` üzerinden bağlı olduğu hesapların verisini görür.
- **JWT**: `sub` = `users.id`, `role` = `authenticated`.
- **Roller**: `anon`, `authenticated`, `authenticator`, `service_role`.

## Migration dosyaları

`db/migrations/` altında sıralı SQL — yeni kurulumda Docker `init` ile otomatik çalışır.

Manuel:

```bash
for f in db/migrations/*.sql; do
  psql "postgres://kargo:kargo@localhost:5432/kargo" -f "$f"
done
psql "postgres://kargo:kargo@localhost:5432/kargo" -f db/seed/seed.sql
```

## Ortam değişkenleri

| Değişken | Varsayılan |
|----------|------------|
| `PGRST_JWT_SECRET` | `kargo-dev-jwt-secret-min-32-chars!!` |
| DB | `postgres://kargo:kargo@localhost:5432/kargo` |
| Authenticator | `authenticator` / `kargo_authenticator` |

`app.jwt_secret` veritabanı ayarı PostgREST `PGRST_JWT_SECRET` ile aynı olmalıdır.
