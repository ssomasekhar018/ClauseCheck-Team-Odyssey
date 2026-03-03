import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Dedicated port so it can run alongside other apps
    port: 5175,
    strictPort: true,
    proxy: {
      '/api': {
        // Backend for this project will run on 8100
        target: 'http://127.0.0.1:8100',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // Keep the /api prefix
      },
    },
  },
})
