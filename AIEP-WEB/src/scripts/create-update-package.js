import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath, pathToFileURL } from 'url'
import { OBSOLETE_PACKAGE_EXCLUDE_FILENAMES, OBSOLETE_REL_PATHS } from './update-obsolete-paths.mjs'
import {
  ROOT_DOC_KEEP_AT_ROOT,
  ROOT_LEGACY_DOC_MAPPINGS
} from './update-root-doc-migration.mjs'
import { zipDirectory } from '../../scripts/zip-directory.mjs'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = path.resolve(SCRIPT_DIR, '../..')
const REPO_ROOT = path.resolve(WEB_ROOT, '..')

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

function copyDirectoryExclude(src, dest, excludeNames) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (excludeNames.includes(entry.name)) continue
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDirectoryExclude(s, d, excludeNames)
    else copyFile(s, d)
  }
}

function copySrcForPackage(srcRoot, destRoot, frameworkAppFolders, frameworkDocFolders) {
  fs.mkdirSync(destRoot, { recursive: true })
  for (const entry of fs.readdirSync(srcRoot, { withFileTypes: true })) {
    const s = path.join(srcRoot, entry.name)
    const d = path.join(destRoot, entry.name)

    if (entry.name === 'apps' && entry.isDirectory()) {
      fs.mkdirSync(d, { recursive: true })
      for (const app of fs.readdirSync(s, { withFileTypes: true })) {
        if (!app.isDirectory() || !frameworkAppFolders.includes(app.name)) continue
        copyDirectory(path.join(s, app.name), path.join(d, app.name))
      }
      continue
    }

    if (entry.name === 'docs' && entry.isDirectory()) {
      fs.mkdirSync(d, { recursive: true })
      for (const doc of fs.readdirSync(s, { withFileTypes: true })) {
        const ds = path.join(s, doc.name)
        const dd = path.join(d, doc.name)
        if (doc.name === '子应用文档' && doc.isDirectory()) {
          fs.mkdirSync(dd, { recursive: true })
          for (const sub of fs.readdirSync(ds, { withFileTypes: true })) {
            if (!sub.isDirectory() || !frameworkDocFolders.includes(sub.name)) continue
            copyDirectory(path.join(ds, sub.name), path.join(dd, sub.name))
          }
        } else {
          copyDirectory(ds, dd)
        }
      }
      continue
    }

    if (entry.isDirectory()) copyDirectory(s, d)
    else copyFile(s, d)
  }
}

function copyServerForPackage(serverRoot, destRoot, frameworkAppFolders) {
  if (!fs.existsSync(serverRoot)) return
  for (const f of ['app.js', 'package.json', 'package-lock.json']) {
    const s = path.join(serverRoot, f)
    if (fs.existsSync(s)) copyFile(s, path.join(destRoot, f))
  }
  const srcRoot = path.join(serverRoot, 'src')
  if (!fs.existsSync(srcRoot)) return
  for (const entry of fs.readdirSync(srcRoot, { withFileTypes: true })) {
    const s = path.join(srcRoot, entry.name)
    const d = path.join(destRoot, 'src', entry.name)
    if (entry.name === 'apps' && entry.isDirectory()) {
      fs.mkdirSync(d, { recursive: true })
      for (const app of fs.readdirSync(s, { withFileTypes: true })) {
        if (!app.isDirectory() || !frameworkAppFolders.includes(app.name)) continue
        copyDirectory(path.join(s, app.name), path.join(d, app.name))
      }
    } else if (entry.isDirectory()) {
      copyDirectory(s, d)
    }
  }
}

async function loadFrameworkFolders() {
  const subAppsPath = path.join(WEB_ROOT, 'src/config/subApps.js')
  const mod = await import(pathToFileURL(subAppsPath))
  const folders = (mod.subApps || []).map((a) => a.folder)
  const docFolders = folders.map((f) => (f === 'ai-smart-crm-admin' ? 'ai-smart-crm' : f))
  return { frameworkAppFolders: folders, frameworkDocFolders: [...new Set(docFolders)] }
}

function parseCreateArgs(argv) {
  const out = { noZip: false }
  for (const a of argv) {
    if (a === '--no-zip') out.noZip = true
  }
  return out
}

function resolveRouteImportPathForPackage(routeFilePath, importPath) {
  return path.normalize(path.join(path.dirname(routeFilePath), importPath))
}

/** 打包前校验：router / 子应用 main.js 中的 import 须在 files/ 内存在对应 .vue */
function validateUpdatePackageRouterImports(filesDir) {
  const webRoot = path.join(filesDir, 'AIEP-WEB')
  const targets = [path.join(webRoot, 'src/router/index.js')]
  const appsRoot = path.join(webRoot, 'src/apps')
  if (fs.existsSync(appsRoot)) {
    for (const entry of fs.readdirSync(appsRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const mainJs = path.join(appsRoot, entry.name, 'main.js')
      if (fs.existsSync(mainJs)) targets.push(mainJs)
    }
  }

  const missing = []
  for (const routeFile of targets) {
    const text = fs.readFileSync(routeFile, 'utf8')
    for (const m of text.matchAll(/import\s*\(\s*['"]([^'"]+\.vue)['"]\s*\)/g)) {
      const full = resolveRouteImportPathForPackage(routeFile, m[1])
      if (!fs.existsSync(full)) {
        missing.push({
          routeFile: path.relative(filesDir, routeFile).replace(/\\/g, '/'),
          importPath: m[1]
        })
      }
    }
  }

  if (missing.length) {
    console.error('\n❌ 更新包路由校验失败：以下 import 在 files/ 中缺少对应 .vue')
    for (const m of missing) console.error(`  · ${m.routeFile} → ${m.importPath}`)
    process.exit(1)
  }
  console.log('\n✓ 路由与页面文件一致性校验通过')
}

async function createUpdatePackage() {
  const cli = parseCreateArgs(process.argv.slice(2))
  console.log('开始创建更新包...')
  console.log(`仓库根目录: ${REPO_ROOT}`)
  console.log(`Web 根目录: ${WEB_ROOT}`)

  const packageJson = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'))
  const currentVersion = packageJson.version
  console.log(`当前版本: ${currentVersion}`)

  const { frameworkAppFolders, frameworkDocFolders } = await loadFrameworkFolders()
  console.log('框架子应用（将打入更新包）:', frameworkAppFolders.join(', '))

  const updatePackageName = `ltc-demo-update-v${currentVersion}`
  const updatePackageDir = path.join(REPO_ROOT, 'dist', updatePackageName)
  const filesDir = path.join(updatePackageDir, 'files')

  if (fs.existsSync(updatePackageDir)) {
    fs.rmSync(updatePackageDir, { recursive: true, force: true })
  }
  fs.mkdirSync(filesDir, { recursive: true })

  console.log('\n复制框架文件到 files/ ...')

  for (const f of ['package.json', 'package-lock.json']) {
    const s = path.join(REPO_ROOT, f)
    if (fs.existsSync(s)) {
      copyFile(s, path.join(filesDir, f))
      console.log(`  ✓ ${f}`)
    }
  }

  const webTargets = ['vite.config.js', 'index.html', 'vite.config.test.js']
  for (const f of webTargets) {
    const s = path.join(WEB_ROOT, f)
    if (fs.existsSync(s)) {
      copyFile(s, path.join(filesDir, 'AIEP-WEB', f))
      console.log(`  ✓ AIEP-WEB/${f}`)
    }
  }

  if (fs.existsSync(path.join(WEB_ROOT, 'build'))) {
    copyDirectory(path.join(WEB_ROOT, 'build'), path.join(filesDir, 'AIEP-WEB', 'build'))
    console.log('  ✓ AIEP-WEB/build')
  }
  if (fs.existsSync(path.join(WEB_ROOT, 'scripts'))) {
    copyDirectory(path.join(WEB_ROOT, 'scripts'), path.join(filesDir, 'AIEP-WEB', 'scripts'))
    console.log('  ✓ AIEP-WEB/scripts')
  }
  if (fs.existsSync(path.join(WEB_ROOT, 'public'))) {
    copyDirectory(path.join(WEB_ROOT, 'public'), path.join(filesDir, 'AIEP-WEB', 'public'))
    console.log('  ✓ AIEP-WEB/public')
  }

  copySrcForPackage(
    path.join(WEB_ROOT, 'src'),
    path.join(filesDir, 'AIEP-WEB', 'src'),
    frameworkAppFolders,
    frameworkDocFolders
  )
  console.log('  ✓ AIEP-WEB/src（排除用户自建子应用，仅含框架子应用）')

  const coreDocTargets = [
    { src: path.join(REPO_ROOT, '核心文档', '框架核心文档'), dest: '核心文档/框架核心文档', type: 'dir' },
    { src: path.join(REPO_ROOT, '核心文档', 'AI+产品落地'), dest: '核心文档/AI+产品落地', type: 'dir' },
    { src: path.join(REPO_ROOT, '核心文档', '执行说明.txt'), dest: '核心文档/执行说明.txt', type: 'file' }
  ]
  for (const { src, dest, type } of coreDocTargets) {
    if (!fs.existsSync(src)) continue
    const target = path.join(filesDir, dest)
    if (type === 'dir') {
      copyDirectoryExclude(src, target, OBSOLETE_PACKAGE_EXCLUDE_FILENAMES)
      if (dest === '核心文档/框架核心文档') {
        console.log(`  ✓ ${dest}（已排除 1.0 废止文档: ${OBSOLETE_PACKAGE_EXCLUDE_FILENAMES.join(', ')}）`)
      } else {
        console.log(`  ✓ ${dest}`)
      }
    } else {
      copyFile(src, target)
      console.log(`  ✓ ${dest}`)
    }
  }

  const serverRoot = path.join(REPO_ROOT, 'AIEP-SERVER')
  if (fs.existsSync(serverRoot)) {
    copyServerForPackage(
      serverRoot,
      path.join(filesDir, 'AIEP-SERVER'),
      frameworkAppFolders
    )
    console.log('  ✓ AIEP-SERVER（仅含框架子应用后端，保留用户自建服务）')
  }

  const cursorTargets = [
    { src: path.join(REPO_ROOT, '.cursor', 'skills'), dest: '.cursor/skills' },
    { src: path.join(REPO_ROOT, '.cursor', 'rules'), dest: '.cursor/rules' }
  ]
  for (const { src, dest } of cursorTargets) {
    if (!fs.existsSync(src)) continue
    copyDirectory(src, path.join(filesDir, dest))
    console.log(`  ✓ ${dest}（Agent Skills / Rules）`)
  }

  const rootScripts = ['sync-skills.mjs', 'sync-cursor-skills.mjs', 'sync-trae-skills.mjs']
  for (const f of rootScripts) {
    const s = path.join(REPO_ROOT, 'scripts', f)
    if (!fs.existsSync(s)) continue
    copyFile(s, path.join(filesDir, 'scripts', f))
    console.log(`  ✓ scripts/${f}`)
  }

  fs.writeFileSync(
    path.join(filesDir, 'framework-meta.json'),
    JSON.stringify({ frameworkAppFolders, frameworkDocFolders }, null, 2)
  )

  const updateInfo = {
    version: currentVersion,
    releaseDate: new Date().toISOString().split('T')[0],
    updateType: 'framework',
    updateMode: 'merge',
    preserveUserSubApps: true,
    minCompatibleVersion: '1.0.0',
    frameworkAppFolders,
    obsoletePaths: OBSOLETE_REL_PATHS,
    rootDocMigration: {
      keepAtRoot: ROOT_DOC_KEEP_AT_ROOT,
      mappings: ROOT_LEGACY_DOC_MAPPINGS
    },
    requirements: { nodeVersion: '>=18.0.0', npmVersion: '>=8.0.0' }
  }
  fs.writeFileSync(path.join(updatePackageDir, 'update-info.json'), JSON.stringify(updateInfo, null, 2))

  copyFile(path.join(SCRIPT_DIR, 'apply-update-package.mjs'), path.join(updatePackageDir, 'update.js'))
  copyFile(path.join(SCRIPT_DIR, 'update-obsolete-paths.mjs'), path.join(updatePackageDir, 'update-obsolete-paths.mjs'))
  copyFile(path.join(SCRIPT_DIR, 'update-root-doc-migration.mjs'), path.join(updatePackageDir, 'update-root-doc-migration.mjs'))
  copyFile(path.join(SCRIPT_DIR, 'repo-root-detect.mjs'), path.join(updatePackageDir, 'repo-root-detect.mjs'))
  copyFile(path.join(SCRIPT_DIR, 'flat-web-to-monorepo.mjs'), path.join(updatePackageDir, 'flat-web-to-monorepo.mjs'))
  copyFile(path.join(SCRIPT_DIR, 'update-sandbox-guard.mjs'), path.join(updatePackageDir, 'update-sandbox-guard.mjs'))

  const launcherDir = path.join(SCRIPT_DIR, 'update-package-launchers')
  for (const name of ['预览更新.bat', '安装更新.bat', 'update-run-with-log.mjs']) {
    copyFile(path.join(launcherDir, name), path.join(updatePackageDir, name))
  }

  const readme = `# LTC 设计应用系统 v${currentVersion} 更新包

## 说明

本更新包仅更新**主应用框架**与框架内置子应用，**不会删除**你自建的 \`src/apps/<你的应用>\` 与 \`src/docs/子应用文档/<你的应用>\`。

**版本规则**：仅当本包版本（v${currentVersion}）**大于**你项目 \`package.json\` 中的 \`version\` 时才安装；相等或更低则自动跳过。

> 你的项目文件夹可以叫任意名字（如 \`Ltc-sj-code\`、\`project-code-package_gx\`），**不必**叫 AIEP-DEV。
>
> **旧版 flat-web**（\`src/\` 在根目录、无 \`AIEP-WEB/\`）也支持；更新时会**自动迁入 \`AIEP-WEB/\`**（与主仓库一致）。**1.x 可无 subApps.js**，将自动创建注册表。若需保持扁平结构：\`--keep-flat-web\`。

## 使用步骤（零风险模式）

**最简单（无需命令行）**：解压到项目根目录后，依次双击：

1. \`预览更新.bat\` — 只看将改什么，**不修改文件**（进度与结果写入 \`预览更新-日志.txt\`）
2. \`安装更新.bat\` — 输入 \`Y\` 确认后正式安装（实时显示进度；日志 \`安装更新-日志.txt\`；详细日志另见 \`backups/v*/update.log\`）

> 双击后会**新开一个黑色窗口**并保持打开，请勿关闭；完成后按任意键关闭。若窗口闪退，请打开同目录下的 \`*-日志.txt\` 查看原因。

**命令行**（与 .bat 等价）：

\`\`\`bash
# 1. 预览（不修改文件）
node ltc-demo-update-v${currentVersion}/update.js --dry-run

# 2. 确认执行（备份 → 合并 → 校验 → 失败自动回滚）
node ltc-demo-update-v${currentVersion}/update.js --yes
\`\`\`

或进入本目录后执行（自动向上查找项目；若与项目文件夹同级，v2.1.0+ 会自动探测）：

\`\`\`bash
cd ltc-demo-update-v${currentVersion}
node update.js --dry-run
node update.js --yes
\`\`\`

若更新包与项目**同级**（例如都在 Desktop），须指定项目路径：

\`\`\`bash
node update.js --project ../你的项目文件夹名 --dry-run
node update.js --project ../你的项目文件夹名 --yes
\`\`\`

若更新包在项目根的**上一级**，可：

\`\`\`bash
node update.js --project .. --yes
\`\`\`

**零风险保障**（详见《更新分发方案》§13）：

- 全量备份 + 失败自动回滚
- 自建子应用源码/文档不删
- 自建子应用路由与嵌入前缀**自动合并**（无需手工改 router/App.vue）
- 主应用验证失败（注册表/build）→ **自动回滚**；子应用构建失败 → **仅提示异常说明**
- 自动删除 1.0 废弃文档：\`环境安装指南.md\`、\`依赖安装指南.md\`、\`A-安装说明.txt\`、\`系统设计规范.md\`（见《更新分发方案》§2.4）

**耗时优化**（避免「更新一小时」）：

- 子应用验证：更新成功后会 **询问是否立即验证**（输入 \`y\` 即可并行构建，无需手输 \`npm run build:<folder>\`）
- 强制验证：\`--verify-sub-apps\`；静默跳过：\`--no-verify-sub-apps\`
- dependencies 未变时 **自动跳过 npm install**
- 终端会打印各阶段 \`⏱\` 耗时，便于定位慢步骤

**Agent / IDE 沙箱**（Trae/Cursor Agent 对话内代跑）：

- \`--dry-run\` 可在 Agent 内预览；\`--yes\` / \`--rollback\` **须本人确认**（Agent 代跑会被拦截，避免进程崩溃）
- 本人执行：双击 \`安装更新.bat\`，或在 IDE **终端 → 新建终端** 粘贴 \`node update.js --yes\`（不必单独开 PowerShell）
- \`--yes\` 运行日志自动写入 \`backups/v*/update.log\`
- CI：\`--allow-sandbox\` 或 \`LTC_ALLOW_SANDBOX=1\`

安装成功后会打印「熟悉项目与规范」清单（§12），并**询问是否删除**本更新包目录（及同目录 zip）。

\`\`\`bash
# 成功后不询问，直接删除更新包
node update.js --yes --delete-package

# 成功后始终保留更新包
node update.js --yes --keep-package
\`\`\`

**更新后子应用空白**（路由变了但页面不显示）：

\`\`\`bash
# 从本更新包 files/ 补全框架子应用源码、路由块与缺失页面（不修改 version）
node update.js --repair-routes --dry-run
node update.js --repair-routes --yes
npm run build
\`\`\`

## 更新后熟悉项目与规范

必读顺序与自检清单见 **《更新分发方案》§12**，包括：

- 框架接入：\`主应用子应用接入规范.md\`、\`执行说明.txt\`
- 产品填报：\`核心文档/AI+产品落地/02-子应用通用模板/\`
- 校验：\`validate:sub-app-registry\`、\`validate:sdd\`
- **Agent Skills**（\`npm install\` / \`update.js\` 后 **postinstall 自动同步**，规则自动加载，无需人工）：
  - 规范：\`.cursor/rules/agent-skills-auto-exec.mdc\`
  - 直接对话：「推进 {app-code} 步骤 N」即可

## 回滚

\`\`\`bash
node update.js --rollback backups/v${currentVersion}-<时间戳>
npm install && npm run build
\`\`\`

版本: v${currentVersion}
`
  fs.writeFileSync(path.join(updatePackageDir, 'README.md'), readme)

  validateUpdatePackageRouterImports(filesDir)

  let zipPath = null
  if (!cli.noZip) {
    zipPath = zipDirectory(updatePackageDir, path.join(REPO_ROOT, 'dist', `${updatePackageName}.zip`))
    console.log(`\n✓ 已压缩: ${zipPath}`)
  }

  console.log(`\n✅ 更新包已生成: ${updatePackageDir}`)
  if (zipPath) console.log(`✅ 分发 zip: ${zipPath}`)
  console.log('\n分发给用户后（解压 zip 到项目根即可，无需绝对路径）:')
  console.log(`  node ltc-demo-update-v${currentVersion}/update.js --dry-run`)
  console.log(`  node ltc-demo-update-v${currentVersion}/update.js --yes`)
}

createUpdatePackage().catch((e) => {
  console.error('❌ 创建更新包失败:', e.message)
  process.exit(1)
})
