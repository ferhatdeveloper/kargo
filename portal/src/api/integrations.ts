import { callRpc } from './rpc'

export interface IntegrationRow {
  provider_code: string
  title: string
  status: string
  last_sync_at?: string
}

export async function fetchIntegrations(accountId: string) {
  return callRpc<IntegrationRow[]>('account_integrations_query', {
    p_account_id: accountId,
  })
}
