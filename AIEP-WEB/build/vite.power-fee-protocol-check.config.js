import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const copyHtmlPlugin = () => ({
  name: 'copy-html',
  closeBundle() {
    const appName = 'power-fee-protocol-check'
    const distPath = resolve(__dirname, `../dist/${appName}`)
    const buildPath = resolve(distPath, 'build')
    const writePair = (html) => {
      html = html.replace(/\.\.\/assets\//g, './assets/')
      fs.writeFileSync(resolve(distPath, `${appName}.html`), html)
      fs.writeFileSync(resolve(distPath, 'index.html'), html)
    }

    if (fs.existsSync(buildPath)) {
      const srcHtml = resolve(buildPath, `${appName}.html`)
      if (fs.existsSync(srcHtml)) {
        writePair(fs.readFileSync(srcHtml, 'utf8'))
        fs.rmSync(buildPath, { recursive: true, force: true })
      }
    } else {
      const direct = resolve(distPath, `${appName}.html`)
      if (fs.existsSync(direct)) {
        writePair(fs.readFileSync(direct, 'utf8'))
      }
    }

    const startSrc = resolve(__dirname, 'start.html')
    if (fs.existsSync(startSrc)) {
      let startContent = fs.readFileSync(startSrc, 'utf8')
      const assetsDir = resolve(distPath, 'assets')
      if (fs.existsSync(assetsDir)) {
        const jsFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js'))
        if (jsFiles.length > 0) {
          startContent = startContent.replace(/\.\/assets\/main\.js/g, `./assets/${jsFiles[0]}`)
        }
      }
      fs.writeFileSync(resolve(distPath, 'start.html'), startContent)
    }
  }
})

export default defineConfig({
  plugins: [vue(), copyHtmlPlugin()],
  base: './',
  root: resolve(__dirname, '..'),
  build: {
    outDir: resolve(__dirname, '../dist/power-fee-protocol-check'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'power-fee-protocol-check.html')
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
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  server: {
    port: 5175,
    open: '/build/power-fee-protocol-check.html'
  }
})
