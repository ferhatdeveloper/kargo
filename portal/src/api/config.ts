/** Kargom Kapında paneli yalnızca PostgREST üzerinden konuşur (yerel dev: :3100). */
export const apiBackend = (
  import.meta.env.VITE_API_BACKEND?.trim() || 'postgrest'
) as 'postgrest' | 'legacy'

export const isPostgrest = apiBackend === 'postgrest'

if (!isPostgrest && import.meta.env.DEV) {
  console.warn(
    '[Kargom Kapında] VITE_API_BACKEND=legacy desteklenmiyor; PostgREST kullanın (VITE_API_BACKEND=postgrest).',
  )
}
