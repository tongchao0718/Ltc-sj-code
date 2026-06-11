#!/usr/bin/env node
/**
 * 更新包启动器：实时输出到终端，并同步写入日志（双击 .bat 时窗口关闭仍可查日志）
 *
 * 用法（在更新包目录）:
 *   node update-run-with-log.mjs --dry-run
 *   node update-run-with-log.mjs --yes
 */
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const updateScript = path.join(__dirname, 'update.js')
const mode = process.argv.includes('--yes') ? 'install' : 'preview'
const logName = mode === 'install' ? '安装更新-日志.txt' : '预览更新-日志.txt'
const logPath = path.join(__dirname, logName)

function stamp() {
  return new Date().toLocaleString('zh-CN', { hour12: false })
}

function banner(text) {
  return `\n${'='.repeat(48)}\n  ${text}\n${'='.repeat(48)}\n`
}

if (!fs.existsSync(updateScript)) {
  console.error(`未找到 update.js: ${updateScript}`)
  process.exit(1)
}

const header = [
  banner(mode === 'install' ? 'LTC 框架更新 - 安装' : 'LTC 框架更新 - 预览'),
  `开始时间: ${stamp()}`,
  `日志文件: ${logPath}`,
  `命令: node update.js ${process.argv.slice(2).join(' ') || '--dry-run'}`,
  ''
].join('\n')

fs.writeFileSync(logPath, header, 'utf8')

function append(chunk) {
  const text = typeof chunk === 'string' ? chunk : chunk.toString('utf8')
  process.stdout.write(text)
  fs.appendFileSync(logPath, text, 'utf8')
}

const child = spawn(process.execPath, [updateScript, ...process.argv.slice(2)], {
  cwd: __dirname,
  env: process.env,
  stdio: ['inherit', 'pipe', 'pipe']
})

child.stdout.on('data', append)
child.stderr.on('data', append)

child.on('error', (err) => {
  const msg = `\n[错误] 无法启动 update.js: ${err.message}\n`
  append(msg)
  process.exit(1)
})

child.on('close', (code) => {
  const exitCode = code ?? 1
  const isWindowsFastFail = exitCode === 3221226505 || exitCode === -1073740791
  const footer = [
    '',
    banner(exitCode === 0 ? '完成' : '未成功结束'),
    `结束时间: ${stamp()}`,
    `退出码: ${exitCode}`,
    isWindowsFastFail
      ? '说明: 3221226505 (0xC0000409) 多为杀毒/系统强杀 Node，常见于大量文件操作；非业务校验失败'
      : '',
    `完整日志: ${logPath}`,
    mode === 'install'
      ? '若 backups/v*/update-backup-manifest.json 已存在，可续跑: node update.js --yes --reuse-backup backups/v2.1.0-<时间戳>'
      : '确认无误后双击「安装更新.bat」执行正式安装',
    mode === 'install' ? '另可查看 backups/v*/update.log' : '',
    ''
  ].filter(Boolean).join('\n')
  append(footer)
  process.exit(exitCode)
})
