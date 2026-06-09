#!/usr/bin/env node
/**
 * 将项目 .cursor/skills/ 同步到全局 ~/.cursor/skills/
 * 用法: npm run sync:cursor-skills
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import os from 'os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.join(__dirname, '..')
const SRC = path.join(REPO_ROOT, '.cursor', 'skills')
const DEST = path.join(os.homedir(), '.cursor', 'skills')

const quiet = process.argv.includes('--quiet')

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name)
    const d = path.join(dest, ent.name)
    if (ent.isDirectory()) copyDir(s, d)
    else {
      fs.copyFileSync(s, d)
      if (!quiet) console.log(`  ✓ ${ent.name} → ${path.relative(DEST, d)}`)
    }
  }
}

function main() {
  if (!fs.existsSync(SRC)) {
    if (!quiet) console.error(`源目录不存在: ${SRC}`)
    process.exit(quiet ? 0 : 1)
  }
  const skills = fs.readdirSync(SRC, { withFileTypes: true }).filter((e) => e.isDirectory())
  if (!skills.length) {
    if (!quiet) console.error('无 Skill 目录可同步')
    process.exit(quiet ? 0 : 1)
  }

  if (!quiet) {
    console.log(`同步 ${skills.length} 个 Skill：\n  源: ${SRC}\n  目标: ${DEST}\n`)
  }
  fs.mkdirSync(DEST, { recursive: true })

  for (const ent of skills) {
    if (!quiet) console.log(`[${ent.name}]`)
    copyDir(path.join(SRC, ent.name), path.join(DEST, ent.name))
    if (!quiet) console.log('')
  }

  if (!quiet) console.log('完成。全局 Skill 已与项目 .cursor/skills/ 对齐。')
}

main()
