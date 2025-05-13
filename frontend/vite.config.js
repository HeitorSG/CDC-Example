import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',           // Allows all external hosts
    port: 5173,                // Default port
    strictPort: false,         // Allow fallback to another port if 5173 is occupied
    hmr: {
      clientPort: 443          // Use the appropriate port for Cloudflare tunnel
    },
    allowedHosts: [
      'necessarily-book-store-magnitude.trycloudflare.com',  // Explicitly allow Cloudflare tunnel
      'all'  // Allow all hosts for general access
    ],
  }
})
