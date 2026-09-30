import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: '/',
  // Dev-only: the inspector tags every JSX element with data attributes, which
  // only bloats the production bundle.
  plugins: [...(command === 'serve' ? [inspectAttr()] : []), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Read by scripts/prerender.mjs to preload each route's full chunk tree.
    manifest: true,
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
          // One shared chunk instead of a tiny file per icon (each would be its own round trip).
          if (/[\\/]node_modules[\\/]lucide-react[\\/]/.test(id)) return 'icons';
          // Only libraries the storefront shell needs on first load live in the
          // shared vendor chunk. Everything else (zod, dnd-kit, qrcode, the long
          // tail of lucide icons, ...) is left to Rollup so it ships inside the
          // lazy route that actually uses it. Forcing all of node_modules into
          // one chunk made every visitor download the admin tooling.
          if (/[\\/]node_modules[\\/](react-helmet-async|react-fast-compare|invariant|shallowequal|sonner|@vercel[\\/]analytics|@vercel[\\/]speed-insights|clsx|tailwind-merge)[\\/]/.test(id)) return 'vendor';
        },
      },
    },
  },
}));
