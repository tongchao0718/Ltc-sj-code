import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createSubAppCopyHtmlPlugin } from './sub-app-copy-html-plugin.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue(), createSubAppCopyHtmlPlugin('ai-smart-crm-admin')],
  base: './',
  root: resolve(__dirname, '..'),
  build: {
    outDir: resolve(__dirname, '../dist/ai-smart-crm-admin'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'ai-smart-crm-admin.html')
      },
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src')
    }
  },
  server: {
    port: 5176,
    open: '/build/ai-smart-crm-admin.html'
  }
})
