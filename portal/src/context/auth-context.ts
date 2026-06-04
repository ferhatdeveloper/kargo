import { createContext } from 'react'
import type { Account, User } from '@/types'

export interface AuthContextValue {
  user: User | null
  accounts: Account[]
  selectedAccountId: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, remember: boolean) => Promise<void>
  logout: () => Promise<void>
  setSelectedAccountId: (id: string) => void
  refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const AUTH_STORAGE_KEYS = {
  token: 'access_token',
  user: 'user',
  account: 'selected_account_id',
  remember: 'remember_me',
} as const
