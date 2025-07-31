import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/peta',
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://10.15.38.162:9000', // Ganti dengan URL backend Anda
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  }
})
