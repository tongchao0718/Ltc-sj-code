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
 *   7. 成功后：交互确认删除更新包；或 --delete-package / --keep-package
 *   8. 更新后子应用空白：node update.js --repair-routes --yes（从 files/ 补全路由与页面）
 *   8b. 应用中心/首页未显示自建子应用：node update.js --repair-registry --yes
 *   9. 备份已完成但中断：node update.js --yes --reuse-backup backups/vX-<时间戳>
 */
import fs from 'fs'
import path from 'path'
import { execSync, spawn } from 'child_process'
import readline from 'readline'
import { fileURLToPath, pathToFileURL } from 'url'
import {
  OBSOLETE_REL_PATHS,
  OBSOLETE_DOC_PATHS,
  OBSOLETE_BACKUP_STRIP_PATHS,
  OBSOLETE_FILENAMES,
  OBSOLETE_FILENAME_SCAN_DIRS,
  findObsoleteFilenameMatches
} from './update-obsolete-paths.mjs'
import {
  ROOT_DOC_KEEP_AT_ROOT,
  ROOT_LEGACY_DOC_MAPPINGS,
  migrateRootLegacyDocs
} from './update-root-doc-migration.mjs'
import {
  LAYOUT_FLAT_WEB,
  LAYOUT_MONOREPO,
  resolveProjectRoots,
  getWebBackupRelPaths,
  webRelInRepo,
  printRepoRootNotFoundHints
} from './repo-root-detect.mjs'
import {
  bootstrapFlatWebToMonorepo,
  planFlatWebToMonorepo,
  cleanupFlatWebRelicsIfMonorepo
} from './flat-web-to-monorepo.mjs'
import {
  assertNotSandboxedForMutatingUpdate,
  printSandboxBlockedHelp,
  WINDOWS_CRASH_EXIT_HINT
} from './update-sandbox-guard.mjs'

/** 备份 .cursor 时跳过的大体积目录（更新包会重新合并，回滚不依赖字体副本） */
const BACKUP_EXCLUDE_DIR_NAMES = new Set(['canvas-fonts'])

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPDATE_ROOT = __dirname
const FILES_DIR = path.join(UPDATE_ROOT, 'files')

function parseCliArgs() {
  const args = process.argv.slice(2)
  const out = {
    project: null,
    yes: false,
    dryRun: false,
    rollback: null,
    strict: false,
    verifySubApps: false,
    noVerifySubApps: false,
    skipInstall: false,
    keepFlatWeb: false,
    allowSandbox: false,
    deletePackage: false,
    keepPackage: false,
    repairRoutes: false,
    repairRegistry: false,
    reuseBackup: null,
    keepAllBackups: false,
    skipMainAppBuild: false
  }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--project' || a === '-p') out.project = args[++i]
    else if (a === '--reuse-backup') out.reuseBackup = args[++i]
    else if (a.startsWith('--reuse-backup=')) out.reuseBackup = a.slice('--reuse-backup='.length)
    else if (a.startsWith('--project=')) out.project = a.slice('--project='.length)
    else if (a === '--yes' || a === '-y') out.yes = true
    else if (a === '--dry-run') out.dryRun = true
    else if (a === '--strict') out.strict = true
    else if (a === '--rollback') out.rollback = args[++i]
    else if (a === '--verify-sub-apps') out.verifySubApps = true
    else if (a === '--no-verify-sub-apps') out.noVerifySubApps = true
    else if (a === '--skip-install') out.skipInstall = true
    else if (a === '--keep-flat-web') out.keepFlatWeb = true
    else if (a === '--allow-sandbox') out.allowSandbox = true
    else if (a === '--delete-package') out.deletePackage = true
    else if (a === '--keep-package') out.keepPackage = true
    else if (a === '--repair-routes') out.repairRoutes = true
    else if (a === '--repair-registry') out.repairRegistry = true
    else if (a === '--keep-all-backups') out.keepAllBackups = true
    else if (a === '--skip-main-app-build') out.skipMainAppBuild = true
  }
  return out
}

function askYesNo(question, defaultYes = false) {
  if (!process.stdin.isTTY) return defaultYes
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const hint = defaultYes ? '[Y/n]' : '[y/N]'
  return new Promise((resolve) => {
    rl.question(`${question} ${hint} `, (answer) => {
      rl.close()
      const a = String(answer ?? '').trim().toLowerCase()
      if (!a) resolve(defaultYes)
      else resolve(a === 'y' || a === 'yes' || a === '是')
    })
  })
}

async function listVerifiableSubAppItems(repoRoot, webRoot) {
  const subApps = await loadSubAppsFromRepo(webRoot)
  const scripts = loadPackageScripts(repoRoot)
  return listSubAppsToVerify(webRoot, subApps, scripts).filter((p) => p.status === 'verify')
}

async function confirmSubAppVerification(repoRoot, webRoot) {
  const items = await listVerifiableSubAppItems(repoRoot, webRoot)
  if (!items.length) {
    console.log('\n· 无可验证的子应用（无 build 脚本或源码目录缺失）')
    return false
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📦 子应用构建验证（可选）')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`将并行验证 ${items.length} 个子应用：`)
  for (const item of items) {
    console.log(`  · ${item.app.name}（${item.app.folder}）→ npm run ${item.scriptKey}`)
  }
  console.log('（并行执行，耗时取决于机器性能与子应用数量）')

  return askYesNo('是否立即验证子应用构建？', false)
}

async function shouldVerifySubAppsAfterUpdate(cli, repoRoot, webRoot) {
  if (cli.verifySubApps) return true
  if (cli.noVerifySubApps) return false
  if (!process.stdin.isTTY) {
    console.log('\n· 非交互终端，已跳过子应用验证（需验证请加 --verify-sub-apps）')
    return false
  }
  return confirmSubAppVerification(repoRoot, webRoot)
}

function createStepTimer() {
  const start = Date.now()
  let last = start
  return {
    mark(label) {
      const now = Date.now()
      const stepSec = ((now - last) / 1000).toFixed(1)
      const totalSec = ((now - start) / 1000).toFixed(1)
      console.log(`  ⏱ ${label}: ${stepSec}s（累计 ${totalSec}s）`)
      last = now
    },
    totalSec() {
      return ((Date.now() - start) / 1000).toFixed(1)
    }
  }
}

function depsFingerprint(pkg) {
  return JSON.stringify({
    dependencies: pkg.dependencies || {},
    devDependencies: pkg.devDependencies || {}
  })
}

/** 合并后依赖树未变则跳过 npm install（仅 version 等元数据变更时常见） */
function projectDepsUnchanged(repoRoot, backupDir) {
  const readPkg = (p) => {
    if (!fs.existsSync(p)) return null
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  }

  const curRoot = readPkg(path.join(repoRoot, 'package.json'))
  const bakRoot = readPkg(path.join(backupDir, 'package.json'))
  if (!curRoot || !bakRoot) return false
  if (depsFingerprint(curRoot) !== depsFingerprint(bakRoot)) return false

  const curServer = readPkg(path.join(repoRoot, 'AIEP-SERVER', 'package.json'))
  const bakServer = readPkg(path.join(backupDir, 'AIEP-SERVER', 'package.json'))
  if (curServer && bakServer && depsFingerprint(curServer) !== depsFingerprint(bakServer)) return false
  if (curServer && !bakServer) return false
  if (!curServer && bakServer) return false

  return true
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

function findProject() {
  return resolveProjectRoots(collectSearchStarts(), { anchorDir: UPDATE_ROOT })
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

function copyDirectory(src, dest, { excludeDirNames = null } = {}) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.isDirectory() && excludeDirNames?.has(entry.name)) continue
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDirectory(s, d, { excludeDirNames })
    else copyFile(s, d)
  }
}

function createUpdateFileLogger(backupDir, { append: appendMode = false } = {}) {
  const logPath = path.join(backupDir, 'update.log')
  if (appendMode) {
    fs.appendFileSync(
      logPath,
      `\n# update.js 续跑\n# 时间: ${new Date().toISOString()}\n\n`,
      'utf8'
    )
  } else {
    fs.writeFileSync(
      logPath,
      `# update.js 运行日志\n# 开始: ${new Date().toISOString()}\n# 路径: ${logPath}\n\n`,
      'utf8'
    )
  }
  const append = (level, args) => {
    const line = args
      .map((a) => (typeof a === 'string' ? a : a instanceof Error ? a.stack || a.message : JSON.stringify(a)))
      .join(' ')
    try {
      fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${level} ${line}\n`)
    } catch {
      /* 日志写入失败不影响更新 */
    }
  }
  const origLog = console.log.bind(console)
  const origErr = console.error.bind(console)
  const origWarn = console.warn.bind(console)
  console.log = (...args) => {
    origLog(...args)
    append('INFO', args)
  }
  console.error = (...args) => {
    origErr(...args)
    append('ERROR', args)
  }
  console.warn = (...args) => {
    origWarn(...args)
    append('WARN', args)
  }
  return {
    logPath,
    restore() {
      console.log = origLog
      console.error = origErr
      console.warn = origWarn
    }
  }
}

function createUpdateProgressTracker(backupDir, meta) {
  const progressFile = path.join(backupDir, '.update-progress.json')
  const write = (phase, detail = '') => {
    fs.writeFileSync(
      progressFile,
      JSON.stringify(
        { ...meta, phase, detail, at: new Date().toISOString() },
        null,
        2
      ) + '\n'
    )
  }
  return {
    mark: write,
    done() {
      try {
        fs.rmSync(progressFile, { force: true })
      } catch {
        /* ignore */
      }
    }
  }
}

function printCrashRecoveryHints(backupDir, version, timestamp) {
  const manifest = path.join(backupDir, 'update-backup-manifest.json')
  const progress = path.join(backupDir, '.update-progress.json')
  const logFile = path.join(backupDir, 'update.log')
  console.error('\n━━━━━━━━ 异常退出恢复指引 ━━━━━━━━')
  console.error(`${WINDOWS_CRASH_EXIT_HINT}。`)
  if (fs.existsSync(logFile)) {
    console.error(`\n完整终端输出已写入: ${logFile}`)
  } else {
    console.error('\n未找到 update.log：若在 Agent 内执行，终端输出不会保留；请在本机 PowerShell 重跑并查看 backups/.../update.log')
  }
  if (fs.existsSync(progress)) {
    try {
      const p = JSON.parse(fs.readFileSync(progress, 'utf8'))
      console.error(`最后记录阶段: ${p.phase}${p.detail ? `（${p.detail}）` : ''}`)
    } catch {
      /* ignore */
    }
  }
  if (fs.existsSync(manifest)) {
    const backupRel = `backups/${path.basename(backupDir)}`
    console.error('\n备份清单已写入。若崩溃在备份阶段且现网未合并，可续跑：')
    console.error(`  node update.js --yes --reuse-backup ${backupRel}`)
    console.error('\n若现网已部分合并或不确定，建议回滚：')
    console.error(`  node update.js --rollback ${backupRel}`)
    console.error('  npm install && npm run build')
  } else {
    console.error('\n备份可能不完整（无 update-backup-manifest.json），现网通常未改动。')
    console.error('可删除 backups/ 下对应目录后，在本机终端重试 --yes。')
  }
  printSandboxBlockedHelp()
}

function installUpdateCrashGuard(backupDir, version, timestamp) {
  const onCrash = (label, err) => {
    console.error(`\n❌ 更新进程${label}:`, err?.message || err)
    printCrashRecoveryHints(backupDir, version, timestamp)
    process.exit(typeof err?.code === 'number' ? err.code : 1)
  }
  process.once('uncaughtException', (err) => onCrash('未捕获异常', err))
  process.once('unhandledRejection', (err) => onCrash('未处理的 Promise 拒绝', err))
}

function isUpdatePackageDirectory(dir) {
  const root = path.resolve(dir)
  if (!fs.existsSync(root)) return false
  if (!fs.existsSync(path.join(root, 'files'))) return false
  return (
    fs.existsSync(path.join(root, 'update-info.json')) ||
    fs.existsSync(path.join(root, 'update.js'))
  )
}

function collectUpdatePackageDeleteTargets(updateRoot) {
  const dir = path.resolve(updateRoot)
  const zipPath = path.join(path.dirname(dir), `${path.basename(dir)}.zip`)
  const targets = [dir]
  if (fs.existsSync(zipPath)) targets.push(zipPath)
  return targets
}

/** 进程退出后再删（避免 Windows 下无法删除正在执行的 update.js 所在目录） */
function scheduleDeferredDelete(targets) {
  if (!targets.length) return
  if (process.platform === 'win32') {
    const parts = targets.map((t) => {
      const q = `"${t.replace(/"/g, '""')}"`
      return `if exist ${q} (rmdir /s /q ${q} 2>nul & del /f /q ${q} 2>nul)`
    })
    const cmd = `ping 127.0.0.1 -n 3 > nul & ${parts.join(' & ')}`
    spawn('cmd.exe', ['/c', cmd], { detached: true, stdio: 'ignore', windowsHide: true }).unref()
  } else {
    const script = targets.map((t) => `rm -rf "${t.replace(/"/g, '\\"')}"`).join('; ')
    spawn('sh', ['-c', `sleep 2; ${script}`], { detached: true, stdio: 'ignore' }).unref()
  }
}

function deleteUpdatePackageArtifacts(updateRoot) {
  const dir = path.resolve(updateRoot)
  if (!isUpdatePackageDirectory(dir)) {
    return { ok: false, reason: '当前目录不是离线更新包（缺少 files/ 或 update-info.json）' }
  }
  const targets = collectUpdatePackageDeleteTargets(dir)
  scheduleDeferredDelete(targets)
  return { ok: true, deferred: true, targets }
}

async function maybeDeleteUpdatePackageAfterSuccess(cli) {
  if (cli.keepPackage) {
    console.log('\n· 已保留更新包（--keep-package）')
    return
  }
  if (!isUpdatePackageDirectory(UPDATE_ROOT)) return

  const label = path.basename(UPDATE_ROOT)
  const zipHint = `${label}.zip`
  let shouldDelete = cli.deletePackage

  if (!shouldDelete) {
    if (!process.stdin.isTTY) {
      console.log('\n· 非交互终端，已保留更新包（自动删除请加 --delete-package）')
      return
    }
    shouldDelete = await askYesNo(
      `是否删除更新包「${label}」及同目录下的 ${zipHint}（若存在）？`,
      false
    )
  }

  if (!shouldDelete) {
    console.log('\n· 已保留更新包，无需时可手动删除')
    return
  }

  const result = deleteUpdatePackageArtifacts(UPDATE_ROOT)
  if (!result.ok) {
    console.warn(`\n⚠️  未能删除更新包: ${result.reason}`)
    return
  }
  console.log('\n✓ 已确认删除更新包（进程退出后几秒内生效）：')
  for (const t of result.targets) console.log(`  · ${t}`)
}

function routePrefixFromTo(to) {
  const parts = String(to ?? '').split('/').filter(Boolean)
  return parts.length ? `/${parts[0]}` : ''
}

/** subApps 数组之后的辅助函数（与 src/config/subApps.js 保持同步） */
const SUB_APPS_HELPER_TAIL_FALLBACK = `/** 从子应用默认入口解析主应用路由前缀 */
export function routePrefixFromTo(to) {
  const parts = String(to ?? '').split('/').filter(Boolean)
  return parts.length ? \`/\${parts[0]}\` : ''
}

/** 主应用嵌入模式需匹配的路由前缀（App.vue 直接引用，勿手改） */
export function getSubAppEmbedPrefixes() {
  return [...new Set(subApps.map((app) => routePrefixFromTo(app.to)).filter(Boolean))]
}

/** 判断当前路径是否处于子应用嵌入区 */
export function isSubAppEmbedPath(path) {
  return getSubAppEmbedPrefixes().some((prefix) => path.startsWith(prefix))
}

export function getSubAppMetrics() {
  return {
    appCount: subApps.length,
    pageCount: MAIN_PAGE_COUNT + subApps.reduce((sum, app) => sum + app.pageCount, 0)
  }
}
`

function extractSubAppsHelperTail(srcText) {
  const marker = 'export function routePrefixFromTo'
  const idx = srcText.indexOf(marker)
  if (idx === -1) return SUB_APPS_HELPER_TAIL_FALLBACK
  return srcText.slice(idx).trimStart() + '\n'
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

/** 定位顶层 routes 数组的闭合 ]（避免误命中 children 内的 ]） */
function findRoutesArrayCloseIndex(routerText) {
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

/** 在 routes 数组末尾追加一个或多个顶层路由块 */
function appendRouteBlocksToRouterText(routerText, blocks) {
  const list = (Array.isArray(blocks) ? blocks : [blocks]).map((b) => String(b).trim()).filter(Boolean)
  if (!list.length) return routerText

  const closeIdx = findRoutesArrayCloseIndex(routerText)
  if (closeIdx === -1) {
    throw new Error('无法在 router/index.js 定位 routes 数组结束位置')
  }

  let before = routerText.slice(0, closeIdx).trimEnd()
  if (!before.endsWith('[') && !before.endsWith(',')) {
    before += ','
  }
  return `${before}\n  ${list.join(',\n  ')}\n${routerText.slice(closeIdx)}`
}

function removeTopLevelRouteBlock(routerText, prefix) {
  const needles = [`path: '${prefix}'`, `path: "${prefix}"`]
  let anchor = -1
  for (const n of needles) {
    const idx = routerText.indexOf(n)
    if (idx !== -1) {
      anchor = idx
      break
    }
  }
  if (anchor === -1) return { text: routerText, removed: false }

  const startIdx = routerText.lastIndexOf('{', anchor)
  if (startIdx === -1) return { text: routerText, removed: false }

  let depth = 0
  let endIdx = -1
  for (let i = startIdx; i < routerText.length; i++) {
    if (routerText[i] === '{') depth++
    else if (routerText[i] === '}') {
      depth--
      if (depth === 0) {
        endIdx = i
        break
      }
    }
  }
  if (endIdx === -1) return { text: routerText, removed: false }

  let endPos = endIdx + 1
  while (endPos < routerText.length && /\s/.test(routerText[endPos])) endPos++

  let startPos = startIdx
  while (startPos > 0 && /\s/.test(routerText[startPos - 1])) startPos--

  // 只删一侧逗号，避免 About }, sample }, next 去掉两侧逗号后变成 }{ 
  if (startPos > 0 && routerText[startPos - 1] === ',') {
    startPos--
    while (startPos > 0 && /\s/.test(routerText[startPos - 1])) startPos--
  } else if (routerText[endPos] === ',') {
    endPos++
    while (endPos < routerText.length && /\s/.test(routerText[endPos])) endPos++
  }

  let text = routerText.slice(0, startPos) + routerText.slice(endPos)
  text = text.replace(/\}(\s*)\{/g, '},$1{')
  return { text, removed: true }
}

/** 用更新包中的框架子应用顶层路由块覆盖现网（保留自建子应用路由） */
function syncFrameworkRoutesFromPackage(webRoot, frameworkMeta, userPrefixes) {
  const routerDest = path.join(webRoot, 'src/router/index.js')
  const routerSrc = path.join(FILES_DIR, 'AIEP-WEB', 'src/router/index.js')
  if (!fs.existsSync(routerSrc) || !fs.existsSync(routerDest)) return []

  const userSet = new Set(userPrefixes || [])
  let dest = fs.readFileSync(routerDest, 'utf8')
  const pkg = fs.readFileSync(routerSrc, 'utf8')
  const synced = []

  for (const folder of frameworkMeta.frameworkAppFolders || []) {
    const prefix = `/${folder}`
    if (userSet.has(prefix)) continue
    const pkgBlock = extractTopLevelRouteByPrefix(pkg, prefix)
    if (!pkgBlock) continue
    dest = removeTopLevelRouteBlock(dest, prefix).text
    dest = appendRouteBlocksToRouterText(dest, pkgBlock)
    synced.push(prefix)
  }

  if (synced.length) fs.writeFileSync(routerDest, dest)
  return synced
}

function ensureFrameworkAppsFromPackage(webRoot, frameworkAppFolders) {
  const synced = []
  for (const folder of frameworkAppFolders || []) {
    const src = path.join(FILES_DIR, 'AIEP-WEB', 'src/apps', folder)
    const dest = path.join(webRoot, 'src/apps', folder)
    if (!fs.existsSync(src)) continue
    mergeDirectory(src, dest)
    synced.push(folder)
  }
  return synced
}

function collectRouteFiles(webRoot, frameworkAppFolders) {
  const files = [path.join(webRoot, 'src/router/index.js')]
  for (const folder of frameworkAppFolders || []) {
    const mainJs = path.join(webRoot, 'src/apps', folder, 'main.js')
    if (fs.existsSync(mainJs)) files.push(mainJs)
  }
  return files
}

/** 从更新包 files/ 补全 router 引用但磁盘缺失的 .vue */
function restoreMissingRouterComponentsFromPackage(webRoot, frameworkAppFolders) {
  const restored = []
  for (const routeFile of collectRouteFiles(webRoot, frameworkAppFolders)) {
    if (!fs.existsSync(routeFile)) continue
    const text = fs.readFileSync(routeFile, 'utf8')
    for (const match of text.matchAll(/import\s*\(\s*['"]([^'"]+\.vue)['"]\s*\)/g)) {
      const destFull = resolveRouteImportPath(routeFile, match[1])
      if (fs.existsSync(destFull)) continue
      const relWithinWeb = path.relative(webRoot, destFull).replace(/\\/g, '/')
      const pkgFull = path.join(FILES_DIR, 'AIEP-WEB', relWithinWeb)
      if (!fs.existsSync(pkgFull)) continue
      copyFile(pkgFull, destFull)
      restored.push(relWithinWeb)
    }
  }
  return [...new Set(restored)]
}

function assertRouterComponentsResolvable(webRoot, frameworkAppFolders) {
  const missing = []
  for (const routeFile of collectRouteFiles(webRoot, frameworkAppFolders)) {
    if (!fs.existsSync(routeFile)) continue
    const text = fs.readFileSync(routeFile, 'utf8')
    for (const match of text.matchAll(/import\s*\(\s*['"]([^'"]+\.vue)['"]\s*\)/g)) {
      const destFull = resolveRouteImportPath(routeFile, match[1])
      if (!fs.existsSync(destFull)) {
        missing.push(path.relative(webRoot, destFull).replace(/\\/g, '/'))
      }
    }
  }
  if (!missing.length) return

  const err = new Error(
    `路由引用的页面文件缺失（${missing.length} 个），子应用将显示空白页:\n${missing
      .slice(0, 12)
      .map((m) => `  - ${m}`)
      .join('\n')}${missing.length > 12 ? `\n  - … 另有 ${missing.length - 12} 个` : ''}`
  )
  err.code = 'MAIN_APP_ROUTE_COMPONENT_MISSING'
  throw err
}

async function getUserOnlyPrefixesFromSubApps(subAppsPath, frameworkAppFolders) {
  if (!fs.existsSync(subAppsPath)) return []
  const mod = await import(pathToFileURL(subAppsPath) + '?t=' + Date.now())
  return (mod.subApps || [])
    .filter((a) => !frameworkAppFolders.includes(a.folder))
    .map((a) => routePrefixFromTo(a.to))
    .filter(Boolean)
}

function listUserSubAppFolders(webRoot, frameworkAppFolders) {
  const appsDir = path.join(webRoot, 'src/apps')
  if (!fs.existsSync(appsDir)) return []
  const frameworkSet = new Set(frameworkAppFolders || [])
  return fs
    .readdirSync(appsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !frameworkSet.has(e.name))
    .map((e) => e.name)
}

/** 从 router 文本中解析自建子应用顶层路由前缀（兼容 1.x 无 subApps.js 的旧工程） */
function discoverUserPrefixesFromRouterText(routerText, frameworkAppFolders, userFolders) {
  if (!routerText?.trim()) return []
  const frameworkSet = new Set(frameworkAppFolders || [])
  const prefixes = new Set()

  for (const folder of userFolders || []) {
    const prefix = `/${folder}`
    if (extractTopLevelRouteByPrefix(routerText, prefix)) prefixes.add(prefix)
  }

  for (const m of routerText.matchAll(/apps\/([^/'"]+)/g)) {
    const folder = m[1]
    if (frameworkSet.has(folder)) continue
    const idx = m.index
    const blockStart = routerText.lastIndexOf('{', idx)
    if (blockStart === -1) continue
    const endIdx = findMatchingBrace(routerText, blockStart)
    if (endIdx === -1 || endIdx < idx) continue
    const block = routerText.slice(blockStart, endIdx + 1)
    const pathMatch = block.match(/path:\s*['"](\/[^'"]+)['"]/)
    if (pathMatch) prefixes.add(pathMatch[1])
  }

  return [...prefixes]
}

/** 注册表 + apps 目录 + router（含备份）综合推断自建子应用路由前缀 */
async function resolveUserSubAppPrefixes(
  webRoot,
  frameworkAppFolders,
  { subAppsPath = null, routerBackupPath = null } = {}
) {
  const prefixes = new Set()
  const subAppsPathResolved = subAppsPath || path.join(webRoot, 'src/config/subApps.js')
  for (const p of await getUserOnlyPrefixesFromSubApps(subAppsPathResolved, frameworkAppFolders)) {
    prefixes.add(p)
  }

  const userFolders = listUserSubAppFolders(webRoot, frameworkAppFolders)
  const routerTexts = []
  const routerPath = path.join(webRoot, 'src/router/index.js')
  if (fs.existsSync(routerPath)) routerTexts.push(fs.readFileSync(routerPath, 'utf8'))
  if (routerBackupPath && fs.existsSync(routerBackupPath)) {
    routerTexts.push(fs.readFileSync(routerBackupPath, 'utf8'))
  }
  for (const text of routerTexts) {
    for (const p of discoverUserPrefixesFromRouterText(text, frameworkAppFolders, userFolders)) {
      prefixes.add(p)
    }
  }
  return [...prefixes]
}

function humanizeSubAppFolderName(folder) {
  return folder
    .replace(/-app$/i, '')
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function inferDefaultEntryTo(routeBlock, prefix) {
  for (const m of routeBlock.matchAll(/redirect:\s*['"]([^'"]+)['"]/g)) {
    const target = m[1]
    if (target === prefix || target.startsWith(`${prefix}/`)) return target
  }
  for (const m of routeBlock.matchAll(
    /path:\s*['"]([^'"]*)['"][\s\S]*?component:\s*\(\)\s*=>\s*import/g
  )) {
    const child = m[1]
    if (!child || child.includes(':') || child.includes('*')) continue
    return child ? `${prefix}/${child}`.replace(/\/+/g, '/') : prefix
  }
  return prefix
}

function buildSubAppEntryFromRoute(folder, routerText) {
  const prefix = `/${folder}`
  const routeBlock = extractTopLevelRouteByPrefix(routerText, prefix)
  if (!routeBlock) return null
  const to = inferDefaultEntryTo(routeBlock, prefix)
  const pageCount = countSubAppRoutablePages(routerText, prefix) ?? 1
  const name = humanizeSubAppFolderName(folder)
  return {
    id: folder.replace(/-app$/i, '') || folder,
    appCode: folder,
    name,
    folder,
    designSystem: 'arco',
    desc: `${name}（更新后自动登记，可在 subApps.js 中完善描述）`,
    icon: '📦',
    to,
    tag: '已接入',
    tagClass: 'tag-success',
    pageCount
  }
}

function writeSubAppsRegistryFile(destPath, { mainCount, subApps, helperTailSource }) {
  const helperTail = helperTailSource
    ? extractSubAppsHelperTail(fs.readFileSync(helperTailSource, 'utf8'))
    : SUB_APPS_HELPER_TAIL_FALLBACK
  const body = `/**
 * 子应用注册表（应用中心 + 首页指标 + 主应用嵌入前缀 — 单一真值）
 */
export const MAIN_PAGE_COUNT = ${mainCount}

export const subApps = ${JSON.stringify(subApps, null, 2)}

${helperTail}`
  fs.writeFileSync(destPath, body)
}

/** 将 src/apps 中已存在路由但未登记的自建子应用写入 subApps.js */
function autoRegisterDiscoveredUserApps(webRoot, subAppsList, frameworkAppFolders, routerText) {
  if (!routerText?.trim()) return { subApps: subAppsList, added: [] }

  const registeredFolders = new Set(subAppsList.map((a) => a.folder))
  const added = []
  const merged = [...subAppsList]

  for (const folder of listUserSubAppFolders(webRoot, frameworkAppFolders)) {
    if (registeredFolders.has(folder)) continue
    const entry = buildSubAppEntryFromRoute(folder, routerText)
    if (!entry) continue
    merged.push(entry)
    registeredFolders.add(folder)
    added.push(folder)
  }

  return { subApps: merged, added }
}

/** 自动保留自建子应用的路由块与嵌入前缀（消除 §5.2 手工合并） */
function preserveUserSubAppIntegration(webRoot, backupDir, userPrefixes, layout, frameworkAppFolders = []) {
  const routerDest = path.join(webRoot, 'src/router/index.js')
  const routerBackup = path.join(backupDir, webRelInRepo(layout, 'src/router/index.js'))
  const appDest = path.join(webRoot, 'src', 'App.vue')
  const appBackup = path.join(backupDir, webRelInRepo(layout, 'src/App.vue'))

  const prefixSet = new Set(userPrefixes || [])
  if (fs.existsSync(routerBackup)) {
    const backupText = fs.readFileSync(routerBackup, 'utf8')
    const userFolders = listUserSubAppFolders(webRoot, frameworkAppFolders)
    for (const p of discoverUserPrefixesFromRouterText(backupText, frameworkAppFolders, userFolders)) {
      prefixSet.add(p)
    }
  }
  const allPrefixes = [...prefixSet]
  if (!allPrefixes.length) return

  if (fs.existsSync(routerBackup) && fs.existsSync(routerDest)) {
    let dest = fs.readFileSync(routerDest, 'utf8')
    const backup = fs.readFileSync(routerBackup, 'utf8')
    const blocks = []
    for (const prefix of allPrefixes) {
      if (dest.includes(`path: '${prefix}'`) || dest.includes(`path: "${prefix}"`)) continue
      const block = extractTopLevelRouteByPrefix(backup, prefix)
      if (block) blocks.push(block)
    }
    if (blocks.length) {
      dest = appendRouteBlocksToRouterText(dest, blocks)
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

  if (fs.existsSync(manifestPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
      if (meta.layout === LAYOUT_FLAT_WEB) {
        const aiepWeb = path.join(repoRoot, 'AIEP-WEB')
        if (fs.existsSync(aiepWeb)) {
          fs.rmSync(aiepWeb, { recursive: true, force: true })
          console.log('  ↩ 已移除更新产生的 AIEP-WEB/（恢复 flat-web 布局）')
        }
      }
    } catch {
      /* ignore */
    }
  }

  console.log('✅ 已回滚至更新前状态')
  purgeObsoleteFiles(repoRoot, OBSOLETE_DOC_PATHS)
  return true
}

function writeBackupManifest(backupDir, meta) {
  fs.writeFileSync(
    path.join(backupDir, 'update-backup-manifest.json'),
    JSON.stringify(meta, null, 2) + '\n'
  )
}

/** 更新成功后默认只保留当次备份，删除 backups/v*-<时间戳>/ 历史副本 */
function pruneOldBackups(repoRoot, keepBackupDir) {
  const backupsRoot = path.join(repoRoot, 'backups')
  if (!fs.existsSync(backupsRoot)) return []

  const keepResolved = path.resolve(keepBackupDir)
  const removed = []

  for (const entry of fs.readdirSync(backupsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    if (!/^v[\d.]+-\d{4}-\d{2}-\d{2}T/.test(entry.name)) continue
    const dir = path.join(backupsRoot, entry.name)
    if (path.resolve(dir) === keepResolved) continue
    fs.rmSync(dir, { recursive: true, force: true })
    removed.push(entry.name)
  }

  return removed
}

function resolveObsoletePaths(meta) {
  const fromMeta = meta.obsoletePaths
  if (Array.isArray(fromMeta) && fromMeta.length) return fromMeta
  return OBSOLETE_REL_PATHS
}

function safeUnlinkIfFile(full, rel) {
  if (!fs.existsSync(full)) return 'missing'
  try {
    const stat = fs.lstatSync(full)
    if (!stat.isFile()) {
      console.warn(`  · 跳过非文件 ${rel}`)
      return 'skipped'
    }
    fs.unlinkSync(full)
    return 'removed'
  } catch (e) {
    console.warn(`  · 备份副本未删除 ${rel}: ${e.message}`)
    return 'failed'
  }
}

/** 从备份中剔除 1.0 废止文档（仅 OBSOLETE_BACKUP_STRIP_PATHS；不用 rmSync 整树） */
function stripObsoleteFromBackup(backupDir) {
  let stripped = 0
  let skipped = 0
  for (const rel of OBSOLETE_BACKUP_STRIP_PATHS) {
    const result = safeUnlinkIfFile(path.join(backupDir, rel), rel)
    if (result === 'removed') stripped++
    else if (result === 'failed' || result === 'skipped') skipped++
  }
  if (stripped) {
    console.log(`  · 备份已剔除 ${stripped} 个 1.0 废止文档（回滚时不再恢复）`)
  }
  if (skipped) {
    console.warn(`  · ${skipped} 个废止文档未能从备份副本删除（不影响继续更新）`)
  }
  if (!stripped && !skipped) {
    console.log('  · 备份副本无 1.0 废止文档需剔除')
  }
}

/** 更新成功后删除 1.0 / 过渡版废弃文档（存在则删，不报错） */
function purgeObsoleteFiles(repoRoot, obsoletePaths) {
  let removed = 0
  const seen = new Set()

  for (const rel of obsoletePaths) {
    const full = path.join(repoRoot, rel)
    if (!fs.existsSync(full)) continue
    fs.rmSync(full, { force: true })
    seen.add(rel)
    console.log(`  ✓ 删除废弃文档: ${rel}`)
    removed++
  }

  for (const dir of OBSOLETE_FILENAME_SCAN_DIRS) {
    for (const name of OBSOLETE_FILENAMES) {
      const rel = dir ? `${dir}/${name}` : name
      if (seen.has(rel)) continue
      const full = path.join(repoRoot, rel)
      if (!fs.existsSync(full)) continue
      fs.rmSync(full, { force: true })
      seen.add(rel)
      console.log(`  ✓ 删除废弃文档: ${rel}`)
      removed++
    }
  }

  for (const rel of findObsoleteFilenameMatches(repoRoot, fs, path)) {
    if (seen.has(rel)) continue
    const full = path.join(repoRoot, rel)
    if (!fs.existsSync(full)) continue
    fs.rmSync(full, { force: true })
    seen.add(rel)
    console.log(`  ✓ 删除废弃文档（扫描）: ${rel}`)
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

function appendNodeOption(existing, option) {
  const parts = String(existing || '')
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (!parts.includes(option)) parts.push(option)
  return parts.join(' ')
}

function isWindowsProcessCrashExit(code) {
  return code === 3221226505 || code === -1073740791 || code === -1073741819
}

function looksLikeBuildProcessCrash(output) {
  const text = String(output || '')
  return /modules transformed/i.test(text) && !/built in/i.test(text)
}

function runCommandCapture(cmd, cwd, env = {}, { shell = false } = {}) {
  const mergedEnv = { ...process.env, ...env }
  try {
    const stdout = execSync(cmd, {
      cwd,
      encoding: 'utf8',
      stdio: ['inherit', 'pipe', 'pipe'],
      env: mergedEnv,
      maxBuffer: 32 * 1024 * 1024,
      shell
    })
    return { ok: true, output: stdout || '', exitCode: 0 }
  } catch (e) {
    const stdout = e.stdout?.toString() || ''
    const stderr = e.stderr?.toString() || ''
    return {
      ok: false,
      message: e.message,
      output: [stdout, stderr].filter(Boolean).join('\n'),
      exitCode: typeof e.status === 'number' ? e.status : null
    }
  }
}

function runCommandCaptureAsync(cmd, cwd) {
  return new Promise((resolve) => {
    const isWin = process.platform === 'win32'
    const child = spawn(isWin ? 'cmd.exe' : 'sh', isWin ? ['/c', cmd] : ['-c', cmd], {
      cwd,
      env: process.env
    })
    let stdout = ''
    let stderr = ''
    child.stdout?.on('data', (d) => {
      stdout += d.toString()
    })
    child.stderr?.on('data', (d) => {
      stderr += d.toString()
    })
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ ok: true, output: stdout })
      } else {
        resolve({
          ok: false,
          message: `exit ${code}`,
          output: [stdout, stderr].filter(Boolean).join('\n')
        })
      }
    })
    child.on('error', (e) => {
      resolve({ ok: false, message: e.message, output: stderr })
    })
  })
}

function loadPackageScripts(repoRoot) {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'))
  return pkg.scripts || {}
}

async function loadSubAppsFromRepo(webRoot) {
  const subAppsPath = path.join(webRoot, 'src/config/subApps.js')
  if (!fs.existsSync(subAppsPath)) return []
  const mod = await import(pathToFileURL(subAppsPath) + '?t=' + Date.now())
  return mod.subApps || []
}

function listSubAppsToVerify(webRoot, subApps, scripts) {
  const items = []
  for (const app of subApps) {
    const scriptKey = `build:${app.folder}`
    const appSrc = path.join(webRoot, 'src/apps', app.folder)
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

/** 主应用 build：monorepo 下直跑 vite，减少 bat/cmd 嵌套导致 0xC0000409 */
function runMainAppBuildVerify(repoRoot, webRoot) {
  const buildEnv = {
    NODE_OPTIONS: appendNodeOption(process.env.NODE_OPTIONS, '--max-old-space-size=8192')
  }
  const useShell = process.platform === 'win32'
  if (fs.existsSync(path.join(repoRoot, 'AIEP-WEB'))) {
    return runCommandCapture('npx vite build --config vite.config.js', webRoot, buildEnv, {
      shell: useShell
    })
  }
  return runCommandCapture('npm run build', repoRoot, buildEnv, { shell: useShell })
}

/** 主应用验证：失败抛错 → 触发回滚 */
function verifyMainAppAfterUpdate(repoRoot, webRoot, { skipBuild = false } = {}) {
  const pkgDest = path.join(repoRoot, 'package.json')
  const pkgSrc = path.join(FILES_DIR, 'package.json')
  if (fs.existsSync(path.join(repoRoot, 'AIEP-WEB')) && fs.existsSync(pkgSrc)) {
    if (syncCoreMonorepoScripts(pkgDest, pkgSrc)) {
      console.log('  ✓ 已校正 package.json 为 monorepo 构建脚本（cd AIEP-WEB && vite ...）')
    }
  }

  console.log('\n━━ 主应用验证（异常将阻断更新并回滚）━━')

  console.log('\n[1/2] 注册表与子应用入口校验...')
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
  console.log('  ✓ 注册表与子应用入口校验通过')

  if (skipBuild) {
    console.log('\n[2/2] 主应用构建...（已跳过 --skip-main-app-build）')
    console.log('  · 请确认已手动执行 npm run build 且 AIEP-WEB/dist/index.html 存在')
    const indexHtml = path.join(webRoot, 'dist', 'index.html')
    if (!fs.existsSync(indexHtml)) {
      const err = new Error(
        `跳过构建校验但产物缺失: ${path.relative(repoRoot, indexHtml).replace(/\\/g, '/')}\n请先手动 npm run build`
      )
      err.code = 'MAIN_APP_ARTIFACT_MISSING'
      throw err
    }
    console.log(`  ✓ 已检测到构建产物（${path.relative(repoRoot, indexHtml).replace(/\\/g, '/')}）`)
    return
  }

  console.log('\n[2/2] 主应用构建...')
  const build = runMainAppBuildVerify(repoRoot, webRoot)
  if (!build.ok) {
    let detail = tailOutput(build.output, 40)
    const crashed =
      isWindowsProcessCrashExit(build.exitCode) || looksLikeBuildProcessCrash(build.output)
    if (crashed) {
      detail += `\n\n${WINDOWS_CRASH_EXIT_HINT}`
      detail +=
        '\n构建在「rendering chunks / 压缩」阶段被系统强杀较常见（大 chunk + 杀毒/内存）。'
      detail +=
        '\n请在项目根 CMD 手动执行：set NODE_OPTIONS=--max-old-space-size=8192 && npm run build'
      detail +=
        '\n若手动 build 通过，可续跑：node update.js --yes --reuse-backup backups/v*-<时间戳> --skip-install --skip-main-app-build'
    }
    const err = new Error(`主应用构建失败\n${detail}`)
    err.code = 'MAIN_APP_BUILD_FAILED'
    err.buildCrashed = crashed
    throw err
  }

  const indexHtml = path.join(webRoot, 'dist', 'index.html')
  if (!fs.existsSync(indexHtml)) {
    const rel = path.relative(repoRoot, indexHtml).replace(/\\/g, '/')
    const err = new Error(`主应用构建产物缺失: ${rel}`)
    err.code = 'MAIN_APP_ARTIFACT_MISSING'
    throw err
  }
  console.log(`  ✓ 主应用构建通过（${path.relative(repoRoot, indexHtml).replace(/\\/g, '/')} 已生成）`)
}

/** 子应用验证：异常仅提示，不触发回滚（默认跳过，见 --verify-sub-apps） */
async function verifySubAppsAfterUpdate(repoRoot, webRoot) {
  const subApps = await loadSubAppsFromRepo(webRoot)
  const scripts = loadPackageScripts(repoRoot)
  const plan = listSubAppsToVerify(webRoot, subApps, scripts)

  console.log('\n━━ 子应用构建验证（异常仅提示，不阻断更新）━━')

  const result = { successes: [], failures: [], skipped: [] }
  const toVerify = []

  for (const item of plan) {
    const { app } = item
    if (item.status === 'skip') {
      result.skipped.push({ app, reason: item.reason })
      console.log(`  · 跳过 ${app.name}（${app.folder}）: ${item.reason}`)
      continue
    }
    toVerify.push(item)
  }

  if (!toVerify.length) return result

  const runOne = async (item) => {
    const { app } = item
    console.log(`  构建 ${app.name}（${app.folder}）...`)
    const build = await runCommandCaptureAsync(`npm run ${item.scriptKey}`, repoRoot)
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

  if (toVerify.length > 1) {
    console.log(`  并行构建 ${toVerify.length} 个子应用...`)
    await Promise.all(toVerify.map((item) => runOne(item)))
  } else {
    await runOne(toVerify[0])
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
  } else if (code === 'MAIN_APP_ROUTE_COMPONENT_MISSING') {
    console.error(
      '\n处理建议: 路由已合并但页面 .vue 未落地，子应用会空白。请在项目根执行：'
    )
    console.error('  node <更新包目录>/update.js --repair-routes --yes')
    console.error('或从更新包 files/AIEP-WEB/src/apps/ 手动复制缺失页面后 npm run build')
  } else if (code === 'MAIN_APP_SUBAPP_BLANK_RISK') {
    console.error('\n处理建议: 子应用入口与 router/页面未对齐，请执行：')
    console.error('  node <更新包目录>/update.js --repair-routes --yes')
    console.error('  npm run validate:sub-app-registry')
  } else if (code === 'MAIN_APP_BUILD_FAILED' || code === 'MAIN_APP_ARTIFACT_MISSING') {
    console.error('\n处理建议: 检查 Node >= 18、依赖是否完整；本地执行 npm run build 复现')
    if (err?.buildCrashed) {
      console.error('  若为 0xC0000409 / 3221226505：多为构建阶段进程被强杀，非语法错误')
      console.error('  手动验证: set NODE_OPTIONS=--max-old-space-size=8192 && npm run build')
      console.error(
        '  通过后续跑: node update.js --yes --reuse-backup backups/v*-<时间戳> --skip-install --skip-main-app-build'
      )
    }
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

function findMatchingBrace(text, startIdx) {
  let depth = 0
  for (let i = startIdx; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

/** 定位包含 index 且含 path + component 的最内层路由对象 */
function extractRouteBlockContaining(text, index) {
  let pos = index
  while (pos > 0) {
    const brace = text.lastIndexOf('{', pos)
    if (brace === -1) return null
    const end = findMatchingBrace(text, brace)
    if (end === -1 || end < index) {
      pos = brace - 1
      continue
    }
    const slice = text.slice(brace, end + 1)
    if (/path\s*:/.test(slice) && /component\s*:/.test(slice)) {
      let endPos = end + 1
      while (endPos < text.length && /[\s,]/.test(text[endPos])) endPos++
      return { start: brace, end: endPos, slice }
    }
    pos = brace - 1
  }
  return null
}

function resolveRouteImportPath(routeFilePath, importPath) {
  return path.normalize(path.join(path.dirname(routeFilePath), importPath))
}

/**
 * 移除路由文件中指向不存在 .vue 文件的 route 块（避免更新后 router 已合并但页面未落地导致 build 失败）
 */
function pruneMissingComponentRoutesInFile(routeFilePath) {
  if (!fs.existsSync(routeFilePath)) return []
  let text = fs.readFileSync(routeFilePath, 'utf8')
  const importRe = /import\s*\(\s*['"]([^'"]+\.vue)['"]\s*\)/g
  const pending = []

  for (const match of text.matchAll(importRe)) {
    const importPath = match[1]
    const full = resolveRouteImportPath(routeFilePath, importPath)
    if (fs.existsSync(full)) continue

    const block = extractRouteBlockContaining(text, match.index)
    if (!block) {
      pending.push({ importPath, note: '未定位路由块，请手动检查' })
      continue
    }
    pending.push({
      importPath,
      routePath: block.slice.match(/path\s*:\s*['"]([^'"]+)['"]/)?.[1],
      start: block.start,
      end: block.end
    })
  }

  const toRemove = pending.filter((p) => p.start != null).sort((a, b) => b.start - a.start)
  for (const r of toRemove) {
    text = text.slice(0, r.start) + text.slice(r.end)
  }
  if (toRemove.length) fs.writeFileSync(routeFilePath, text)

  return pending.map(({ start, end, ...rest }) => rest)
}

function pruneRouterFilesWithMissingComponents(webRoot, frameworkAppFolders = []) {
  const pruned = []
  const mainRouter = path.join(webRoot, 'src/router/index.js')
  for (const item of pruneMissingComponentRoutesInFile(mainRouter)) {
    pruned.push({ file: path.relative(webRoot, mainRouter).replace(/\\/g, '/'), ...item })
  }
  for (const folder of frameworkAppFolders) {
    const mainJs = path.join(webRoot, 'src/apps', folder, 'main.js')
    for (const item of pruneMissingComponentRoutesInFile(mainJs)) {
      pruned.push({ file: path.relative(webRoot, mainJs).replace(/\\/g, '/'), ...item })
    }
  }
  return pruned
}

/** 更新后子应用空白：从 files/ 补全框架子应用源码、路由块与缺失 .vue */
async function runRouterRepair(webRoot, frameworkMeta, userPrefixes) {
  const frameworkFolders = frameworkMeta.frameworkAppFolders || []
  console.log('\n━━ 路由与页面修复（--repair-routes）━━')

  const syncedApps = ensureFrameworkAppsFromPackage(webRoot, frameworkFolders)
  if (syncedApps.length) {
    console.log(`  ✓ 同步框架子应用源码（${syncedApps.join(', ')}）`)
  } else {
    console.log('  · 无框架子应用目录需同步')
  }

  const syncedRoutes = syncFrameworkRoutesFromPackage(webRoot, frameworkMeta, userPrefixes)
  if (syncedRoutes.length) {
    console.log(`  ✓ 同步框架子应用路由块（${syncedRoutes.join(', ')}）`)
  } else {
    console.log('  · 无框架路由块需同步')
  }

  const restoredComponents = restoreMissingRouterComponentsFromPackage(webRoot, frameworkFolders)
  if (restoredComponents.length) {
    console.log(`  ✓ 从更新包补全缺失页面（${restoredComponents.length} 个）`)
    for (const rel of restoredComponents.slice(0, 8)) console.log(`    · ${rel}`)
    if (restoredComponents.length > 8) {
      console.log(`    · … 另有 ${restoredComponents.length - 8} 个`)
    }
  } else {
    console.log('  · 未发现需补全的 .vue')
  }

  const prunedRoutes = pruneRouterFilesWithMissingComponents(webRoot, frameworkFolders)
  if (prunedRoutes.length) {
    console.log('\n  修正路由：移除更新包中也不存在的页面路由')
    for (const r of prunedRoutes) {
      if (r.note) console.warn(`  ⚠ ${r.file}: ${r.importPath} — ${r.note}`)
      else console.log(`  ✓ ${r.file}: 已移除 ${r.routePath || r.importPath}`)
    }
  }

  assertRouterComponentsResolvable(webRoot, frameworkFolders)
  console.log('  ✓ 路由引用的页面文件均已存在')

  const subAppsSrc = path.join(FILES_DIR, 'AIEP-WEB', 'src/config/subApps.js')
  await syncSubAppsRegistryAfterRoutes(webRoot, subAppsSrc, frameworkFolders)
  console.log('  ✓ 同步 subApps.js（应用中心 / 首页指标 / 嵌入前缀）')
  await assertSubAppsRegistryHealthy(webRoot)
}

/** 应用中心 / 首页指标与 subApps.js 对齐（可从备份恢复自建路由并自动登记） */
async function runRegistryRepair(webRoot, frameworkMeta, { backupDir = null, layout = null } = {}) {
  const frameworkFolders = frameworkMeta.frameworkAppFolders || []
  console.log('\n━━ 子应用注册表修复（--repair-registry）━━')

  let userPrefixes = await resolveUserSubAppPrefixes(webRoot, frameworkFolders, {
    subAppsPath: path.join(webRoot, 'src/config/subApps.js')
  })
  if (backupDir && layout) {
    preserveUserSubAppIntegration(webRoot, backupDir, userPrefixes, layout, frameworkFolders)
    userPrefixes = await resolveUserSubAppPrefixes(webRoot, frameworkFolders, {
      subAppsPath: path.join(webRoot, 'src/config/subApps.js'),
      routerBackupPath: path.join(backupDir, webRelInRepo(layout, 'src/router/index.js'))
    })
    if (userPrefixes.length) {
      console.log(`  ✓ 自建子应用路由前缀: ${userPrefixes.join(', ')}`)
    }
  }

  const subAppsSrc = path.join(FILES_DIR, 'AIEP-WEB', 'src/config/subApps.js')
  const backupSubApps =
    backupDir && layout
      ? path.join(backupDir, webRelInRepo(layout, 'src/config/subApps.js'))
      : null
  await syncSubAppsRegistryAfterRoutes(webRoot, subAppsSrc, frameworkFolders, {
    backupDestPath: backupSubApps && fs.existsSync(backupSubApps) ? backupSubApps : null
  })
  console.log('  ✓ 应用中心 / 首页指标已与现网子应用对齐')
  await assertSubAppsRegistryHealthy(webRoot)
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

function normalizeNpmScriptForLayout(value, layout) {
  let s = String(value)
  if (layout === LAYOUT_FLAT_WEB) {
    // monorepo: cd AIEP-WEB && vite ...  →  flat-web: vite ...
    s = s.replace(/\bcd AIEP-WEB\s*&&\s*/g, '')
    // monorepo: node AIEP-WEB/scripts/...  →  flat-web: node scripts/...
    s = s.replace(/\bnode AIEP-WEB\//g, 'node ')
  }
  return s
}

/** flat-web 迁入 monorepo 后，将子应用 dev:/build: 等脚本恢复为 AIEP-WEB 前缀 */
function normalizeNpmScriptToMonorepo(value) {
  let s = String(value).trim()
  if (!s || s.includes('AIEP-SERVER')) return s
  if (/\bcd AIEP-WEB\s*&&\s*/i.test(s)) return s
  if (s.includes('scripts/sync-skills')) return s

  s = s.replace(/\bnode scripts\//g, 'node AIEP-WEB/scripts/')
  s = s.replace(/\bnode src\//g, 'node AIEP-WEB/src/')
  if (/\bvite\b/.test(s) && !/\bcd AIEP-WEB\s*&&\s*/i.test(s)) {
    s = `cd AIEP-WEB && ${s}`
  }
  return s
}

function normalizePackageJsonScriptsToMonorepo(pkgPath) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  if (!pkg.scripts) return

  const skipKeys = new Set([
    'postinstall',
    'sync:skills',
    'sync:cursor-skills',
    'sync:trae-skills',
    'install:all'
  ])

  for (const [k, v] of Object.entries(pkg.scripts)) {
    if (skipKeys.has(k) || k.startsWith('server:')) continue
    const isWebScript =
      k === 'dev' ||
      k === 'build' ||
      k === 'preview' ||
      k === 'test' ||
      k.startsWith('dev:') ||
      k.startsWith('build:') ||
      k.startsWith('validate:') ||
      k.startsWith('pack:') ||
      k.startsWith('export:') ||
      k.startsWith('import:') ||
      k.startsWith('scaffold:') ||
      k.startsWith('infer:') ||
      k === 'update' ||
      k === 'rollback' ||
      k === 'create-update-package' ||
      k === 'install-deps'
    if (isWebScript) {
      pkg.scripts[k] = normalizeNpmScriptToMonorepo(v)
    }
  }
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

/** flat-web 失败回滚后，根目录 src/ 与残留 AIEP-WEB/ 并存会导致布局误判 */
function removeStaleAiepWebIfRootSrcExists(repoRoot) {
  const aiepWeb = path.join(repoRoot, 'AIEP-WEB')
  const rootSrc = path.join(repoRoot, 'src')
  if (!fs.existsSync(aiepWeb) || !fs.existsSync(rootSrc)) return false
  fs.rmSync(aiepWeb, { recursive: true, force: true })
  console.log('  ✓ 已清理 flat-web 回滚残留的 AIEP-WEB/（避免 build 找不到 index.html）')
  return true
}

/** monorepo 布局下强制同步 dev/build/preview 等核心脚本（防止回滚后仍为 vite build） */
function syncCoreMonorepoScripts(pkgDest, pkgSrcPath) {
  const aiepWeb = path.join(path.dirname(pkgDest), 'AIEP-WEB')
  if (!fs.existsSync(aiepWeb) || !fs.existsSync(pkgSrcPath)) return false

  const dest = JSON.parse(fs.readFileSync(pkgDest, 'utf8'))
  const src = JSON.parse(fs.readFileSync(pkgSrcPath, 'utf8'))
  dest.scripts = dest.scripts || {}

  const forceKeys = [
    'dev',
    'build',
    'preview',
    'test',
    'test:watch',
    'test:coverage',
    'update',
    'rollback',
    'create-update-package',
    'install-deps',
    'validate:sdd',
    'infer:process-step',
    'validate:sub-app-registry',
    'scaffold:sub-app',
    'pack:sub-app',
    'export:sub-app',
    'import:sub-app'
  ]
  let changed = false
  for (const k of forceKeys) {
    if (src.scripts?.[k] && dest.scripts[k] !== src.scripts[k]) {
      dest.scripts[k] = src.scripts[k]
      changed = true
    }
  }
  for (const [k, v] of Object.entries(src.scripts || {})) {
    if ((k.startsWith('dev:') || k.startsWith('build:')) && dest.scripts[k] !== v) {
      dest.scripts[k] = v
      changed = true
    }
  }

  fs.writeFileSync(pkgDest, JSON.stringify(dest, null, 2) + '\n')
  normalizePackageJsonScriptsToMonorepo(pkgDest)
  return changed
}

function warnUserAppsNotInRegistry(webRoot, frameworkAppFolders, registeredFolders = null) {
  const appsDir = path.join(webRoot, 'src/apps')
  if (!fs.existsSync(appsDir)) return
  const registered = registeredFolders || new Set()
  const extra = fs
    .readdirSync(appsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !frameworkAppFolders.includes(e.name) && !registered.has(e.name))
    .map((e) => e.name)
  if (!extra.length) return
  console.log(`  ⚠️  自建子应用目录尚未写入 subApps.js: ${extra.join(', ')}`)
  console.log('     源码已保留；请按《主应用子应用接入规范》补登记后运行 validate:sub-app-registry')
}

function mergePackageJson(destPath, srcPath, layout, { forceFrameworkScripts = false } = {}) {
  const dest = JSON.parse(fs.readFileSync(destPath, 'utf8'))
  const src = JSON.parse(fs.readFileSync(srcPath, 'utf8'))

  dest.version = src.version
  if (src.dependencies) dest.dependencies = { ...dest.dependencies, ...src.dependencies }
  if (src.devDependencies) dest.devDependencies = { ...dest.devDependencies, ...src.devDependencies }
  if (src.scripts) {
    dest.scripts = dest.scripts || {}
    for (const [k, v] of Object.entries(src.scripts)) {
      const val = normalizeNpmScriptForLayout(v, layout)
      const isFrameworkScript =
        k.startsWith('build:') ||
        k.startsWith('dev:') ||
        k.startsWith('validate:') ||
        k.startsWith('infer:') ||
        k.startsWith('export:') ||
        k.startsWith('import:') ||
        k.startsWith('pack:') ||
        k.startsWith('scaffold:') ||
        k === 'dev' ||
        k === 'build' ||
        k === 'postinstall' ||
        k === 'sync:skills'
      if (isFrameworkScript) {
        if (layout === LAYOUT_FLAT_WEB || !dest.scripts[k] || forceFrameworkScripts) {
          dest.scripts[k] = val
        }
      } else if (!dest.scripts[k]) {
        dest.scripts[k] = val
      }
    }
  }
  fs.writeFileSync(destPath, JSON.stringify(dest, null, 2) + '\n')
}

async function mergeSubApps(destPath, srcPath, { backupDestPath = null, webRoot = null, frameworkAppFolders = [] } = {}) {
  let userApps = []
  let userMainCount
  const userSource =
    backupDestPath && fs.existsSync(backupDestPath) ? backupDestPath : destPath
  if (fs.existsSync(userSource)) {
    try {
      const userMod = await import(pathToFileURL(userSource) + '?t=' + Date.now())
      userApps = userMod.subApps || []
      userMainCount = userMod.MAIN_PAGE_COUNT
    } catch {
      console.warn('  ⚠️  无法读取更新前 subApps.js，将仅合并框架条目')
    }
  }
  const pkgMod = await import(pathToFileURL(srcPath) + '?t=' + Date.now())
  const pkgApps = pkgMod.subApps || []
  const frameworkSet = new Set(
    frameworkAppFolders.length ? frameworkAppFolders : pkgApps.map((a) => a.folder)
  )
  const userFoldersOnDisk = webRoot ? listUserSubAppFolders(webRoot, [...frameworkSet]) : []
  const includeFrameworkDemos =
    userApps.some((a) => frameworkSet.has(a.folder)) ||
    (userApps.length === 0 && userFoldersOnDisk.length === 0)

  const merged = []
  const seen = new Set()
  const push = (app) => {
    if (seen.has(app.id)) return
    seen.add(app.id)
    merged.push(app)
  }
  for (const u of userApps) push(u)
  if (includeFrameworkDemos) {
    for (const p of pkgApps) push(p)
  }

  const mainCount = pkgMod.MAIN_PAGE_COUNT ?? userMainCount ?? 6
  writeSubAppsRegistryFile(destPath, {
    mainCount,
    subApps: merged,
    helperTailSource: srcPath
  })
  return merged
}

function countSubAppRoutablePages(routerText, prefix) {
  const block = extractTopLevelRouteByPrefix(routerText, prefix)
  if (!block) return null
  const imports = [...block.matchAll(/component\s*:\s*\(\)\s*=>\s*import\s*\(\s*['"]([^'"]+\.vue)['"]/g)]
  return Math.max(0, imports.length - 1)
}

/** 路由稳定后同步 subApps.js：框架条目以更新包为准，pageCount 与 router 对齐 */
async function syncSubAppsRegistryAfterRoutes(
  webRoot,
  subAppsSrc,
  frameworkAppFolders,
  { backupDestPath = null } = {}
) {
  const destPath = path.join(webRoot, 'src/config/subApps.js')
  if (!fs.existsSync(subAppsSrc)) return

  await mergeSubApps(destPath, subAppsSrc, {
    backupDestPath,
    webRoot,
    frameworkAppFolders
  })

  const routerPath = path.join(webRoot, 'src/router/index.js')
  if (!fs.existsSync(routerPath)) return

  const routerText = fs.readFileSync(routerPath, 'utf8')
  let mod = await import(pathToFileURL(destPath) + '?t=' + Date.now())
  const { subApps: withDiscovered, added: autoRegistered } = autoRegisterDiscoveredUserApps(
    webRoot,
    mod.subApps || [],
    frameworkAppFolders,
    routerText
  )
  if (autoRegistered.length) {
    writeSubAppsRegistryFile(destPath, {
      mainCount: mod.MAIN_PAGE_COUNT ?? 6,
      subApps: withDiscovered,
      helperTailSource: subAppsSrc
    })
    console.log(`  ✓ 自动登记自建子应用（${autoRegistered.join(', ')}）→ 应用中心 / 首页`)
    mod = await import(pathToFileURL(destPath) + '?t=' + Date.now())
  }

  let pageCountSynced = 0
  const updated = (mod.subApps || []).map((app) => {
    const prefix = routePrefixFromTo(app.to)
    const counted = prefix ? countSubAppRoutablePages(routerText, prefix) : null
    if (counted != null && counted !== app.pageCount) {
      pageCountSynced++
      return { ...app, pageCount: counted }
    }
    return app
  })

  if (pageCountSynced) {
    writeSubAppsRegistryFile(destPath, {
      mainCount: mod.MAIN_PAGE_COUNT ?? 6,
      subApps: updated,
      helperTailSource: subAppsSrc
    })
    console.log(`  ✓ 同步 subApps.js pageCount（${pageCountSynced} 个子应用与 router 对齐）`)
  }
}

async function assertSubAppsRegistryHealthy(webRoot) {
  const healthPath = path.join(webRoot, 'scripts/sub-app-route-health.mjs')
  if (!fs.existsSync(healthPath)) return

  const { validateAllSubAppsHealth } = await import(pathToFileURL(healthPath) + '?t=' + Date.now())
  const subApps = await loadSubAppsFromRepo(webRoot)
  const { failed } = validateAllSubAppsHealth(webRoot, subApps)
  if (!failed.length) return

  const err = new Error(
    `子应用入口/路由健康检查未通过（打开可能空白）:\n${failed.map((f) => `  - ${f}`).join('\n')}`
  )
  err.code = 'MAIN_APP_SUBAPP_BLANK_RISK'
  throw err
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
  assertNotSandboxedForMutatingUpdate(cli)
  const meta = loadUpdateMeta()
  const project = findProject()

  if (!project) {
    printRepoRootNotFoundHints({ updateRoot: UPDATE_ROOT })
    process.exit(1)
  }

  let { repoRoot, webRoot, layout } = project
  if (layout === LAYOUT_FLAT_WEB) {
    if (cli.keepFlatWeb) {
      console.log('ℹ️  检测到旧版 flat-web（src/ 在根目录），将保持扁平结构（--keep-flat-web）')
    } else {
      console.log('ℹ️  检测到旧版 flat-web，更新时将自动迁入 AIEP-WEB/（与主仓库 monorepo 一致）')
    }
    if (!fs.existsSync(path.join(webRoot, 'src/config/subApps.js'))) {
      console.log('ℹ️  旧项目未含 subApps.js，更新后将自动创建子应用注册表')
    }
  }

  if (cli.rollback) {
    await runRollbackOnly(repoRoot, cli.rollback)
    return
  }

  if (!fs.existsSync(FILES_DIR)) {
    console.error('❌ 更新包缺少 files/ 目录')
    process.exit(1)
  }

  const frameworkMetaPath = path.join(FILES_DIR, 'framework-meta.json')
  const frameworkMeta = fs.existsSync(frameworkMetaPath)
    ? JSON.parse(fs.readFileSync(frameworkMetaPath, 'utf8'))
    : { frameworkAppFolders: ['sample-app'], frameworkDocFolders: ['sample-app'] }

  const backupSubAppsPath = path.join(webRoot, 'src/config/subApps.js')
  const userPrefixes = await resolveUserSubAppPrefixes(webRoot, frameworkMeta.frameworkAppFolders || [], {
    subAppsPath: backupSubAppsPath
  })

  if (cli.repairRegistry) {
    assertNotSandboxedForMutatingUpdate({ ...cli, yes: true })
    console.log('子应用注册表修复（应用中心 / 首页指标）...')
    const frameworkFolders = frameworkMeta.frameworkAppFolders || []
    const userFolders = listUserSubAppFolders(webRoot, frameworkFolders)
    if (cli.dryRun) {
      console.log(`\n[dry-run] 自建子应用目录: ${userFolders.join(', ') || '无'}`)
      console.log(`[dry-run] 路由前缀: ${userPrefixes.join(', ') || '无'}`)
      console.log('[dry-run] 将写入 subApps.js 并同步 pageCount。确认后执行: node update.js --repair-registry --yes')
      if (cli.reuseBackup) {
        console.log(`[dry-run] 将从备份恢复自建路由: ${cli.reuseBackup}`)
      }
      return
    }
    if (!cli.yes) {
      const ok = await askYesNo(
        '将从 src/apps + router 自动登记自建子应用至 subApps.js（应用中心 / 首页），是否继续？',
        false
      )
      if (!ok) {
        console.log('已取消。')
        return
      }
    }
    let backupDir = null
    let backupLayout = layout
    if (cli.reuseBackup) {
      backupDir = path.isAbsolute(cli.reuseBackup)
        ? cli.reuseBackup
        : path.join(repoRoot, cli.reuseBackup)
      const manifestPath = path.join(backupDir, 'update-backup-manifest.json')
      if (!fs.existsSync(manifestPath)) {
        console.error(`\n❌ --reuse-backup 目录缺少 update-backup-manifest.json:\n  ${backupDir}`)
        process.exit(1)
      }
      backupLayout = JSON.parse(fs.readFileSync(manifestPath, 'utf8')).layout || layout
    }
    try {
      await runRegistryRepair(webRoot, frameworkMeta, { backupDir, layout: backupLayout })
      console.log('\n修复完成。请刷新浏览器查看应用中心与首页。')
    } catch (e) {
      console.error(`\n❌ 注册表修复失败: ${e.message}`)
      process.exit(1)
    }
    return
  }

  if (cli.repairRoutes) {
    assertNotSandboxedForMutatingUpdate({ ...cli, yes: true })
    console.log('子应用路由/页面修复模式（不修改 package.json 版本）...')
    if (userPrefixes.length) {
      console.log(`自建子应用路由前缀（将保留）: ${userPrefixes.join(', ')}`)
    }
    if (cli.dryRun) {
      console.log('\n[dry-run] 将执行：同步框架子应用源码 → 同步框架路由块 → 补全缺失 .vue → 校验')
      console.log('[dry-run] 未修改任何文件。确认后执行: node update.js --repair-routes --yes')
      return
    }
    if (!cli.yes) {
      const ok = await askYesNo('将从更新包 files/ 补全框架子应用路由与页面，是否继续？', false)
      if (!ok) {
        console.log('已取消。')
        return
      }
    }
    try {
      await runRouterRepair(webRoot, frameworkMeta, userPrefixes)
      console.log('\n修复完成。建议执行: npm run build')
      if (cli.yes || process.stdin.isTTY) {
        const rebuild = cli.yes ? true : await askYesNo('是否立即执行 npm run build 验证？', true)
        if (rebuild) verifyMainAppAfterUpdate(repoRoot, webRoot)
      }
    } catch (e) {
      console.error(`\n❌ 路由修复失败: ${e.message}`)
      process.exit(1)
    }
    return
  }

  console.log('检查系统更新（零风险模式：备份 → 合并 → 校验 → 失败自动回滚）...')

  try {
    checkNodeVersion()
  } catch (e) {
    console.error(`❌ ${e.message}`)
    process.exit(1)
  }

  const packageVersion = resolvePackageVersion(meta)
  if (!packageVersion) {
    console.error('❌ 更新包未声明版本（update-info.json 或 files/package.json）')
    process.exit(1)
  }

  const currentVersion = readProjectVersion(repoRoot)
  const cmp = compareVersion(packageVersion, currentVersion)
  const serverRoot = path.join(repoRoot, 'AIEP-SERVER')

  console.log(`当前版本: v${currentVersion}`)
  console.log(`更新包版本: v${packageVersion}`)
  console.log(`项目根目录: ${repoRoot}（${layout === LAYOUT_FLAT_WEB ? '旧版 flat-web' : '标准 monorepo'}）`)

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
    if (layout === LAYOUT_FLAT_WEB && !cli.keepFlatWeb) {
      console.log('\n[dry-run] flat-web → monorepo 结构迁移：')
      for (const line of planFlatWebToMonorepo(repoRoot)) {
        console.log(`  ${line}`)
      }
    }
    console.log('\n[dry-run] 将执行：全量备份 → 合并框架 → 自动合并自建路由/嵌入前缀 → 根目录文档迁入核心文档 → 清理废弃文档 → npm install')
    console.log('[dry-run] 主应用验证（注册表 + build，失败回滚）')
    if (cli.verifySubApps) {
      console.log('[dry-run] 子应用 build 验证（--verify-sub-apps，并行；失败仅提示）')
    } else if (cli.noVerifySubApps) {
      console.log('[dry-run] 子应用 build 验证：--no-verify-sub-apps，将跳过')
    } else {
      console.log('[dry-run] 更新成功后将询问「是否立即验证子应用构建？」（确认即可，无需手输 build 命令）')
    }
    if (cli.skipInstall) {
      console.log('[dry-run] npm install：已指定 --skip-install，将跳过')
    } else {
      console.log('[dry-run] npm install：dependencies 未变时将自动跳过')
    }
    console.log('[dry-run] 未修改任何文件。')
    const rootMigration = migrateRootLegacyDocs(repoRoot, fs, path, { dryRun: true })
    if (rootMigration.plans?.length) {
      console.log('[dry-run] 将迁入根目录遗留文档（合并后删除根目录副本）:')
      rootMigration.plans.forEach((p) =>
        console.log(`  - ${p.rootName} → ${p.targetRel}（${p.action === 'merge' ? '比对合并' : '直接迁入'}）`)
      )
    } else {
      console.log('[dry-run] 无根目录遗留框架文档待迁入')
    }
    if (ROOT_DOC_KEEP_AT_ROOT.length) {
      console.log(`[dry-run] 根目录保留: ${ROOT_DOC_KEEP_AT_ROOT.join('、')}`)
    }
    const pendingObsolete = new Set(
      obsoletePaths.filter((rel) => fs.existsSync(path.join(repoRoot, rel)))
    )
    for (const rel of findObsoleteFilenameMatches(repoRoot, fs, path)) {
      pendingObsolete.add(rel)
    }
    if (pendingObsolete.size) {
      console.log('[dry-run] 将删除 1.0 废止文档:')
      for (const rel of [...pendingObsolete].sort()) {
        console.log(`  - ${rel}`)
      }
    } else {
      console.log('[dry-run] 无 1.0 废止文档待删除')
    }
    try {
      const subApps = await loadSubAppsFromRepo(webRoot)
      const scripts = loadPackageScripts(repoRoot)
      const plan = listSubAppsToVerify(webRoot, subApps, scripts)
      const toVerify = plan.filter((p) => p.status === 'verify')
      if (cli.verifySubApps && toVerify.length) {
        console.log('[dry-run] 将并行验证子应用构建:')
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

  const timer = createStepTimer()
  const version = packageVersion
  let timestamp
  let backupDir

  if (cli.reuseBackup) {
    backupDir = path.isAbsolute(cli.reuseBackup)
      ? cli.reuseBackup
      : path.join(repoRoot, cli.reuseBackup)
    const manifestPath = path.join(backupDir, 'update-backup-manifest.json')
    if (!fs.existsSync(manifestPath)) {
      console.error(`\n❌ --reuse-backup 目录缺少 update-backup-manifest.json:\n  ${backupDir}`)
      process.exit(1)
    }
    timestamp = path.basename(backupDir).replace(/^v[\d.]+-/, '')
    console.log(`\n♻️  复用已有备份（跳过重新备份）: ${path.relative(repoRoot, backupDir)}`)
  } else {
    timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    backupDir = path.join(repoRoot, 'backups', `v${version}-${timestamp}`)
    fs.mkdirSync(backupDir, { recursive: true })
  }

  const fileLog = createUpdateFileLogger(backupDir, { append: Boolean(cli.reuseBackup) })
  installUpdateCrashGuard(backupDir, version, timestamp)
  const progress = createUpdateProgressTracker(backupDir, { version, timestamp })
  progress.mark(cli.reuseBackup ? 'backup-reuse' : 'backup-start')
  console.log(`\n更新日志文件: ${fileLog.logPath}`)

  const backupLayout = layout

  if (!cli.reuseBackup) {
  const backupRelPaths = [
    ...getWebBackupRelPaths(backupLayout),
    '核心文档/框架核心文档',
    '核心文档/AI+产品落地',
    '核心文档/执行说明.txt',
    'AIEP-SERVER',
    '.cursor',
    'scripts',
    ...Object.keys(ROOT_LEGACY_DOC_MAPPINGS).filter((name) =>
      fs.existsSync(path.join(repoRoot, name))
    )
  ]
  const backupTargets = backupRelPaths.map((rel) => path.join(repoRoot, rel))
  const heavyBackupItems = new Set(['.cursor', 'AIEP-SERVER', 'AIEP-WEB/src', 'src'])

  console.log('\n创建备份...')
  for (let i = 0; i < backupTargets.length; i++) {
    const t = backupTargets[i]
    if (!fs.existsSync(t)) continue
    const rel = backupRelPaths[i]
    const dest = path.join(backupDir, rel)
    if (heavyBackupItems.has(rel)) {
      console.log(`  … 备份 ${rel}（文件较多，请稍候）`)
    }
    progress.mark('backup-item', rel)
    if (fs.statSync(t).isDirectory()) {
      const exclude = rel === '.cursor' ? BACKUP_EXCLUDE_DIR_NAMES : null
      copyDirectory(t, dest, { excludeDirNames: exclude })
    } else copyFile(t, dest)
    console.log(`  ✓ ${rel}`)
  }

  progress.mark('backup-manifest')
  console.log('  … 写入备份清单 update-backup-manifest.json ...')
  writeBackupManifest(backupDir, {
    version: currentVersion,
    targetVersion: packageVersion,
    layout: backupLayout,
    createdAt: new Date().toISOString(),
    paths: backupRelPaths.filter((rel) => fs.existsSync(path.join(backupDir, rel))),
    userSubAppPrefixes: userPrefixes
  })
  console.log('  ✓ 备份清单已写入')

  progress.mark('backup-strip-obsolete')
  console.log('  … 整理备份清单（剔除 1.0 废止文档，可选）...')
  try {
    stripObsoleteFromBackup(backupDir)
    console.log('  ✓ 备份清单整理完成')
  } catch (e) {
    console.warn(`  ⚠ 备份废止文档整理跳过: ${e.message}`)
    console.warn('  · 不影响继续更新；回滚时可能短暂恢复 1.0 废止文档副本')
  }

  timer.mark('备份')
  console.log(`  ✓ 备份完成: backups/v${version}-${timestamp}`)
  } else {
    console.log('  ✓ 跳过备份（使用 --reuse-backup）')
  }

  let migratedFromFlatWeb = false
  if (backupLayout === LAYOUT_FLAT_WEB && !cli.keepFlatWeb) {
    progress.mark('flat-web-migrate')
    console.log('\n迁入 AIEP-WEB/（flat-web → monorepo，src/apps 与子应用文档整目录迁入）...')
    removeStaleAiepWebIfRootSrcExists(repoRoot)
    migratedFromFlatWeb = bootstrapFlatWebToMonorepo(repoRoot, { copyFile, copyDirectory })
    if (migratedFromFlatWeb) {
      webRoot = path.join(repoRoot, 'AIEP-WEB')
      layout = LAYOUT_MONOREPO
      console.log('  ✓ 结构已与主仓库对齐（AIEP-WEB/ + 根 scripts/）')
    }
  }

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
    progress.mark('merge-start')
    console.log('\n合并更新文件...')

    progress.mark('merge', 'package.json')
    const pkgSrc = path.join(FILES_DIR, 'package.json')
    const pkgDest = path.join(repoRoot, 'package.json')
    if (fs.existsSync(pkgSrc)) {
      mergePackageJson(pkgDest, pkgSrc, layout, { forceFrameworkScripts: migratedFromFlatWeb })
    }
    if (migratedFromFlatWeb || fs.existsSync(path.join(repoRoot, 'AIEP-WEB'))) {
      if (syncCoreMonorepoScripts(pkgDest, pkgSrc)) {
        console.log('  ✓ package.json 核心脚本已同步为 monorepo（cd AIEP-WEB && vite ...）')
      } else {
        normalizePackageJsonScriptsToMonorepo(pkgDest)
      }
    }

    const lockSrc = path.join(FILES_DIR, 'package-lock.json')
    const lockDest = path.join(repoRoot, 'package-lock.json')
    if (fs.existsSync(lockSrc)) copyFile(lockSrc, lockDest)

    const webFiles = ['vite.config.js', 'index.html', 'vite.config.test.js']
    for (const f of webFiles) {
      const s = path.join(FILES_DIR, 'AIEP-WEB', f)
      const d = path.join(webRoot, f)
      if (fs.existsSync(s)) copyFile(s, d)
    }

    const publicSrc = path.join(FILES_DIR, 'AIEP-WEB', 'public')
    const publicDest = path.join(webRoot, 'public')
    if (fs.existsSync(publicSrc)) {
      mergeDirectory(publicSrc, publicDest)
      console.log('  ✓ 合并 AIEP-WEB/public（含 app-icon.png 等静态资源）')
    }

    mergeBuildDirectory(
      path.join(FILES_DIR, 'AIEP-WEB', 'build'),
      path.join(webRoot, 'build'),
      frameworkMeta.frameworkAppFolders || []
    )
    mergeDirectory(path.join(FILES_DIR, 'AIEP-WEB', 'scripts'), path.join(webRoot, 'scripts'))

    progress.mark('merge', 'AIEP-WEB/src')
    mergeSrcTree(
      path.join(FILES_DIR, 'AIEP-WEB', 'src'),
      path.join(webRoot, 'src'),
      frameworkMeta
    )

    progress.mark('merge', 'framework-apps-sync')
    const frameworkFolders = frameworkMeta.frameworkAppFolders || []
    const syncedApps = ensureFrameworkAppsFromPackage(webRoot, frameworkFolders)
    if (syncedApps.length) {
      console.log(`  ✓ 深度同步框架子应用源码（${syncedApps.join(', ')}）`)
    }

    preserveUserSubAppIntegration(webRoot, backupDir, userPrefixes, backupLayout, frameworkFolders)

    progress.mark('merge', 'framework-routes-sync')
    const syncedRoutes = syncFrameworkRoutesFromPackage(webRoot, frameworkMeta, userPrefixes)
    if (syncedRoutes.length) {
      console.log(`  ✓ 同步框架子应用路由块（${syncedRoutes.join(', ')}）`)
    }

    progress.mark('merge', 'router-restore-components')
    const restoredComponents = restoreMissingRouterComponentsFromPackage(webRoot, frameworkFolders)
    if (restoredComponents.length) {
      console.log(`  ✓ 从更新包补全缺失页面（${restoredComponents.length} 个）`)
      for (const rel of restoredComponents.slice(0, 8)) console.log(`    · ${rel}`)
      if (restoredComponents.length > 8) {
        console.log(`    · … 另有 ${restoredComponents.length - 8} 个`)
      }
    }

    progress.mark('merge', 'router-prune')
    const prunedRoutes = pruneRouterFilesWithMissingComponents(webRoot, frameworkFolders)
    if (prunedRoutes.length) {
      console.log('\n修正路由：移除更新包中也不存在的页面路由（避免 build 失败）')
      for (const r of prunedRoutes) {
        if (r.note) {
          console.warn(`  ⚠ ${r.file}: ${r.importPath} — ${r.note}`)
        } else {
          console.log(`  ✓ ${r.file}: 已移除 ${r.routePath || r.importPath}`)
        }
      }
    }

    try {
      assertRouterComponentsResolvable(webRoot, frameworkFolders)
    } catch (e) {
      e.code = e.code || 'MAIN_APP_ROUTE_COMPONENT_MISSING'
      throw e
    }

    const subAppsDest = path.join(webRoot, 'src/config/subApps.js')
    const subAppsSrc = path.join(FILES_DIR, 'AIEP-WEB', 'src/config/subApps.js')
    const backupSubAppsFile = path.join(
      backupDir,
      webRelInRepo(backupLayout, 'src/config/subApps.js')
    )
    if (fs.existsSync(subAppsSrc)) {
      await syncSubAppsRegistryAfterRoutes(webRoot, subAppsSrc, frameworkFolders, {
        backupDestPath: backupSubAppsFile
      })
      console.log('  ✓ 同步 subApps.js（框架入口 + 应用中心 + 首页指标）')
      const registeredMod = await import(pathToFileURL(subAppsDest) + '?t=' + Date.now())
      warnUserAppsNotInRegistry(
        webRoot,
        frameworkFolders,
        new Set((registeredMod.subApps || []).map((a) => a.folder))
      )
      await assertSubAppsRegistryHealthy(webRoot)
    }

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

    progress.mark('merge', '.cursor/skills')
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

    console.log('\n迁入根目录遗留框架文档（比对合并 → 删除根目录副本）...')
    migrateRootLegacyDocs(repoRoot, fs, path)

    console.log('\n清理废弃文档（1.0 遗留，必须删除）...')
    purgeObsoleteFiles(repoRoot, obsoletePaths)

    if (layout === LAYOUT_MONOREPO) {
      const relics = cleanupFlatWebRelicsIfMonorepo(repoRoot)
      if (relics.length) {
        console.log('\n清理根目录 flat-web 迁余（已迁入 AIEP-WEB/，不再在根目录显示）...')
        for (const rel of relics) console.log(`  ✓ 已删除 ${rel}`)
      }
    }

    timer.mark('合并与清理')

    const shouldSkipInstall =
      cli.skipInstall || projectDepsUnchanged(repoRoot, backupDir)
    if (shouldSkipInstall) {
      const reason = cli.skipInstall
        ? '--skip-install'
        : 'package.json dependencies 与更新前一致'
      console.log(`\n跳过 npm install（${reason}）`)
    } else {
      progress.mark('npm-install')
      console.log('\n安装依赖...')
      console.log('  … npm 进度仅显示在本窗口，update.log 在本阶段可能暂不刷新')
      execSync('npm install', { stdio: 'inherit', cwd: repoRoot })
      if (fs.existsSync(path.join(serverRoot, 'package.json'))) {
        console.log('安装 AIEP-SERVER 依赖...')
        execSync('npm install', { stdio: 'inherit', cwd: serverRoot })
      }
    }
    timer.mark('依赖安装')

    progress.mark('main-app-verify')
    verifyMainAppAfterUpdate(repoRoot, webRoot, { skipBuild: cli.skipMainAppBuild })
    timer.mark('主应用验证')
  } catch (e) {
    const step = e?.code?.startsWith('MAIN_APP_') ? '主应用验证' : '合并/安装/验证'
    fail(step, e)
  }

  let subAppResult = { successes: [], failures: [], skipped: [] }
  const runSubAppVerify = await shouldVerifySubAppsAfterUpdate(cli, repoRoot, webRoot)
  if (runSubAppVerify) {
    try {
      subAppResult = await verifySubAppsAfterUpdate(repoRoot, webRoot)
      printSubAppVerificationReport(subAppResult)
      timer.mark('子应用验证')
    } catch (e) {
      console.warn('\n⚠️  子应用验证过程异常（不影响已完成的更新）:', e.message)
    }
  } else if (cli.noVerifySubApps) {
    console.log('\n· 已按 --no-verify-sub-apps 跳过子应用验证')
  } else if (!cli.verifySubApps && process.stdin.isTTY) {
    console.log('\n· 已跳过子应用构建验证（需要时: node update.js --verify-sub-apps）')
  }

  console.log(`\n✅ 更新完成（主应用验证已通过，总耗时 ${timer.totalSec()}s）`)
  console.log(`更新日志: ${fileLog.logPath}`)
  progress.done()
  if (subAppResult.failures.length) {
    console.log(`⚠️  有 ${subAppResult.failures.length} 个子应用构建异常，见上文说明`)
  }
  console.log(`备份: ${backupDir}`)
  console.log(`手动回滚: node update.js --rollback backups/v${version}-${timestamp}`)

  const finalPurge = purgeObsoleteFiles(repoRoot, obsoletePaths)
  if (finalPurge) {
    console.log(`\n收尾清理 1.0 废止文档（${finalPurge} 个）`)
  }

  if (!cli.keepAllBackups) {
    const prunedBackups = pruneOldBackups(repoRoot, backupDir)
    if (prunedBackups.length) {
      console.log(`\n清理历史备份（仅保留当次）: 已删除 ${prunedBackups.length} 个`)
      for (const name of prunedBackups.slice(0, 6)) console.log(`  · ${name}`)
      if (prunedBackups.length > 6) console.log(`  · … 另有 ${prunedBackups.length - 6} 个`)
    }
  }

  printPostUpdateOnboarding(repoRoot)
  await maybeDeleteUpdatePackageAfterSuccess(cli)
}

main().catch((e) => {
  console.error('❌ 更新失败:', e.message)
  process.exit(1)
})
