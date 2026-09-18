import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // three.js lives in its own lazily loaded chunk (~240 kB gzipped), fetched after first paint for
    // the hero wall and shared with the room, so it is allowed past the default 500 kB warning.
    chunkSizeWarningLimit: 1000,
  },
})
