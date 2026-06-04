/** Yerel PostgREST (docker compose) veya harici REST API */
export const apiBackend = (
  import.meta.env.VITE_API_BACKEND?.trim() ||
  (import.meta.env.DEV ? 'postgrest' : 'legacy')
) as 'postgrest' | 'legacy'

export const isPostgrest = apiBackend === 'postgrest'
