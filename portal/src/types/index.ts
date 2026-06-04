export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  avatar: string | null
  type: number
  status: number
}

export interface LoginResponse {
  token: string
  user: User
  twoFactorAuthType?: number
  retryAfter?: number
}

export interface Account {
  id: string
  name: string
  logo: string | null
  eft_code: string
  account_code: string
  status: number
  can_domestic: boolean
  can_abroad: boolean
  can_invoice: boolean
  can_pod: boolean
  has_sub_accounts: boolean
}

export interface Paginated<T> {
  items: T[]
  total: number
}

export interface Cargo {
  id: string
  tracking_number?: string
  receiver_name?: string
  status?: number
  cargo_company?: { title: string }
  created_at?: string
  pay_on_delivery?: boolean
}

export interface QueryOptions {
  page?: number
  per_page?: number
  fields?: Array<{ name: string; aggregate?: string; group?: boolean; filters?: unknown[] }>
  filters?: unknown[]
  sort?: unknown[]
}
