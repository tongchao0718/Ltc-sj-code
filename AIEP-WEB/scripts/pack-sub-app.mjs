#!/usr/bin/env node
/**
 * 子应用打包编排：注册表校验 → build → 产物校验
 * 用法: npm run pack:sub-app -- --app sample-app [--skip-build] [--skip-registry] [--json]
 */
import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.join(__dirname, '..', '..')
const WEB_SRC = path.join(__dirname, '..', 'src')

function parseArgs(argv) {
  const args = {
    app: null,
    folder: null,
    skipBuild: false,
    skipRegistry: false,
    json: false
  }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--app' && argv[i + 1]) args.app = argv[++i]
    else if (a === '--folder' && argv[i + 1]) args.folder = argv[++i]
    else if (a === '--skip-build') args.skipBuild = true
    else if (a === '--skip-registry') args.skipRegistry = true
    else if (a === '--json') args.json = true
  }
  return args
}

function resolveAppFolder(appCode) {
  try {
    const text = fs.readFileSync(path.join(WEB_SRC, 'config', 'subApps.js'), 'utf8')
    const re = new RegExp(
      `appCode:\\s*['"]${appCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"][\\s\\S]*?folder:\\s*['"]([^'"]+)['"]`
    )
    const m = text.match(re)
    if (m) return m[1]
  } catch {
    /* fallback */
  }
  return appCode
}

function runNpm(script, extraArgs = []) {
  const isWin = process.platform === 'win32'
  const r = spawnSync(isWin ? 'npm.cmd' : 'npm', ['run', script, '--', ...extraArgs], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    shell: isWin
  })
  return { exitCode: r.status ?? 1, stdout: r.stdout || '', stderr: r.stderr || '' }
}

function main() {
  const args = parseArgs(process.argv)
  const folder = args.folder || (args.app ? resolveAppFolder(args.app) : null)
  const appCode = args.app || folder

  if (!folder) {
    console.error('Usage: npm run pack:sub-app -- --app <app-code> [--skip-build] [--json]')
    process.exit(2)
  }

  const buildScript = `build:${folder}`
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'))
  if (!pkg.scripts[buildScript]) {
    const err = { error: `package.json 缺少脚本: ${buildScript}`, folder }
    console.log(JSON.stringify(err, null, 2))
    process.exit(1)
  }

  const steps = []
  let overallPass = true

  if (!args.skipRegistry && appCode) {
    const reg = runNpm('validate:sub-app-registry', [`--app`, appCode])
    steps.push({
      name: 'validate:sub-app-registry',
      exit_code: reg.exitCode,
      pass: reg.exitCode === 0
    })
    if (reg.exitCode !== 0) overallPass = false
  }

  let buildFailed = false
  if (!args.skipBuild) {
    const build = runNpm(buildScript)
    buildFailed = build.exitCode !== 0
    steps.push({
      name: buildScript,
      exit_code: build.exitCode,
      pass: build.exitCode === 0
    })
    if (buildFailed) overallPass = false
  }

  if (buildFailed) {
    steps.push({
      name: 'validate:sub-app-pack',
      exit_code: null,
      pass: false,
      skipped: true,
      reason: 'build 失败，跳过产物校验（避免旧 dist 误判为 pass）'
    })
  } else {
    const validateScript = path.join(__dirname, 'validate-sub-app-pack.mjs')
    const valArgs = ['node', validateScript, '--folder', folder]
    if (args.json) valArgs.push('--json')
    const val = spawnSync(valArgs[0], valArgs.slice(1), {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      shell: process.platform === 'win32'
    })
    let packCheck = null
    try {
      packCheck = JSON.parse(val.stdout)
    } catch {
      packCheck = { all_pass: val.status === 0, raw: val.stdout }
    }
    steps.push({
      name: 'validate:sub-app-pack',
      exit_code: val.status ?? 1,
      pass: val.status === 0,
      checks: packCheck.checks,
      missing: packCheck.missing
    })
    if (val.status !== 0) overallPass = false
  }

  const result = {
    app: appCode,
    folder,
    dist: `AIEP-WEB/dist/${folder}/`,
    all_pass: overallPass,
    steps,
    skill: 'pack-sub-app',
    suggested_agent: 'Read AIEP-WEB/src/skills/pack-sub-app/SKILL.md'
  }

  if (args.json) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    console.log(`\n子应用打包: ${folder} (app: ${appCode})\n`)
    for (const s of steps) {
      console.log(`  ${s.pass ? '✅' : '❌'} ${s.name} — exit ${s.exit_code}`)
    }
    console.log(`\n产物: ${result.dist}`)
    console.log(`总评: ${overallPass ? 'pass' : 'fail'}`)
    if (!overallPass) {
      console.log('\nAgent：请 Read pack-sub-app Skill 并按 post-pack-checklist 修复。')
    }
  }

  process.exit(overallPass ? 0 : 1)
}

main()
