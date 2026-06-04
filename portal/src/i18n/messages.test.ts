import { describe, expect, it } from 'vitest'
import { messages, type MessageKey } from './messages'

describe('i18n messages', () => {
  const trKeys = Object.keys(messages.tr) as MessageKey[]
  const enKeys = Object.keys(messages.en) as MessageKey[]

  it('tr and en have the same keys', () => {
    expect(enKeys.sort()).toEqual(trKeys.sort())
  })

  it('auth.login is translated', () => {
    expect(messages.tr['auth.login']).toBe('Giriş yap')
    expect(messages.en['auth.login']).toBe('Sign in')
  })
})
