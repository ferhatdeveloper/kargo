import { callRpc } from './rpc'

export interface FinanceSummary {
  balance: number
  pod_receivable: number
  currency: string
}

export async function fetchFinanceSummary(accountId: string) {
  return callRpc<FinanceSummary>('account_finance_summary', {
    p_account_id: accountId,
  })
}
