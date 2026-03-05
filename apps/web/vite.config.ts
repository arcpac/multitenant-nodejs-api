import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": { target: "http://localhost:4001", changeOrigin: true },
      "/me": { target: "http://localhost:4001", changeOrigin: true },
      "/tasks": { target: "http://localhost:4002", changeOrigin: true },
      "/graphql": { target: "http://localhost:4002", changeOrigin: true },
    }
  }
})
