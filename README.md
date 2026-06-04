# Kargo Portal

Stocado müşteri portalına (`https://portal.stocado.com/tr`) benzer bir kargo yönetim paneli.

## Proje yapısı

- `portal/` — React + Vite + Mantine UI frontend

## Geliştirme

```bash
cd portal
npm install
npm run dev
```

Uygulama `http://localhost:5173/tr/auth/login` adresinde açılır. API istekleri varsayılan olarak `https://api.kargopaneli.com/v1` adresine Vite proxy ile yönlendirilir.

### Yerel veritabanı (PostgreSQL + PostgREST)

```bash
make db-up          # veya: docker compose up -d
# PostgREST: http://127.0.0.1:3000
# Demo: demo@stocado.local / Demo123!
```

Ayrıntılar: [db/README.md](db/README.md)

## Özellikler

- Türkçe arayüz (`/tr` rotaları)
- Giriş, kayıt ve şifremi unuttum sayfaları (Stocado ile aynı metinler)
- Müşteri paneli: gösterge paneli, kargolar, ürünler, faturalar, entegrasyonlar ve diğer menü öğeleri
- Canlı API entegrasyonu (oturum token’ı ile)

## Güvenlik

Giriş bilgilerini `.env` dosyasına veya repoya eklemeyin. Oturum token’ı yalnızca tarayıcı `localStorage` içinde tutulur.
