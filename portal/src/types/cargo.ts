export interface CargoCompanyInfo {
  title: string
  code?: string
  logo_url?: string | null
}

export interface CargoListItem {
  id: string
  tracking_number?: string
  receiver_name?: string
  receiver_phone?: string
  receiver_city?: string
  receiver_district?: string
  sender_name?: string
  sender_company?: string
  status?: number
  status_key?: string
  pay_on_delivery?: boolean
  pod_amount?: number
  payment_status?: string
  payment_type?: string
  pod_settlement_estimate?: string
  created_at?: string
  desi?: number
  carrier_barcode?: string
  reference_barcode?: string
  last_movement?: string
  last_movement_description?: string
  order_number?: string
  label_printed?: boolean
  cargo_company?: CargoCompanyInfo
}

export type CargoListTab = 'all' | 'pod' | 'draft'

export interface CargoFilters {
  pay_on_delivery?: boolean
  payment_status?: string
  label_printed?: boolean
  last_movements?: string[]
  created_from?: string
  created_to?: string
  desi_min?: number
  desi_max?: number
}
