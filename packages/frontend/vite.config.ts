import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import myManifest from './manifest.json';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
		proxy: {
      '/api': {
        target: 'http://localhost:9000/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    }
	},
  plugins: [
    react(),
    VitePWA({
      includeAssets: [
        'offline.html',
        'favicon.ico',
        'iqbe-icon.png',
      ],
      devOptions: {
        enabled: true,
      },
      manifest: myManifest,
    }),
  ],
})
