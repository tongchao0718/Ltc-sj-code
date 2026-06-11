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
import { subApps, getSubAppMetrics, routePrefixFromTo } from '../src/config/subApps.js'
import { validateAllSubAppsHealth } from './sub-app-route-health.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = path.join(__dirname, '..')
const WEB_SRC = path.join(WEB_ROOT, 'src')

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
  const expectedEmbedPrefixes = [...new Set(subApps.map((a) => routePrefixFromTo(a.to)).filter(Boolean))]

  if (!appVueText.includes("from './config/subApps.js'") && !appVueText.includes('from "./config/subApps.js"')) {
    failed.push('App.vue 须从 src/config/subApps.js 导入嵌入检测（如 isSubAppEmbedPath）')
  }
  if (!appVueText.includes('isSubAppEmbedPath')) {
    failed.push('App.vue 须使用 isSubAppEmbedPath 或 getSubAppEmbedPrefixes 判定嵌入模式')
  }
  if (/SUB_APP_EMBED_PREFIXES\s*=/.test(appVueText)) {
    failed.push('App.vue 禁止硬编码 SUB_APP_EMBED_PREFIXES，请使用 subApps.js 导出函数')
  }

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
    if (!routerText.includes(`'${prefix}'`) && !routerText.includes(`"${prefix}"`)) {
      failed.push(`[${entry.id}] router/index.js 未引用前缀 ${prefix}`)
    }
    if (!entry.designSystem) {
      warnings.push(`[${entry.id}] 建议声明 designSystem: marketing | arco | ant`)
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
    for (const prefix of expectedEmbedPrefixes) {
      if (!routePrefixes.has(prefix)) {
        failed.push(`注册表前缀 '${prefix}' 在 router/index.js 中无对应顶层路由`)
      }
    }

    const health = validateAllSubAppsHealth(WEB_ROOT, subApps)
    failed.push(...health.failed)
    warnings.push(...health.warnings)
  } else {
    const entry = findSubApp(appCode)
    if (entry) {
      const health = validateAllSubAppsHealth(WEB_ROOT, [entry])
      failed.push(...health.failed)
      warnings.push(...health.warnings)
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
