export interface AddressBookEntry {
  id: string
  label?: string
  contact_name: string
  phone?: string
  city: string
  district?: string
  address_line: string
  is_default?: boolean
}

export interface CarrierQuote {
  carrier_id: string
  carrier_code: string
  title: string
  logo_url?: string | null
  chargeable_desi: number
  price: number
  pod_fee: number
  total: number
  currency: string
  estimated_days: string
  supports_pod: boolean
  is_cheapest?: boolean
}

export interface CargoQuoteResult {
  chargeable_desi: number
  pay_on_delivery: boolean
  quotes: CarrierQuote[]
}

export interface LabelSettings {
  format: '100x150' | '100x100' | 'A6'
  layout: 'standard' | 'compact'
  show_logo: boolean
  show_barcode: boolean
  show_reference: boolean
  font_size: 'sm' | 'md' | 'lg'
  accent_color: string
}

export interface CreateCargoPayload {
  account_id: string
  carrier_id?: string
  receiver_name: string
  receiver_phone?: string
  receiver_email?: string
  sender?: Record<string, unknown>
  receiver?: Record<string, unknown>
  length_cm?: number
  width_cm?: number
  height_cm?: number
  weight_kg?: number
  desi?: number
  package_count?: number
  content_description?: string
  pay_on_delivery?: boolean
  pod_amount?: number
  is_draft?: boolean
  label_settings?: LabelSettings
}

export interface CreateCargoResult {
  id: string
  tracking_number: string
  status: number
  desi: number
  quoted_price?: number
  cargo_company_id?: string
}
