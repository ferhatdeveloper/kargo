import { callRpc } from './rpc'
import type { Paginated } from '@/types'
import type { CargoFilters, CargoListItem, CargoListTab } from '@/types/cargo'

export async function queryCargos(
  accountId: string,
  options: {
    page?: number
    per_page?: number
    tab?: CargoListTab
    search?: string
    filters?: CargoFilters
  },
) {
  return callRpc<Paginated<CargoListItem>>('account_cargos_query', {
    p_account_id: accountId,
    p_page: options.page ?? 1,
    p_per_page: options.per_page ?? 10,
    p_tab: options.tab ?? 'all',
    p_search: options.search ?? null,
    p_filters: options.filters ?? {},
  })
}
