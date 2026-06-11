#!/usr/bin/env node
/**
 * 子应用导出/集成包 — 共享工具
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { isAiepRepoRoot, isFlatWebRoot, walkUpForRepoRoot, resolveProjectLayoutAt } from '../src/scripts/repo-root-detect.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const WEB_ROOT = path.join(__dirname, '..')
export const WEB_SRC = path.join(WEB_ROOT, 'src')
export const REPO_ROOT = path.join(WEB_ROOT, '..')

export function isLtcDemoRoot(dir) {
  return isAiepRepoRoot(dir) || isFlatWebRoot(dir)
}

export function findRepoRoot(startDir = process.cwd()) {
  return (
    walkUpForRepoRoot(startDir) ||
    walkUpForRepoRoot(REPO_ROOT) ||
    resolveProjectLayoutAt(startDir)?.repoRoot ||
    null
  )
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

export function findRoutesArrayCloseIndex(routerText) {
  const m = routerText.match(/const\s+routes\s*=\s*\[/)
  const arrayStart = m ? m.index + m[0].length - 1 : -1
  if (arrayStart === -1) return routerText.lastIndexOf(']')

  let depth = 0
  for (let i = arrayStart; i < routerText.length; i++) {
    if (routerText[i] === '[') depth++
    else if (routerText[i] === ']') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

export function appendRouteBlocksToRouterText(routerText, blocks) {
  const list = (Array.isArray(blocks) ? blocks : [blocks]).map((b) => String(b).trim()).filter(Boolean)
  if (!list.length) return routerText

  const closeIdx = findRoutesArrayCloseIndex(routerText)
  if (closeIdx === -1) throw new Error('无法在 router/index.js 定位 routes 数组结束位置')

  let before = routerText.slice(0, closeIdx).trimEnd()
  if (!before.endsWith('[') && !before.endsWith(',')) before += ','
  return `${before}\n  ${list.join(',\n  ')}\n${routerText.slice(closeIdx)}`
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

  const closeIdx = findRoutesArrayCloseIndex(text)
  if (closeIdx === -1) throw new Error('router/index.js 结构异常')
  text = appendRouteBlocksToRouterText(text, routerBlock.trim())
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

function subAppsTextHasEntry(text, { folder, appCode, id }) {
  const needles = [
    folder && `folder: '${folder}'`,
    folder && `folder: "${folder}"`,
    appCode && `appCode: '${appCode}'`,
    appCode && `appCode: "${appCode}"`,
    id && `id: '${id}'`,
    id && `id: "${id}"`
  ].filter(Boolean)
  return needles.some((n) => text.includes(n))
}

/** 列出 bundle files/ 在目标仓库中已存在的路径（相对 repoRoot） */
export function listExistingBundleDestPaths(bundleFilesDir, repoRoot) {
  const existing = []
  if (!fs.existsSync(bundleFilesDir)) return existing

  function walk(relDir) {
    const abs = path.join(bundleFilesDir, relDir)
    for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
      const rel = relDir ? `${relDir}/${ent.name}` : ent.name
      const dest = path.join(repoRoot, rel)
      if (ent.isDirectory()) {
        if (fs.existsSync(dest)) existing.push(`${rel}/`)
        walk(rel)
      } else if (fs.existsSync(dest)) {
        existing.push(rel)
      }
    }
  }
  walk('')
  return existing
}

/**
 * 导入前检测是否与仓库中已有子应用冲突
 * @returns {{ hasConflicts: boolean, subApps: boolean, router: boolean, packageScripts: string[], existingPaths: string[] }}
 */
export function detectImportConflicts(repoRoot, manifest, bundleFilesDir) {
  const { appCode, folder, subAppEntry, packageScripts, routerPrefix } = manifest
  const conflicts = {
    hasConflicts: false,
    subApps: false,
    router: false,
    packageScripts: [],
    existingPaths: []
  }

  const subAppsPath = path.join(repoRoot, 'AIEP-WEB/src/config/subApps.js')
  if (fs.existsSync(subAppsPath)) {
    const text = fs.readFileSync(subAppsPath, 'utf8')
    if (subAppsTextHasEntry(text, { folder, appCode, id: subAppEntry?.id })) {
      conflicts.subApps = true
      conflicts.hasConflicts = true
    }
  }

  const routerPath = path.join(repoRoot, 'AIEP-WEB/src/router/index.js')
  if (routerPrefix && fs.existsSync(routerPath)) {
    const routerText = fs.readFileSync(routerPath, 'utf8')
    if (
      routerText.includes(`path: '${routerPrefix}'`) ||
      routerText.includes(`path: "${routerPrefix}"`)
    ) {
      conflicts.router = true
      conflicts.hasConflicts = true
    }
  }

  const pkgPath = path.join(repoRoot, 'package.json')
  if (fs.existsSync(pkgPath) && packageScripts) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
    for (const key of Object.keys(packageScripts)) {
      if (pkg.scripts?.[key]) {
        conflicts.packageScripts.push(key)
        conflicts.hasConflicts = true
      }
    }
  }

  conflicts.existingPaths = listExistingBundleDestPaths(bundleFilesDir, repoRoot)
  if (conflicts.existingPaths.length) {
    conflicts.hasConflicts = true
  }

  return conflicts
}

export function formatImportConflictReport(conflicts, manifest) {
  const { appCode, folder, subAppEntry } = manifest
  const lines = [
    `检测到仓库中已存在同名子应用「${subAppEntry?.name || appCode}」（${appCode} / ${folder}）：`
  ]
  if (conflicts.subApps) lines.push('  · subApps.js 已注册该子应用（应用中心 / 首页指标）')
  if (conflicts.router) lines.push(`  · router/index.js 已有路由 ${manifest.routerPrefix}`)
  if (conflicts.packageScripts.length) {
    lines.push(`  · package.json 已有 scripts: ${conflicts.packageScripts.join(', ')}`)
  }
  if (conflicts.existingPaths.length) {
    const preview = conflicts.existingPaths.slice(0, 8)
    lines.push(`  · 已有 ${conflicts.existingPaths.length} 个文件/目录将被覆盖，例如:`)
    preview.forEach((p) => lines.push(`      ${p}`))
    if (conflicts.existingPaths.length > 8) {
      lines.push(`      … 另有 ${conflicts.existingPaths.length - 8} 项`)
    }
  }
  return lines.join('\n')
}

/**
 * 解析导入模式：full（含注册表）| files-only | cancel | blocked
 * @param {{ skipConflictReport?: boolean }} opts
 */
export async function resolveImportMode(args, conflicts, manifest, opts = {}) {
  if (!conflicts.hasConflicts) {
    return { mode: 'full', force: false }
  }
  if (args.force) return { mode: 'full', force: true }
  if (args.filesOnly) return { mode: 'files-only', force: false }

  const canPrompt = process.stdin.isTTY && !process.env.CI
  if (canPrompt) {
    const readline = await import('readline/promises')
    if (!opts.skipConflictReport) {
      console.log('\n' + formatImportConflictReport(conflicts, manifest))
    }
    console.log('\n请选择：')
    console.log('  1) 覆盖全部（源码 + subApps + router + npm scripts）')
    console.log('  2) 仅更新源码文件（不改注册表与路由）')
    console.log('  3) 取消导入\n')
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    try {
      while (true) {
        const answer = (await rl.question('输入 1 / 2 / 3: ')).trim()
        if (answer === '1') return { mode: 'full', force: true }
        if (answer === '2') return { mode: 'files-only', force: false }
        if (answer === '3') return { mode: 'cancel', force: false }
        console.log('无效输入，请输入 1、2 或 3')
      }
    } finally {
      rl.close()
    }
  }

  return { mode: 'blocked', force: false }
}

export function printImportConflictBlocked(conflicts, manifest, bundleDir, { skipReport = false } = {}) {
  if (!skipReport) {
    console.error('\n' + formatImportConflictReport(conflicts, manifest))
  }
  console.error('\n未写入任何文件。请指定处理方式后重试：')
  console.error(`  覆盖全部: npm run import:sub-app -- --bundle "${bundleDir}" --yes --force`)
  console.error(`  仅更新源码: npm run import:sub-app -- --bundle "${bundleDir}" --yes --files-only`)
  console.error('\n或在终端交互运行（不加 --force/--files-only）以出现选择菜单。')
  const conflictsSummary = {
    ...conflicts,
    existingPaths: conflicts.existingPaths.slice(0, 12),
    existingPathCount: conflicts.existingPaths.length
  }
  console.error(
    JSON.stringify(
      {
        status: 'conflict',
        appCode: manifest.appCode,
        folder: manifest.folder,
        conflicts: conflictsSummary,
        options: { overwrite: '--yes --force', filesOnly: '--yes --files-only' }
      },
      null,
      2
    )
  )
}
