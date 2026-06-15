import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    proxy: {
      '/products': {
        target: 'http://database-project-production-aefc.up.railway.app',
        changeOrigin: true,
      },
      '/orders': {
        target: 'http://database-project-production-aefc.up.railway.app',
        changeOrigin: true,
      },
      '/sellers': {
        target: 'http://database-project-production-aefc.up.railway.app',
        changeOrigin: true,
      },
      '/payments': {
        target: 'http://database-project-production-aefc.up.railway.app',
        changeOrigin: true,
      },
      '/reviews': {
        target: 'http://database-project-production-aefc.up.railway.app',
        changeOrigin: true,
      },
      '/customers': {
        target: 'http://database-project-production-aefc.up.railway.app',
        changeOrigin: true,
      },
    }
  }
})
