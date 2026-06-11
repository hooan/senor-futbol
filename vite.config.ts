import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-i18n': ['i18next', 'react-i18next'],
          'vendor-date': ['date-fns'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api/football': {
        target: 'https://v3.football.api-sports.io',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost')
          const apiPath = url.searchParams.get('path') || ''
          url.searchParams.delete('path')
          return `/${apiPath}${url.search}`
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const apiKey = process.env.VITE_API_FOOTBALL_KEY || ''
            proxyReq.setHeader('x-rapidapi-host', 'v3.football.api-sports.io')
            proxyReq.setHeader('x-rapidapi-key', apiKey)
          })
        },
      },
    },
  },
})
