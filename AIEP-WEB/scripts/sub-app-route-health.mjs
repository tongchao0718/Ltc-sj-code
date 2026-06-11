#!/usr/bin/env node
/**
 * 子应用路由健康检查：入口可解析、壳组件与页面 .vue 存在、子路由非空
 * 供 sub-app-registry-validate 与更新包 apply 流程复用
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { routePrefixFromTo } from '../src/config/subApps.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = path.join(__dirname, '..')

export function resolveRouteImportPath(routeFilePath, importPath) {
  return path.normalize(path.join(path.dirname(routeFilePath), importPath))
}

function findMatchingBrace(text, startIdx) {
  let depth = 0
  for (let i = startIdx; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

export function extractTopLevelRouteBlock(routerText, prefix) {
  const needles = [`path: '${prefix}'`, `path: "${prefix}"`]
  let anchor = -1
  for (const n of needles) {
    const idx = routerText.indexOf(n)
    if (idx !== -1) {
      anchor = idx
      break
    }
  }
  if (anchor === -1) return null
  const startIdx = routerText.lastIndexOf('{', anchor)
  if (startIdx === -1) return null
  const endIdx = findMatchingBrace(routerText, startIdx)
  if (endIdx === -1) return null
  return routerText.slice(startIdx, endIdx + 1)
}

export function extractRouteBlockContaining(text, index) {
  let pos = index
  while (pos > 0) {
    const brace = text.lastIndexOf('{', pos)
    if (brace === -1) return null
    const end = findMatchingBrace(text, brace)
    if (end === -1 || end < index) {
      pos = brace - 1
      continue
    }
    const slice = text.slice(brace, end + 1)
    if (/path\s*:/.test(slice) && (/component\s*:/.test(slice) || /redirect\s*:/.test(slice))) {
      return { start: brace, end: end + 1, slice }
    }
    pos = brace - 1
  }
  return null
}

export function entryPathSuffix(entry) {
  const prefix = routePrefixFromTo(entry.to)
  if (!prefix) return ''
  return entry.to.slice(prefix.length).replace(/^\//, '')
}

/** 统计子应用可渲染页面数（不含顶层壳 component） */
export function countSubAppRoutablePages(routerText, prefix) {
  const block = extractTopLevelRouteBlock(routerText, prefix)
  if (!block) return null
  const imports = [...block.matchAll(/component\s*:\s*\(\)\s*=>\s*import\s*\(\s*['"]([^'"]+\.vue)['"]/g)]
  return Math.max(0, imports.length - 1)
}

/**
 * 检查单个子应用是否可能空白（入口、壳、子路由、.vue 落地）
 * @returns {string[]} failed messages
 */
export function validateSubAppEntryHealth(webRoot, entry, routerText) {
  const failed = []
  const prefix = routePrefixFromTo(entry.to)
  const routerFile = path.join(webRoot, 'src/router/index.js')

  if (!prefix) {
    failed.push(`[${entry.id}] 无法从 to=${entry.to} 解析路由前缀`)
    return failed
  }

  const block = extractTopLevelRouteBlock(routerText, prefix)
  if (!block) {
    failed.push(`[${entry.id}] router 缺少顶层路由 ${prefix}`)
    return failed
  }

  const shellImports = [
    ...block.matchAll(/component\s*:\s*\(\)\s*=>\s*import\s*\(\s*['"]([^'"]+\.vue)['"]/g)
  ]
  if (!shellImports.length) {
    failed.push(`[${entry.id}] 顶层路由 ${prefix} 缺少壳 component`)
  } else {
    const shellPath = resolveRouteImportPath(routerFile, shellImports[0][1])
    if (!fs.existsSync(shellPath)) {
      failed.push(`[${entry.id}] 壳组件缺失: ${shellImports[0][1]}`)
    }
  }

  const routable = countSubAppRoutablePages(routerText, prefix)
  if (routable === 0) {
    failed.push(`[${entry.id}] 子路由为空（打开 ${entry.to} 将空白）`)
  }

  const suffix = entryPathSuffix(entry)
  if (suffix) {
    const needles = [`path: '${suffix}'`, `path: "${suffix}"`]
    const redirectNeedles = [`redirect: '${entry.to}'`, `redirect: "${entry.to}"`]
    let pathIdx = -1
    for (const n of needles) {
      const idx = block.indexOf(n)
      if (idx !== -1) {
        pathIdx = idx
        break
      }
    }
    const hasRedirect = redirectNeedles.some((n) => block.includes(n))

    if (pathIdx === -1 && !hasRedirect) {
      failed.push(`[${entry.id}] 应用中心入口 to=${entry.to} 在 router 中无匹配 path/redirect`)
    } else if (pathIdx !== -1) {
      const routeObj = extractRouteBlockContaining(block, pathIdx)
      if (routeObj) {
        const comp = routeObj.slice.match(/import\s*\(\s*['"]([^'"]+\.vue)['"]/)
        if (comp) {
          const pagePath = resolveRouteImportPath(routerFile, comp[1])
          if (!fs.existsSync(pagePath)) {
            failed.push(`[${entry.id}] 入口页面缺失: ${comp[1]}`)
          }
        } else if (!/redirect\s*:/.test(routeObj.slice)) {
          failed.push(`[${entry.id}] 入口路由 ${suffix} 无 component 且无 redirect`)
        }
      }
    }
  }

  const appsDir = path.join(webRoot, 'src/apps', entry.folder)
  if (!fs.existsSync(appsDir)) {
    failed.push(`[${entry.id}] 源码目录不存在 src/apps/${entry.folder}`)
  }

  return failed
}

export function validateAllSubAppsHealth(webRoot, subApps) {
  const routerPath = path.join(webRoot, 'src/router/index.js')
  if (!fs.existsSync(routerPath)) {
    return { failed: ['router/index.js 不存在'], warnings: [], routableCounts: {} }
  }
  const routerText = fs.readFileSync(routerPath, 'utf8')
  const failed = []
  const warnings = []
  const routableCounts = {}

  for (const entry of subApps) {
    failed.push(...validateSubAppEntryHealth(webRoot, entry, routerText))
    const prefix = routePrefixFromTo(entry.to)
    const counted = prefix ? countSubAppRoutablePages(routerText, prefix) : null
    if (counted != null) {
      routableCounts[entry.id] = counted
      if (entry.pageCount != null && counted !== entry.pageCount) {
        warnings.push(
          `[${entry.id}] pageCount=${entry.pageCount} 与 router 实际可渲染页 ${counted} 不一致（应用中心/首页指标可能不准）`
        )
      }
    }
  }

  return { failed, warnings, routableCounts }
}
