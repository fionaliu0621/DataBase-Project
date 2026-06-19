import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 判斷這個請求是不是「瀏覽器網址列導航」（直接打網址 / reload），
// 而不是程式碼裡 fetch() 呼叫的 API 請求。
// Sec-Fetch-Mode: navigate 只有在瀏覽器導航時才會出現，
// fetch() 呼叫送出的是 cors 或 same-origin，不會誤判。
function bypassIfNavigation(req) {
  if (req.headers['sec-fetch-mode'] === 'navigate') {
    return '/index.html';
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    proxy: {
      '/products': {
        target: 'https://database-project-production-aefc.up.railway.app',
        changeOrigin: true,
        bypass: bypassIfNavigation,
      },
      '/orders': {
        target: 'https://database-project-production-aefc.up.railway.app',
        changeOrigin: true,
        bypass: bypassIfNavigation,
      },
      '/sellers': {
        target: 'https://database-project-production-aefc.up.railway.app',
        changeOrigin: true,
        bypass: bypassIfNavigation,
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
        bypass: bypassIfNavigation,
      },
      '/revenue': {
        target: 'https://database-project-production-aefc.up.railway.app',
        changeOrigin: true,
      },
      '/cities': {
        target: 'https://database-project-production-aefc.up.railway.app',
        changeOrigin: true,
      },
      '/geolocation': {
        target: 'https://database-project-production-aefc.up.railway.app',
        changeOrigin: true,
      },
    }
  }
})