import type { Account } from '@/types'

/** PostgREST ham satır → portal Account tipi */
export function mapAccountRow(row: Record<string, unknown>): Account {
  return {
    id: String(row.id),
    name: String(row.name),
    logo: (row.logo_url ?? row.logo ?? null) as string | null,
    eft_code: String(row.eft_code ?? ''),
    account_code: String(row.account_code),
    status: Number(row.status),
    can_domestic: Boolean(row.can_domestic),
    can_abroad: Boolean(row.can_abroad),
    can_invoice: Boolean(row.can_invoice),
    can_pod: Boolean(row.can_pod),
    has_sub_accounts: Boolean(row.has_sub_accounts),
  }
}
