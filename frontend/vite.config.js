// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5173,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5000',
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/api/, '')
//       }
//     }
//   }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
    build: {
    outDir: '../backend/static',
    emptyOutDir: true
  },
  server: {
    // 1. Allow the platform to set the port, or default to 5173
    port: process.env.PORT || 5173,
    // 2. IMPORTANT: Bind to 0.0.0.0 so the platform can access it
    host: '0.0.0.0',
    allowedHosts: ["nomo-frontend.onrender.com"],
    proxy: {
      '/api': {
        // 3. Use an environment variable for the production API URL
        // target: process.env.VITE_API_URL || 'http://localhost:5000',
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})