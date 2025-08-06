import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/gis-fe',
  plugins: [vue()],
  server: {
    port: 9100,
    https: false,
    hmr: {
      port: 1500,
      host: 'localhost',
      protocol: 'wss'
    },
    proxy: {
      '/api/peta': {
        target: 'http://10.15.38.162:9000/api', // Ganti dengan URL backend Anda
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/admin': {
        target: 'http://localhost:9000', // GIS backend
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending request to:', proxyReq.path);
          });
        }
      },
      '/auth': {
        target: 'http://localhost:9000', // GIS backend
        changeOrigin: true,
        secure: false
      }
    }
  }
})
