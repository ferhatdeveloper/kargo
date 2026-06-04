import { callRpc } from './rpc'

export interface DashboardMetrics {
  pending: number
  in_transit: number
  delivered: number
  problem: number
  returned: number
  total: number
  pod_open: number
  daily: { date: string; total: number; delivered: number }[]
  by_carrier: { title: string; count: number }[]
}

export async function fetchDashboardMetrics(accountId: string, days = 7) {
  return callRpc<DashboardMetrics>('account_dashboard_metrics', {
    p_account_id: accountId,
    p_days: days,
  })
}
