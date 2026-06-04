import { Navigate, useLocation } from 'react-router-dom'

/** Eski /tr/... bookmark'ları dil kodu olmadan yönlendir */
export function LegacyLocaleRedirect() {
  const { pathname, search, hash } = useLocation()
  const next = pathname.replace(/^\/tr(?=\/|$)/, '') || '/'
  return <Navigate to={`${next}${search}${hash}`} replace />
}
