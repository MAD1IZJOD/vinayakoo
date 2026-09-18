import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // three.js lives in its own lazily loaded chunk (~240 kB gzipped) that is only fetched as the
    // visitor approaches the room, so it is allowed to be larger than the default 500 kB warning.
    chunkSizeWarningLimit: 1000,
  },
})
