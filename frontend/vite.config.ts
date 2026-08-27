import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        // Use 127.0.0.1 (not localhost) to avoid IPv6 (::1) vs IPv4 mismatch
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            console.warn(
              `[vite proxy] Backend unreachable at http://127.0.0.1:3000 — is Nest running? (${err.message})`,
            )
            if (res && !res.headersSent && typeof (res as any).writeHead === 'function') {
              ;(res as any).writeHead(502, { 'Content-Type': 'application/json' })
              ;(res as any).end(
                JSON.stringify({
                  statusCode: 502,
                  message: 'Backend API is not running on port 3000',
                }),
              )
            }
          })
        },
      },
    },
  },
})
