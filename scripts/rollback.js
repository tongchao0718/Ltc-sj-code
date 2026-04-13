import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import readline from 'readline'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('开始版本回滚...')

try {
  console.log('检查 git 仓库状态...')
  execSync('git status', { stdio: 'inherit' })

  console.log('\n最近的提交记录：')
  execSync('git log --oneline -5', { stdio: 'inherit' })

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('\n请输入要回滚到的提交哈希值: ', (commitHash) => {
    try {
      const hash = commitHash.trim()
      if (!hash) {
        console.error('未输入提交哈希，已取消。')
        rl.close()
        process.exit(1)
        return
      }
      console.log(`\n回滚到提交: ${hash}`)
      execSync(`git reset --hard ${hash}`, { stdio: 'inherit' })

      console.log('\n安装依赖...')
      execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') })

      console.log('\n构建项目...')
      execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
      execSync('npm run build:sample-app', { stdio: 'inherit', cwd: path.join(__dirname, '..') })

      console.log('\n✅ 版本回滚完成！')
      console.log('\n📝 回滚内容：')
      console.log(`  - 回滚到提交: ${hash}`)
      console.log('  - 重新安装依赖')
      console.log('  - 重新构建项目')
    } catch (error) {
      console.error('❌ 回滚失败:', error.message)
    } finally {
      rl.close()
    }
  })
} catch (error) {
  console.error('❌ 回滚失败:', error.message)
  process.exit(1)
}
