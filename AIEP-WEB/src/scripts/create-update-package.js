import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath, pathToFileURL } from 'url'
import { OBSOLETE_FILENAMES, OBSOLETE_REL_PATHS } from './update-obsolete-paths.mjs'

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

async function createUpdatePackage() {
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
      copyDirectoryExclude(src, target, OBSOLETE_FILENAMES)
      if (dest === '核心文档/框架核心文档') {
        console.log(`  ✓ ${dest}（已排除废弃文档: ${OBSOLETE_FILENAMES.join(', ')}）`)
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
    requirements: { nodeVersion: '>=18.0.0', npmVersion: '>=8.0.0' }
  }
  fs.writeFileSync(path.join(updatePackageDir, 'update-info.json'), JSON.stringify(updateInfo, null, 2))

  copyFile(path.join(SCRIPT_DIR, 'apply-update-package.mjs'), path.join(updatePackageDir, 'update.js'))
  copyFile(path.join(SCRIPT_DIR, 'update-obsolete-paths.mjs'), path.join(updatePackageDir, 'update-obsolete-paths.mjs'))

  const readme = `# LTC 应用系统 v${currentVersion} 更新包

## 说明

本更新包仅更新**主应用框架**与框架内置子应用，**不会删除**你自建的 \`src/apps/<你的应用>\` 与 \`src/docs/子应用文档/<你的应用>\`。

**版本规则**：仅当本包版本（v${currentVersion}）**大于**你项目 \`package.json\` 中的 \`version\` 时才安装；相等或更低则自动跳过。

## 使用步骤（零风险模式）

**推荐**：将整个文件夹解压到**项目根目录**（与 package.json 同级），先预览再确认：

\`\`\`bash
# 1. 预览（不修改文件）
node ltc-demo-update-v${currentVersion}/update.js --dry-run

# 2. 确认执行（备份 → 合并 → 校验 → 失败自动回滚）
node ltc-demo-update-v${currentVersion}/update.js --yes
\`\`\`

或进入本目录后执行（自动向上查找项目）：

\`\`\`bash
cd ltc-demo-update-v${currentVersion}
node update.js --dry-run
node update.js --yes
\`\`\`

若更新包不在项目内，可指定**相对路径**：

\`\`\`bash
node update.js --project .. --yes
\`\`\`

**零风险保障**（详见《更新分发方案》§13）：

- 全量备份 + 失败自动回滚
- 自建子应用源码/文档不删
- 自建子应用路由与嵌入前缀**自动合并**（无需手工改 router/App.vue）
- 主应用验证失败（注册表/build）→ **自动回滚**；子应用构建失败 → **仅提示异常说明**
- 自动删除 1.0 废弃文档：\`环境安装指南.md\`、\`依赖安装指南.md\`、\`A-安装说明.txt\`、\`系统设计规范.md\`（见《更新分发方案》§2.4）

安装成功后会打印「熟悉项目与规范」清单（§12）。

## 更新后熟悉项目与规范

必读顺序与自检清单见 **《更新分发方案》§12**，包括：

- 框架接入：\`主应用子应用接入规范.md\`、\`执行说明.txt\`
- 产品填报：\`核心文档/AI+产品落地/02-子应用通用模板/\`
- 校验：\`validate:sub-app-registry\`、\`validate:sdd\`

## 回滚

\`\`\`bash
node update.js --rollback backups/v${currentVersion}-<时间戳>
npm install && npm run build
\`\`\`

版本: v${currentVersion}
`
  fs.writeFileSync(path.join(updatePackageDir, 'README.md'), readme)

  console.log(`\n✅ 更新包已生成: ${updatePackageDir}`)
  console.log('\n分发给用户后（解压到项目根即可，无需绝对路径）:')
  console.log(`  node ltc-demo-update-v${currentVersion}/update.js --dry-run`)
  console.log(`  node ltc-demo-update-v${currentVersion}/update.js --yes`)
}

createUpdatePackage().catch((e) => {
  console.error('❌ 创建更新包失败:', e.message)
  process.exit(1)
})
