import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    proxy: {
      '/products': {
        target: 'https://database-project-production-aefc.up.railway.app',
        changeOrigin: true,
      },
      '/orders': {
        target: 'https://database-project-production-aefc.up.railway.app',
        changeOrigin: true,
      },
      '/sellers': {
        target: 'https://database-project-production-aefc.up.railway.app',
        changeOrigin: true,
      },
      '/payments': {
        target: 'https://database-project-production-aefc.up.railway.app',
        changeOrigin: true,
      },
      '/reviews': {
        target: 'https://database-project-production-aefc.up.railway.app',
        changeOrigin: true,
      },
      '/customers': {
        target: 'https://database-project-production-aefc.up.railway.app',
        changeOrigin: true,
      },
    }
  }
})
