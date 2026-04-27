import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('开始系统更新...')

try {
  console.log('检查 git 仓库状态...')
  execSync('git status', { stdio: 'inherit' })

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(__dirname, '../backups', timestamp)
  fs.mkdirSync(backupDir, { recursive: true })
  console.log(`创建备份目录: ${backupDir}`)

  console.log('拉取最新代码...')
  execSync('git pull origin main', { stdio: 'inherit' })

  console.log('安装依赖...')
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') })

  console.log('构建项目...')
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
  execSync('npm run build:sample-app', { stdio: 'inherit', cwd: path.join(__dirname, '..') })

  console.log('\n✅ 系统更新完成！')
  console.log('\n📝 更新内容：')
  console.log('  - 拉取最新代码')
  console.log('  - 安装最新依赖')
  console.log('  - 重新构建项目')
  console.log('\n💡 提示：')
  console.log('  - 已创建更新备份，位于 backups/ 目录')
  console.log('  - 如果更新后出现问题，可以使用 npm run rollback 回滚到之前的版本')
} catch (error) {
  console.error('❌ 更新失败:', error.message)
  process.exit(1)
}
