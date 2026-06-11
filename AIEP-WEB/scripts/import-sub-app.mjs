#!/usr/bin/env node
/**
 * 一键导入子应用导出包
 *
 * 用法:
 *   npm run import:sub-app -- --bundle dist/sub-app-bundles/marketing-demo-bundle-2026-06-08 --dry-run
 *   npm run import:sub-app -- --bundle ./marketing-demo-bundle --yes
 *   npm run import:sub-app -- --bundle ./marketing-demo-bundle --yes --force
 *   npm run import:sub-app -- --bundle ./marketing-demo-bundle --yes --files-only
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
  mergePackageScripts,
  detectImportConflicts,
  formatImportConflictReport,
  resolveImportMode,
  printImportConflictBlocked
} from './sub-app-bundle-shared.mjs'

function parseArgs(argv) {
  const out = { bundle: '', dryRun: false, yes: false, force: false, filesOnly: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--bundle' && argv[i + 1]) out.bundle = argv[++i]
    else if (a === '--dry-run') out.dryRun = true
    else if (a === '--yes') out.yes = true
    else if (a === '--force') out.force = true
    else if (a === '--files-only') out.filesOnly = true
    else if (!a.startsWith('-') && !out.bundle) out.bundle = a
  }
  return out
}

function runRegistryValidate(repoRoot) {
  const validateCandidates = [
    path.join(repoRoot, 'scripts/sub-app-registry-validate.mjs'),
    path.join(repoRoot, 'AIEP-WEB/scripts/sub-app-registry-validate.mjs')
  ]
  const validateScript = validateCandidates.find((p) => fs.existsSync(p))
  if (!validateScript) {
    console.error('\n未找到 sub-app-registry-validate.mjs（flat-web 在 scripts/，monorepo 在 AIEP-WEB/scripts/）')
    process.exit(1)
  }
  const validate = spawnSync(process.execPath, [validateScript], {
    cwd: repoRoot,
    stdio: 'inherit'
  })
  if (validate.status !== 0) {
    console.error('\n校验未通过，请手动检查 subApps.js / router/index.js')
    process.exit(validate.status ?? 1)
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.bundle) {
    console.error(
      '用法: npm run import:sub-app -- --bundle <path> [--dry-run] [--yes] [--force | --files-only]'
    )
    process.exit(1)
  }
  if (args.force && args.filesOnly) {
    console.error('--force 与 --files-only 不能同时使用')
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

  const conflicts = detectImportConflicts(repoRoot, manifest, filesDir)

  console.log(`\n导入子应用: ${subAppEntry.name} (${appCode})`)
  console.log(`Bundle: ${bundleDir}`)
  console.log(`仓库: ${repoRoot}`)

  if (conflicts.hasConflicts) {
    console.log('\n' + formatImportConflictReport(conflicts, manifest))
  } else {
    console.log('\n未检测到同名子应用，将执行全新导入。')
  }

  if (args.dryRun) {
    console.log('\n[dry-run] 计划步骤:')
    console.log(`  1. 复制 files/ → ${repoRoot}`)
    if (!conflicts.hasConflicts || args.force) {
      console.log(`  2. 合并 subApps.js → ${folder}`)
      if (routerBlock) console.log(`  3. 合并 router/index.js → ${routerPrefix}`)
      if (packageScripts && Object.keys(packageScripts).length) {
        console.log(`  4. 合并 package.json scripts: ${Object.keys(packageScripts).join(', ')}`)
      }
    } else if (args.filesOnly) {
      console.log('  2. 跳过 subApps / router / package.json（--files-only）')
    } else {
      console.log('  2. 需选择 --force（覆盖）或 --files-only（仅源码）后才会写入')
    }
    console.log('\n[dry-run] 未写入任何文件')
    process.exit(0)
  }

  if (!args.yes) {
    console.log('\n加 --yes 确认写入；若存在同名子应用，终端交互下可不加 --force 直接选择处理方式')
    process.exit(0)
  }

  const { mode, force } = await resolveImportMode(args, conflicts, manifest, {
    skipConflictReport: conflicts.hasConflicts
  })

  if (mode === 'cancel') {
    console.log('\n已取消导入，未修改任何文件。')
    process.exit(0)
  }

  if (mode === 'blocked') {
    printImportConflictBlocked(conflicts, manifest, bundleDir, { skipReport: true })
    process.exit(2)
  }

  const copied = copyBundleFilesToRepo(filesDir, repoRoot)
  console.log('\n✓ 已复制:', copied.join(', ') || '(files/)')

  if (mode === 'files-only') {
    console.log('✓ 已跳过 subApps.js / router / package.json（仅更新源码）')
    console.log(`\n✓ 文件更新完成。可运行: npm run dev:${folder}`)
    console.log('\nAgent：注册表未变更；若需同步应用中心/首页指标，请使用 --force 重新导入。')
    process.exit(0)
  }

  const subAppsPath = path.join(WEB_SRC, 'config/subApps.js')
  const subResult = mergeSubAppEntry(subAppsPath, subAppEntry, { force })
  console.log(`✓ subApps.js: ${subResult.action}${subResult.reason ? ' (' + subResult.reason + ')' : ''}`)

  if (routerBlock && routerPrefix) {
    const routerPath = path.join(WEB_SRC, 'router/index.js')
    const routerResult = mergeRouterBlock(routerPath, routerBlock, routerPrefix, { force })
    console.log(
      `✓ router/index.js: ${routerResult.action}${routerResult.reason ? ' (' + routerResult.reason + ')' : ''}`
    )
  }

  if (packageScripts && Object.keys(packageScripts).length) {
    const scriptResult = mergePackageScripts(repoRoot, packageScripts, { force })
    console.log(`✓ package.json scripts 新增: ${scriptResult.added.join(', ') || '无'}`)
    if (scriptResult.skipped.length) {
      console.log(`  跳过（已存在）: ${scriptResult.skipped.join(', ')}`)
    }
  }

  console.log('\n校验 subApps 注册表...')
  runRegistryValidate(repoRoot)

  console.log(`\n✓ 集成完成。可运行: npm run dev:${folder}`)
  console.log('\nAgent：请 Read export-import-sub-app Skill 并按 handoff-checklist 验收。')
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
