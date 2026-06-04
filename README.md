# Navlun

B2B **kargo ve lojistik müşteri paneli** — gönderi, entegrasyon, finans ve raporlama tek arayüzde.

## Proje yapısı

- `portal/` — React + Vite + Mantine UI frontend
- `db/` — PostgreSQL şeması (migrations + seed)
- `docker-compose.yml` — PostgreSQL 16 + PostgREST 12

## Geliştirme

```bash
cp portal/.env.example portal/.env   # yerel PostgREST
docker compose up -d                 # DB + API :3000
cd portal
npm install
npm run dev
```

Giriş (yerel): `demo@navlun.local` / `Demo123!` (eski volume’da `demo@stocado.local` da çalışır)

Uygulama `http://localhost:5173/auth/login` adresinde açılır. API istekleri varsayılan olarak harici kargo API’sine Vite proxy ile yönlendirilir (`portal/vite.config.ts`).

### Yerel veritabanı (PostgreSQL + PostgREST)

```bash
make db-up          # veya: docker compose up -d
# PostgREST: http://127.0.0.1:3000
# Demo: demo@navlun.local / Demo123!
```

Ayrıntılar: [db/README.md](db/README.md)

### Testler

```bash
make portal-check    # lint + unit + API smoke + build
cd portal && npm run test:smoke
```

## Özellikler

- Çoklu dil (TR/EN) — dil URL’de değil, `localStorage` + üst bardaki seçici
- Giriş, kayıt ve şifremi unuttum
- Müşteri paneli: gösterge paneli, kargolar, ürünler, faturalar, entegrasyonlar
- Canlı veya yerel PostgREST API entegrasyonu

## Marka

Ürün adı **Navlun** (lojistik/navlun teriminden). Rakip marka adları UI veya repoda kullanılmaz.

## Güvenlik

Giriş bilgilerini `.env` dosyasına veya repoya eklemeyin. Oturum token’ı yalnızca tarayıcı `localStorage` içinde tutulur.
