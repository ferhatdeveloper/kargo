import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getMe, getUserAccounts, login as apiLogin, logout as apiLogout } from '@/api/auth'
import type { User } from '@/types'
import { AUTH_STORAGE_KEYS, AuthContext, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.user)
    return raw ? (JSON.parse(raw) as User) : null
  })
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem(AUTH_STORAGE_KEYS.token),
  )
  const [accounts, setAccounts] = useState<AuthContextValue['accounts']>([])
  const [selectedAccountId, setSelectedAccountIdState] = useState<string | null>(() =>
    localStorage.getItem(AUTH_STORAGE_KEYS.account),
  )
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem(AUTH_STORAGE_KEYS.token))

  const setSelectedAccountId = useCallback((id: string) => {
    setSelectedAccountIdState(id)
    localStorage.setItem(AUTH_STORAGE_KEYS.account, id)
  }, [])

  const loadSession = useCallback(async () => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.token)
    if (!token) {
      setAccessToken(null)
      setIsLoading(false)
      return
    }
    setAccessToken(token)
    try {
      const me = await getMe()
      setUser(me)
      localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(me))
      const accRes = await getUserAccounts(me.id)
      setAccounts(accRes.items)
      const stored = localStorage.getItem(AUTH_STORAGE_KEYS.account)
      const valid = accRes.items.find((a) => a.id === stored)
      if (valid) {
        setSelectedAccountIdState(valid.id)
      } else if (accRes.items[0]) {
        setSelectedAccountId(accRes.items[0].id)
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEYS.token)
      localStorage.removeItem(AUTH_STORAGE_KEYS.user)
      setAccessToken(null)
      setUser(null)
      setAccounts([])
    } finally {
      setIsLoading(false)
    }
  }, [setSelectedAccountId])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await Promise.resolve()
      if (cancelled) return
      await loadSession()
    })()
    return () => {
      cancelled = true
    }
  }, [loadSession])

  const login = useCallback(
    async (email: string, password: string, remember: boolean) => {
      const res = await apiLogin({ email, password, remember })
      localStorage.setItem(AUTH_STORAGE_KEYS.token, res.token)
      localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(res.user))
      if (remember) localStorage.setItem(AUTH_STORAGE_KEYS.remember, '1')
      setAccessToken(res.token)
      setUser(res.user)

      let accountId: string | null = null
      try {
        const accRes = await getUserAccounts(res.user.id)
        setAccounts(accRes.items)
        accountId = accRes.items[0]?.id ?? null
        if (accountId) {
          setSelectedAccountIdState(accountId)
          localStorage.setItem(AUTH_STORAGE_KEYS.account, accountId)
        }
      } catch {
        setAccounts([])
      }
      setIsLoading(false)
      return accountId
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      /* ignore */
    }
    localStorage.removeItem(AUTH_STORAGE_KEYS.token)
    localStorage.removeItem(AUTH_STORAGE_KEYS.user)
    localStorage.removeItem(AUTH_STORAGE_KEYS.account)
    setAccessToken(null)
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
      isAuthenticated: !!user && !!accessToken,
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
      accessToken,
      login,
      logout,
      setSelectedAccountId,
      loadSession,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
