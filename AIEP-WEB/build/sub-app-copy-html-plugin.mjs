import { resolve, dirname } from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const ROOT_LAYOUT_STYLE =
  '<style data-sub-app-root-style>html,body,#app{height:100%;margin:0;}</style>'

/** 整理 Vite 产物 HTML，便于 file:// 与静态服务器打开（IIFE 不用 type=module） */
function normalizeBuiltHtml(html) {
  let out = html.replace(/\.\.\/assets\//g, './assets/')
  out = out.replace(/\.\.\/app-icon\.png/g, './vite.svg')

  const scriptMatch = out.match(/<script[^>]*src="(\.\/assets\/[^"]+\.js)"[^>]*><\/script>/i)
  if (scriptMatch) {
    const src = scriptMatch[1]
    out = out.replace(/<script[^>]*src="\.\/assets\/[^"]+\.js"[^>]*><\/script>\s*/i, '')
    if (!out.includes(`src="${src}"`)) {
      out = out.replace(/<\/body>/i, `    <script src="${src}"></script>\n  </body>`)
    }
  }

  if (!out.includes('data-sub-app-root-style')) {
    out = out.replace(/<head>/i, `<head>\n  ${ROOT_LAYOUT_STYLE}`)
  }
  return out
}

/**
 * 子应用构建后整理 HTML：{app}.html、index.html、start.html（与《子应用打包指南》一致）
 * @param {string} appSlug 子应用目录名，如 sample-app、marketing-demo
 */
export function createSubAppCopyHtmlPlugin(appSlug) {
  return {
    name: `copy-html-${appSlug}`,
    closeBundle() {
      const distPath = resolve(__dirname, `../dist/${appSlug}`)
      const buildPath = resolve(distPath, 'build')
      const writePair = (html) => {
        const normalized = normalizeBuiltHtml(html)
        fs.writeFileSync(resolve(distPath, `${appSlug}.html`), normalized)
        fs.writeFileSync(resolve(distPath, 'index.html'), normalized)
      }

      if (fs.existsSync(buildPath)) {
        const srcHtml = resolve(buildPath, `${appSlug}.html`)
        if (fs.existsSync(srcHtml)) {
          writePair(fs.readFileSync(srcHtml, 'utf8'))
          fs.rmSync(buildPath, { recursive: true, force: true })
        }
      } else {
        const direct = resolve(distPath, `${appSlug}.html`)
        const indexDirect = resolve(distPath, 'index.html')
        const src = fs.existsSync(direct) ? direct : indexDirect
        if (fs.existsSync(src)) {
          writePair(fs.readFileSync(src, 'utf8'))
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
        if (!startContent.includes('data-sub-app-root-style')) {
          startContent = startContent.replace(/<head>/i, `<head>\n  ${ROOT_LAYOUT_STYLE}`)
        }
        fs.writeFileSync(resolve(distPath, 'start.html'), startContent)
      }
    }
  }
}
