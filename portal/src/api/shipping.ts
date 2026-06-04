import { api } from './client'
import { isPostgrest } from './config'
import { mockCargoQuoteFromDimensions } from '@/lib/mockCarrierQuotes'
import type {
  AddressBookEntry,
  CargoQuoteResult,
  CreateCargoPayload,
  CreateCargoResult,
  LabelSettings,
} from '@/types/shipping'

export async function fetchAddresses(accountId: string) {
  if (isPostgrest) {
    const res = await api.post<AddressBookEntry[]>('/rpc/account_addresses_query', {
      p_account_id: accountId,
    })
    return res.data
  }
  return [] as AddressBookEntry[]
}

export async function fetchCargoQuote(
  accountId: string,
  params: {
    length_cm?: number
    width_cm?: number
    height_cm?: number
    weight_kg?: number
    desi?: number
    pay_on_delivery?: boolean
    pod_amount?: number
  },
): Promise<CargoQuoteResult> {
  if (isPostgrest) {
    const res = await api.post<CargoQuoteResult>('/rpc/account_cargo_quote', {
      p_account_id: accountId,
      p_length_cm: params.length_cm ?? 0,
      p_width_cm: params.width_cm ?? 0,
      p_height_cm: params.height_cm ?? 0,
      p_weight_kg: params.weight_kg ?? 0,
      p_desi: params.desi ?? null,
      p_pay_on_delivery: params.pay_on_delivery ?? false,
      p_pod_amount: params.pod_amount ?? null,
    })
    return res.data
  }
  return mockCargoQuoteFromDimensions(
    params.length_cm ?? 0,
    params.width_cm ?? 0,
    params.height_cm ?? 0,
    params.weight_kg ?? 0,
    params.pay_on_delivery ?? false,
  )
}

export async function fetchLabelSettings(accountId: string): Promise<LabelSettings> {
  if (isPostgrest) {
    const res = await api.post<LabelSettings>('/rpc/account_label_settings_get', {
      p_account_id: accountId,
    })
    return res.data
  }
  return {
    format: '100x150',
    layout: 'standard',
    show_logo: true,
    show_barcode: true,
    show_reference: true,
    font_size: 'md',
    accent_color: '#228be6',
  }
}

export async function saveLabelSettings(accountId: string, label: LabelSettings) {
  if (isPostgrest) {
    const res = await api.post<LabelSettings>('/rpc/account_label_settings_save', {
      p_account_id: accountId,
      p_label: label,
    })
    return res.data
  }
  return label
}

export async function createCargo(payload: CreateCargoPayload): Promise<CreateCargoResult> {
  if (isPostgrest) {
    const res = await api.post<CreateCargoResult>('/rpc/account_cargo_create', {
      p_payload: payload,
    })
    return res.data
  }
  const tracking = `NV${Date.now().toString(36).toUpperCase()}`
  return {
    id: crypto.randomUUID(),
    tracking_number: tracking,
    status: payload.is_draft ? 0 : 1,
    desi: payload.desi ?? 1,
    quoted_price: 0,
    cargo_company_id: payload.carrier_id,
  }
}
