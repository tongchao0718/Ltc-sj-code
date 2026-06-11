#!/usr/bin/env node
/**
 * 一键导出子应用工程包（源码 + 注册信息 + 路由块 + npm scripts）
 *
 * 用法:
 *   npm run export:sub-app -- --app marketing-demo
 *   npm run export:sub-app -- --app marketing-demo --no-zip
 */
import fs from 'fs'
import path from 'path'
import {
  REPO_ROOT,
  WEB_ROOT,
  WEB_SRC,
  findRepoRoot,
  copyDirectory,
  copyFile,
  collectBundleFileList,
  findSubAppEntry,
  extractTopLevelRouteByPrefix,
  getPackageScriptsForFolder,
  routePrefixFromTo
} from './sub-app-bundle-shared.mjs'
import { zipDirectory } from './zip-directory.mjs'

function parseArgs(argv) {
  const out = { app: '', zip: true, out: '' }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--app' && argv[i + 1]) out.app = argv[++i]
    else if (a === '--zip') out.zip = true
    else if (a === '--no-zip') out.zip = false
    else if (a === '--out' && argv[i + 1]) out.out = argv[++i]
    else if (!a.startsWith('-') && !out.app) out.app = a
  }
  return out
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.app) {
    console.error('用法: npm run export:sub-app -- --app <app-code> [--no-zip] [--out dist/xxx]')
    process.exit(1)
  }

  const repoRoot = findRepoRoot() || REPO_ROOT
  const entry = await findSubAppEntry(args.app)
  if (!entry) {
    console.error(`未在 subApps.js 找到子应用: ${args.app}`)
    process.exit(1)
  }

  const { appCode, folder } = entry
  const fileList = collectBundleFileList(folder, appCode)
  if (!fileList.some((f) => f.rel.includes(`src/apps/${folder}`))) {
    console.error(`子应用源码目录不存在: AIEP-WEB/src/apps/${folder}`)
    process.exit(1)
  }

  const routerPath = path.join(WEB_SRC, 'router/index.js')
  const routerText = fs.readFileSync(routerPath, 'utf8')
  const prefix = routePrefixFromTo(entry.to)
  const routerBlock = extractTopLevelRouteByPrefix(routerText, prefix)
  if (!routerBlock) {
    console.error(`未在 router/index.js 找到前缀 ${prefix} 的路由块，请先完成子应用接入`)
    process.exit(1)
  }

  const pkgScripts = getPackageScriptsForFolder(folder)
  const rootPkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'))

  const stamp = new Date().toISOString().slice(0, 10)
  const bundleName = `${appCode}-bundle-${stamp}`
  const bundleDir = args.out
    ? path.resolve(repoRoot, args.out)
    : path.join(repoRoot, 'dist', 'sub-app-bundles', bundleName)

  const filesDir = path.join(bundleDir, 'files')
  fs.mkdirSync(filesDir, { recursive: true })

  for (const item of fileList) {
    const dest = path.join(filesDir, item.rel)
    if (item.type === 'dir') copyDirectory(item.src, dest)
    else copyFile(item.src, dest)
  }

  const manifest = {
    schemaVersion: 1,
    type: 'sub-app-bundle',
    appCode,
    folder,
    exportedAt: new Date().toISOString(),
    exportedFrom: {
      repo: 'ltc-demo',
      version: rootPkg.version || 'unknown'
    },
    subAppEntry: entry,
    routerPrefix: prefix,
    packageScripts: pkgScripts,
    files: fileList.map((f) => f.rel)
  }

  fs.writeFileSync(path.join(bundleDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  fs.mkdirSync(path.join(bundleDir, 'integration'), { recursive: true })
  fs.writeFileSync(
    path.join(bundleDir, 'integration', 'router-block.js'),
    routerBlock.trim() + '\n'
  )

  const integrateSrc = path.join(WEB_ROOT, 'scripts', 'sub-app-bundle-integrate.mjs')
  copyFile(integrateSrc, path.join(bundleDir, 'integrate.mjs'))

  const readme = `# ${entry.name}（${appCode}）子应用导出包

由 \`npm run export:sub-app -- --app ${appCode}\` 生成，用于无 Git / 离线交接。

## 接收方一键集成

1. 将整个 \`${path.basename(bundleDir)}\` 文件夹复制到 ltc-demo 仓库根目录同级或任意位置
2. 在 **ltc-demo 仓库根目录** 执行：

\`\`\`bash
node ${path.basename(bundleDir)}/integrate.mjs --yes
\`\`\`

或（若已拉取最新框架）：

\`\`\`bash
npm run import:sub-app -- --bundle ${path.basename(bundleDir)} --yes
\`\`\`

3. 校验：

\`\`\`bash
npm run validate:sub-app-registry
npm run dev:${folder}
\`\`\`

## 包内容

| 路径 | 说明 |
|------|------|
| \`files/\` | 子应用源码、文档、vite 配置、HTML 入口 |
| \`manifest.json\` | 注册信息、npm scripts、文件清单 |
| \`integration/router-block.js\` | router/index.js 路由块 |
| \`integrate.mjs\` | 一键集成脚本 |

## 选项

\`integrate.mjs --dry-run\` 检测冲突并预览  
\`integrate.mjs --yes\` 确认写入（有同名子应用时终端会提示选择）  
\`integrate.mjs --yes --force\` 覆盖全部（源码 + 注册表）  
\`integrate.mjs --yes --files-only\` 仅更新源码，不改 subApps/router
`
  fs.writeFileSync(path.join(bundleDir, 'README.md'), readme)

  console.log(`\n✓ 子应用导出完成: ${bundleDir}`)
  console.log(`  应用: ${entry.name} (${appCode})`)
  console.log(`  文件: ${fileList.length} 项`)
  console.log(`\n交接给对方后，在对方 ltc-demo 根目录执行:`)
  console.log(`  node ${path.relative(repoRoot, path.join(bundleDir, 'integrate.mjs'))} --yes`)
  console.log(`\nAgent：请 Read export-import-sub-app Skill 并按 handoff-checklist 交接。`)

  if (args.zip) {
    const zipPath = zipDirectory(bundleDir, `${bundleDir}.zip`)
    console.log(`\n✓ 已压缩: ${zipPath}`)
  }
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
