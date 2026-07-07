import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.VITE_API_BACKEND?.trim() || 'postgrest'
  const postgrestTarget = env.VITE_POSTGREST_URL?.trim() || 'http://127.0.0.1:3100'

  if (backend !== 'postgrest') {
    console.warn(
      `[vite] VITE_API_BACKEND=${backend} — Kargom Kapında yalnızca PostgREST destekler; proxy PostgREST'e yönlendiriliyor.`,
    )
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: postgrestTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
      },
    },
  }
})
