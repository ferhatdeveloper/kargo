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
import type { MessageKey } from '@/i18n/messages'

export interface MenuItem {
  labelKey: MessageKey
  icon: TablerIcon
  color: string
  path: string
  id?: string
  children?: { labelKey: MessageKey; path: string }[]
}

export function getAccountMenu(
  accountId: string,
  account?: {
    can_pod?: boolean
    can_invoice?: boolean
    has_sub_accounts?: boolean
  },
): MenuItem[] {
  const base = `/accounts/${accountId}`
  const items: MenuItem[] = [
    { labelKey: 'menu.dashboard', icon: IconLayoutDashboard, color: 'blue', path: `${base}/dashboard` },
    { labelKey: 'menu.cargosCreate', icon: IconPackageExport, color: 'teal', path: `${base}/cargos/create` },
    { labelKey: 'menu.cargos', icon: IconPackages, color: 'indigo', path: `${base}/cargos` },
    { labelKey: 'menu.returns', icon: IconTruckReturn, color: 'orange', path: `${base}/returns`, id: 'returns' },
    { labelKey: 'menu.products', icon: IconBox, color: 'violet', path: `${base}/products` },
    { labelKey: 'menu.pricing', icon: IconCurrencyLira, color: 'green', path: `${base}/pricing-plans` },
    { labelKey: 'menu.accounting', icon: IconReportMoney, color: 'cyan', path: `${base}/accounting-transactions` },
  ]

  if (account?.can_pod !== false) {
    items.push({
      labelKey: 'menu.pod',
      icon: IconCashBanknote,
      color: 'yellow',
      path: `${base}/pay-on-delivery`,
      id: 'pod',
    })
  }

  items.push({
    labelKey: 'menu.invoices',
    icon: IconFileInvoice,
    color: 'grape',
    path: `${base}/invoices`,
    id: 'invoices',
  })

  if (account?.can_invoice !== false) {
    items.push({
      labelKey: 'menu.invoices',
      icon: IconFileInvoice,
      color: 'grape',
      path: `${base}/invoices/pending`,
      id: 'invoice-ops',
      children: [
        { labelKey: 'menu.invoicesPending', path: `${base}/invoices/pending` },
        { labelKey: 'menu.invoicesIssued', path: `${base}/invoices/issued` },
        { labelKey: 'menu.invoicesExternal', path: `${base}/invoices/external` },
        { labelKey: 'menu.invoiceSettings', path: `${base}/settings/invoice-settings` },
      ],
    })
  }

  items.push(
    { labelKey: 'menu.marketOrders', icon: IconBuildingStore, color: 'pink', path: `${base}/market-orders` },
    { labelKey: 'menu.integrations', icon: IconPlugConnected, color: 'violet', path: `${base}/integrations` },
  )

  if (account?.has_sub_accounts) {
    items.push({
      labelKey: 'menu.subAccounts',
      icon: IconUsersGroup,
      color: 'lime',
      path: `${base}/sub-accounts`,
      id: 'sub-accounts',
    })
  }

  items.push(
    { labelKey: 'menu.statistics', icon: IconChartBar, color: 'cyan', path: `${base}/statistics` },
    { labelKey: 'menu.tickets', icon: IconHeadset, color: 'red', path: `${base}/tickets` },
    { labelKey: 'menu.settings', icon: IconSettings, color: 'gray', path: `${base}/settings` },
  )

  return items
}
