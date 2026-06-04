import { api } from './client'
import { callRpc } from './rpc'
import { mapAccountRow } from './mapAccount'
import type { LoginResponse, Paginated, Account, User } from '@/types'

export async function login(data: {
  email: string
  password: string
  remember: boolean
}) {
  return callRpc<LoginResponse>('auth_login', {
    p_email: data.email,
    p_password: data.password,
    p_remember: data.remember,
  })
}

export async function logout() {
  await callRpc<void>('auth_logout', {})
}

export async function getMe() {
  return callRpc<User>('auth_me', {})
}

export async function forgotPassword(email: string) {
  await callRpc<void>('auth_forgot_password', { p_email: email })
}

export async function getUserAccounts(userId: string) {
  return callRpc<Paginated<Account>>('user_accounts_query', {
    p_user_id: userId,
    p_page: 1,
    p_per_page: 50,
  })
}

export async function getAccount(accountId: string) {
  const res = await api.get<Account[]>('/accounts', {
    params: { id: `eq.${accountId}`, limit: 1 },
  })
  const row = res.data[0]
  if (!row) throw new Error('Hesap bulunamadı')
  return mapAccountRow(row as unknown as Record<string, unknown>)
}
