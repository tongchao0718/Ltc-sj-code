#!/usr/bin/env node
/**
 * 更新包一键安装（保留用户自建子应用）
 *
 * 无需绝对路径，任选其一：
 *   1. 解压到项目根后：node ltc-demo-update-vX/update.js
 *   2. 进入更新包目录：node update.js（自动向上查找项目）
 *   3. 指定相对项目路径：node update.js --project ..
 *   4. 环境变量：LTC_PROJECT_ROOT=.. node update.js
 *   5. 零风险：node update.js --dry-run → node update.js --yes
 *   6. 回滚：node update.js --rollback backups/vX-timestamp
 */
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath, pathToFileURL } from 'url'
import { OBSOLETE_REL_PATHS } from './update-obsolete-paths.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPDATE_ROOT = __dirname
const FILES_DIR = path.join(UPDATE_ROOT, 'files')

function isLtcDemoRoot(dir) {
  const pkgPath = path.join(dir, 'package.json')
  if (!fs.existsSync(pkgPath)) return false
  try {
    const j = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
    return j.name === 'ltc-demo' && fs.existsSync(path.join(dir, 'AIEP-WEB'))
  } catch {
    return false
  }
}

function walkUpForLtcDemo(startDir, maxDepth = 12) {
  let dir = path.resolve(startDir)
  for (let i = 0; i < maxDepth; i++) {
    if (isLtcDemoRoot(dir)) return dir
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

function parseCliArgs() {
  const args = process.argv.slice(2)
  const out = { project: null, yes: false, dryRun: false, rollback: null, strict: false }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--project' || a === '-p') out.project = args[++i]
    else if (a.startsWith('--project=')) out.project = a.slice('--project='.length)
    else if (a === '--yes' || a === '-y') out.yes = true
    else if (a === '--dry-run') out.dryRun = true
    else if (a === '--strict') out.strict = true
    else if (a === '--rollback') out.rollback = args[++i]
  }
  return out
}

function parseCliProjectRoot() {
  return parseCliArgs().project
}

function collectSearchStarts() {
  const starts = []
  const add = (p) => {
    if (p) starts.push(path.resolve(p))
  }

  add(process.env.LTC_PROJECT_ROOT)
  add(parseCliProjectRoot())
  add(process.cwd())

  let dir = UPDATE_ROOT
  for (let i = 0; i < 12; i++) {
    add(dir)
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }

  return [...new Set(starts)]
}

function findRepoRoot() {
  for (const start of collectSearchStarts()) {
    const found = walkUpForLtcDemo(start)
    if (found) return found
  }
  return null
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDirectory(s, d)
    else copyFile(s, d)
  }
}

function routePrefixFromTo(to) {
  const parts = String(to ?? '').split('/').filter(Boolean)
  return parts.length ? `/${parts[0]}` : ''
}

function extractEmbedPrefixes(appVueText) {
  const m = appVueText.match(/SUB_APP_EMBED_PREFIXES\s*=\s*\[([^\]]+)\]/)
  if (!m) return []
  return [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1])
}

/** 从 router 文本中提取指定前缀的顶层路由对象 */
function extractTopLevelRouteByPrefix(routerText, prefix) {
  const needles = [`path: '${prefix}'`, `path: "${prefix}"`]
  let anchor = -1
  for (const n of needles) {
    const idx = routerText.indexOf(n)
    if (idx !== -1) {
      anchor = idx
      break
    }
  }
  if (anchor === -1) return null
  const startIdx = routerText.lastIndexOf('{', anchor)
  if (startIdx === -1) return null
  let depth = 0
  for (let i = startIdx; i < routerText.length; i++) {
    if (routerText[i] === '{') depth++
    else if (routerText[i] === '}') {
      depth--
      if (depth === 0) return routerText.slice(startIdx, i + 1)
    }
  }
  return null
}

async function getUserOnlyPrefixesFromSubApps(subAppsPath, frameworkAppFolders) {
  if (!fs.existsSync(subAppsPath)) return []
  const mod = await import(pathToFileURL(subAppsPath) + '?t=' + Date.now())
  return (mod.subApps || [])
    .filter((a) => !frameworkAppFolders.includes(a.folder))
    .map((a) => routePrefixFromTo(a.to))
    .filter(Boolean)
}

/** 自动保留自建子应用的路由块与嵌入前缀（消除 §5.2 手工合并） */
function preserveUserSubAppIntegration(webRoot, backupDir, userPrefixes) {
  if (!userPrefixes.length) return

  const routerDest = path.join(webRoot, 'src/router/index.js')
  const routerBackup = path.join(backupDir, 'AIEP-WEB', 'src', 'router', 'index.js')
  const appDest = path.join(webRoot, 'src', 'App.vue')
  const appBackup = path.join(backupDir, 'AIEP-WEB', 'src', 'App.vue')

  if (fs.existsSync(routerBackup) && fs.existsSync(routerDest)) {
    let dest = fs.readFileSync(routerDest, 'utf8')
    const backup = fs.readFileSync(routerBackup, 'utf8')
    const blocks = []
    for (const prefix of userPrefixes) {
      if (dest.includes(`path: '${prefix}'`) || dest.includes(`path: "${prefix}"`)) continue
      const block = extractTopLevelRouteByPrefix(backup, prefix)
      if (block) blocks.push(block)
    }
    if (blocks.length) {
      const closeIdx = dest.lastIndexOf(']')
      dest = `${dest.slice(0, closeIdx)},\n  ${blocks.join(',\n  ')}\n${dest.slice(closeIdx)}`
      fs.writeFileSync(routerDest, dest)
      console.log(`  ✓ 自动合并自建子应用路由（${blocks.length} 条）`)
    }
  }

  if (fs.existsSync(appBackup) && fs.existsSync(appDest)) {
    // 嵌入前缀已由 subApps.js + isSubAppEmbedPath 驱动，无需再合并 SUB_APP_EMBED_PREFIXES
    console.log('  · App.vue 嵌入前缀由 subApps.js 驱动，跳过 SUB_APP_EMBED_PREFIXES 合并')
  }
}

/** build/ 合并：不覆盖用户自建子应用的 vite.<folder>.config.js */
function mergeBuildDirectory(src, dest, frameworkAppFolders) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      mergeBuildDirectory(s, d, frameworkAppFolders)
      continue
    }
    const viteMatch = entry.name.match(/^vite\.(.+)\.config\.js$/)
    if (viteMatch && !frameworkAppFolders.includes(viteMatch[1]) && fs.existsSync(d)) {
      continue
    }
    copyFile(s, d)
  }
}

function checkNodeVersion() {
  const major = parseInt(process.versions.node.split('.')[0], 10)
  if (major < 18) {
    throw new Error(`需要 Node.js >= 18，当前 ${process.versions.node}`)
  }
}

function isGitDirty(repoRoot) {
  try {
    const out = execSync('git status --porcelain', { cwd: repoRoot, encoding: 'utf8' })
    return Boolean(out.trim())
  } catch {
    return false
  }
}

function rollbackFromBackup(repoRoot, backupDir) {
  if (!backupDir || !fs.existsSync(backupDir)) {
    console.error('❌ 无法回滚：备份目录不存在')
    return false
  }
  console.log('\n⏪ 正在从备份自动回滚...')
  const manifestPath = path.join(backupDir, 'update-backup-manifest.json')
  const relPaths = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')).paths
    : [
        'package.json',
        'package-lock.json',
        'AIEP-WEB/vite.config.js',
        'AIEP-WEB/index.html',
        'AIEP-WEB/vite.config.test.js',
        'AIEP-WEB/build',
        'AIEP-WEB/scripts',
        'AIEP-WEB/src',
        '核心文档/框架核心文档',
        '核心文档/AI+产品落地',
        '核心文档/执行说明.txt',
        'AIEP-SERVER'
      ]

  for (const rel of relPaths) {
    const src = path.join(backupDir, rel)
    const dest = path.join(repoRoot, rel)
    if (!fs.existsSync(src)) continue
    if (fs.statSync(src).isDirectory()) {
      if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true })
      copyDirectory(src, dest)
    } else {
      copyFile(src, dest)
    }
    console.log(`  ↩ ${rel}`)
  }
  console.log('✅ 已回滚至更新前状态')
  return true
}

function writeBackupManifest(backupDir, meta) {
  fs.writeFileSync(
    path.join(backupDir, 'update-backup-manifest.json'),
    JSON.stringify(meta, null, 2) + '\n'
  )
}

function resolveObsoletePaths(meta) {
  const fromMeta = meta.obsoletePaths
  if (Array.isArray(fromMeta) && fromMeta.length) return fromMeta
  return OBSOLETE_REL_PATHS
}

/** 更新成功后删除 1.0 / 过渡版废弃文档（存在则删，不报错） */
function purgeObsoleteFiles(repoRoot, obsoletePaths) {
  let removed = 0
  for (const rel of obsoletePaths) {
    const full = path.join(repoRoot, rel)
    if (!fs.existsSync(full)) continue
    fs.rmSync(full, { force: true })
    console.log(`  ✓ 删除废弃文档: ${rel}`)
    removed++
  }
  if (!removed) console.log('  · 无待清理废弃文档')
  return removed
}

function tailOutput(text, maxLines = 20) {
  return String(text || '')
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .slice(-maxLines)
    .join('\n')
}

function runCommandCapture(cmd, cwd) {
  try {
    const stdout = execSync(cmd, { cwd, encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'] })
    return { ok: true, output: stdout || '' }
  } catch (e) {
    const stdout = e.stdout?.toString() || ''
    const stderr = e.stderr?.toString() || ''
    return {
      ok: false,
      message: e.message,
      output: [stdout, stderr].filter(Boolean).join('\n')
    }
  }
}

function loadPackageScripts(repoRoot) {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'))
  return pkg.scripts || {}
}

async function loadSubAppsFromRepo(webRoot) {
  const subAppsPath = path.join(webRoot, 'src/config/subApps.js')
  const mod = await import(pathToFileURL(subAppsPath) + '?t=' + Date.now())
  return mod.subApps || []
}

function listSubAppsToVerify(repoRoot, subApps, scripts) {
  const items = []
  for (const app of subApps) {
    const scriptKey = `build:${app.folder}`
    const appSrc = path.join(repoRoot, 'AIEP-WEB', 'src/apps', app.folder)
    if (!scripts[scriptKey]) {
      items.push({ app, status: 'skip', reason: `缺少 npm 脚本 ${scriptKey}` })
    } else if (!fs.existsSync(appSrc)) {
      items.push({ app, status: 'skip', reason: `源码目录不存在 src/apps/${app.folder}` })
    } else {
      items.push({ app, status: 'verify', scriptKey })
    }
  }
  return items
}

/** 主应用验证：失败抛错 → 触发回滚 */
function verifyMainAppAfterUpdate(repoRoot) {
  console.log('\n━━ 主应用验证（异常将阻断更新并回滚）━━')

  console.log('\n[1/2] 注册表校验...')
  const registry = runCommandCapture('npm run validate:sub-app-registry', repoRoot)
  if (!registry.ok) {
    let detail = tailOutput(registry.output, 30)
    try {
      const report = JSON.parse(registry.output)
      if (report.failed_items?.length) {
        detail = report.failed_items.map((i) => `  - ${i}`).join('\n')
      }
    } catch {
      /* 非 JSON 输出 */
    }
    const err = new Error(`主应用注册表校验未通过\n${detail}`)
    err.code = 'MAIN_APP_REGISTRY_FAILED'
    throw err
  }
  console.log('  ✓ 注册表校验通过')

  console.log('\n[2/2] 主应用构建...')
  const build = runCommandCapture('npm run build', repoRoot)
  if (!build.ok) {
    const err = new Error(`主应用构建失败\n${tailOutput(build.output)}`)
    err.code = 'MAIN_APP_BUILD_FAILED'
    throw err
  }

  const indexHtml = path.join(repoRoot, 'AIEP-WEB', 'dist', 'index.html')
  if (!fs.existsSync(indexHtml)) {
    const err = new Error('主应用构建产物缺失: AIEP-WEB/dist/index.html')
    err.code = 'MAIN_APP_ARTIFACT_MISSING'
    throw err
  }
  console.log('  ✓ 主应用构建通过（AIEP-WEB/dist/index.html 已生成）')
}

/** 子应用验证：异常仅提示，不触发回滚 */
async function verifySubAppsAfterUpdate(repoRoot, webRoot) {
  const subApps = await loadSubAppsFromRepo(webRoot)
  const scripts = loadPackageScripts(repoRoot)
  const plan = listSubAppsToVerify(repoRoot, subApps, scripts)

  console.log('\n━━ 子应用构建验证（异常仅提示，不阻断更新）━━')

  const result = { successes: [], failures: [], skipped: [] }

  for (const item of plan) {
    const { app } = item
    if (item.status === 'skip') {
      result.skipped.push({ app, reason: item.reason })
      console.log(`  · 跳过 ${app.name}（${app.folder}）: ${item.reason}`)
      continue
    }

    console.log(`\n  构建 ${app.name}（${app.folder}）...`)
    const build = runCommandCapture(`npm run ${item.scriptKey}`, repoRoot)
    if (build.ok) {
      result.successes.push(app)
      console.log(`  ✓ ${app.folder} 构建通过`)
    } else {
      result.failures.push({
        app,
        scriptKey: item.scriptKey,
        detail: tailOutput(build.output)
      })
      console.warn(`  ⚠ ${app.folder} 构建未通过（仅提示，不回滚）`)
    }
  }

  return result
}

function printMainAppFailure(err) {
  console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.error('❌ 主应用验证失败 — 更新已阻断并回滚')
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  const code = err.code || 'MAIN_APP_VERIFY_FAILED'
  console.error(`异常类型: ${code}`)
  console.error('异常说明:')
  console.error(String(err.message || err)
    .split('\n')
    .map((l) => `  ${l}`)
    .join('\n'))
  if (code === 'MAIN_APP_REGISTRY_FAILED') {
    console.error('\n处理建议: 检查 subApps.js、router/index.js、App.vue 是否对齐；见《主应用子应用接入规范》')
  } else if (code === 'MAIN_APP_BUILD_FAILED' || code === 'MAIN_APP_ARTIFACT_MISSING') {
    console.error('\n处理建议: 检查 Node >= 18、依赖是否完整；本地执行 npm run build 复现')
  }
}

function printSubAppVerificationReport(result) {
  const { successes, failures, skipped } = result
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📦 子应用验证汇总（异常仅提示）')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`通过 ${successes.length} · 异常 ${failures.length} · 跳过 ${skipped.length}`)

  for (const f of failures) {
    console.log(`\n⚠️  [子应用异常] ${f.app.name}（folder: ${f.app.folder}）`)
    console.log(`   命令: npm run ${f.scriptKey}`)
    console.log('   异常说明:')
    console.log(
      f.detail
        .split('\n')
        .map((l) => `     ${l}`)
        .join('\n')
    )
    console.log(`   建议: 手动执行 npm run ${f.scriptKey} 复现；检查 src/apps/${f.app.folder}/ 与 build/vite.${f.app.folder}.config.js`)
  }

  for (const s of skipped) {
    console.log(`\n· [已跳过] ${s.app.name}（${s.app.folder}）: ${s.reason}`)
  }

  if (failures.length) {
    console.log('\n主应用已更新成功；请按上述说明修复子应用后执行 npm run build:<folder>')
  }
}

/** 覆盖合并：用 src 更新 dest，但不删除 dest 中多出的条目 */
function mergeDirectory(src, dest) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      mergeDirectory(s, d)
    } else {
      copyFile(s, d)
    }
  }
}

function mergeServerTree(serverFrom, serverTo, { frameworkAppFolders }) {
  if (!fs.existsSync(serverFrom)) return

  for (const f of ['app.js', 'package.json', 'package-lock.json']) {
    const s = path.join(serverFrom, f)
    const d = path.join(serverTo, f)
    if (fs.existsSync(s)) copyFile(s, d)
  }

  const srcFrom = path.join(serverFrom, 'src')
  const srcTo = path.join(serverTo, 'src')
  if (!fs.existsSync(srcFrom)) return

  for (const entry of fs.readdirSync(srcFrom, { withFileTypes: true })) {
    const s = path.join(srcFrom, entry.name)
    const d = path.join(srcTo, entry.name)
    if (entry.name === 'apps' && entry.isDirectory()) {
      fs.mkdirSync(d, { recursive: true })
      for (const app of fs.readdirSync(s, { withFileTypes: true })) {
        if (!app.isDirectory() || !frameworkAppFolders.includes(app.name)) continue
        mergeDirectory(path.join(s, app.name), path.join(d, app.name))
      }
    } else if (entry.isDirectory()) {
      mergeDirectory(s, d)
    }
  }
}

function mergeSrcTree(srcFrom, destTo, { frameworkAppFolders, frameworkDocFolders }) {
  if (!fs.existsSync(srcFrom)) return

  for (const entry of fs.readdirSync(srcFrom, { withFileTypes: true })) {
    const name = entry.name
    const s = path.join(srcFrom, name)
    const d = path.join(destTo, name)

    if (name === 'apps' && entry.isDirectory()) {
      fs.mkdirSync(d, { recursive: true })
      for (const appEntry of fs.readdirSync(s, { withFileTypes: true })) {
        if (!appEntry.isDirectory()) continue
        if (!frameworkAppFolders.includes(appEntry.name)) continue
        mergeDirectory(path.join(s, appEntry.name), path.join(d, appEntry.name))
      }
      continue
    }

    if (name === 'docs' && entry.isDirectory()) {
      fs.mkdirSync(d, { recursive: true })
      for (const docEntry of fs.readdirSync(s, { withFileTypes: true })) {
        const ds = path.join(s, docEntry.name)
        const dd = path.join(d, docEntry.name)
        if (docEntry.name === '子应用文档' && docEntry.isDirectory()) {
          fs.mkdirSync(dd, { recursive: true })
          for (const sub of fs.readdirSync(ds, { withFileTypes: true })) {
            if (!sub.isDirectory()) continue
            if (!frameworkDocFolders.includes(sub.name)) continue
            mergeDirectory(path.join(ds, sub.name), path.join(dd, sub.name))
          }
        } else {
          mergeDirectory(ds, dd)
        }
      }
      continue
    }

    if (entry.isDirectory()) mergeDirectory(s, d)
    else copyFile(s, d)
  }
}

function mergePackageJson(destPath, srcPath) {
  const dest = JSON.parse(fs.readFileSync(destPath, 'utf8'))
  const src = JSON.parse(fs.readFileSync(srcPath, 'utf8'))

  dest.version = src.version
  if (src.dependencies) dest.dependencies = { ...dest.dependencies, ...src.dependencies }
  if (src.devDependencies) dest.devDependencies = { ...dest.devDependencies, ...src.devDependencies }
  if (src.scripts) {
    dest.scripts = dest.scripts || {}
    for (const [k, v] of Object.entries(src.scripts)) {
      if (k.startsWith('build:') || k.startsWith('dev:') || k.startsWith('validate:')) {
        if (!dest.scripts[k]) dest.scripts[k] = v
      } else {
        dest.scripts[k] = v
      }
    }
  }
  fs.writeFileSync(destPath, JSON.stringify(dest, null, 2) + '\n')
}

async function mergeSubApps(destPath, srcPath) {
  const userMod = await import(pathToFileURL(destPath) + '?t=' + Date.now())
  const pkgMod = await import(pathToFileURL(srcPath) + '?t=' + Date.now())
  const userApps = userMod.subApps || []
  const pkgApps = pkgMod.subApps || []
  const merged = [...pkgApps]
  for (const u of userApps) {
    if (!merged.some((m) => m.id === u.id)) merged.push(u)
  }
  const mainCount = pkgMod.MAIN_PAGE_COUNT ?? userMod.MAIN_PAGE_COUNT ?? 6
  const body = `/**
 * 子应用注册表（应用中心 + 首页指标与路由配置保持同步）
 */
export const MAIN_PAGE_COUNT = ${mainCount}

export const subApps = ${JSON.stringify(merged, null, 2)}

export function getSubAppMetrics() {
  return {
    appCount: subApps.length,
    pageCount: MAIN_PAGE_COUNT + subApps.reduce((sum, app) => sum + app.pageCount, 0)
  }
}
`
  fs.writeFileSync(destPath, body)
}

function loadUpdateMeta() {
  const infoPath = path.join(UPDATE_ROOT, 'update-info.json')
  if (fs.existsSync(infoPath)) {
    return JSON.parse(fs.readFileSync(infoPath, 'utf8'))
  }
  return {}
}

function parseVersion(v) {
  const s = String(v ?? '')
    .replace(/^v/i, '')
    .trim()
  const parts = s.split('.').map((n) => parseInt(n, 10) || 0)
  while (parts.length < 3) parts.push(0)
  return parts.slice(0, 3)
}

/** @returns {number} 1 if a>b, -1 if a<b, 0 if equal */
function compareVersion(a, b) {
  const pa = parseVersion(a)
  const pb = parseVersion(b)
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1
    if (pa[i] < pb[i]) return -1
  }
  return 0
}

function readProjectVersion(repoRoot) {
  const pkgPath = path.join(repoRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  return pkg.version || '0.0.0'
}

function resolvePackageVersion(meta) {
  if (meta.version) return meta.version
  const pkgPath = path.join(FILES_DIR, 'package.json')
  if (fs.existsSync(pkgPath)) {
    return JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version
  }
  return null
}

/** 安装成功后打印 §12 精简清单（完整版见 更新分发方案.md） */
function printPostUpdateOnboarding(repoRoot) {
  const rel = (...parts) => path.join('核心文档', ...parts)
  const full = (...parts) => path.join(repoRoot, rel(...parts))

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📖 更新后熟悉项目与规范执行（《更新分发方案》§12）')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  console.log('\n【立即验证】')
  console.log('  1. npm run dev              # 主应用（更新脚本已校验 build）')
  console.log('  2. npm run validate:sub-app-registry')
  console.log('  3. npm run build:<folder>   # 子应用异常时请按上文说明修复')
  console.log('  4. npm run server:dev       # 若使用 AIEP-SERVER')

  console.log('\n【代码真值（优先于旧版记忆）】')
  console.log('  · AIEP-WEB/src/config/subApps.js')
  console.log('  · AIEP-WEB/src/router/index.js')
  console.log('  · AIEP-WEB/src/App.vue → isSubAppEmbedPath（读取 subApps.js）')

  console.log('\n【框架规范 · 第一遍必读】')
  console.log(`  1. ${rel('执行说明.txt')}`)
  console.log(`  2. ${rel('框架核心文档', '主应用子应用接入规范.md')}`)
  console.log(`  3. ${rel('框架核心文档', '系统设计规范.md')}`)
  console.log('  4. AIEP-WEB/src/docs/系统文档/使用说明.md')

  console.log('\n【产品 / 门禁规范 · 项目填报入口】')
  console.log(`  · ${rel('AI+产品落地', 'README.md')}`)
  console.log(`  · ${rel('AI+产品落地', '01-AI全流程设计', '01-规范与模板索引.md')}`)
  console.log(`  · ${rel('AI+产品落地', '02-子应用通用模板', '')}  ← 实例文档唯一来源`)

  console.log('\n【交活前校验】')
  console.log('  npm run validate:sub-app-registry')
  console.log('  npm run validate:sdd -- --app <appCode> --gate G2')

  console.log('\n【Agent Skills（自动，无需人工）】')
  console.log('  · postinstall 已同步 Cursor 全局 + Trae .trae/skills/')
  console.log('  · .cursor/rules/agent-skills-auto-exec.mdc 自动加载总编排与阶段 Skill')
  console.log('  · 直接描述任务即可，例如「推进 sample-app 步骤 3」')

  console.log('\n【一句话】写代码看框架核心文档 + subApps.js；写需求看 AI+产品落地/02-模板；交活前跑校验。')
  console.log(`\n完整说明: ${full('框架核心文档', '更新分发方案.md')} §12`)
}

async function runRollbackOnly(repoRoot, rollbackRel) {
  const backupDir = path.isAbsolute(rollbackRel)
    ? rollbackRel
    : path.join(repoRoot, rollbackRel)
  if (!rollbackFromBackup(repoRoot, backupDir)) process.exit(1)
  console.log('\n回滚后建议执行: npm install && npm run build')
}

async function main() {
  const cli = parseCliArgs()
  const meta = loadUpdateMeta()
  const repoRoot = findRepoRoot()

  if (!repoRoot) {
    console.error('❌ 未找到 ltc-demo 项目根目录（需含 package.json 与 AIEP-WEB/）')
    console.error('   建议：将更新包解压到项目根目录，或执行 node update.js --project <相对路径>')
    process.exit(1)
  }

  if (cli.rollback) {
    await runRollbackOnly(repoRoot, cli.rollback)
    return
  }

  console.log('检查系统更新（零风险模式：备份 → 合并 → 校验 → 失败自动回滚）...')

  try {
    checkNodeVersion()
  } catch (e) {
    console.error(`❌ ${e.message}`)
    process.exit(1)
  }

  if (!fs.existsSync(FILES_DIR)) {
    console.error('❌ 更新包缺少 files/ 目录')
    process.exit(1)
  }

  const packageVersion = resolvePackageVersion(meta)
  if (!packageVersion) {
    console.error('❌ 更新包未声明版本（update-info.json 或 files/package.json）')
    process.exit(1)
  }

  const currentVersion = readProjectVersion(repoRoot)
  const cmp = compareVersion(packageVersion, currentVersion)
  const webRoot = path.join(repoRoot, 'AIEP-WEB')
  const serverRoot = path.join(repoRoot, 'AIEP-SERVER')

  console.log(`当前版本: v${currentVersion}`)
  console.log(`更新包版本: v${packageVersion}`)
  console.log(`项目根目录: ${repoRoot}`)

  if (cmp < 0) {
    console.log('\n⏭️  更新包版本低于现网版本，已跳过（不进行降级）。')
    process.exit(0)
  }
  if (cmp === 0) {
    console.log('\n✅ 已是最新版本，无需更新。')
    process.exit(0)
  }

  const minCompatible = meta.minCompatibleVersion
  if (minCompatible && compareVersion(currentVersion, minCompatible) < 0) {
    console.error(
      `\n❌ 现网版本 v${currentVersion} 低于更新包最低兼容版本 v${minCompatible}，请先逐级升级或联系维护人。`
    )
    process.exit(1)
  }

  const frameworkMetaPath = path.join(FILES_DIR, 'framework-meta.json')
  const frameworkMeta = fs.existsSync(frameworkMetaPath)
    ? JSON.parse(fs.readFileSync(frameworkMetaPath, 'utf8'))
    : { frameworkAppFolders: ['sample-app'], frameworkDocFolders: ['sample-app'] }

  const backupSubAppsPath = path.join(webRoot, 'src/config/subApps.js')
  const userPrefixes = await getUserOnlyPrefixesFromSubApps(
    backupSubAppsPath,
    frameworkMeta.frameworkAppFolders || []
  )

  const gitDirty = isGitDirty(repoRoot)
  if (gitDirty) {
    console.warn('\n⚠️  检测到 Git 工作区有未提交修改，更新将覆盖同名文件。')
    if (cli.strict) {
      console.error('❌ --strict 模式下拒绝继续。请先 commit/stash 或去掉 --strict。')
      process.exit(1)
    }
  }

  console.log(`\n将升级: v${currentVersion} → v${packageVersion}`)
  if (userPrefixes.length) {
    console.log(`自建子应用路由前缀（将自动保留）: ${userPrefixes.join(', ')}`)
  }

  const obsoletePaths = resolveObsoletePaths(meta)

  if (cli.dryRun) {
    console.log('\n[dry-run] 将执行：全量备份 → 合并框架 → 自动合并自建路由/嵌入前缀 → 清理废弃文档 → npm install')
    console.log('[dry-run] 主应用验证（注册表 + build，失败回滚）→ 子应用 build 验证（失败仅提示）')
    console.log('[dry-run] 未修改任何文件。')
    const pendingObsolete = obsoletePaths.filter((rel) => fs.existsSync(path.join(repoRoot, rel)))
    if (pendingObsolete.length) {
      console.log('[dry-run] 将删除废弃文档:')
      pendingObsolete.forEach((rel) => console.log(`  - ${rel}`))
    } else {
      console.log('[dry-run] 无废弃文档待删除')
    }
    try {
      const subApps = await loadSubAppsFromRepo(webRoot)
      const scripts = loadPackageScripts(repoRoot)
      const plan = listSubAppsToVerify(repoRoot, subApps, scripts)
      const toVerify = plan.filter((p) => p.status === 'verify')
      if (toVerify.length) {
        console.log('[dry-run] 将验证子应用构建:')
        toVerify.forEach((p) => console.log(`  - ${p.app.name} → npm run ${p.scriptKey}`))
      }
    } catch {
      /* dry-run 预览子应用列表失败可忽略 */
    }
    process.exit(0)
  }

  if (!cli.yes) {
    console.log('\n确认继续？添加 --yes 跳过本提示（建议先在项目副本上验证）。')
    console.log('  node update.js --yes')
    process.exit(0)
  }

  const version = packageVersion
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(repoRoot, 'backups', `v${version}-${timestamp}`)
  fs.mkdirSync(backupDir, { recursive: true })

  const backupRelPaths = [
    'package.json',
    'package-lock.json',
    'AIEP-WEB/vite.config.js',
    'AIEP-WEB/index.html',
    'AIEP-WEB/vite.config.test.js',
    'AIEP-WEB/build',
    'AIEP-WEB/scripts',
    'AIEP-WEB/src',
    '核心文档/框架核心文档',
    '核心文档/AI+产品落地',
    '核心文档/执行说明.txt',
    'AIEP-SERVER',
    '.cursor',
    'scripts'
  ]
  const backupTargets = backupRelPaths.map((rel) => path.join(repoRoot, rel))

  console.log('\n创建备份...')
  for (let i = 0; i < backupTargets.length; i++) {
    const t = backupTargets[i]
    if (!fs.existsSync(t)) continue
    const rel = backupRelPaths[i]
    const dest = path.join(backupDir, rel)
    if (fs.statSync(t).isDirectory()) copyDirectory(t, dest)
    else copyFile(t, dest)
    console.log(`  ✓ ${rel}`)
  }

  writeBackupManifest(backupDir, {
    version: currentVersion,
    targetVersion: packageVersion,
    createdAt: new Date().toISOString(),
    paths: backupRelPaths.filter((rel) => fs.existsSync(path.join(backupDir, rel))),
    userSubAppPrefixes: userPrefixes
  })

  let rolledBack = false
  const fail = (step, err) => {
    if (step === '主应用验证' || err?.code?.startsWith('MAIN_APP_')) {
      printMainAppFailure(err)
    } else {
      console.error(`\n❌ 更新在「${step}」失败: ${err.message || err}`)
    }
    if (!rolledBack) {
      rolledBack = true
      rollbackFromBackup(repoRoot, backupDir)
      console.error(`\n已自动回滚。亦可手动: node update.js --rollback backups/v${version}-${timestamp}`)
    }
    process.exit(1)
  }

  try {
    console.log('\n合并更新文件...')

    const pkgSrc = path.join(FILES_DIR, 'package.json')
    const pkgDest = path.join(repoRoot, 'package.json')
    if (fs.existsSync(pkgSrc)) mergePackageJson(pkgDest, pkgSrc)

    const lockSrc = path.join(FILES_DIR, 'package-lock.json')
    const lockDest = path.join(repoRoot, 'package-lock.json')
    if (fs.existsSync(lockSrc)) copyFile(lockSrc, lockDest)

    const webFiles = ['vite.config.js', 'index.html', 'vite.config.test.js']
    for (const f of webFiles) {
      const s = path.join(FILES_DIR, 'AIEP-WEB', f)
      const d = path.join(webRoot, f)
      if (fs.existsSync(s)) copyFile(s, d)
    }

    mergeBuildDirectory(
      path.join(FILES_DIR, 'AIEP-WEB', 'build'),
      path.join(webRoot, 'build'),
      frameworkMeta.frameworkAppFolders || []
    )
    mergeDirectory(path.join(FILES_DIR, 'AIEP-WEB', 'scripts'), path.join(webRoot, 'scripts'))

    mergeSrcTree(
      path.join(FILES_DIR, 'AIEP-WEB', 'src'),
      path.join(webRoot, 'src'),
      frameworkMeta
    )

    const subAppsDest = path.join(webRoot, 'src/config/subApps.js')
    const subAppsSrc = path.join(FILES_DIR, 'AIEP-WEB', 'src/config/subApps.js')
    if (fs.existsSync(subAppsDest) && fs.existsSync(subAppsSrc)) {
      await mergeSubApps(subAppsDest, subAppsSrc)
      console.log('  ✓ 合并 subApps.js（保留你的子应用登记）')
    }

    preserveUserSubAppIntegration(webRoot, backupDir, userPrefixes)

    const coreDocMerge = [
      ['核心文档/框架核心文档', '核心文档/框架核心文档'],
      ['核心文档/AI+产品落地', '核心文档/AI+产品落地']
    ]
    for (const [relFrom, relTo] of coreDocMerge) {
      const s = path.join(FILES_DIR, relFrom)
      const d = path.join(repoRoot, relTo)
      if (fs.existsSync(s)) {
        mergeDirectory(s, d)
        console.log(`  ✓ 合并 ${relTo}`)
      }
    }

    const execNoteSrc = path.join(FILES_DIR, '核心文档', '执行说明.txt')
    const execNoteDest = path.join(repoRoot, '核心文档', '执行说明.txt')
    if (fs.existsSync(execNoteSrc)) {
      copyFile(execNoteSrc, execNoteDest)
      console.log('  ✓ 合并 核心文档/执行说明.txt')
    }

    const serverFrom = path.join(FILES_DIR, 'AIEP-SERVER')
    if (fs.existsSync(serverFrom)) {
      fs.mkdirSync(serverRoot, { recursive: true })
      mergeServerTree(serverFrom, serverRoot, frameworkMeta)
      console.log('  ✓ 合并 AIEP-SERVER（保留用户自建后端子应用）')
    }

    const cursorMerge = [
      ['.cursor/skills', '.cursor/skills'],
      ['.cursor/rules', '.cursor/rules']
    ]
    for (const [relFrom, relTo] of cursorMerge) {
      const s = path.join(FILES_DIR, relFrom)
      const d = path.join(repoRoot, relTo)
      if (fs.existsSync(s)) {
        mergeDirectory(s, d)
        console.log(`  ✓ 合并 ${relTo}（Agent Skills / Rules）`)
      }
    }

    const scriptsFrom = path.join(FILES_DIR, 'scripts')
    if (fs.existsSync(scriptsFrom)) {
      mergeDirectory(scriptsFrom, path.join(repoRoot, 'scripts'))
      console.log('  ✓ 合并 scripts/（含 sync-skills postinstall 自动同步）')
    }

    console.log('\n清理废弃文档（1.0 遗留，必须删除）...')
    purgeObsoleteFiles(repoRoot, obsoletePaths)

    console.log('\n安装依赖...')
    execSync('npm install', { stdio: 'inherit', cwd: repoRoot })
    if (fs.existsSync(path.join(serverRoot, 'package.json'))) {
      console.log('安装 AIEP-SERVER 依赖...')
      execSync('npm install', { stdio: 'inherit', cwd: serverRoot })
    }

    verifyMainAppAfterUpdate(repoRoot)
  } catch (e) {
    const step = e?.code?.startsWith('MAIN_APP_') ? '主应用验证' : '合并/安装/验证'
    fail(step, e)
  }

  let subAppResult = { successes: [], failures: [], skipped: [] }
  try {
    subAppResult = await verifySubAppsAfterUpdate(repoRoot, webRoot)
    printSubAppVerificationReport(subAppResult)
  } catch (e) {
    console.warn('\n⚠️  子应用验证过程异常（不影响已完成的更新）:', e.message)
  }

  console.log('\n✅ 更新完成（主应用验证已通过）')
  if (subAppResult.failures.length) {
    console.log(`⚠️  有 ${subAppResult.failures.length} 个子应用构建异常，见上文说明`)
  }
  console.log(`备份: ${backupDir}`)
  console.log(`手动回滚: node update.js --rollback backups/v${version}-${timestamp}`)
  printPostUpdateOnboarding(repoRoot)
}

main().catch((e) => {
  console.error('❌ 更新失败:', e.message)
  process.exit(1)
})
