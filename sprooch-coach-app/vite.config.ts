import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// PWA d'abord (PRD §8) : tout le contenu est précaché pour fonctionner hors ligne.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Sprooch Coach',
        short_name: 'Sprooch Coach',
        description: "Préparer l'oral du Sproochentest : on répond à voix haute, jamais par écrit.",
        lang: 'fr',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#F3F7FA',
        theme_color: '#0082B8',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2,json,jpg,png,webp}'],
      },
    }),
  ],
})
