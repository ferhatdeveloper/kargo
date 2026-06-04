export function computeChargeableDesi(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  weightKg: number,
): number {
  const volumetric =
    lengthCm > 0 && widthCm > 0 && heightCm > 0
      ? Math.round(((lengthCm * widthCm * heightCm) / 3000) * 100) / 100
      : 0
  return Math.max(weightKg || 0, volumetric)
}

export function formatTry(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount)
}
