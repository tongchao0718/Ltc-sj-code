#!/usr/bin/env node
/**
 * 子应用导出/集成包 — 共享工具
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const WEB_ROOT = path.join(__dirname, '..')
export const WEB_SRC = path.join(WEB_ROOT, 'src')
export const REPO_ROOT = path.join(WEB_ROOT, '..')

export function isLtcDemoRoot(dir) {
  const pkgPath = path.join(dir, 'package.json')
  if (!fs.existsSync(pkgPath)) return false
  try {
    const j = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
    return j.name === 'ltc-demo' && fs.existsSync(path.join(dir, 'AIEP-WEB'))
  } catch {
    return false
  }
}

export function findRepoRoot(startDir = process.cwd()) {
  let dir = path.resolve(startDir)
  for (let i = 0; i < 14; i++) {
    if (isLtcDemoRoot(dir)) return dir
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

export function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

export function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDirectory(s, d)
    else copyFile(s, d)
  }
}

export function routePrefixFromTo(to) {
  const parts = String(to ?? '').split('/').filter(Boolean)
  return parts.length ? `/${parts[0]}` : ''
}

export async function loadSubApps(subAppsPath) {
  const mod = await import(pathToFileURL(subAppsPath) + '?t=' + Date.now())
  return mod.subApps || []
}

export async function findSubAppEntry(appCode, subAppsPath = path.join(WEB_SRC, 'config/subApps.js')) {
  const apps = await loadSubApps(subAppsPath)
  return apps.find((s) => s.appCode === appCode || s.folder === appCode || s.id === appCode) || null
}

export async function resolveAppFolder(appCode) {
  const entry = await findSubAppEntry(appCode)
  return entry?.folder || appCode
}

/** 从 router 文本提取指定前缀的顶层路由对象 */
export function extractTopLevelRouteByPrefix(routerText, prefix) {
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

export function collectBundleFileList(folder, appCode) {
  const rel = []
  const addDir = (abs, relPath) => {
    if (fs.existsSync(abs)) rel.push({ type: 'dir', src: abs, rel: relPath })
  }
  const addFile = (abs, relPath) => {
    if (fs.existsSync(abs)) rel.push({ type: 'file', src: abs, rel: relPath })
  }

  addDir(path.join(WEB_SRC, 'apps', folder), `AIEP-WEB/src/apps/${folder}`)
  addDir(
    path.join(WEB_SRC, 'docs', '子应用文档', appCode),
    `AIEP-WEB/src/docs/子应用文档/${appCode}`
  )
  addFile(
    path.join(WEB_ROOT, 'build', `vite.${folder}.config.js`),
    `AIEP-WEB/build/vite.${folder}.config.js`
  )
  addFile(path.join(WEB_ROOT, 'build', `${folder}.html`), `AIEP-WEB/build/${folder}.html`)

  const serverApp = path.join(REPO_ROOT, 'AIEP-SERVER', 'src', 'apps', folder)
  if (fs.existsSync(serverApp)) {
    addDir(serverApp, `AIEP-SERVER/src/apps/${folder}`)
  }

  return rel
}

export function getPackageScriptsForFolder(folder) {
  const pkgPath = path.join(REPO_ROOT, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  const out = {}
  for (const key of [`dev:${folder}`, `build:${folder}`]) {
    if (pkg.scripts[key]) out[key] = pkg.scripts[key]
  }
  return out
}

export function formatSubAppEntryBlock(entry) {
  return `  {
    id: '${entry.id}',
    appCode: '${entry.appCode}',
    name: '${entry.name}',
    folder: '${entry.folder}',
    designSystem: '${entry.designSystem}',
    desc: '${String(entry.desc || '').replace(/'/g, "\\'")}',
    icon: '${entry.icon}',
    to: '${entry.to}',
    tag: '${entry.tag}',
    tagClass: '${entry.tagClass}',
    pageCount: ${entry.pageCount}
  }`
}

export function mergeSubAppEntry(subAppsPath, entry, { force = false } = {}) {
  let text = fs.readFileSync(subAppsPath, 'utf8')
  const folderNeedle = `folder: '${entry.folder}'`
  const exists = text.includes(folderNeedle) || text.includes(`folder: "${entry.folder}"`)

  if (exists && !force) {
    return { action: 'skipped', reason: 'subApps.js 已存在该 folder' }
  }

  const block = formatSubAppEntryBlock(entry)
  if (exists && force) {
    const re = new RegExp(
      `\\{[\\s\\S]*?folder:\\s*['"]${entry.folder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"][\\s\\S]*?\\n  \\}`,
      'm'
    )
    if (!re.test(text)) {
      throw new Error('无法定位 subApps.js 中待替换的条目')
    }
    text = text.replace(re, block.trim())
    fs.writeFileSync(subAppsPath, text)
    return { action: 'updated' }
  }

  const marker = 'export function routePrefixFromTo'
  const markerIdx = text.indexOf(marker)
  if (markerIdx === -1) throw new Error('subApps.js 结构异常')
  const closeIdx = text.lastIndexOf(']', markerIdx)
  if (closeIdx === -1) throw new Error('subApps.js 结构异常')
  text = `${text.slice(0, closeIdx)},\n${block}\n${text.slice(closeIdx)}`
  fs.writeFileSync(subAppsPath, text)
  return { action: 'appended' }
}

export function mergeRouterBlock(routerPath, routerBlock, prefix, { force = false } = {}) {
  let text = fs.readFileSync(routerPath, 'utf8')
  const exists =
    text.includes(`path: '${prefix}'`) || text.includes(`path: "${prefix}"`)

  if (exists && !force) {
    return { action: 'skipped', reason: `router 已存在 ${prefix}` }
  }

  if (exists && force) {
    const old = extractTopLevelRouteByPrefix(text, prefix)
    if (!old) throw new Error('无法定位 router 中待替换的路由块')
    text = text.replace(old, routerBlock.trim())
    fs.writeFileSync(routerPath, text)
    return { action: 'updated' }
  }

  const closeIdx = text.lastIndexOf(']')
  if (closeIdx === -1) throw new Error('router/index.js 结构异常')
  text = `${text.slice(0, closeIdx)},\n${routerBlock.trim()}\n${text.slice(closeIdx)}`
  fs.writeFileSync(routerPath, text)
  return { action: 'appended' }
}

export function mergePackageScripts(repoRoot, scripts, { force = false } = {}) {
  const pkgPath = path.join(repoRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  pkg.scripts = pkg.scripts || {}
  const added = []
  const skipped = []
  for (const [key, val] of Object.entries(scripts)) {
    if (pkg.scripts[key] && pkg.scripts[key] !== val && !force) {
      skipped.push(key)
      continue
    }
    if (!pkg.scripts[key] || force) {
      pkg.scripts[key] = val
      added.push(key)
    }
  }
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  return { added, skipped }
}

export function copyBundleFilesToRepo(bundleFilesDir, repoRoot) {
  const copied = []
  if (!fs.existsSync(bundleFilesDir)) {
    throw new Error(`bundle files 目录不存在: ${bundleFilesDir}`)
  }
  for (const entry of fs.readdirSync(bundleFilesDir, { withFileTypes: true })) {
    const src = path.join(bundleFilesDir, entry.name)
    const dest = path.join(repoRoot, entry.name)
    if (entry.isDirectory()) {
      copyDirectory(src, dest)
      copied.push(entry.name + '/')
    } else {
      copyFile(src, dest)
      copied.push(entry.name)
    }
  }
  return copied
}
