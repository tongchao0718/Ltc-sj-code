#!/usr/bin/env node
/**
 * 子应用导出包 — 接收方一键集成（可独立运行，不依赖 AIEP-WEB/scripts）
 *
 * 在 bundle 目录或 ltc-demo 根目录执行:
 *   node integrate.mjs --dry-run
 *   node integrate.mjs --yes
 *   node integrate.mjs --yes --force
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BUNDLE_DIR = fs.existsSync(path.join(__dirname, 'manifest.json'))
  ? __dirname
  : null

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    yes: argv.includes('--yes'),
    force: argv.includes('--force'),
    filesOnly: argv.includes('--files-only'),
    bundle: (() => {
      const i = argv.indexOf('--bundle')
      return i !== -1 && argv[i + 1] ? path.resolve(argv[i + 1]) : BUNDLE_DIR
    })()
  }
}

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

function findRepoRoot(startDir) {
  let dir = path.resolve(startDir)
  for (let i = 0; i < 14; i++) {
    if (isLtcDemoRoot(dir)) return dir
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const bundleDir = args.bundle
  if (!bundleDir || !fs.existsSync(path.join(bundleDir, 'manifest.json'))) {
    console.error('请指定含 manifest.json 的 bundle 目录，或在 bundle 根目录运行本脚本')
    process.exit(1)
  }

  const manifest = JSON.parse(fs.readFileSync(path.join(bundleDir, 'manifest.json'), 'utf8'))
  const routerBlockPath = path.join(bundleDir, 'integration/router-block.js')
  const routerBlock = fs.existsSync(routerBlockPath)
    ? fs.readFileSync(routerBlockPath, 'utf8').trim()
    : null

  const repoRoot = findRepoRoot(process.cwd())
  if (!repoRoot) {
    console.error('未找到 ltc-demo 仓库根目录，请在仓库根目录或其子目录运行')
    process.exit(1)
  }

  const { appCode, folder, subAppEntry, packageScripts, routerPrefix } = manifest
  const filesDir = path.join(bundleDir, 'files')

  console.log(`\n子应用集成包: ${appCode} (${manifest.subAppEntry?.name || folder})`)
  console.log(`目标仓库: ${repoRoot}`)
  console.log(`模式: ${args.dryRun ? 'dry-run' : args.yes ? '写入' : '预览（加 --yes 确认）'}\n`)

  const steps = []
  steps.push(`复制 files/ → ${repoRoot}`)
  steps.push(`合并 subApps.js → ${subAppEntry.folder}`)
  if (routerBlock) steps.push(`合并 router/index.js → ${routerPrefix}`)
  if (packageScripts && Object.keys(packageScripts).length) {
    steps.push(`合并 package.json scripts: ${Object.keys(packageScripts).join(', ')}`)
  }
  steps.push('运行 validate:sub-app-registry')

  steps.forEach((s, i) => console.log(`  ${i + 1}. ${s}`))

  if (!args.yes && !args.dryRun) {
    console.log('\n加 --yes 执行集成，或 --dry-run 仅校验路径')
    process.exit(0)
  }

  if (args.dryRun) {
    console.log('\n[dry-run] 未写入任何文件')
    process.exit(0)
  }

  const importScript = path.join(repoRoot, 'AIEP-WEB/scripts/import-sub-app.mjs')
  if (!fs.existsSync(importScript)) {
    console.error('目标仓库缺少 AIEP-WEB/scripts/import-sub-app.mjs，请更新框架后再集成')
    process.exit(1)
  }

  const childArgs = ['--bundle', bundleDir, '--yes']
  if (args.force) childArgs.push('--force')
  if (args.filesOnly) childArgs.push('--files-only')

  const r = spawnSync(process.execPath, [importScript, ...childArgs], {
    cwd: repoRoot,
    stdio: 'inherit'
  })
  process.exit(r.status ?? 1)
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
