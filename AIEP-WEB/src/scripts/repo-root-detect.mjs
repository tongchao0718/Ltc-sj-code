#!/usr/bin/env node
/**
 * AIEP 项目根目录识别（更新包、子应用集成共用）
 *
 * 支持两种布局：
 * - monorepo：{项目}/package.json + {项目}/AIEP-WEB/src/...
 * - flat-web（旧版 1.x）：{项目}/package.json + {项目}/src/...（无 AIEP-WEB/；可无 subApps.js）
 *
 * 文件夹名、package.json.name 均可自定义。
 */
import fs from 'fs'
import path from 'path'

export const LAYOUT_MONOREPO = 'monorepo'
export const LAYOUT_FLAT_WEB = 'flat-web'

function hasLegacyWebFingerprint(webRoot) {
  const hasVite = fs.existsSync(path.join(webRoot, 'vite.config.js'))
  const hasIndex = fs.existsSync(path.join(webRoot, 'index.html'))
  if (!hasVite && !hasIndex) return false

  const hasEntry =
    fs.existsSync(path.join(webRoot, 'src', 'main.js')) ||
    fs.existsSync(path.join(webRoot, 'src', 'main.ts'))
  const hasApp = fs.existsSync(path.join(webRoot, 'src', 'App.vue'))
  const hasRouter = fs.existsSync(path.join(webRoot, 'src', 'router', 'index.js'))
  const hasApps = fs.existsSync(path.join(webRoot, 'src', 'apps'))
  const hasViews = fs.existsSync(path.join(webRoot, 'src', 'views'))

  return (hasEntry || hasApp) && (hasRouter || hasApps || hasViews)
}

function hasAiepWebFingerprint(webRoot) {
  if (
    fs.existsSync(path.join(webRoot, 'vite.config.js')) &&
    fs.existsSync(path.join(webRoot, 'src', 'config', 'subApps.js'))
  ) {
    return true
  }
  return hasLegacyWebFingerprint(webRoot)
}

export function isFlatWebRoot(dir) {
  const abs = path.resolve(dir)
  if (fs.existsSync(path.join(abs, 'AIEP-WEB'))) return false
  if (!fs.existsSync(path.join(abs, 'package.json'))) return false
  return hasAiepWebFingerprint(abs)
}

export function isAiepRepoRoot(dir) {
  const abs = path.resolve(dir)
  const webRoot = path.join(abs, 'AIEP-WEB')
  if (!fs.existsSync(webRoot)) return false
  try {
    if (!fs.statSync(webRoot).isDirectory()) return false
  } catch {
    return false
  }

  const pkgPath = path.join(abs, 'package.json')
  if (!fs.existsSync(pkgPath)) return false

  if (hasAiepWebFingerprint(webRoot)) return true

  try {
    const j = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
    if (j.name === 'ltc-demo') return true

    const scripts = j.scripts || {}
    const keys = Object.keys(scripts)
    if (keys.includes('validate:sub-app-registry')) return true
    if (keys.includes('infer:process-step')) return true
    if (keys.includes('create-update-package')) return true

    const dev = String(scripts.dev || '')
    if (dev.includes('AIEP-WEB') && (scripts.build || keys.some((k) => k.startsWith('build:')))) {
      return true
    }
    return false
  } catch {
    return false
  }
}

/** @deprecated 使用 isAiepRepoRoot */
export const isLtcDemoRoot = isAiepRepoRoot

export function resolveProjectLayoutAt(dir) {
  const abs = path.resolve(dir)
  if (isAiepRepoRoot(abs)) {
    return {
      repoRoot: abs,
      webRoot: path.join(abs, 'AIEP-WEB'),
      layout: LAYOUT_MONOREPO
    }
  }
  if (isFlatWebRoot(abs)) {
    return {
      repoRoot: abs,
      webRoot: abs,
      layout: LAYOUT_FLAT_WEB
    }
  }
  return null
}

export function walkUpForProjectLayout(startDir, maxDepth = 14) {
  let dir = path.resolve(startDir)
  for (let i = 0; i < maxDepth; i++) {
    const layout = resolveProjectLayoutAt(dir)
    if (layout) return layout
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

/** @deprecated 仅返回 repoRoot 字符串 */
export function walkUpForRepoRoot(startDir, maxDepth = 14) {
  const found = walkUpForProjectLayout(startDir, maxDepth)
  return found?.repoRoot ?? null
}

function findSiblingProjectLayouts(fromDir) {
  const parent = path.dirname(path.resolve(fromDir))
  const found = []
  try {
    for (const entry of fs.readdirSync(parent, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const candidate = path.join(parent, entry.name)
      const layout = resolveProjectLayoutAt(candidate)
      if (layout) found.push(layout)
    }
  } catch {
    /* ignore */
  }
  return found
}

/** @deprecated */
export function findSiblingRepoRoots(fromDir) {
  return findSiblingProjectLayouts(fromDir).map((p) => p.repoRoot)
}

export function resolveProjectRoots(searchStarts, { anchorDir = process.cwd() } = {}) {
  const seen = new Set()

  for (const start of searchStarts) {
    if (!start) continue
    const found = walkUpForProjectLayout(start)
    if (found && !seen.has(found.repoRoot)) {
      seen.add(found.repoRoot)
      return found
    }
  }

  for (const sibling of findSiblingProjectLayouts(anchorDir)) {
    if (!seen.has(sibling.repoRoot)) return sibling
  }

  return null
}

/** @deprecated 使用 resolveProjectRoots */
export function findRepoRootFromStarts(searchStarts, options = {}) {
  return resolveProjectRoots(searchStarts, options)?.repoRoot ?? null
}

/** 备份/回滚用的相对路径列表 */
export function getWebBackupRelPaths(layout) {
  const webParts = [
    'vite.config.js',
    'index.html',
    'vite.config.test.js',
    'build',
    'scripts',
    'src',
    'public'
  ]
  if (layout === LAYOUT_FLAT_WEB) {
    return ['package.json', 'package-lock.json', ...webParts]
  }
  return [
    'package.json',
    'package-lock.json',
    ...webParts.map((p) => `AIEP-WEB/${p}`)
  ]
}

export function webRelInRepo(layout, relWithinWeb) {
  const norm = relWithinWeb.replace(/\\/g, '/')
  if (layout === LAYOUT_FLAT_WEB) return norm
  return `AIEP-WEB/${norm}`
}

export function printRepoRootNotFoundHints({ updateRoot = null } = {}) {
  const cwd = process.cwd()
  const siblings = updateRoot
    ? findSiblingProjectLayouts(updateRoot)
    : findSiblingProjectLayouts(cwd)

  console.error('❌ 未找到 AIEP 项目根目录')
  console.error('')
  console.error('支持的项目结构（文件夹名可任意）：')
  console.error('')
  console.error('  【标准】monorepo：')
  console.error('    项目根/package.json + 项目根/AIEP-WEB/（含 vite.config.js 与 src/）')
  console.error('')
  console.error('  【旧版 1.x】flat-web（如 project-code-package_gx）：')
  console.error('    项目根/package.json + vite.config.js + src/App.vue 或 src/main.js')
  console.error('    （更新时默认自动迁入 AIEP-WEB/；可加 --keep-flat-web 保持扁平）')
  console.error('')
  console.error(`当前工作目录: ${cwd}`)
  if (updateRoot) console.error(`更新包位置: ${updateRoot}`)
  console.error('')
  console.error('推荐做法：')
  console.error('  A. 将更新包解压到项目根内，执行 node ltc-demo-update-vX/update.js --dry-run')
  console.error('  B. 更新包与项目同级：node update.js --project ../你的项目文件夹名 --dry-run')
  console.error('  C. 环境变量：LTC_PROJECT_ROOT=../你的项目 node update.js --yes')
  console.error('')
  console.error('常见误操作：')
  console.error('  · 只在 src/ 或 AIEP-WEB/ 子目录执行（应在含 package.json 的项目根）')
  console.error('  · 项目缺少 src/ 与 vite.config.js（不是 Vue 主工程）')
  if (siblings.length > 0) {
    console.error('')
    console.error('在同目录下检测到可能的项目：')
    for (const s of siblings) {
      const tag = s.layout === LAYOUT_FLAT_WEB ? 'flat-web' : 'monorepo'
      console.error(`  · [${tag}] ${s.repoRoot}`)
    }
  }
}
