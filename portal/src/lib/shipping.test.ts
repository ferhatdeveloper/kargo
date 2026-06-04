import { describe, expect, it } from 'vitest'
import { computeChargeableDesi } from './shipping'

describe('computeChargeableDesi', () => {
  it('uses weight when higher than volumetric desi', () => {
    expect(computeChargeableDesi(10, 10, 10, 5)).toBe(5)
  })

  it('uses volumetric desi from dimensions', () => {
    expect(computeChargeableDesi(30, 30, 30, 1)).toBe(9)
  })

  it('returns zero when all inputs empty', () => {
    expect(computeChargeableDesi(0, 0, 0, 0)).toBe(0)
  })
})
