import type { CargoQuoteResult } from '@/types/shipping'
import { computeChargeableDesi } from './shipping'

const baseRates: Record<string, { base: number; perDesi: number; pod: number; days: string }> = {
  yurtici: { base: 137, perDesi: 8, pod: 12, days: '1-2' },
  aras: { base: 142, perDesi: 9, pod: 14, days: '1-3' },
  mng: { base: 135, perDesi: 7.5, pod: 11, days: '2-3' },
  ptt: { base: 128, perDesi: 7, pod: 0, days: '2-4' },
  hepsijet: { base: 132, perDesi: 7.8, pod: 10, days: '1-2' },
  surat: { base: 140, perDesi: 8.2, pod: 13, days: '1-2' },
  kolaygelsin: { base: 132, perDesi: 7.6, pod: 0, days: '1-3' },
}

export function mockCargoQuote(
  desi: number,
  payOnDelivery: boolean,
): CargoQuoteResult {
  const chargeable = Math.max(1, Math.ceil(desi || 1))
  const rows = Object.entries(baseRates).map(([code, rate]) => {
    const price = Math.round((rate.base + (chargeable - 1) * rate.perDesi) * 100) / 100
    const podFee = payOnDelivery ? rate.pod : 0
    const total = Math.round((price + podFee) * 100) / 100
    return {
      carrier_id: `mock-${code}`,
      carrier_code: code,
      title: code === 'hepsijet' ? 'hepsiJET' : code.charAt(0).toUpperCase() + code.slice(1),
      chargeable_desi: desi,
      price,
      pod_fee: podFee,
      total,
      currency: 'TRY',
      estimated_days: rate.days,
      supports_pod: rate.pod > 0,
      is_cheapest: false,
    }
  })

  rows.sort((a, b) => a.total - b.total)
  if (rows[0]) rows[0].is_cheapest = true

  return {
    chargeable_desi: desi,
    pay_on_delivery: payOnDelivery,
    quotes: rows,
  }
}

export function mockCargoQuoteFromDimensions(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  weightKg: number,
  payOnDelivery: boolean,
): CargoQuoteResult {
  const desi = computeChargeableDesi(lengthCm, widthCm, heightCm, weightKg)
  return mockCargoQuote(desi, payOnDelivery)
}
