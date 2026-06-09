#!/usr/bin/env node
/**
 * 子应用打包产物校验（《子应用打包指南》§4.3、§8.1）
 * 用法: node AIEP-WEB/scripts/validate-sub-app-pack.mjs --folder sample-app [--json]
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = path.join(__dirname, '..')
const WEB_SRC = path.join(WEB_ROOT, 'src')

function parseArgs(argv) {
  const args = { folder: null, app: null, json: false }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--folder' && argv[i + 1]) args.folder = argv[++i]
    else if (a === '--app' && argv[i + 1]) args.app = argv[++i]
    else if (a === '--json') args.json = true
  }
  return args
}

function resolveAppFolder(appCode) {
  try {
    const text = fs.readFileSync(path.join(WEB_SRC, 'config', 'subApps.js'), 'utf8')
    const re = new RegExp(
      `appCode:\\s*['"]${appCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"][\\s\\S]*?folder:\\s*['"]([^'"]+)['"]`
    )
    const m = text.match(re)
    if (m) return m[1]
  } catch {
    /* fallback */
  }
  return appCode
}

function validatePack(folder) {
  const distDir = path.join(WEB_ROOT, 'dist', folder)
  const checks = {
    P1: { pass: false, detail: '' },
    P2: { pass: false, detail: '' },
    P3: { pass: false, detail: '' },
    P4: { pass: false, detail: '' },
    P5: { pass: false, detail: '' },
    P6: { pass: false, detail: '' },
    P7: { pass: false, detail: '' },
    P8: { pass: false, detail: '' },
    P9: { pass: false, detail: '' },
    P10: { pass: false, detail: '' }
  }
  const missing = []

  if (!fs.existsSync(distDir)) {
    checks.P1.detail = `dist/${folder}/ 不存在`
    missing.push('P1: 先执行 npm run build:' + folder)
    return { checks, allPass: false, missing, distDir }
  }
  checks.P1.pass = true
  checks.P1.detail = `dist/${folder}/ 存在`

  const indexHtml = path.join(distDir, 'index.html')
  const appHtml = path.join(distDir, `${folder}.html`)
  if (!fs.existsSync(indexHtml)) {
    checks.P2.detail = 'index.html 缺失'
    missing.push('P2: createSubAppCopyHtmlPlugin 未生成 index.html')
  } else {
    checks.P2.pass = true
    checks.P2.detail = 'index.html 存在'
  }

  if (!fs.existsSync(appHtml)) {
    checks.P3.detail = `${folder}.html 缺失`
    missing.push(`P3: ${folder}.html 缺失`)
  } else {
    checks.P3.pass = true
    checks.P3.detail = `${folder}.html 存在`
  }

  const assetsDir = path.join(distDir, 'assets')
  const jsFiles =
    fs.existsSync(assetsDir) && fs.statSync(assetsDir).isDirectory()
      ? fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js'))
      : []
  if (jsFiles.length === 0) {
    checks.P4.detail = 'assets/*.js 缺失'
    missing.push('P4: 构建未产出 JS 资源')
  } else {
    checks.P4.pass = true
    checks.P4.detail = `assets 含 ${jsFiles.length} 个 .js`
  }

  const staleBuild = path.join(distDir, 'build')
  if (fs.existsSync(staleBuild)) {
    checks.P5.detail = 'dist 内残留 build/ 目录（createSubAppCopyHtmlPlugin 未完成）'
    missing.push('P5: 删除残留 build/ 或修复 vite 配置')
  } else {
    checks.P5.pass = true
    checks.P5.detail = '无残留 build/ 目录'
  }

  function checkHtmlAssetPaths(label, filePath) {
    if (!fs.existsSync(filePath)) return { ok: false, msg: `${label} 缺失` }
    const html = fs.readFileSync(filePath, 'utf8')
    if (html.includes('../assets/')) return { ok: false, msg: `${label} 仍含 ../assets/` }
    if (jsFiles.length > 0 && !html.includes('./assets/')) {
      return { ok: false, msg: `${label} 未引用 ./assets/` }
    }
    return { ok: true, msg: `${label} 使用 ./assets/` }
  }

  const p6Index = checkHtmlAssetPaths('index.html', indexHtml)
  const p6App = checkHtmlAssetPaths(`${folder}.html`, appHtml)
  if (!p6Index.ok || !p6App.ok) {
    checks.P6.detail = [p6Index, p6App].filter((r) => !r.ok).map((r) => r.msg).join('；')
    missing.push('P6: 修正 createSubAppCopyHtmlPlugin 路径替换')
  } else if (checks.P2.pass && checks.P3.pass) {
    checks.P6.pass = true
    checks.P6.detail = `index.html 与 ${folder}.html 均为 ./assets/ 相对路径`
  } else {
    checks.P6.detail = '跳过（入口 HTML 不齐）'
  }

  function checkIifeScript(label, filePath) {
    if (!fs.existsSync(filePath)) return { ok: false, msg: `${label} 缺失` }
    const html = fs.readFileSync(filePath, 'utf8')
    if (/type\s*=\s*["']module["']/i.test(html)) {
      return { ok: false, msg: `${label} 仍含 type="module"` }
    }
    if (!/<script[^>]*src="\.\/assets\/[^"]+\.js"/i.test(html)) {
      return { ok: false, msg: `${label} 须为 IIFE <script src="./assets/*.js">` }
    }
    return { ok: true, msg: `${label} 为 IIFE 脚本引用` }
  }

  /** P9：IIFE 须在 #app 之后加载，禁止脚本仅出现在 head（否则 mount 前执行 → 白屏） */
  function checkScriptAfterApp(label, filePath) {
    if (!fs.existsSync(filePath)) return { ok: false, msg: `${label} 缺失` }
    const html = fs.readFileSync(filePath, 'utf8')
    const scriptMatch = html.match(/<script[^>]*src="\.\/assets\/[^"]+\.js"[^>]*>/i)
    if (!scriptMatch) return { ok: false, msg: `${label} 无 IIFE script` }
    const scriptPos = html.indexOf(scriptMatch[0])
    const appPos = html.search(/id\s*=\s*["']app["']/i)
    const headEnd = html.indexOf('</head>')
    if (headEnd >= 0 && scriptPos >= 0 && scriptPos < headEnd) {
      return { ok: false, msg: `${label} 脚本在 <head> 内（须在 <body> 中 #app 之后）` }
    }
    if (appPos >= 0 && scriptPos >= 0 && scriptPos < appPos) {
      return { ok: false, msg: `${label} 脚本在 #app 之前` }
    }
    return { ok: true, msg: `${label} 脚本位于 #app 之后` }
  }

  /** P10：standaloneRoutes 独立路由 path 须以 / 开头（生产 Vue Router 否则 Invalid path） */
  function checkStandaloneRoutesSource(folder) {
    const routesFile = path.join(WEB_SRC, 'apps', folder, 'routes.js')
    if (!fs.existsSync(routesFile)) {
      return { skip: true, detail: '无 routes.js，跳过 P10' }
    }
    const src = fs.readFileSync(routesFile, 'utf8')
    if (!/function\s+standaloneRoutes\s*\(/.test(src)) {
      return { skip: true, detail: '无 standaloneRoutes()，跳过 P10' }
    }
    const issues = []
    if (/function\s+standaloneRoutes[\s\S]*?\.slice\s*\(\s*1\s*\)/.test(src)) {
      issues.push('standaloneRoutes 中对 path 使用 slice(1)（会导致生产 Invalid path）')
    }
    const fnBody = src.match(/function\s+standaloneRoutes\s*\([^)]*\)\s*\{([\s\S]*?)\n\}/)?.[1] || ''
    for (const m of fnBody.matchAll(/path:\s*['"]([^'"]+)['"]/g)) {
      const p = m[1]
      if (p && p !== '' && !p.startsWith('/')) {
        issues.push(`standaloneRoutes 含非法 path "${p}"（须以 / 开头）`)
      }
    }
    if (issues.length) return { skip: false, ok: false, detail: issues.join('；') }
    return { skip: false, ok: true, detail: 'standaloneRoutes path 格式合规' }
  }

  const p8Index = checkIifeScript('index.html', indexHtml)
  const p8App = checkIifeScript(`${folder}.html`, appHtml)
  if (!p8Index.ok || !p8App.ok) {
    checks.P8.detail = [p8Index, p8App].filter((r) => !r.ok).map((r) => r.msg).join('；')
    missing.push('P8: 确认 rollup format=iife 且 createSubAppCopyHtmlPlugin 已 normalize')
  } else if (checks.P2.pass && checks.P3.pass) {
    checks.P8.pass = true
    checks.P8.detail = `index.html 与 ${folder}.html 均为 IIFE 无 module`
  } else {
    checks.P8.detail = '跳过（入口 HTML 不齐）'
  }

  const p9Index = checkScriptAfterApp('index.html', indexHtml)
  const p9App = checkScriptAfterApp(`${folder}.html`, appHtml)
  if (!p9Index.ok || !p9App.ok) {
    checks.P9.detail = [p9Index, p9App].filter((r) => !r.ok).map((r) => r.msg).join('；')
    missing.push('P9: 确认 sub-app-copy-html-plugin 已将脚本移至 #app 之后（§5.4.1）')
  } else if (checks.P2.pass && checks.P3.pass) {
    checks.P9.pass = true
    checks.P9.detail = 'index.html 与入口脚本均在 #app 之后'
  } else {
    checks.P9.detail = '跳过（入口 HTML 不齐）'
  }

  const p10 = checkStandaloneRoutesSource(folder)
  if (p10.skip) {
    checks.P10.pass = true
    checks.P10.detail = p10.detail
  } else if (!p10.ok) {
    checks.P10.detail = p10.detail
    missing.push('P10: 修正 standaloneRoutes()（§5.4.2）')
  } else {
    checks.P10.pass = true
    checks.P10.detail = p10.detail
  }

  const startHtml = path.join(distDir, 'start.html')
  if (!fs.existsSync(startHtml)) {
    checks.P7.detail = 'start.html 缺失（CDN/本地备选入口）'
    missing.push('P7: 确认 build/start.html 模板存在且 vite 使用 createSubAppCopyHtmlPlugin')
  } else {
    const startContent = fs.readFileSync(startHtml, 'utf8')
    const hasAssetScript = /\.\/assets\/[^"']+\.js/.test(startContent)
    const hasStalePlaceholder = /\.\/assets\/main\.js/.test(startContent)
    if (!hasAssetScript || hasStalePlaceholder) {
      checks.P7.detail = 'start.html 未正确引用打包后的 ./assets/*.js'
      missing.push('P7: createSubAppCopyHtmlPlugin 须将 main.js 替换为实际 hash 文件名')
    } else {
      checks.P7.pass = true
      checks.P7.detail = 'start.html 存在且引用 ./assets/*.js'
    }
  }

  const allPass = Object.values(checks).every((c) => c.pass)
  return { checks, allPass, missing, distDir }
}

function main() {
  const { folder: folderArg, app, json } = parseArgs(process.argv)
  const folder = folderArg || (app ? resolveAppFolder(app) : null)
  if (!folder) {
    console.error('Usage: validate-sub-app-pack.mjs --folder <folder> | --app <app-code> [--json]')
    process.exit(2)
  }

  const result = validatePack(folder)
  const out = {
    folder,
    dist: `AIEP-WEB/dist/${folder}/`,
    all_pass: result.allPass,
    checks: result.checks,
    missing: result.missing
  }

  if (json) {
    console.log(JSON.stringify(out, null, 2))
  } else {
    console.log(`子应用打包校验: ${folder}`)
    console.log(`产物目录: ${out.dist}`)
    for (const [id, c] of Object.entries(result.checks)) {
      console.log(`  ${id}: ${c.pass ? '✅' : '❌'} ${c.detail}`)
    }
    if (result.missing.length) {
      console.log('\n待修复:')
      result.missing.forEach((m) => console.log(`  - ${m}`))
    }
  }

  process.exit(result.allPass ? 0 : 1)
}

main()
