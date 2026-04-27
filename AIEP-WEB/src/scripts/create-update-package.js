import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')

async function createUpdatePackage() {
  console.log('开始创建更新包...')

  try {
    // 1. 读取当前版本
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'))
    const currentVersion = packageJson.version
    console.log(`当前版本: ${currentVersion}`)

    // 2. 构建项目
    console.log('构建项目...')
    execSync('npm run build', { stdio: 'inherit', cwd: projectRoot })
    execSync('npm run build:sample-app', { stdio: 'inherit', cwd: projectRoot })

    // 2. 创建更新包目录
    const updatePackageName = `ltc-demo-update-v${currentVersion}`
    const updatePackageDir = path.join(projectRoot, 'dist', updatePackageName)
    
    if (fs.existsSync(updatePackageDir)) {
      fs.rmSync(updatePackageDir, { recursive: true, force: true })
    }
    fs.mkdirSync(updatePackageDir, { recursive: true })

    // 3. 全量备份提示（按新规则）
    console.log('=====================================')
    console.log('全量备份操作提示...')
    console.log('=====================================')
    console.log('根据创建指南中的全量备份规则要求：')
    console.log('1. 备份文件应存储在项目根目录的 versions 目录下')
    console.log('2. 每个版本的备份应创建独立的子目录，以当前版本号命名')
    console.log('3. 备份目录命名格式：versions/v{版本号}')
    console.log('4. 备份内容应包括：src、public、build、scripts、docs、框架核心文档、package.json、package-lock.json、vite.config.js、index.html、执行说明.txt')
    console.log('5. 应生成版本说明文件，格式：{版本号}_版本说明.md')
    console.log('6. 版本说明文件应详细描述当前版本较上一版本的更新明细')
    console.log('=====================================')

    // 4. 复制必要文件
    console.log('复制文件...')
    // 获取变更的文档文件
    const changedDocs = getChangedDocs()
    console.log('变更的文档:', changedDocs)
    
    const filesToCopy = [
      'public',
      'build',
      'scripts',
      'docs',
      '框架核心文档',
      'package.json',
      'package-lock.json',
      'vite.config.js',
      'index.html'
    ].concat(changedDocs)

    for (const file of filesToCopy) {
      const sourcePath = path.join(projectRoot, file)
      const destPath = path.join(updatePackageDir, file)
      
      if (fs.existsSync(sourcePath)) {
        if (fs.statSync(sourcePath).isDirectory()) {
          copyDirectory(sourcePath, destPath)
        } else {
          fs.copyFileSync(sourcePath, destPath)
        }
        console.log(`  ✓ ${file}`)
      }
    }
    
    // 复制src目录，但排除子应用目录
    console.log('复制src目录（排除子应用）...')
    const srcSourcePath = path.join(projectRoot, 'src')
    const srcDestPath = path.join(updatePackageDir, 'src')
    if (fs.existsSync(srcSourcePath)) {
      copyDirectoryExclude(srcSourcePath, srcDestPath, ['apps'])
      console.log('  ✓ src目录（排除子应用）')
    }

    // 5. 创建更新包信息文件
    const updateInfo = {
      version: currentVersion,
      releaseDate: new Date().toISOString().split('T')[0],
      updateType: 'full',
      updateMode: 'merge',
      changes: getChangesFromGit(),
      requirements: {
        nodeVersion: '>=18.0.0',
        npmVersion: '>=8.0.0',
        diskSpace: '100MB'
      },
      backupRequired: true,
      restartRequired: true
    }

    fs.writeFileSync(
      path.join(updatePackageDir, 'update-info.json'),
      JSON.stringify(updateInfo, null, 2)
    )

    // 6. 创建更新包的 package.json
    const updatePackageJson = {
      name: 'ltc-demo-update',
      version: currentVersion,
      updateType: 'full',
      targetVersion: currentVersion,
      minCompatibleVersion: '1.0.0',
      releaseDate: new Date().toISOString().split('T')[0],
      description: `LTC 应用系统 v${currentVersion} 全量更新包`,
      author: 'LTC Team',
      dependencies: {
        node: '>=18.0.0',
        npm: '>=8.0.0'
      }
    }

    fs.writeFileSync(
      path.join(updatePackageDir, 'package.json'),
      JSON.stringify(updatePackageJson, null, 2)
    )

    // 7. 创建更新脚本
    createUpdateScript(updatePackageDir, currentVersion)
    createRollbackScript(updatePackageDir, currentVersion)

    // 8. 创建 README
    createReadme(updatePackageDir, currentVersion)
    
    // 9. 创建更新内容说明文档
    createUpdateContentDoc(updatePackageDir, currentVersion)

    console.log(`\n✅ 更新包创建成功！`)
    console.log(`📦 更新包路径: ${updatePackageDir}`)
    console.log(`\n💡 提示：`)
    console.log(`  - 更新包已创建在 dist/ 目录`)
    console.log(`  - 可以手动打包为 ZIP 文件进行分发`)
    console.log(`  - 用户解压后执行 update.js 即可更新`)

  } catch (error) {
    console.error('❌ 创建更新包失败:', error.message)
    process.exit(1)
  }
}

function copyDirectory(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function copyDirectoryExclude(src, dest, exclude) {
  fs.mkdirSync(dest, { recursive: true })
  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      if (!exclude.includes(entry.name)) {
        copyDirectoryExclude(srcPath, destPath, exclude)
      }
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function getChangesFromGit() {
  try {
    const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""', {
      encoding: 'utf-8'
    }).trim()

    let logCommand = 'git log --pretty=format:"%h|%s|%an|%ad" --date=short -10'
    if (lastTag) {
      logCommand = `git log ${lastTag}..HEAD --pretty=format:"%h|%s|%an|%ad" --date=short`
    }

    const logs = execSync(logCommand, { encoding: 'utf-8' }).trim().split('\n')

    return logs.map(log => {
      const [hash, message, author, date] = log.split('|')
      return {
        type: message.includes('feat') ? 'feature' : 
              message.includes('fix') ? 'bugfix' : 'improvement',
        category: message.includes('feat') ? '新增功能' : 
                 message.includes('fix') ? '问题修复' : '优化改进',
        description: message,
        author,
        date
      }
    })
  } catch (error) {
    return [{
      type: 'improvement',
      category: '优化改进',
      description: '系统更新',
      author: 'LTC Team',
      date: new Date().toISOString().split('T')[0]
    }]
  }
}

function getChangedDocs() {
  try {
    // 所有可能的文档文件
    const allDocs = [
      '产品设计文档.md',
      '安装指南.md',
      '框架基线.md',
      '系统设计规范.md',
      '文档对齐清单.md',
      '更新分发方案.md',
      '一键更新指南.md',
      '主应用打包指南.md',
      '子应用打包指南.md',
      '创建指南.md'
    ]

    // 使用 git 检测变更的文件
    const changedFiles = execSync('git diff --name-only HEAD~1 HEAD', {
      encoding: 'utf-8'
    }).trim().split('\n')

    // 过滤出变更的文档文件
    const changedDocs = allDocs.filter(doc => {
      return changedFiles.includes(doc)
    })

    // 如果没有检测到变更，返回所有文档（确保首次打包包含所有文档）
    return changedDocs.length > 0 ? changedDocs : allDocs
  } catch (error) {
    // 如果 git 命令失败，返回所有文档
    return [
      '产品设计文档.md',
      '安装指南.md',
      '框架基线.md',
      '系统设计规范.md',
      '文档对齐清单.md',
      '更新分发方案.md',
      '一键更新指南.md',
      '主应用打包指南.md',
      '子应用打包指南.md',
      '创建指南.md'
    ]
  }
}

function createUpdateScript(packageDir, version) {
  const scriptContent = "#!/usr/bin/env node\n\n" +
    "import fs from 'fs'\n" +
    "import path from 'path'\n" +
    "import { execSync } from 'child_process'\n" +
    "import { fileURLToPath } from 'url'\n\n" +
    "const __filename = fileURLToPath(import.meta.url)\n" +
    "const __dirname = path.dirname(__filename)\n" +
    "const projectRoot = path.join(__dirname, '..')\n\n" +
    "console.log('开始系统更新...')\n" +
    "console.log('更新版本: v" + version + "')\n\n" +
    "try {\n" +
    "  // 1. 检查环境\n" +
    "  console.log('\\n检查环境...')\n" +
    "  const nodeVersion = process.version\n" +
    "  console.log('  Node.js 版本: ' + nodeVersion)\n" +
    "  \n" +
    "  if (nodeVersion < 'v18.0.0') {\n" +
    "    console.error('❌ Node.js 版本过低，需要 18.0 或更高版本')\n" +
    "    process.exit(1)\n" +
    "  }\n\n" +
    "  // 2. 创建备份\n" +
    "  console.log('\\n创建备份...')\n" +
    "  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')\n" +
    "  const backupDir = path.join(projectRoot, 'backups', 'v" + version + "-' + timestamp)\n" +
    "  fs.mkdirSync(backupDir, { recursive: true })\n" +
    "  \n" +
    "  const filesToBackup = ['src', 'public', 'build', 'scripts', 'docs', '框架核心文档', 'package.json', 'package-lock.json']\n" +
    "  for (const file of filesToBackup) {\n" +
    "    const sourcePath = path.join(projectRoot, file)\n" +
    "    if (fs.existsSync(sourcePath)) {\n" +
    "      const destPath = path.join(backupDir, file)\n" +
    "      if (fs.statSync(sourcePath).isDirectory()) {\n" +
    "        copyDirectory(sourcePath, destPath)\n" +
    "      } else {\n" +
    "        fs.copyFileSync(sourcePath, destPath)\n" +
    "      }\n" +
    "      console.log('  ✓ 备份 ' + file)\n" +
    "    }\n" +
    "  }\n\n" +
    "  // 3. 复制更新文件\n" +
    "  console.log('\\n复制更新文件...')\n" +
    "  const updateFilesDir = path.join(__dirname, 'files')\n" +
    "  const filesToUpdate = ['src', 'public', 'build', 'scripts', 'docs', '框架核心文档', 'package.json', 'package-lock.json', '产品设计文档.md', '安装指南.md', '框架基线.md', '系统设计规范.md', '文档对齐清单.md', '更新分发方案.md', '一键更新指南.md', '主应用打包指南.md', '子应用打包指南.md', '创建指南.md']\n" +
    "  \n" +
    "  for (const file of filesToUpdate) {\n" +
    "    const sourcePath = path.join(updateFilesDir, file)\n" +
    "    const destPath = path.join(projectRoot, file)\n" +
    "    \n" +
    "    if (fs.existsSync(sourcePath)) {\n" +
    "      if (fs.existsSync(destPath)) {\n" +
    "        if (fs.statSync(destPath).isDirectory()) {\n" +
    "          fs.rmSync(destPath, { recursive: true, force: true })\n" +
    "        } else {\n" +
    "          fs.unlinkSync(destPath)\n" +
    "        }\n" +
    "      }\n" +
    "      \n" +
    "      if (fs.statSync(sourcePath).isDirectory()) {\n" +
    "        copyDirectory(sourcePath, destPath)\n" +
    "      } else {\n" +
    "        fs.copyFileSync(sourcePath, destPath)\n" +
    "      }\n" +
    "      console.log('  ✓ 更新 ' + file)\n" +
    "    }\n" +
    "  }\n\n" +
    "  // 4. 安装依赖\n" +
    "  console.log('\\n安装依赖...')\n" +
    "  execSync('npm install', { stdio: 'inherit', cwd: projectRoot })\n\n" +
    "  // 5. 构建项目\n" +
    "  console.log('\\n构建项目...')\n" +
    "  execSync('npm run build', { stdio: 'inherit', cwd: projectRoot })\n" +
    "  execSync('npm run build:sample-app', { stdio: 'inherit', cwd: projectRoot })\n\n" +
    "  // 6. 清理更新包\n" +
    "  console.log('\\n清理更新包...')\n" +
    "  const updatePackageDir = path.join(projectRoot, 'ltc-demo-update')\n" +
    "  if (fs.existsSync(updatePackageDir)) {\n" +
    "    fs.rmSync(updatePackageDir, { recursive: true, force: true })\n" +
    "  }\n\n" +
    "  console.log('\\n✅ 系统更新完成！')\n" +
    "  console.log('\\n📝 更新内容：')\n" +
    "  console.log('  - 更新到版本 v" + version + "')\n" +
    "  console.log('  - 已创建更新备份')\n" +
    "  console.log('  - 已安装最新依赖')\n" +
    "  console.log('  - 已重新构建项目')\n" +
    "  console.log('\\n💡 提示：')\n" +
    "  console.log('  - 备份位置: ' + backupDir)\n" +
    "  console.log('  - 如果更新后出现问题，可以使用 rollback.js 回滚')\n" +
    "  console.log('  - 建议重启开发服务器: npm run dev')\n\n" +
    "} catch (error) {\n" +
    "  console.error('\\n❌ 更新失败:', error.message)\n" +
    "  console.error('\\n💡 提示：')\n" +
    "  console.error('  - 请检查错误信息并重试')\n" +
    "  console.error('  - 如果问题持续，请联系技术支持')\n" +
    "  process.exit(1)\n" +
    "}\n\n" +
    "function copyDirectory(src, dest) {\n" +
    "  fs.mkdirSync(dest, { recursive: true })\n" +
    "  const entries = fs.readdirSync(src, { withFileTypes: true })\n\n" +
    "  for (const entry of entries) {\n" +
    "    const srcPath = path.join(src, entry.name)\n" +
    "    const destPath = path.join(dest, entry.name)\n\n" +
    "    if (entry.isDirectory()) {\n" +
    "      copyDirectory(srcPath, destPath)\n" +
    "    } else {\n" +
    "      fs.copyFileSync(srcPath, destPath)\n" +
    "    }\n" +
    "  }\n" +
    "}\n";

  fs.writeFileSync(path.join(packageDir, 'update.js'), scriptContent)
}

function createRollbackScript(packageDir, version) {
  const scriptContent = "#!/usr/bin/env node\n\n" +
    "import fs from 'fs'\n" +
    "import path from 'path'\n" +
    "import { execSync } from 'child_process'\n" +
    "import readline from 'readline'\n" +
    "import { fileURLToPath } from 'url'\n\n" +
    "const __filename = fileURLToPath(import.meta.url)\n" +
    "const __dirname = path.dirname(__filename)\n" +
    "const projectRoot = path.join(__dirname, '..')\n\n" +
    "console.log('开始版本回滚...')\n\n" +
    "try {\n" +
    "  // 1. 查找备份\n" +
    "  console.log('\\n查找备份...')\n" +
    "  const backupsDir = path.join(projectRoot, 'backups')\n" +
    "  \n" +
    "  if (!fs.existsSync(backupsDir)) {\n" +
    "    console.error('❌ 未找到备份目录')\n" +
    "    process.exit(1)\n" +
    "  }\n\n" +
    "  const backups = fs.readdirSync(backupsDir)\n" +
    "    .filter(dir => dir.startsWith('v" + version + "-'))\n" +
    "    .sort()\n" +
    "    .reverse()\n\n" +
    "  if (backups.length === 0) {\n" +
    "    console.error('❌ 未找到版本 v" + version + " 的备份')\n" +
    "    process.exit(1)\n" +
    "  }\n\n" +
    "  console.log('\\n可用的备份：')\n" +
    "  backups.forEach((backup, index) => {\n" +
    "    console.log('  ' + (index + 1) + '. ' + backup)\n" +
    "  })\n\n" +
    "  const rl = readline.createInterface({\n" +
    "    input: process.stdin,\n" +
    "    output: process.stdout\n" +
    "  })\n\n" +
    "  rl.question('\\n请选择要回滚的备份 (1-' + backups.length + '): ', (answer) => {\n" +
    "    try {\n" +
    "      const choice = parseInt(answer.trim()) - 1\n" +
    "      if (choice < 0 || choice >= backups.length) {\n" +
    "        console.error('❌ 无效的选择')\n" +
    "        rl.close()\n" +
    "        process.exit(1)\n" +
    "        return\n" +
    "      }\n\n" +
    "      const selectedBackup = backups[choice]\n" +
    "      const backupPath = path.join(backupsDir, selectedBackup)\n\n" +
    "      console.log('\\n回滚到备份: ' + selectedBackup)\n\n" +
    "      // 2. 恢复文件\n" +
    "      console.log('\\n恢复文件...')\n" +
    "      const filesToRestore = ['src', 'public', 'build', 'scripts', 'docs', '框架核心文档', 'package.json', 'package-lock.json']\n" +
    "      \n" +
    "      for (const file of filesToRestore) {\n" +
    "        const sourcePath = path.join(backupPath, file)\n" +
    "        const destPath = path.join(projectRoot, file)\n" +
    "        \n" +
    "        if (fs.existsSync(sourcePath)) {\n" +
    "          if (fs.existsSync(destPath)) {\n" +
    "            if (fs.statSync(destPath).isDirectory()) {\n" +
    "              fs.rmSync(destPath, { recursive: true, force: true })\n" +
    "            } else {\n" +
    "              fs.unlinkSync(destPath)\n" +
    "            }\n" +
    "          }\n" +
    "          \n" +
    "          if (fs.statSync(sourcePath).isDirectory()) {\n" +
    "            copyDirectory(sourcePath, destPath)\n" +
    "          } else {\n" +
    "            fs.copyFileSync(sourcePath, destPath)\n" +
    "          }\n" +
    "          console.log('  ✓ 恢复 ' + file)\n" +
    "        }\n" +
    "      }\n\n" +
    "      // 3. 安装依赖\n" +
    "      console.log('\\n安装依赖...')\n" +
    "      execSync('npm install', { stdio: 'inherit', cwd: projectRoot })\n\n" +
    "      // 4. 构建项目\n" +
    "      console.log('\\n构建项目...')\n" +
    "      execSync('npm run build', { stdio: 'inherit', cwd: projectRoot })\n" +
    "      execSync('npm run build:sample-app', { stdio: 'inherit', cwd: projectRoot })\n\n" +
    "      console.log('\\n✅ 版本回滚完成！')\n" +
    "      console.log('\\n📝 回滚内容：')\n" +
    "      console.log('  - 回滚到备份: ' + selectedBackup)\n" +
    "      console.log('  - 已恢复文件')\n" +
    "      console.log('  - 已重新安装依赖')\n" +
    "      console.log('  - 已重新构建项目')\n" +
    "      console.log('\\n💡 提示：')\n" +
    "      console.log('  - 建议重启开发服务器: npm run dev')\n\n" +
    "    } catch (error) {\n" +
    "      console.error('❌ 回滚失败:', error.message)\n" +
    "    } finally {\n" +
    "      rl.close()\n" +
    "    }\n" +
    "  })\n\n" +
    "} catch (error) {\n" +
    "  console.error('❌ 回滚失败:', error.message)\n" +
    "  process.exit(1)\n" +
    "}\n\n" +
    "function copyDirectory(src, dest) {\n" +
    "  fs.mkdirSync(dest, { recursive: true })\n" +
    "  const entries = fs.readdirSync(src, { withFileTypes: true })\n\n" +
    "  for (const entry of entries) {\n" +
    "    const srcPath = path.join(src, entry.name)\n" +
    "    const destPath = path.join(dest, entry.name)\n\n" +
    "    if (entry.isDirectory()) {\n" +
    "      copyDirectory(srcPath, destPath)\n" +
    "    } else {\n" +
    "      fs.copyFileSync(srcPath, destPath)\n" +
    "    }\n" +
    "  }\n" +
    "}\n";

  fs.writeFileSync(path.join(packageDir, 'rollback.js'), scriptContent)
}

function createVersionNote(version) {
  const changes = getChangesFromGit()
  const today = new Date().toISOString().split('T')[0]
  
  // 分类变更
  const features = changes.filter(change => change.type === 'feature')
  const improvements = changes.filter(change => change.type === 'improvement')
  const bugfixes = changes.filter(change => change.type === 'bugfix')
  
  // 生成变更内容
  const featuresContent = features.length > 0 ? features.map(change => '- ' + change.description).join('\n') : '- 无'
  const improvementsContent = improvements.length > 0 ? improvements.map(change => '- ' + change.description).join('\n') : '- 无'
  const bugfixesContent = bugfixes.length > 0 ? bugfixes.map(change => '- ' + change.description).join('\n') : '- 无'
  
  return "# 版本说明\n\n" +
    "## 版本信息\n\n" +
    "- **版本号**：v" + version + "\n" +
    "- **发布日期**：" + today + "\n" +
    "- **更新类型**：全量更新\n" +
    "- **上一版本**：v" + getPreviousVersion(version) + "\n\n" +
    "## 更新明细\n\n" +
    "### 新增功能\n\n" +
    featuresContent + "\n\n" +
    "### 优化改进\n\n" +
    improvementsContent + "\n\n" +
    "### 问题修复\n\n" +
    bugfixesContent + "\n\n" +
    "## 技术变更\n\n" +
    "### 依赖变更\n\n" +
    "- **新增依赖**：\n" +
    "  - pinia: ^2.1.7\n" +
    "  - vue-i18n: ^9.8.0\n" +
    "  - echarts: ^5.4.3\n\n" +
    "- **更新依赖**：\n" +
    "  - arco-design: ^2.61.0\n" +
    "  - vue: ^3.4.0\n" +
    "  - vite: ^6.0.3\n\n" +
    "## 系统要求\n\n" +
    "- **Node.js**：>= 18.0.0\n" +
    "- **npm**：>= 8.0.0\n" +
    "- **磁盘空间**：100MB\n\n" +
    "## 升级注意事项\n\n" +
    "- 更新前请确保备份重要数据\n" +
    "- 更新过程会自动安装新依赖\n" +
    "- 更新后会自动重新构建项目\n" +
    "- 更新后请启动开发服务器验证\n"
}

function getPreviousVersion(currentVersion) {
  // 简单的版本号递减逻辑
  const parts = currentVersion.split('.')
  let major = parseInt(parts[0])
  let minor = parseInt(parts[1])
  let patch = parseInt(parts[2])
  
  if (patch > 0) {
    patch--
  } else if (minor > 0) {
    minor--
    patch = 9
  } else if (major > 0) {
    major--
    minor = 9
    patch = 9
  }
  
  return `${major}.${minor}.${patch}`
}

function createReadme(packageDir, version) {
  const readmeContent = "# LTC 应用系统 v" + version + " 更新包\n\n" +
    "## 更新说明\n\n" +
    "本更新包用于将 LTC 应用系统更新到 v" + version + " 版本。\n\n" +
    "## 更新内容\n\n" +
    "- 集成 Pinia 状态管理库\n" +
    "- 集成 Vue I18n 国际化支持\n" +
    "- 集成 ECharts 数据可视化\n" +
    "- 优化 Arco Design 组件集成\n" +
    "- 修复 Pinia 未注册导致页面空白的问题\n\n" +
    "## 系统要求\n\n" +
    "- Node.js: >= 18.0.0\n" +
    "- npm: >= 8.0.0\n" +
    "- 磁盘空间: 100MB\n\n" +
    "## 更新步骤\n\n" +
    "### 1. 解压更新包\n\n" +
    "将更新包解压到项目根目录。\n\n" +
    "### 2. 执行更新脚本\n\n" +
    "```bash\n" +
    "node update.js\n" +
    "```\n\n" +
    "### 3. 验证更新\n\n" +
    "更新完成后，启动开发服务器验证：\n\n" +
    "```bash\n" +
    "npm run dev\n" +
    "```\n\n" +
    "### 4. 回滚（如需要）\n\n" +
    "如果更新后出现问题，可以执行回滚脚本：\n\n" +
    "```bash\n" +
    "node rollback.js\n" +
    "```\n\n" +
    "## 注意事项\n\n" +
    "- 更新前会自动创建备份\n" +
    "- 更新过程中请勿关闭终端\n" +
    "- 更新完成后建议重启开发服务器\n" +
    "- 如遇问题，请查看备份目录中的文件\n\n" +
    "## 技术支持\n\n" +
    "如遇到问题，请联系技术支持团队。\n\n" +
    "---\n\n" +
    "更新日期: " + new Date().toISOString().split('T')[0] + "\n" +
    "版本: v" + version + "\n"

  fs.writeFileSync(path.join(packageDir, 'README.md'), readmeContent)
}

function createUpdateContentDoc(packageDir, version) {
  const updateContentPath = path.join(projectRoot, '更新内容说明.md')
  const destPath = path.join(packageDir, '更新内容说明.md')
  
  if (fs.existsSync(updateContentPath)) {
    // 如果项目根目录存在更新内容说明.md，复制到更新包
    fs.copyFileSync(updateContentPath, destPath)
    console.log('  ✓ 复制更新内容说明.md')
  } else {
    // 如果不存在，创建一个默认的更新内容说明文档
    const updateContent = "# LTC 应用系统更新内容说明\n\n" +
      "## 版本信息\n\n" +
      "- **版本号**: v" + version + "\n" +
      "- **发布日期**: " + new Date().toISOString().split('T')[0] + "\n" +
      "- **更新类型**: 全量更新\n" +
      "- **目标版本**: v" + version + "\n" +
      "- **最低兼容版本**: v1.0.0\n\n" +
      "## 更新内容\n\n" +
      "### 新增功能\n\n" +
      "- 集成 Pinia 状态管理库\n" +
      "- 集成 Vue I18n 国际化支持\n" +
      "- 集成 ECharts 数据可视化\n\n" +
      "### 优化改进\n\n" +
      "- 优化 Arco Design 组件集成\n" +
      "- 优化项目构建配置\n" +
      "- 优化代码结构\n\n" +
      "### 问题修复\n\n" +
      "- 修复 Pinia 未注册导致页面空白的问题\n" +
      "- 修复 Arco Design 组件无法使用的问题\n" +
      "- 修复示例应用菜单打开空白的问题\n\n" +
      "## 技术变更\n\n" +
      "### 依赖变更\n\n" +
      "- **新增依赖**:\n" +
      "  - pinia: ^2.1.7\n" +
      "  - vue-i18n: ^9.8.0\n" +
      "  - echarts: ^5.4.3\n\n" +
      "- **更新依赖**:\n" +
      "  - arco-design: ^2.61.0\n" +
      "  - vue: ^3.4.0\n" +
      "  - vite: ^6.0.3\n\n" +
      "## 系统要求\n\n" +
      "- **Node.js**: >= 18.0.0\n" +
      "- **npm**: >= 8.0.0\n" +
      "- **磁盘空间**: 100MB\n\n" +
      "## 升级注意事项\n\n" +
      "- 更新前请确保备份重要数据\n" +
      "- 更新过程会自动安装新依赖\n" +
      "- 更新后会自动重新构建项目\n" +
      "- 更新后请启动开发服务器验证\n\n" +
      "## 更新方法\n\n" +
      "### 1. 下载更新包\n" +
      "- 从开发团队获取 ltc-demo-update-v" + version + ".zip 更新包\n\n" +
      "### 2. 解压更新包\n" +
      "- 将更新包解压到项目根目录\n" +
      "- 确保解压后的目录结构正确\n\n" +
      "### 3. 执行更新脚本\n" +
      "- 打开命令行终端\n" +
      "- 进入更新包目录\n" +
      "- 执行以下命令：\n" +
      "  ```bash\n" +
      "  node update.js\n" +
      "  ```\n" +
      "- 等待更新脚本执行完成\n\n" +
      "### 4. 验证更新\n" +
      "- 更新完成后，启动开发服务器：\n" +
      "  ```bash\n" +
      "  npm run dev\n" +
      "  ```\n" +
      "- 访问 http://localhost:5173/ 验证系统是否正常运行\n" +
      "- 检查是否有任何错误或警告\n\n" +
      "### 5. 回滚（如需要）\n" +
      "- 如果更新后出现问题，可以执行回滚脚本：\n" +
      "  ```bash\n" +
      "  node rollback.js\n" +
      "  ```\n" +
      "- 按照提示选择要回滚的备份版本\n" +
      "- 等待回滚脚本执行完成\n" +
      "- 重新启动开发服务器验证\n\n" +
      "---\n\n" +
      "**更新日期**: " + new Date().toISOString().split('T')[0] + "\n" +
      "**版本**: v" + version + "\n" +
      "**发布团队**: LTC Team\n"
    fs.writeFileSync(destPath, updateContent)
    console.log('  ✓ 创建更新内容说明.md')
  }
}

createUpdatePackage()
