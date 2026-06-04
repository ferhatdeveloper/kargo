import { api } from './client'
import type { LoginResponse, Paginated, Account, User } from '@/types'

export async function login(data: {
  email: string
  password: string
  remember: boolean
}) {
  const res = await api.post<LoginResponse>('/auth/login', data)
  return res.data
}

export async function logout() {
  await api.post('/auth/logout')
}

export async function getMe() {
  const res = await api.get<User>('/auth/me')
  return res.data
}

export async function forgotPassword(email: string) {
  await api.post('/auth/forgot-password', { email })
}

export async function getUserAccounts(userId: string) {
  const res = await api.post<Paginated<Account>>(
    `/users/${userId}/accounts/query`,
    { page: 1, per_page: 50 },
  )
  return res.data
}

export async function getAccount(accountId: string) {
  const res = await api.get<Account>(`/accounts/${accountId}`)
  return res.data
}
