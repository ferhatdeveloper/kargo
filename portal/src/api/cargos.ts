import { api } from './client'
import type { Cargo, Paginated, QueryOptions } from '@/types'

export async function queryCargos(accountId: string, options: QueryOptions) {
  const res = await api.post<Paginated<Cargo>>(
    `/accounts/${accountId}/cargos/query`,
    options,
  )
  return res.data
}
