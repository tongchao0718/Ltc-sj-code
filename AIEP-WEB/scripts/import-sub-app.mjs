#!/usr/bin/env node
/**
 * 一键导入子应用导出包
 *
 * 用法:
 *   npm run import:sub-app -- --bundle dist/sub-app-bundles/marketing-demo-bundle-2026-06-08 --yes
 *   npm run import:sub-app -- --bundle ./marketing-demo-bundle --dry-run
 */
import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import {
  REPO_ROOT,
  WEB_SRC,
  findRepoRoot,
  copyBundleFilesToRepo,
  mergeSubAppEntry,
  mergeRouterBlock,
  mergePackageScripts
} from './sub-app-bundle-shared.mjs'

function parseArgs(argv) {
  const out = { bundle: '', dryRun: false, yes: false, force: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--bundle' && argv[i + 1]) out.bundle = argv[++i]
    else if (a === '--dry-run') out.dryRun = true
    else if (a === '--yes') out.yes = true
    else if (a === '--force') out.force = true
    else if (!a.startsWith('-') && !out.bundle) out.bundle = a
  }
  return out
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.bundle) {
    console.error('用法: npm run import:sub-app -- --bundle <path> [--yes] [--force] [--dry-run]')
    process.exit(1)
  }

  const repoRoot = findRepoRoot() || REPO_ROOT
  const bundleDir = path.resolve(args.bundle)
  const manifestPath = path.join(bundleDir, 'manifest.json')

  if (!fs.existsSync(manifestPath)) {
    console.error(`未找到 manifest.json: ${manifestPath}`)
    process.exit(1)
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  if (manifest.type !== 'sub-app-bundle' || manifest.schemaVersion !== 1) {
    console.error('不支持的 bundle 格式')
    process.exit(1)
  }

  const { appCode, folder, subAppEntry, packageScripts, routerPrefix } = manifest
  const filesDir = path.join(bundleDir, 'files')
  const routerBlockPath = path.join(bundleDir, 'integration/router-block.js')
  const routerBlock = fs.existsSync(routerBlockPath)
    ? fs.readFileSync(routerBlockPath, 'utf8').trim()
    : null

  console.log(`\n导入子应用: ${subAppEntry.name} (${appCode})`)
  console.log(`Bundle: ${bundleDir}`)
  console.log(`仓库: ${repoRoot}\n`)

  if (args.dryRun) {
    console.log('[dry-run] 将复制:', filesDir, '→', repoRoot)
    console.log('[dry-run] subApps / router / package.json 合并预览完成')
    process.exit(0)
  }

  if (!args.yes) {
    console.log('加 --yes 确认写入')
    process.exit(0)
  }

  const copied = copyBundleFilesToRepo(filesDir, repoRoot)
  console.log('✓ 已复制:', copied.join(', ') || '(files/)')

  const subAppsPath = path.join(WEB_SRC, 'config/subApps.js')
  const subResult = mergeSubAppEntry(subAppsPath, subAppEntry, { force: args.force })
  console.log(`✓ subApps.js: ${subResult.action}${subResult.reason ? ' (' + subResult.reason + ')' : ''}`)

  if (routerBlock && routerPrefix) {
    const routerPath = path.join(WEB_SRC, 'router/index.js')
    const routerResult = mergeRouterBlock(routerPath, routerBlock, routerPrefix, {
      force: args.force
    })
    console.log(`✓ router/index.js: ${routerResult.action}${routerResult.reason ? ' (' + routerResult.reason + ')' : ''}`)
  }

  if (packageScripts && Object.keys(packageScripts).length) {
    const scriptResult = mergePackageScripts(repoRoot, packageScripts, { force: args.force })
    console.log(`✓ package.json scripts 新增: ${scriptResult.added.join(', ') || '无'}`)
    if (scriptResult.skipped.length) {
      console.log(`  跳过（已存在）: ${scriptResult.skipped.join(', ')}`)
    }
  }

  console.log('\n校验 subApps 注册表...')
  const validateScript = path.join(repoRoot, 'AIEP-WEB/scripts/sub-app-registry-validate.mjs')
  const validate = spawnSync(process.execPath, [validateScript], {
    cwd: repoRoot,
    stdio: 'inherit'
  })
  if (validate.status !== 0) {
    console.error('\n校验未通过，请手动检查 subApps.js / router/index.js')
    process.exit(validate.status ?? 1)
  }

  console.log(`\n✓ 集成完成。可运行: npm run dev:${folder}`)
  console.log(`\nAgent：请 Read export-import-sub-app Skill 并按 handoff-checklist 验收。`)
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
