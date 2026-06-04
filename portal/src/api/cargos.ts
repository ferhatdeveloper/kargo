import { callRpc } from './rpc'
import type { Cargo, Paginated, QueryOptions } from '@/types'

export async function queryCargos(accountId: string, options: QueryOptions) {
  return callRpc<Paginated<Cargo>>('account_cargos_query', {
    p_account_id: accountId,
    p_page: options.page ?? 1,
    p_per_page: options.per_page ?? 25,
  })
}
