import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getMe, getUserAccounts, login as apiLogin, logout as apiLogout } from '@/api/auth'
import type { Account, User } from '@/types'

interface AuthContextValue {
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

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEYS = {
  token: 'access_token',
  user: 'user',
  account: 'selected_account_id',
  remember: 'remember_me',
} as const

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.user)
    return raw ? (JSON.parse(raw) as User) : null
  })
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccountId, setSelectedAccountIdState] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEYS.account),
  )
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem(STORAGE_KEYS.token))

  const setSelectedAccountId = useCallback((id: string) => {
    setSelectedAccountIdState(id)
    localStorage.setItem(STORAGE_KEYS.account, id)
  }, [])

  const loadSession = useCallback(async () => {
    const token = localStorage.getItem(STORAGE_KEYS.token)
    if (!token) {
      setIsLoading(false)
      return
    }
    try {
      const me = await getMe()
      setUser(me)
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(me))
      const accRes = await getUserAccounts(me.id)
      setAccounts(accRes.items)
      const stored = localStorage.getItem(STORAGE_KEYS.account)
      const valid = accRes.items.find((a) => a.id === stored)
      if (valid) {
        setSelectedAccountIdState(valid.id)
      } else if (accRes.items[0]) {
        setSelectedAccountId(accRes.items[0].id)
      }
    } catch {
      localStorage.removeItem(STORAGE_KEYS.token)
      localStorage.removeItem(STORAGE_KEYS.user)
      setUser(null)
      setAccounts([])
    } finally {
      setIsLoading(false)
    }
  }, [setSelectedAccountId])

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  const login = useCallback(
    async (email: string, password: string, remember: boolean) => {
      const res = await apiLogin({ email, password, remember })
      localStorage.setItem(STORAGE_KEYS.token, res.token)
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(res.user))
      if (remember) localStorage.setItem(STORAGE_KEYS.remember, '1')
      setUser(res.user)
      const accRes = await getUserAccounts(res.user.id)
      setAccounts(accRes.items)
      if (accRes.items[0]) setSelectedAccountId(accRes.items[0].id)
    },
    [setSelectedAccountId],
  )

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      /* ignore */
    }
    localStorage.removeItem(STORAGE_KEYS.token)
    localStorage.removeItem(STORAGE_KEYS.user)
    localStorage.removeItem(STORAGE_KEYS.account)
    setUser(null)
    setAccounts([])
    setSelectedAccountIdState(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accounts,
      selectedAccountId,
      isLoading,
      isAuthenticated: !!user && !!localStorage.getItem(STORAGE_KEYS.token),
      login,
      logout,
      setSelectedAccountId,
      refresh: loadSession,
    }),
    [
      user,
      accounts,
      selectedAccountId,
      isLoading,
      login,
      logout,
      setSelectedAccountId,
      loadSession,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
