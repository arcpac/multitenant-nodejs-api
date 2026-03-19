import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/auth": { target: "http://127.0.0.1:4001", changeOrigin: true },
      "/api": {
        target: "http://127.0.0.1:4001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/ai": { target: "http://127.0.0.1:4002", changeOrigin: true },
      "/tasks": { target: "http://127.0.0.1:4002", changeOrigin: true },
      "/graphql": { target: "http://127.0.0.1:4002", changeOrigin: true },
    },
  },
});
