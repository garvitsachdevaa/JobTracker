import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (
            id.includes('react-router-dom') ||
            id.includes('react-dom') ||
            id.includes('node_modules/react/') ||
            id.includes('node_modules\\react\\')
          ) {
            return 'react-core'
          }

          if (id.includes('recharts')) {
            return 'charts'
          }

          if (id.includes('framer-motion')) {
            return 'motion'
          }

          if (id.includes('react-hook-form') || id.includes('yup') || id.includes('@hookform')) {
            return 'forms'
          }

          if (id.includes('date-fns')) {
            return 'date-utils'
          }

          if (id.includes('axios')) {
            return 'network'
          }

          if (id.includes('react-toastify') || id.includes('react-icons')) {
            return 'ui-kit'
          }

          return 'vendor'
        },
      },
    },
  },
})