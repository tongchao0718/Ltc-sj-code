import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const copyHtmlPlugin = () => ({
  name: 'copy-html-marketing-demo',
  closeBundle() {
    const distPath = resolve(__dirname, '../dist/marketing-demo')
    const buildPath = resolve(distPath, 'build')
    const writePair = (html) => {
      html = html.replace(/\.\.\/assets\//g, './assets/')
      fs.writeFileSync(resolve(distPath, 'marketing-demo.html'), html)
      fs.writeFileSync(resolve(distPath, 'index.html'), html)
    }

    if (fs.existsSync(buildPath)) {
      const srcHtml = resolve(buildPath, 'marketing-demo.html')
      if (fs.existsSync(srcHtml)) {
        writePair(fs.readFileSync(srcHtml, 'utf8'))
        fs.rmSync(buildPath, { recursive: true, force: true })
      }
    } else {
      const direct = resolve(distPath, 'marketing-demo.html')
      if (fs.existsSync(direct)) {
        writePair(fs.readFileSync(direct, 'utf8'))
      }
    }
  }
})

export default defineConfig({
  plugins: [vue(), copyHtmlPlugin()],
  base: './',
  root: resolve(__dirname, '..'),
  build: {
    outDir: resolve(__dirname, '../dist/marketing-demo'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'marketing-demo.html')
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
    port: 5177,
    open: '/build/marketing-demo.html'
  }
})
