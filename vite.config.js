import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/gregobase': {
        target: 'https://gregobase.selapa.net',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/gregobase/, ''),
      },
    },
  },
})
