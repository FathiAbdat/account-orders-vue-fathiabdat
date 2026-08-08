import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  define: {
    __YUM_FONT_PATH__: JSON.stringify('../fonts/'),
    __YUM_BRAND_PATH__: JSON.stringify('../brand/'),
  },
  server: {
    host: '127.0.0.1',
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith('.css')
            ? 'assets/yum-account-orders.css'
            : 'assets/[name]-[hash][extname]',
      },
    },
  },
})
