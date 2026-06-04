import { callRpc } from './rpc'
import type { Paginated } from '@/types'

export interface ProductRow {
  id: string
  sku: string
  title: string
  unit_price?: number
  width_cm?: number
  height_cm?: number
  length_cm?: number
  desi?: number
  is_active: boolean
  created_at?: string
}

export async function queryProducts(
  accountId: string,
  page = 1,
  perPage = 25,
  search?: string,
) {
  return callRpc<Paginated<ProductRow>>('account_products_query', {
    p_account_id: accountId,
    p_page: page,
    p_per_page: perPage,
    p_search: search ?? null,
  })
}
