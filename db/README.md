# Navlun — PostgreSQL + PostgREST

Navlun müşteri paneli için tam veritabanı şeması. Tablolar `public` şemasında; API katmanı **PostgREST** ile sunulur.

## Hızlı başlangıç

```bash
# Kök dizinden (RetailEX portlarıyla çakışmaz)
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml ps
```

| Servis     | Port | Açıklama        |
|-----------|------|-----------------|
| PostgreSQL | 5433 | `navlun` / `navlun` |
| PostgREST  | 3100 | REST + OpenAPI  |

**Demo giriş:** `demo@navlun.local` / `Demo123!`

```bash
curl -s -X POST http://127.0.0.1:3100/rpc/auth_login \
  -H 'Content-Type: application/json' \
  -d '{"p_email":"demo@navlun.local","p_password":"Demo123!","p_remember":false}'
```

OpenAPI: http://127.0.0.1:3100/

## Şema özeti

Bkz. migration dosyaları `db/migrations/` — kullanıcı, hesap, kargo, ürün, finans, pazaryeri, destek modülleri.

## PostgREST RPC (portal API eşlemesi)

| Portal (mevcut) | PostgREST |
|-----------------|-----------|
| `POST /auth/login` | `POST /rpc/auth_login` |
| `GET /auth/me` | `POST /rpc/auth_me` |
| `POST /users/:id/accounts/query` | `POST /rpc/user_accounts_query` |
| `POST /accounts/:id/cargos/query` | `POST /rpc/account_cargos_query` |
| Kargo fiyat karşılaştırma | `POST /rpc/account_cargo_quote` |
| Kargo oluşturma | `POST /rpc/account_cargo_create` |
| Adres defteri | `POST /rpc/account_addresses_query` |
| Etiket ayarları | `POST /rpc/account_label_settings_get` / `_save` |
| Dashboard metrikleri | `POST /rpc/account_dashboard_metrics` |
| Bakiye / K.Ö özeti | `POST /rpc/account_finance_summary` |
| Ürün listesi | `POST /rpc/account_products_query` |
| Entegrasyonlar | `POST /rpc/account_integrations_query` |
| Filtreli kargo listesi | `POST /rpc/account_cargos_query` (+ `p_tab`, `p_filters`) |

Migration `015_stocado_parity.sql` Stocado kolonları ve filtreleri ekler.

## Ortam değişkenleri

| Değişken | Varsayılan |
|----------|------------|
| `NAVLUN_PGRST_JWT_SECRET` | `navlun-dev-jwt-secret-min-32-chars!!` |
| DB | `postgres://navlun:navlun@localhost:5433/navlun` |

`app.jwt_secret` veritabanı ayarı `NAVLUN_PGRST_JWT_SECRET` ile aynı olmalıdır.
