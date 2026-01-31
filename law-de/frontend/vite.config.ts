import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Dedicated port for the courtroom simulation frontend
    port: 5174,
    strictPort: true
  }
})
