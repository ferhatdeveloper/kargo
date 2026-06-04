import { describe, expect, it } from 'vitest'
import { stripLegacyLocalePrefix } from './localeRedirect'

describe('stripLegacyLocalePrefix', () => {
  it('removes /tr prefix from auth paths', () => {
    expect(stripLegacyLocalePrefix('/tr/auth/login')).toBe('/auth/login')
  })

  it('removes /tr only', () => {
    expect(stripLegacyLocalePrefix('/tr')).toBe('/')
  })

  it('leaves modern paths unchanged', () => {
    expect(stripLegacyLocalePrefix('/accounts/x/dashboard')).toBe('/accounts/x/dashboard')
  })
})
