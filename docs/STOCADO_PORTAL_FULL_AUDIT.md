# Stocado Portal — Tam Sayfa İnceleme Raporu

**Kaynak:** https://portal.stocado.com/  
**Tarih:** 4 Haziran 2026 (güncelleme: canlı inceleme + önceki keşif + frontend bundle analizi)  
**URL kalıbı:** `/tr/accounts/{accountId}/{kaynak}[/{alt}]`  
**Hesap ID:** 26 karakter (ULID benzeri, örn. `01kmnf4Kye2nyYkprdv3g7ss5p`)

Bu belge, Stocado müşteri panelindeki **her menü sayfasının** tasarım yapısını, form alanlarını, tabloları, filtreleri ve API ipuçlarını kaydeder. Kargom Kapında (`portal/`) ile karşılaştırma sütunu her sayfada verilir.

---

## İçindekiler

1. [Global kabuk](#1-global-kabuk)
2. [Kimlik doğrulama](#2-kimlik-doğrulama)
3. [Gösterge paneli](#3-gösterge-paneli-dashboard)
4. [Yeni kargo](#4-yeni-kargo-cargoscreate)
5. [Kargolarım](#5-kargolarım-cargos)
6. [İade yönetimi](#6-iade-yönetimi-returns)
7. [Ürünlerim](#7-ürünlerim-products)
8. [Fiyat listesi](#8-fiyat-listesi-pricing-plans)
9. [Finans hareketlerim](#9-finans-hareketlerim-accounting-transactions)
10. [Kapıda ödeme](#10-kapıda-ödeme-pay-on-delivery)
11. [Faturalarım](#11-faturalarım-invoices)
12. [Fatura işlemleri](#12-fatura-işlemleri-alt-sayfalar)
13. [Pazaryeri siparişleri](#13-pazaryeri-siparişleri-market-orders)
14. [Entegrasyonlar](#14-entegrasyonlar-integrations)
15. [İstatistikler](#15-istatistikler-statistics)
16. [Destek merkezi](#16-destek-merkezi-tickets)
17. [Ayarlar](#17-ayarlar-settings)
18. [Alt hesaplar](#18-alt-hesaplar)
19. [API özeti](#19-api-özeti)
20. [Kargom Kapında parite matrisi](#20-kargomkapinda-parite-matrisi)

---

## 1. Global kabuk

### Sidebar menü (sıra)

| # | Menü | Koşul |
|---|------|--------|
| 1 | Gösterge Panelim | — |
| 2 | Yeni Kargo | — |
| 3 | Kargolarım | — |
| 4 | İade Yönetimi | — |
| 5 | Ürünlerim | — |
| 6 | Fiyat Listesi | — |
| 7 | Finans Hareketlerim | — |
| 8 | Kapıda Ödeme | `can_pod` |
| 9 | Faturalarım | — |
| 10 | Fatura İşlemlerim ▾ | `can_invoice` |
| 11 | Pazaryeri Siparişleri | — |
| 12 | Entegrasyonlar | — |
| 13 | İstatistikler | — |
| 14 | Destek Merkezi | Okunmamış badge |
| 15 | Ayarlar | — |
| 16 | Kullanıcı / hesap değiştir | Alt kısım |

### Header (tüm hesap sayfaları)

- **Bakiye** rozeti: turuncu `#ff8800`, beyaz yazı, örn. `Bakiye: 648,52₺`
- **K.Ö Alacak** rozeti: mavi `#0d87f7`, örn. `K.Ö Alacak 4.495,79₺`
- Kullanıcı menüsü (ad, e-posta, çıkış)

### Tasarım tokenları

| Token | Değer |
|-------|--------|
| Primary | `#0d87f7` |
| Turuncu bakiye | `#ff8800` |
| Sidebar genişlik | ~250px |
| Aktif menü BG | `#e6f4ff` + sol 3px mavi çizgi |
| Sayfa zemini | `#f5f7fa` |
| Tablo header | `#f9fafb` |
| Border | `#e5e7eb` |
| Buton radius | ~6px |
| Font | Inter benzeri, 13–14px gövde |

### Liste sayfası ortak araç çubuğu

- Arama: `Ara...`
- Aktif filtre **chip**'leri (× ile kaldır)
- İkonlar: grafik, yenile, tablo görünümü, indir
- **Filtreler** (mavi dolu buton) → sağdan drawer

---

## 2. Kimlik doğrulama

### 2.1 Giriş — `/tr/auth/login`

| Alan | Stocado |
|------|---------|
| Başlık | Tekrar hoş geldiniz! |
| Üst link | Henüz hesabınız yok mu? **Kayıt Ol** |
| Alanlar | E-posta, Şifre, Beni hatırla, Şifremi unuttum |
| CTA | Giriş yap (mavi) |
| Alt | Mesafeli satış, gizlilik, iade koşulları linkleri |

**Kargom Kapında:** Split-layout korunuyor (ürün kararı); Stocado ile bire bir değil.

### 2.2 Kayıt — `/tr/auth/register`

- Ad, Soyad, E-posta, Telefon (+90)
- Şifre, Şifre tekrar
- Zorunlu onay kutuları: Yasaklı ürünler EK-1/EK-2, KVKK, üyelik koşulları
- **Kayıt Ol**

### 2.3 Şifremi unuttum — `/tr/auth/forgot-password`

- E-posta
- **Şifre sıfırlama bağlantısı gönder**

---

## 3. Gösterge paneli (`/dashboard`)

### Başlık ve sekmeler

- **İyi Çalışmalar {Ad}**
- Sekmeler: **Kargolar** | Kapıda Ödemeler | Finans
- Tarih: **Son 7 gün** (menü: 7/14/30 gün)

### Metrik kartları (6)

| Kart | Renk ipucu |
|------|------------|
| Bekleyen Paketler | Sarı |
| Yolda Olan Paketler | Mavi |
| Teslim Edilen Paketler | Yeşil |
| Sorunlu Paketler | Kırmızı |
| Geri Dönen Paketler | Turuncu |
| TÜMÜ | Gri |

### Widget alanları

1. **Gönderi ve Kargo Analiz Özeti** — Türkiye haritası (şehir yoğunluğu); alt sekmeler: Sorunlu | Desi Değişmeleri
2. **Günlük Gönderi İstatistikleri** — çizgi grafik (Teslim / Transfer / Toplam)
3. **Kargo Firmaları** — pasta + en çok/az alan şehir
4. **Gönderi Sayısı** — halka grafik (tamamlanma %)

**Kargom Kapında:** Kartlar ve grafikler var; harita ve KÖ/Finans sekmeleri içeriği zayıf.

---

## 4. Yeni kargo (`/cargos/create`)

### Stepper (4 adım)

1. Gönderici ve Alıcı  
2. Paket Bilgisi  
3. Ek Hizmetler  
4. Teklif ve Özet  

### Sağ panel (sabit)

- **Kargo Gönder** (primary)
- **Kargo Bana Gelsin**
- **Tekliflerim** — desi/ölçü girilince fiyat listesi

### Form alanları

| Bölüm | Alanlar |
|--------|---------|
| Gönderici | Dropdown adres (+ yeni) |
| Alıcı | Dropdown adres (+ yeni) |
| KÖ | Radio: Kapıda Ödeme |
| Paket | Ürün seç (+), açıklama, **Desi** veya En/Boy/Yükseklik/Ağırlık |
| Ek | Kapıda Alıcı Ödemeli, Kontrollü Teslimat, Taslak |
| Alt | Temizle, **Kargo Oluştur** |

**Kargom Kapında:** Stepper + panel var; adres/ürün modalları ve canlı teklif API tam değil.

---

## 5. Kargolarım (`/cargos`)

### Üst

- Bakiye + K.Ö rozetleri
- Sekmeler: **Tümü** | **Kapıda Ödemeli** | **Taslaklar**

### Tablo — Tümü (~24 kolon)

Gönderici (2 satır), Alıcı, Alıcı İl, Alıcı İlçe, Alıcı Tel, Son Hareket (badge), K.Ö tutarı, Oluşturma Tarihi, Taşıyıcı Barkod, Referans Barkod, Kargo Firması (logo), Son Hareket Açıklama, Durum, Desi, menüler, kopyala ikonları.

### Tablo — Kapıda ödemeli

Taşıyıcı/Referans barkod, Sipariş No, Alıcı, Tel, Tahmini K.Ö mahsup, Ödeme türü, Ödeme durumu.

### Filtre drawer (13+ grup)

Son hareket tarihi, kontrol tarihi, KÖ (Evet/Hayır), ödeme durumu (6 seçenek), toplama tarihi, etiket durumu, kullanıcı/şube desi min-max, yükseklik/genişlik/uzunluk/ağırlık min-max, **son hareket** çoklu seçim.

**Temizle** / **Sorgula**; chip’ler üstte.

### Sayfalama

`1 - 10 / 21`, sayfa başına 10/25/50, sayfa numaraları.

### Satır aksiyonları

⋮ menü: detay, iptal, etiket, **İade talebi oluştur**, vb.

**Kargom Kapında:** Tablo ve filtre iskeleti var; kolon menüleri, logo, toplu işlem, export gerçek değil.

---

## 6. İade yönetimi (`/returns`)

### KPI şeridi (4 kart)

Kargo Oluşturuldu, Yolda, Teslim Edilen, İptal — gradient kartlar.

### İade oranı rozeti

≤5% yeşil, ≤15% sarı, üstü kırmızı.

### Sekmeler

**Tümü** | Bekleyen | Yolda | Teslim Edilen | İptal

### Bilgi alert’i

Kargolarım ⋮ → **İade Talebi Oluştur** yönlendirmesi.

### Tablo kolonları

Referans No, Taşıyıcı Barkod, İlgili Kargo, Alıcı, **Sebep**, Son hareket, Kargo firması, Oluşturma.

### İade oluşturma modalı

Ön tanımlı sebepler: hasarlı, yanlış ürün, eksik, beğenmedi, beden, iptal, Diğer + serbest metin.

**Kargom Kapında:** `PlaceholderPage` — **tam eksik**.

---

## 7. Ürünlerim (`/products`)

- Sekme: **Tümü** (+ özel sekme ekleme)
- **Yeni Ürün Ekle**, Filtreler, Excel/indir
- Kolonlar: ID, Ürün Adı, Ürün Kodu, Fiyat, En, Boy, Yükseklik, Desi, Oluşturma, Aktif ✓, Sil 🗑

**Kargom Kapında:** Liste var; oluştur/düzenle modal ve API CRUD eksik.

---

## 8. Fiyat listesi (`/pricing-plans`)

- Başlık: **Kargo Fiyat Listesi**
- Taşıyıcı sekmeleri: Kolay Gelsin, Sürat, hepsiJET, PTT, Yurtiçi, UPS…
- Mavi bilgi kutusu (kurye, KÖ, desi kuralları)
- Alt sekmeler: **Normal** | **Ek Ücretler**
- İki sütunlu desi–fiyat tablosu + sayfalama
- Sağ: Artan desi, limit aşımları tablosu

**Kargom Kapında:** Sekmeler + örnek tablo; gerçek plan API’si yok.

---

## 9. Finans hareketlerim (`/accounting-transactions`)

### Sekmeler

**Tümü** | **Kapıda Ödemeler** | **İşlem Türleri** (gruplu özet)

### Tablo

ID, Cari hesap, Belge ID, **İşlem türü**, Model, **Tutar** (işaretli), **Bakiye**, Referans barkod (+ kargo menü), Açıklama, Para birimi, Durum, Tarih, Fatura no.

### İşlem türleri (örnek)

Bakiye yükleme/çekme, transfer, KÖ tutarı/komisyon, gönderim ücreti, desi farkı, etiket/sigorta, iptal, banka havalesi…

### Admin

Manuel işlem ekleme, düzeltme, bakiye transferi.

**Kargom Kapında:** `PlaceholderPage` — **tam eksik**.

---

## 10. Kapıda ödeme (`/pay-on-delivery`)

**URL:** `/pay-on-delivery/{tab}` — varsayılan `dashboard`

| Sekme | İçerik |
|--------|--------|
| Gösterge Paneli | KPI, ödeme akış kartı, geçmiş, günlük grafik, zaman çizelgesi |
| Yaklaşan Ödemeler | Mahsup takvimi |
| Ödeme Takibi | Dönem 7/30/90/tümü, durum filtresi, arama |
| Ödenenler | Tamamlanan tahsilatlar |
| Kargolar | POD kargo tablosu |
| Banka Hesapları | IBAN / banka listesi |

**Kargom Kapında:** `PlaceholderPage` — **tam eksik**.

---

## 11. Faturalarım (`/invoices`)

- Yıl seçici (cari + 2 önceki yıl)
- Arama (fatura no)
- Toplam tutar kartı
- Liste: fatura no, E-Fatura/E-Arşiv, durum, tarih, tutarlar, PDF
- Durum: Oluşturuldu, Gönderildi, İptal; Sovos: Bekliyor, İşleniyor, Gönderildi, Başarısız

**Kargom Kapında:** `PlaceholderPage`.

---

## 12. Fatura işlemleri (alt sayfalar)

### Bekleyen (`/invoices/pending`)

- Sovos bağlantı uyarısı + bakiye kartı
- Özet: Sipariş / KÖ / Toplam
- Segment: Tümü | Gecikmiş | KÖ | Pazaryeri
- Tablo: seçim, takip no (+ pazaryeri logosu), alıcı, şehir, ücretler, teslim tarihi, TC, işlem
- Modal: KDV %, not; tekli/toplu fatura kes
- Boş: **Fatura bekleyen gönderi yok**

### Kestiğim (`/invoices/issued`)

- Dönem: 1g/1h/1a/3a/özel
- Durum segmenti (+ sorunlu Sovos)
- KPI: tutar, vergi, gönderilen, bekleyen/hatalı
- PDF görüntüle, yeniden dene, yeniden gönder

### Harici (`/invoices/external`)

- Excel indir
- Harici kesildi olarak işaretlenen kargolar listesi

### Fatura ayarları (`/settings/invoice-settings`)

- Sovos, banka, internet satış, taşıyıcı VKN, varsayılan notlar

**Kargom Kapında:** Hepsi `PlaceholderPage`.

---

## 13. Pazaryeri siparişleri (`/market-orders`)

### KPI chip’leri

Onay bekleyen, telefon onaylı, aksiyon gereken, planlı, kargo oluşturulan, iptal, iade talebi.

### Araç çubuğu

Yenile, Excel, kolon yöneticisi (sürükle-bırak, localStorage), kargo oluştur, iptal/sil, geçmiş sipariş çek, yorumlar çekmecesi.

### Varsayılan kolonlar

Pazaryeri, Sipariş ID, Alıcı, Ürün, Durum, Yorumlar, KÖ, ödeme tutarı, tarih; opsiyonel: sipariş no, tel, e-posta, referans barkod.

### Durumlar

Pending, PhoneConfirmed, ActionRequired, Scheduled, Processed, Cancelled, ReturnRequested.

**Kargom Kapında:** `PlaceholderPage` — **tam eksik**.

---

## 14. Entegrasyonlar (`/integrations`)

**Sekmeler:** Pazaryeri | Fatura | API

### Pazaryeri grid (4 kolon kart)

Butik Sistem, HepsiBurada, Trendyol, İkas, Ticimax, WooCommerce, N11, Pazarama, Turkcell Pasaj, Çiçek Sepeti, Shopify, T-Soft (çok yakında).

Kart: logo, başlık, açıklama, **Bağlı Değil** + **Bağlan** veya **Çok Yakında**.

### Fatura / API sekmeleri

- Fatura: e-fatura entegrasyon sağlayıcıları
- API: anahtar oluşturma, webhook (bundle’dan çıkarım)

**Kargom Kapında:** Pazaryeri grid var; bağlan akışı ve diğer sekmeler iskelet.

---

## 15. İstatistikler (`/statistics`)

- Alt başlık: performans, teslimat, iade analizleri
- Dönem: 1/3/6/12 ay
- Sekmeler: Genel Bakış | Performans | Finansal | Hedefler & Trend
- Sarı **akıllı uyarılar** bandı
- 4 KPI kartı (renkli üst çizgi)
- Dönem karşılaştırma tablosu (bu ay / geçen ay / değişim %)
- Haftalık bar chart (gün bazlı yoğunluk)

**Kargom Kapında:** Genel bakış kısmen; diğer sekmeler boş metin.

---

## 16. Destek merkezi (`/tickets`)

- Sidebar’da okunmamış **badge**
- **Yeni destek talebi**
- Tablo sekmeleri: Tümü | Bekleyenler
- Oluşturma formu: Konu*, Öncelik, Mesaj*
- Kolonlar: Ticket no, Konu, Kullanıcı, Durum, Öncelik, Tarih
- Detay sayfası: mesaj thread’i
- `GET .../tickets/unread-count`

**Kargom Kapında:** `PlaceholderPage`.

---

## 17. Ayarlar (`/settings`)

**Sekmeler:**

| Sekme | İçerik |
|--------|--------|
| Belge Yükle | Belge listesi, durum: İnceleniyor/Onaylandı/Reddedildi |
| Hesap Bilgileri | Unvan, vergi, fatura/iletişim adresi formları |
| Kullanıcılar | Hesap kullanıcıları CRUD |
| Adresler | Adres defteri |
| Etiket | Etiket şablonları |
| Giriş Geçmişi | Oturum logları |
| E-posta Bildirimleri | Bildirim tercihleri |
| Fatura Ayarları | Sovos / fatura profili |
| Kargo Firma Ayarları | Taşıyıcı tercihleri |

**Hesap bloğu:** logo yükle, yetki checkbox listesi (yurtiçi, yurtdışı, fatura, KÖ, mahsuplaşma…), limit alanları.

**Kargom Kapında:** Sekme isimleri var; çoğu panel “yakında” metni.

---

## 18. Alt hesaplar (`/sub-accounts`)

- Alt hesap listesi ( `has_sub_accounts` ise menüde görünür)
- Oluşturma / yetki atama

**Kargom Kapında:** `PlaceholderPage`.

---

## 19. API özeti

| Kaynak | Yöntem | Not |
|--------|--------|-----|
| Giriş | `POST /auth/login` | JWT |
| Kargolar | `POST /accounts/{id}/cargos/query` | `fields`, `filters`, `sort`, `page` |
| Kargo oluştur | `POST /accounts/{id}/cargos` | |
| İade | `POST .../cargos/{id}/returns` | |
| Finans | `POST .../accounting-transactions/query` | |
| KÖ | Tab + özel POD endpoint’leri | |
| Fatura bekleyen | `GET .../customer-invoices/pending-cargos` | Sovos |
| Pazaryeri | `POST .../market-orders/query` | |
| Destek | `POST .../tickets/query` | |
| Dashboard | `GET .../dashboard/metrics` | |

Kargom Kapında PostgREST hedefi: `db/migrations/*`, RPC’ler (`account_cargos_query`, vb.).

---

## 20. Kargom Kapında parite matrisi

| Sayfa | Stocado derinliği | Kargom Kapında durumu | Boş/iskelet hissi |
|-------|-------------------|---------------|-------------------|
| Dashboard | ★★★★★ | ★★☆☆☆ | Harita, KÖ/Finans sekmeleri zayıf |
| Kargolar | ★★★★★ | ★★★☆☆ | Menü/aksiyon/export eksik |
| Yeni kargo | ★★★★★ | ★★★☆☆ | Modallar, gerçek teklif |
| Ürünler | ★★★★☆ | ★★☆☆☆ | CRUD yok |
| Fiyat listesi | ★★★★☆ | ★★☆☆☆ | Statik tablo |
| Entegrasyonlar | ★★★★☆ | ★★☆☆☆ | Bağlan akışı yok |
| İstatistik | ★★★★☆ | ★★☆☆☆ | 3 sekme boş |
| Ayarlar | ★★★★★ | ★☆☆ops | Sekmelerin çoğu boş |
| İade | ★★★★★ | ☆☆☆☆☆ | Placeholder |
| Finans | ★★★★★ | ☆☆☆☆☆ | Placeholder |
| KÖ sayfası | ★★★★★ | ☆☆☆☆☆ | Placeholder |
| Faturalar (tümü) | ★★★★★ | ☆☆☆☆☆ | Placeholder |
| Pazaryeri sipariş | ★★★★★ | ☆☆☆☆☆ | Placeholder |
| Destek | ★★★★☆ | ☆☆☆☆☆ | Placeholder |
| Alt hesaplar | ★★★☆☆ | ☆☆☆☆☆ | Placeholder |

**Sonuç:** Kargom Kapında’da ~**9/18** ana iş sayfası hâlâ placeholder veya yalnızca statik iskelet; bu yüzden “boş taslak” algısı doğru.

---

## Ek: Ortak bileşen kütüphanesi (Stocado’dan çıkarım)

Uygulama geliştirirken tekrar kullanılacak bileşenler:

1. `FinanceBadges` — header  
2. `QueryDataTable` — sıralama, filtre, sayfalama, kolon yönetimi  
3. `FilterDrawer` — sağ panel + chip  
4. `KpiCard` / `KpiStrip` — gradient veya bordered  
5. `PageHeader` — başlık + aksiyonlar  
6. `StatusBadge` — kargo hareket / ödeme / fatura  
7. `IntegrationCard` — grid  
8. `StepperForm` + `QuoteSidebar` — yeni kargo  
9. `EmptyState` — illüstrasyon + CTA  
10. `PeriodSelect` — 7/30/90 gün  

---

*Bu rapor `docs/STOCADO_PORTAL_TODO.md` ile birlikte kullanılmalıdır.*
