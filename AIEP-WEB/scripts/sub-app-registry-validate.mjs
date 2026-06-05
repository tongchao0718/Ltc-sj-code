#!/usr/bin/env node
/**
 * 主应用子应用注册表一致性校验
 * 用法:
 *   node AIEP-WEB/scripts/sub-app-registry-validate.mjs           # 全量
 *   node AIEP-WEB/scripts/sub-app-registry-validate.mjs --app ai-smart-crm
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { subApps, getSubAppMetrics } from '../src/config/subApps.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB_SRC = path.join(__dirname, '..', 'src')

function parseArgs(argv) {
  const args = { app: null }
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--app' && argv[i + 1]) args.app = argv[++i]
  }
  return args
}

function readText(rel) {
  return fs.readFileSync(path.join(WEB_SRC, rel), 'utf8')
}

function extractEmbedPrefixes(appVueText) {
  const m = appVueText.match(/SUB_APP_EMBED_PREFIXES\s*=\s*\[([^\]]+)\]/)
  if (!m) return []
  return [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1])
}

function extractTopLevelRoutePrefixes(routerText) {
  const prefixes = new Set()
  for (const app of subApps) {
    const prefix = routePrefixFromTo(app.to)
    if (
      prefix &&
      (routerText.includes(`path: '${prefix}'`) || routerText.includes(`path: "${prefix}"`))
    ) {
      prefixes.add(prefix)
    }
  }
  return prefixes
}

function routePrefixFromTo(to) {
  const parts = to.split('/').filter(Boolean)
  return parts.length ? `/${parts[0]}` : ''
}

function findSubApp(appCode) {
  return subApps.find(
    (s) => s.appCode === appCode || s.folder === appCode || s.id === appCode
  )
}

function validateRegistry({ appCode } = {}) {
  const failed = []
  const warnings = []
  const routerText = readText('router/index.js')
  const appVueText = readText('App.vue')
  const dashboardText = readText('views/Dashboard.vue')

  const routePrefixes = extractTopLevelRoutePrefixes(routerText)
  const embedPrefixes = extractEmbedPrefixes(appVueText)

  const targets = appCode ? subApps.filter((s) => findSubApp(appCode)?.id === s.id) : subApps
  if (appCode && !targets.length) {
    failed.push(`注册表未找到 app_code/folder 为「${appCode}」的子应用条目`)
    return { status: 'failed', failed, warnings }
  }

  for (const entry of targets) {
    const prefix = routePrefixFromTo(entry.to)
    if (!prefix) {
      failed.push(`[${entry.id}] 无法从 to=${entry.to} 解析路由前缀`)
      continue
    }
    if (!routePrefixes.has(prefix)) {
      failed.push(`[${entry.id}] router/index.js 缺少顶层路由 path: '${prefix}'`)
    }
    if (!embedPrefixes.includes(prefix)) {
      failed.push(`[${entry.id}] App.vue SUB_APP_EMBED_PREFIXES 缺少 '${prefix}'`)
    }
    if (!routerText.includes(`'${prefix}'`) && !routerText.includes(`"${prefix}"`)) {
      failed.push(`[${entry.id}] router/index.js 未引用前缀 ${prefix}`)
    }
  }

  if (!appCode) {
    if (!dashboardText.includes('config/subApps.js')) {
      failed.push('Dashboard.vue 未从 src/config/subApps.js 读取指标')
    }
    if (!readText('views/AppCenter.vue').includes('config/subApps.js')) {
      failed.push('AppCenter.vue 未从 src/config/subApps.js 读取应用列表')
    }
    const metrics = getSubAppMetrics()
    if (metrics.appCount !== subApps.length) {
      warnings.push(`getSubAppMetrics().appCount (${metrics.appCount}) 与 subApps.length (${subApps.length}) 不一致`)
    }
  }

  const status = failed.length ? 'failed' : warnings.length ? 'passed' : 'passed'
  return { status, failed, warnings, checked: targets.map((t) => t.id) }
}

function main() {
  const { app } = parseArgs(process.argv)
  const result = validateRegistry({ appCode: app })
  const report = {
    gate: 'MAIN_APP_REGISTRY',
    app: app || '*',
    status: result.status,
    failed_items: result.failed,
    warnings: result.warnings,
    checked_apps: result.checked,
    checked_at: new Date().toISOString()
  }
  console.log(JSON.stringify(report, null, 2))
  process.exit(result.status === 'failed' ? 1 : 0)
}

export { validateRegistry }

const isCli =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isCli) {
  main()
}
