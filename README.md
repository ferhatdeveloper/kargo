# Navlun

B2B **kargo ve lojistik müşteri paneli** — gönderi, entegrasyon, finans ve raporlama tek arayüzde.

## Proje yapısı

- `portal/` — React + Vite + Mantine UI frontend
- `db/` — PostgreSQL şeması (migrations + seed)
- `docker-compose.yml` — PostgreSQL 16 + PostgREST 12

## Geliştirme

```bash
cd portal
npm install
npm run dev
```

Uygulama `http://localhost:5173/tr/auth/login` adresinde açılır. API istekleri varsayılan olarak harici kargo API’sine Vite proxy ile yönlendirilir (`portal/vite.config.ts`).

### Yerel veritabanı (PostgreSQL + PostgREST)

```bash
make db-up          # veya: docker compose up -d
# PostgREST: http://127.0.0.1:3000
# Demo: demo@navlun.local / Demo123!
```

Ayrıntılar: [db/README.md](db/README.md)

## Özellikler

- Türkçe arayüz (`/tr` rotaları)
- Giriş, kayıt ve şifremi unuttum
- Müşteri paneli: gösterge paneli, kargolar, ürünler, faturalar, entegrasyonlar
- Canlı veya yerel PostgREST API entegrasyonu

## Marka

Ürün adı **Navlun** (lojistik/navlun teriminden). Rakip marka adları UI veya repoda kullanılmaz.

## Güvenlik

Giriş bilgilerini `.env` dosyasına veya repoya eklemeyin. Oturum token’ı yalnızca tarayıcı `localStorage` içinde tutulur.
