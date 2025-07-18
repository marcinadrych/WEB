import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa" // <<< DODAJEMY TEN IMPORT

export default defineConfig({
  plugins: [
    react(),
    
    // --- POCZĄTEK DODANEJ SEKCJI ---
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Magazyn Adrych',
        short_name: 'ADRYCH',
        description: 'Aplikacja do zarządzania magazynem firmowym.',
        theme_color: '#ffffff', // Ustawiony na biały dla jasnego motywu
        background_color: '#ffffff',
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait",
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
    // --- KONIEC DODANEJ SEKCJI ---
  ],

  // Twoja sekcja 'resolve' pozostaje bez zmian
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})