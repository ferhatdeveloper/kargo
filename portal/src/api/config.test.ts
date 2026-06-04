import { describe, expect, it } from 'vitest'
import { apiBackend, isPostgrest } from './config'

describe('api config', () => {
  it('defaults to PostgREST backend', () => {
    expect(apiBackend).toBe('postgrest')
    expect(isPostgrest).toBe(true)
  })
})
