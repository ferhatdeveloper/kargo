/** Eski `/tr/...` yollarını dil kodu olmadan döndürür */
export function stripLegacyLocalePrefix(pathname: string): string {
  const next = pathname.replace(/^\/tr(?=\/|$)/, '')
  return next || '/'
}
