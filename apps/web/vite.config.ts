import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/auth": { target: "http://localhost:4001", changeOrigin: true },
      "/api": {
        target: "http://localhost:4001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/tasks": { target: "http://localhost:4002", changeOrigin: true },
      "/graphql": { target: "http://localhost:4002", changeOrigin: true },
    },
  },
});
