import {
  IconBox,
  IconBuildingStore,
  IconCashBanknote,
  IconChartBar,
  IconCurrencyLira,
  IconFileInvoice,
  IconHeadset,
  IconLayoutDashboard,
  IconPackageExport,
  IconPackages,
  IconPlugConnected,
  IconReportMoney,
  IconSettings,
  IconTruckReturn,
  IconUsersGroup,
} from '@tabler/icons-react'
import type { TablerIcon } from '@tabler/icons-react'

export interface MenuItem {
  label: string
  icon: TablerIcon
  color: string
  path: string
  id?: string
  children?: { label: string; path: string }[]
}

export function getAccountMenu(accountId: string, account?: {
  can_pod?: boolean
  can_invoice?: boolean
  has_sub_accounts?: boolean
}): MenuItem[] {
  const base = `/tr/accounts/${accountId}`
  const items: MenuItem[] = [
    { label: 'Gösterge Panelim', icon: IconLayoutDashboard, color: 'blue', path: `${base}/dashboard` },
    { label: 'Yeni Kargo', icon: IconPackageExport, color: 'teal', path: `${base}/cargos/create` },
    { label: 'Kargolarım', icon: IconPackages, color: 'indigo', path: `${base}/cargos` },
    { label: 'İade Yönetimi', icon: IconTruckReturn, color: 'orange', path: `${base}/returns`, id: 'returns' },
    { label: 'Ürünlerim', icon: IconBox, color: 'violet', path: `${base}/products` },
    { label: 'Fiyat Listesi', icon: IconCurrencyLira, color: 'green', path: `${base}/pricing-plans` },
    { label: 'Finans Hareketlerim', icon: IconReportMoney, color: 'cyan', path: `${base}/accounting-transactions` },
  ]

  if (account?.can_pod !== false) {
    items.push({
      label: 'Kapıda Ödeme',
      icon: IconCashBanknote,
      color: 'yellow',
      path: `${base}/pay-on-delivery`,
      id: 'pod',
    })
  }

  items.push({
    label: 'Faturalarım',
    icon: IconFileInvoice,
    color: 'grape',
    path: `${base}/invoices`,
    id: 'invoices',
  })

  if (account?.can_invoice !== false) {
    items.push({
      label: 'Fatura İşlemlerim',
      icon: IconFileInvoice,
      color: 'grape',
      path: `${base}/invoices/pending`,
      id: 'invoice-ops',
      children: [
        { label: 'Fatura Bekleyen Gönderiler', path: `${base}/invoices/pending` },
        { label: 'Kestiğim Faturalar', path: `${base}/invoices/issued` },
        { label: 'Harici Kesilen', path: `${base}/invoices/external` },
        { label: 'Fatura Ayarları', path: `${base}/settings/invoice-settings` },
      ],
    })
  }

  items.push(
    { label: 'Pazaryeri Siparişleri', icon: IconBuildingStore, color: 'pink', path: `${base}/market-orders` },
    { label: 'Entegrasyonlar', icon: IconPlugConnected, color: 'violet', path: `${base}/integrations` },
  )

  if (account?.has_sub_accounts) {
    items.push({
      label: 'Alt Hesaplar',
      icon: IconUsersGroup,
      color: 'lime',
      path: `${base}/sub-accounts`,
      id: 'sub-accounts',
    })
  }

  items.push(
    { label: 'İstatistikler', icon: IconChartBar, color: 'cyan', path: `${base}/statistics` },
    { label: 'Destek Merkezi', icon: IconHeadset, color: 'red', path: `${base}/tickets` },
    { label: 'Ayarlar', icon: IconSettings, color: 'gray', path: `${base}/settings` },
  )

  return items
}
