import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const usePostgrest = env.VITE_API_BACKEND === 'postgrest'
  const postgrestTarget = env.VITE_POSTGREST_URL?.trim() || 'http://127.0.0.1:3000'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: usePostgrest
        ? {
            '/api': {
              target: postgrestTarget,
              changeOrigin: true,
              rewrite: (p) => p.replace(/^\/api/, ''),
            },
          }
        : {
            '/api': {
              target: 'https://api.kargopaneli.com',
              changeOrigin: true,
              rewrite: (p) => p.replace(/^\/api/, '/v1'),
            },
          },
    },
  }
})
