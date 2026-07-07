# Navlun

B2B **kargo ve lojistik müşteri paneli** — gönderi, entegrasyon, finans ve raporlama tek arayüzde.

## Proje yapısı

- `portal/` — React + Vite + Mantine UI frontend
- `db/` — PostgreSQL şeması (migrations + seed)
- `docker-compose.yml` — Dokploy production (PostgreSQL + PostgREST + Nginx portal)
- `docker-compose.dev.yml` — yerel geliştirme (yalnızca DB + PostgREST)

## Dokploy ile dağıtım

1. Dokploy'da yeni proje → **Docker Compose** servisi oluşturun.
2. GitHub reposu: `ferhatdeveloper/kargo`, branch: **main**.
3. **Compose Path:** `./docker-compose.yml`
4. Ortam değişkenlerini ayarlayın (`.env.example` referans):

| Değişken | Açıklama |
|----------|----------|
| `POSTGRES_PASSWORD` | PostgreSQL şifresi |
| `PGRST_JWT_SECRET` | JWT imza anahtarı (en az 32 karakter) |

5. **Domains** sekmesinden `portal` servisine domain bağlayın (container port **80**).
6. Deploy'a tıklayın.

Production'da portal Nginx üzerinden `/api` isteklerini PostgREST'e proxy'ler; ayrı API domain'i gerekmez.

Demo giriş: `demo@navlun.local` / `Demo123!`

## Yerel geliştirme

```bash
cp portal/.env.example portal/.env
make db-up                           # DB + PostgREST :3000
cd portal && npm install && npm run dev
```

Uygulama `http://localhost:5173/auth/login` adresinde açılır. API istekleri Vite proxy ile PostgREST'e gider.

### Testler

```bash
make portal-check    # lint + unit + API smoke + build
```

## Özellikler

- Çoklu dil (TR/EN) — `localStorage` + üst bardaki seçici
- Giriş, kayıt ve şifremi unuttum
- Müşteri paneli: gösterge paneli, kargolar, ürünler, faturalar, entegrasyonlar
- PostgREST RPC API (auth, kargolar, fiyat teklifi, kargo oluşturma, etiket ayarları)

## Güvenlik

Giriş bilgilerini repoya eklemeyin. Üretimde `POSTGRES_PASSWORD` ve `PGRST_JWT_SECRET` değerlerini mutlaka değiştirin.
