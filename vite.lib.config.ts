import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDirectory = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  define: {
    __YUM_FONT_PATH__: JSON.stringify('./fonts/'),
    __YUM_BRAND_PATH__: JSON.stringify('./brand/'),
  },
  build: {
    outDir: 'dist/component',
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: resolve(projectDirectory, 'src/yum-account-orders.ts'),
      name: 'YumAccountOrders',
      formats: ['es'],
      fileName: () => 'yum-account-orders.js',
    },
    rollupOptions: {
      output: {
        assetFileNames: 'yum-account-orders.[ext]',
      },
    },
  },
})
