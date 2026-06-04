import { api } from './client'
import { isPostgrest } from './config'
import type { Cargo, Paginated, QueryOptions } from '@/types'

export async function queryCargos(accountId: string, options: QueryOptions) {
  if (isPostgrest) {
    const res = await api.post<Paginated<Cargo>>('/rpc/account_cargos_query', {
      p_account_id: accountId,
      p_page: options.page ?? 1,
      p_per_page: options.per_page ?? 25,
    })
    return res.data
  }
  const res = await api.post<Paginated<Cargo>>(
    `/accounts/${accountId}/cargos/query`,
    options,
  )
  return res.data
}
