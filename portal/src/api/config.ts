/** Navlun paneli yalnızca PostgREST (docker compose :3000) üzerinden konuşur. */
export const apiBackend = (
  import.meta.env.VITE_API_BACKEND?.trim() || 'postgrest'
) as 'postgrest' | 'legacy'

export const isPostgrest = apiBackend === 'postgrest'

if (!isPostgrest && import.meta.env.DEV) {
  console.warn(
    '[Navlun] VITE_API_BACKEND=legacy desteklenmiyor; PostgREST kullanın (VITE_API_BACKEND=postgrest).',
  )
}
