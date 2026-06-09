#!/usr/bin/env node
/**
 * 一键同步 Agent Skills（Cursor 全局 + Trae 项目级）
 * 由 postinstall / update.js 自动调用；一般无需人工执行。
 * 用法: npm run sync:skills [-- --quiet]
 */
import { spawnSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.join(__dirname, '..')
const quiet = process.argv.includes('--quiet')

function runScript(name) {
  const script = path.join(__dirname, name)
  const r = spawnSync(process.execPath, [script, ...(quiet ? ['--quiet'] : [])], {
    cwd: REPO_ROOT,
    stdio: quiet ? 'pipe' : 'inherit',
    encoding: 'utf8'
  })
  return r.status === 0
}

function main() {
  if (!quiet) {
    console.log('同步 Agent Skills（Cursor ~/.cursor/skills + Trae .trae/skills）...\n')
  }
  const cursorOk = runScript('sync-cursor-skills.mjs')
  const traeOk = runScript('sync-trae-skills.mjs')
  if (!cursorOk && !traeOk) {
    if (!quiet) console.warn('⚠️  Skill 同步跳过（无 .cursor/skills/）')
    process.exit(0)
  }
  if (quiet) {
    console.log('[postinstall] Agent Skills 已自动同步（Cursor 全局 + Trae 项目）')
  } else {
    console.log('\n完成。Agent 由 .cursor/rules 自动加载 Skill，无需手动 /skill-name。')
  }
}

main()
