import { callRpc } from './rpc'
import type {
  AddressBookEntry,
  CargoQuoteResult,
  CreateCargoPayload,
  CreateCargoResult,
  LabelSettings,
} from '@/types/shipping'

export async function fetchAddresses(accountId: string) {
  return callRpc<AddressBookEntry[]>('account_addresses_query', {
    p_account_id: accountId,
  })
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
  return callRpc<CargoQuoteResult>('account_cargo_quote', {
    p_account_id: accountId,
    p_length_cm: params.length_cm ?? 0,
    p_width_cm: params.width_cm ?? 0,
    p_height_cm: params.height_cm ?? 0,
    p_weight_kg: params.weight_kg ?? 0,
    p_desi: params.desi ?? null,
    p_pay_on_delivery: params.pay_on_delivery ?? false,
    p_pod_amount: params.pod_amount ?? null,
  })
}

export async function fetchLabelSettings(accountId: string): Promise<LabelSettings> {
  return callRpc<LabelSettings>('account_label_settings_get', {
    p_account_id: accountId,
  })
}

export async function saveLabelSettings(accountId: string, label: LabelSettings) {
  return callRpc<LabelSettings>('account_label_settings_save', {
    p_account_id: accountId,
    p_label: label,
  })
}

export async function createCargo(payload: CreateCargoPayload): Promise<CreateCargoResult> {
  return callRpc<CreateCargoResult>('account_cargo_create', {
    p_payload: payload,
  })
}
