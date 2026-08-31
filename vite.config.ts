import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Function form, not the object form. The object form matches only the
         * exact entry module, so `react-dom/client` and `gsap/ScrollTrigger`
         * were never matched — react-dom ended up inside the app chunk, and
         * every one-line app change busted 138 KB of vendor code in every
         * returning visitor's cache.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
          if (id.includes('react-router')) return 'router';
          return 'vendor';
        },
      },
    },
  },
});
