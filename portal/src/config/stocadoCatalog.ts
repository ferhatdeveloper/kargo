export const LAST_MOVEMENT_OPTIONS = [
  'Entegrasyon Hatası',
  'Gönderime Hazır',
  'Çıkış Şubesi',
  'Transferde',
  'Teslimat Şubesi',
  'Dağıtımda',
  'Teslim Edildi',
] as const

export const PAYMENT_STATUS_OPTIONS = [
  'Tahsil Edilecek',
  'Tahsil Edildi',
  'Firmadan Tahsil Edildi',
  'Tamamlandı',
  'İptal Edildi',
  'Kargo Firması Tarafından Ödendi',
] as const

export const LABEL_STATUS_OPTIONS = ['Yazdırıldı', 'Yazdırılmadı'] as const

export interface MarketplaceProvider {
  code: string
  title: string
  description: string
  connectable: boolean
  comingSoon?: boolean
  note?: string
}

export const MARKETPLACE_PROVIDERS: MarketplaceProvider[] = [
  {
    code: 'butik',
    title: 'Butik Sistem',
    description: 'Butik Sistem mağaza siparişlerinizi otomatik aktarın.',
    connectable: false,
    note: 'Aktivasyon için Butik Sistem destek hattı ile iletişime geçin: 0541 568 39 38',
  },
  {
    code: 'hepsiburada',
    title: 'HepsiBurada',
    description: 'HepsiBurada siparişlerinizi panelden yönetin.',
    connectable: true,
  },
  {
    code: 'trendyol',
    title: 'Trendyol',
    description: 'Trendyol sipariş senkronizasyonu.',
    connectable: true,
  },
  {
    code: 'ikas',
    title: 'İkas',
    description: 'İkas e-ticaret entegrasyonu.',
    connectable: true,
  },
  {
    code: 'ticimax',
    title: 'Ticimax',
    description: 'Ticimax mağaza bağlantısı.',
    connectable: true,
  },
  {
    code: 'woocommerce',
    title: 'WooCommerce',
    description: 'WooCommerce mağazanızı bağlayın.',
    connectable: true,
  },
  {
    code: 'n11',
    title: 'N11',
    description: 'N11 pazaryeri entegrasyonu.',
    connectable: true,
  },
  {
    code: 'pazarama',
    title: 'Pazarama',
    description: 'Pazarama sipariş aktarımı.',
    connectable: true,
  },
  {
    code: 'turkcell',
    title: 'Turkcell Pasaj',
    description: 'Turkcell Pasaj mağaza bağlantısı.',
    connectable: true,
  },
  {
    code: 'ciceksepeti',
    title: 'Çiçek Sepeti',
    description: 'Çiçek Sepeti siparişleri.',
    connectable: true,
  },
  {
    code: 'shopify',
    title: 'Shopify',
    description: 'Shopify mağazanız için Kargom Kapında uygulamasını kurun.',
    connectable: true,
  },
  {
    code: 'tsoft',
    title: 'T-Soft',
    description: 'T-Soft entegrasyonu yakında.',
    connectable: false,
    comingSoon: true,
  },
]

export const PRICING_CARRIER_TABS = [
  { code: 'kolaygelsin', title: 'Kolay Gelsin' },
  { code: 'surat', title: 'Sürat Kargo' },
  { code: 'hepsijet', title: 'hepsiJET' },
  { code: 'ptt', title: 'PTT' },
  { code: 'yurtici', title: 'Yurtiçi Kargo' },
  { code: 'mng', title: 'MNG Kargo' },
] as const
