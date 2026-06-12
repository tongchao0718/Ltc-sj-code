import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { prdAnnotationDevSyncPlugin } from './vite-plugins/prd-annotation-dev-sync.mjs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [vue(), prdAnnotationDevSyncPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'arco-design': ['@arco-design/web-vue'],
          'echarts': ['echarts'],
          'i18n': ['vue-i18n']
        }
      }
    }
  }
})
