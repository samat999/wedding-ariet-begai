import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true, // или host: '0.0.0.0'
    port: 5173
  }
})
