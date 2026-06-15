import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/products': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/orders': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/sellers': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/payments': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/reviews': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/customers': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    }
  }
})