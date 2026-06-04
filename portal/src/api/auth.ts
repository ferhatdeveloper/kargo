import { api } from './client'
import { isPostgrest } from './config'
import type { LoginResponse, Paginated, Account, User } from '@/types'

export async function login(data: {
  email: string
  password: string
  remember: boolean
}) {
  if (isPostgrest) {
    const res = await api.post<LoginResponse>('/rpc/auth_login', {
      p_email: data.email,
      p_password: data.password,
      p_remember: data.remember,
    })
    return res.data
  }
  const res = await api.post<LoginResponse>('/auth/login', data)
  return res.data
}

export async function logout() {
  if (isPostgrest) {
    await api.post('/rpc/auth_logout', {})
    return
  }
  await api.post('/auth/logout')
}

export async function getMe() {
  if (isPostgrest) {
    const res = await api.post<User>('/rpc/auth_me', {})
    return res.data
  }
  const res = await api.get<User>('/auth/me')
  return res.data
}

export async function forgotPassword(email: string) {
  if (isPostgrest) {
    await api.post('/rpc/auth_forgot_password', { p_email: email })
    return
  }
  await api.post('/auth/forgot-password', { email })
}

export async function getUserAccounts(userId: string) {
  if (isPostgrest) {
    const res = await api.post<Paginated<Account>>('/rpc/user_accounts_query', {
      p_user_id: userId,
      p_page: 1,
      p_per_page: 50,
    })
    return res.data
  }
  const res = await api.post<Paginated<Account>>(
    `/users/${userId}/accounts/query`,
    { page: 1, per_page: 50 },
  )
  return res.data
}

export async function getAccount(accountId: string) {
  if (isPostgrest) {
    const res = await api.get<Account[]>('/accounts', {
      params: { id: `eq.${accountId}`, limit: 1 },
    })
    const row = res.data[0]
    if (!row) throw new Error('Hesap bulunamadı')
    return row
  }
  const res = await api.get<Account>(`/accounts/${accountId}`)
  return res.data
}
