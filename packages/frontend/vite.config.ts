import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@/": `${import.meta.dirname}/src/`,
    },
  },
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:9000/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    VitePWA({
      includeAssets: [
        "offline.html",
        "favicon.ico",
        "iqbe-icon.png",
        "iqbe.png",
      ],
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
