#!/usr/bin/env node
/**
 * 旧版 flat-web（src/ 在根目录）→ 标准 monorepo（AIEP-WEB/）结构迁移
 */
import fs from 'fs'
import path from 'path'

/** 保留在仓库根 scripts/ 的 Skill 同步脚本 */
export const REPO_ROOT_SCRIPT_NAMES = new Set([
  'sync-skills.mjs',
  'sync-cursor-skills.mjs',
  'sync-trae-skills.mjs'
])

/** 根目录 → AIEP-WEB/ 下的相对路径 */
export const FLAT_WEB_TO_MONOREPO_MOVES = [
  ['src', 'src'],
  ['build', 'build'],
  ['dist', 'dist'],
  ['public', 'public'],
  ['vite.config.js', 'vite.config.js'],
  ['index.html', 'index.html'],
  ['vite.config.test.js', 'vite.config.test.js']
]

/** 根目录散落工具 → AIEP-WEB 内路径 */
export const FLAT_WEB_LEGACY_FILE_MOVES = [
  ['install-deps.js', 'src/tools/install-deps.js'],
  ['install-env.ps1', 'src/scripts/install-env.ps1']
]

function mergeDirectory(src, dest, { copyFile, copyDirectory }) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDirectory(s, d)
    else copyFile(s, d)
  }
}

function splitRootScripts(repoRoot, aiepWeb, helpers) {
  const rootScripts = path.join(repoRoot, 'scripts')
  if (!fs.existsSync(rootScripts)) return []

  const webScripts = path.join(aiepWeb, 'scripts')
  fs.mkdirSync(webScripts, { recursive: true })
  const actions = []

  for (const entry of fs.readdirSync(rootScripts, { withFileTypes: true })) {
    if (REPO_ROOT_SCRIPT_NAMES.has(entry.name)) continue
    const s = path.join(rootScripts, entry.name)
    const d = path.join(webScripts, entry.name)
    if (entry.isDirectory()) {
      if (fs.existsSync(d)) {
        mergeDirectory(s, d, helpers)
        fs.rmSync(s, { recursive: true, force: true })
      } else {
        fs.renameSync(s, d)
      }
      actions.push(`scripts/${entry.name}/ → AIEP-WEB/scripts/${entry.name}/`)
    } else if (!fs.existsSync(d)) {
      fs.renameSync(s, d)
      actions.push(`scripts/${entry.name} → AIEP-WEB/scripts/${entry.name}`)
    } else {
      fs.rmSync(s, { force: true })
      actions.push(`scripts/${entry.name}（根目录副本已移除）`)
    }
  }
  return actions
}

function logSubAppsAfterSrcMove(webSrc) {
  const appsDir = path.join(webSrc, 'apps')
  let folders = []
  if (fs.existsSync(appsDir)) {
    folders = fs
      .readdirSync(appsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
  }
  if (folders.length) {
    console.log(`  ✓ src/ → AIEP-WEB/src/（子应用目录已完整迁入: ${folders.join(', ')}）`)
  } else {
    console.log('  ✓ src/ → AIEP-WEB/src/')
  }
}

function migrateRootDocs(repoRoot, aiepWeb, helpers) {
  const rootDocs = path.join(repoRoot, 'docs')
  if (!fs.existsSync(rootDocs)) return null
  const webDocs = path.join(aiepWeb, 'src', 'docs')
  fs.mkdirSync(path.join(aiepWeb, 'src'), { recursive: true })
  if (!fs.existsSync(webDocs)) {
    fs.renameSync(rootDocs, webDocs)
    return 'docs/ → AIEP-WEB/src/docs/'
  }
  mergeDirectory(rootDocs, webDocs, helpers)
  fs.rmSync(rootDocs, { recursive: true, force: true })
  return 'docs/ 已合并入 AIEP-WEB/src/docs/'
}

/** @returns {string[]} 计划动作（dry-run） */
export function planFlatWebToMonorepo(repoRoot) {
  const abs = path.resolve(repoRoot)
  if (fs.existsSync(path.join(abs, 'AIEP-WEB'))) {
    return ['已存在 AIEP-WEB/，跳过结构迁移']
  }
  if (!fs.existsSync(path.join(abs, 'src'))) {
    return ['根目录无 src/，无法迁移']
  }

  const plans = [
    '将创建 AIEP-WEB/ 并迁入以下路径（与主仓库 monorepo 一致）：',
    '  · src/ 整目录迁入（含 src/apps/<子应用>/、src/docs/子应用文档/、subApps.js，不拆不覆盖）',
    '  · build/ 整目录迁入（含 vite.<子应用>.config.js，自建子应用构建配置保留）'
  ]
  for (const [from] of FLAT_WEB_TO_MONOREPO_MOVES) {
    if (from === 'src' || from === 'build') continue
    if (fs.existsSync(path.join(abs, from))) {
      plans.push(`  · ${from} → AIEP-WEB/${from}`)
    }
  }
  for (const [from, to] of FLAT_WEB_LEGACY_FILE_MOVES) {
    if (fs.existsSync(path.join(abs, from))) {
      plans.push(`  · ${from} → AIEP-WEB/${to}`)
    }
  }
  if (fs.existsSync(path.join(abs, 'scripts'))) {
    plans.push('  · scripts/ 中除 sync-skills* 外 → AIEP-WEB/scripts/')
  }
  if (fs.existsSync(path.join(abs, 'docs'))) {
    plans.push('  · docs/ → AIEP-WEB/src/docs/')
  }
  plans.push('  · package.json 脚本将恢复为 cd AIEP-WEB && / node AIEP-WEB/... 形式')
  plans.push('  · 迁入完成后删除根目录残留的 src/、build/、vite.config.js 等（仅删迁余副本）')
  return plans
}

/**
 * 将 flat-web 工程迁入 AIEP-WEB/
 * @returns {boolean} 是否执行了迁移
 */
export function bootstrapFlatWebToMonorepo(repoRoot, helpers) {
  const abs = path.resolve(repoRoot)
  const aiepWeb = path.join(abs, 'AIEP-WEB')

  if (fs.existsSync(aiepWeb)) return false
  if (!fs.existsSync(path.join(abs, 'src'))) return false

  fs.mkdirSync(aiepWeb, { recursive: true })

  for (const [from, to] of FLAT_WEB_TO_MONOREPO_MOVES) {
    const src = path.join(abs, from)
    const dest = path.join(aiepWeb, to)
    if (!fs.existsSync(src)) continue
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.renameSync(src, dest)
      if (from === 'src') {
        logSubAppsAfterSrcMove(dest)
      } else {
        console.log(`  ✓ ${from} → AIEP-WEB/${to}`)
      }
    } else if (fs.statSync(src).isDirectory()) {
      mergeDirectory(src, dest, helpers)
      fs.rmSync(src, { recursive: true, force: true })
      if (from === 'src') {
        logSubAppsAfterSrcMove(dest)
      } else {
        console.log(`  ✓ 合并 ${from}/ → AIEP-WEB/${to}/`)
      }
    } else {
      helpers.copyFile(src, dest)
      fs.rmSync(src, { force: true })
      console.log(`  ✓ 覆盖 ${from} → AIEP-WEB/${to}`)
    }
  }

  const buildDir = path.join(aiepWeb, 'build')
  if (fs.existsSync(buildDir)) {
    const viteConfigs = fs
      .readdirSync(buildDir)
      .filter((n) => /^vite\..+\.config\.js$/.test(n))
      .map((n) => n.replace(/^vite\.(.+)\.config\.js$/, '$1'))
    if (viteConfigs.length) {
      console.log(`  ✓ build/ 子应用 Vite 配置已迁入: ${viteConfigs.join(', ')}`)
    }
  }

  for (const [from, to] of FLAT_WEB_LEGACY_FILE_MOVES) {
    const src = path.join(abs, from)
    const dest = path.join(aiepWeb, to)
    if (!fs.existsSync(src)) continue
    if (fs.existsSync(dest)) {
      fs.rmSync(src, { force: true })
      console.log(`  · 移除根目录遗留 ${from}`)
      continue
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.renameSync(src, dest)
    console.log(`  ✓ ${from} → AIEP-WEB/${to}`)
  }

  const scriptActions = splitRootScripts(abs, aiepWeb, helpers)
  for (const line of scriptActions) console.log(`  ✓ ${line}`)

  const docsAction = migrateRootDocs(abs, aiepWeb, helpers)
  if (docsAction) console.log(`  ✓ ${docsAction}`)

  const purged = purgeRootWebRelics(abs, aiepWeb)
  for (const rel of purged) {
    console.log(`  ✓ 已删除根目录迁余: ${rel}`)
  }

  return true
}

/**
 * 迁入 AIEP-WEB/ 后，删除根目录仍残留的 Web 工程副本（避免资源管理器仍显示 src/ 等）
 * 仅当 AIEP-WEB/ 内已有对应路径时才删除根目录副本。
 * @returns {string[]} 已删除的相对路径（相对项目根）
 */
export function purgeRootWebRelics(repoRoot, aiepWeb = path.join(repoRoot, 'AIEP-WEB')) {
  const abs = path.resolve(repoRoot)
  const web = path.resolve(aiepWeb)
  if (!fs.existsSync(web)) return []

  const removed = []

  const tryRemove = (rootRel, webRel) => {
    const rootPath = path.join(abs, rootRel)
    const webPath = path.join(web, webRel)
    if (!fs.existsSync(rootPath) || !fs.existsSync(webPath)) return
    try {
      fs.rmSync(rootPath, { recursive: true, force: true })
      removed.push(rootRel)
    } catch {
      /* 占用或权限问题时跳过 */
    }
  }

  for (const [from, to] of FLAT_WEB_TO_MONOREPO_MOVES) {
    tryRemove(from, to)
  }

  for (const [from, to] of FLAT_WEB_LEGACY_FILE_MOVES) {
    tryRemove(from, to)
  }

  tryRemove('docs', path.join('src', 'docs'))

  const rootScripts = path.join(abs, 'scripts')
  const webScripts = path.join(web, 'scripts')
  if (fs.existsSync(rootScripts) && fs.existsSync(webScripts)) {
    for (const entry of fs.readdirSync(rootScripts, { withFileTypes: true })) {
      if (REPO_ROOT_SCRIPT_NAMES.has(entry.name)) continue
      const rootEntry = path.join(rootScripts, entry.name)
      const webEntry = path.join(webScripts, entry.name)
      if (!fs.existsSync(webEntry)) continue
      try {
        fs.rmSync(rootEntry, { recursive: true, force: true })
        removed.push(`scripts/${entry.name}`)
      } catch {
        /* skip */
      }
    }
  }

  return removed
}

/** 合并收尾：monorepo 布局下若根目录仍有 flat-web 迁余，一律清理 */
export function cleanupFlatWebRelicsIfMonorepo(repoRoot) {
  const aiepWeb = path.join(repoRoot, 'AIEP-WEB')
  if (!fs.existsSync(path.join(aiepWeb, 'src'))) return []
  return purgeRootWebRelics(repoRoot, aiepWeb)
}
