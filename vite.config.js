import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Strip debug logging from production bundles (console.error/warn are kept)
  esbuild: mode === 'production' ? { pure: ['console.log', 'console.debug'] } : {},
}))
