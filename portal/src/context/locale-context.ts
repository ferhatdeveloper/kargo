import { createContext } from 'react'
import type { Locale, MessageKey } from '@/i18n/messages'

export interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey, params?: Record<string, string>) => string
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)
