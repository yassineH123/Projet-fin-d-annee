import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // On fournit notre propre service worker (public/sw.js) qui gère le cache
      // ET les notifications push. injectionPoint: undefined => VitePWA ne génère
      // pas de SW Workbox et n'écrase plus notre sw.js.
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      injectManifest: { injectionPoint: undefined },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'og-image.png'],
      manifest: {
        name: 'AtlasWay — Covoiturage Maroc',
        short_name: 'AtlasWay',
        description: 'Covoiturage au Maroc — trouvez ou proposez un trajet entre les villes marocaines.',
        theme_color: '#C1272D',
        background_color: '#080503',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  // Pré-bundle toutes les deps dès le démarrage (y compris celles des routes lazy)
  // pour éviter une ré-optimisation en cours de session, qui ferait cohabiter
  // deux instances de React (erreur "Cannot read properties of null (useContext)").
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom', 'axios',
      'react-helmet-async', 'react-hot-toast', 'lucide-react',
      'recharts', 'leaflet', 'react-leaflet', 'socket.io-client', 'qrcode.react',
    ],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true, rewrite: (path) => path.replace(/^\/api/, '') },
      '/uploads': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts':   ['recharts'],
          'vendor-maps':     ['leaflet', 'react-leaflet'],
          'vendor-socket':   ['socket.io-client'],
          'vendor-ui':       ['lucide-react', 'react-hot-toast', 'qrcode.react'],
        },
      },
    },
  },
});
