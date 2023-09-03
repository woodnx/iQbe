import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
		proxy: {
			"^/api/.*": "http://localhost:4000",
		},
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
      manifest: {
        theme_color: "#339AF0",
        background_color: "#ffffff",
        scope: "/",
        start_url: "/",
        name: "iQbe",
        short_name: "iqbe",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-256x256.png",
            sizes: "256x256",
            type: "image/png"
          },
          {
            src: "/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: 'any maskable',
          }
        ]
      }
    }),
  ],
})
