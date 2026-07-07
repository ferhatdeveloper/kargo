# Navlun

B2B **kargo ve lojistik müşteri paneli** — gönderi, entegrasyon, finans ve raporlama tek arayüzde.

## Proje yapısı

- `portal/` — React + Vite + Mantine UI frontend
- `db/` — PostgreSQL şeması (migrations + seed)
- `docker-compose.dokploy.yml` — Dokploy production (RetailEX ile uyumlu)
- `docker-compose.dev.yml` — yerel geliştirme (ayrı portlar)

## RetailEX ile birlikte çalışma

Aynı Dokploy sunucusunda [RetailEX](https://github.com/ferhatdeveloper/RetailEX) ile çakışmaz:

| | RetailEX | Navlun (bu proje) |
|---|----------|-------------------|
| Ağ | `berqenas_net` | `berqenas_net` (paylaşımlı) |
| PostgreSQL volume | `saas_postgres_data` | `navlun_pg_data` |
| Host portları | `:5432`, `:3002–:3020`, `:8080` | **Yok** (yalnızca internal) |
| Servis adları | `saas_postgres`, `postgrest_*` | `navlun_db`, `navlun_postgrest`, `navlun_portal` |
| Ortam değişkenleri | `POSTGRES_PASSWORD` | `NAVLUN_POSTGRES_PASSWORD` |

Yerel geliştirmede Navlun `:5433` (PostgreSQL) ve `:3100` (PostgREST) kullanır.

## Dokploy ile dağıtım

1. Dokploy'da yeni proje → **Docker Compose** servisi
2. Repo: `ferhatdeveloper/kargo`, branch: **main**
3. **Compose Path:** `./docker-compose.dokploy.yml`
4. Ortam değişkenleri (`.env.example`):

| Değişken | Açıklama |
|----------|----------|
| `NAVLUN_POSTGRES_PASSWORD` | PostgreSQL şifresi |
| `NAVLUN_PGRST_JWT_SECRET` | JWT imza anahtarı (en az 32 karakter) |

5. **Domains** → `navlun_portal` servisi, port **80**
6. Deploy

Demo giriş: `demo@navlun.local` / `Demo123!`

## Yerel geliştirme

```bash
cp portal/.env.example portal/.env
make db-up                           # DB :5433 + PostgREST :3100
cd portal && npm install && npm run dev
```

### Testler

```bash
make portal-check
```

## Güvenlik

Üretimde `NAVLUN_PGRST_JWT_SECRET` değerini mutlaka değiştirin.
