import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/tr'
import 'dayjs/locale/en'
import {
  defaultLocale,
  localeStorageKey,
  messages,
  type Locale,
  type MessageKey,
} from '@/i18n/messages'
import { LocaleContext, type LocaleContextValue } from './locale-context'

function readStoredLocale(): Locale {
  const raw = localStorage.getItem(localeStorageKey)
  if (raw === 'tr' || raw === 'en') return raw
  const browser = navigator.language.toLowerCase()
  if (browser.startsWith('en')) return 'en'
  return defaultLocale
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    localStorage.setItem(localeStorageKey, next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    dayjs.locale(locale)
  }, [locale])

  const t = useCallback(
    (key: MessageKey, params?: Record<string, string>) => {
      let text: string = messages[locale][key] ?? messages.tr[key] ?? key
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(`{${k}}`, v)
        }
      }
      return text
    },
    [locale],
  )

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
