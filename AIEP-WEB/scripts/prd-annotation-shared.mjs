/**
 * PRD 标注：合并 overrides 并生成 annotations/*.js 源码
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { pathToFileURL } from 'url'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = join(__dirname, '..')

/** 子应用标注文件注册 */
export const PRD_ANNOTATION_APPS = {
  'sample-app': {
    folder: 'sample-app',
    exportName: 'SAMPLE_APP_ANNOTATIONS',
    annotationsFile: 'sampleAppAnnotations.js',
    overridesFile: 'prd-annotation-overrides.json'
  }
}

export function resolveAppPaths(appCode) {
  const reg = PRD_ANNOTATION_APPS[appCode]
  if (!reg) {
    throw new Error(`未注册标注子应用: ${appCode}`)
  }
  const baseDir = join(WEB_ROOT, 'src/apps', reg.folder, 'annotations')
  return {
    ...reg,
    baseDir,
    annotationsPath: join(baseDir, reg.annotationsFile),
    overridesPath: join(baseDir, reg.overridesFile)
  }
}

function escapeJsString(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function escapeTemplate(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

function formatSectionsEntry(id, entry) {
  const lines = [`  ${id}: {`]
  if (entry.featureId) lines.push(`    featureId: '${escapeJsString(entry.featureId)}',`)
  if (entry.featureName) lines.push(`    featureName: '${escapeJsString(entry.featureName)}',`)
  if (entry.moduleName) lines.push(`    moduleName: '${escapeJsString(entry.moduleName)}',`)
  if (entry.pageRoute) lines.push(`    pageRoute: '${escapeJsString(entry.pageRoute)}',`)

  if (entry.sections && Object.keys(entry.sections).length) {
    lines.push('    sections: {')
    for (const [k, v] of Object.entries(entry.sections)) {
      lines.push(`      ${k}: \`${escapeTemplate(v || '')}\`,`)
    }
    lines.push('    }')
  } else if (entry.markdown) {
    lines.push(`    markdown: \`${escapeTemplate(entry.markdown)}\`,`)
  }

  lines.push('  }')
  return lines.join('\n')
}

export function generateAnnotationsSource(exportName, annotations) {
  const ids = Object.keys(annotations)
    .map(Number)
    .sort((a, b) => a - b)

  const body = ids.map((id) => formatSectionsEntry(id, annotations[id])).join(',\n')

  return `/**
 * PRD 标注（由 apply-prd-annotation-overrides / 开发态同步生成）
 * 勿手改后又在浮窗同步，以免覆盖冲突
 */

export const ${exportName} = {
${body}
}
`
}

export async function loadBaseAnnotations(annotationsPath, exportName) {
  const mod = await import(pathToFileURL(annotationsPath).href)
  const data = mod[exportName]
  if (!data || typeof data !== 'object') {
    throw new Error(`无法从 ${annotationsPath} 读取 ${exportName}`)
  }
  return structuredClone(data)
}

export function loadOverridesJson(overridesPath) {
  if (!existsSync(overridesPath)) return {}
  try {
    return JSON.parse(readFileSync(overridesPath, 'utf8'))
  } catch (e) {
    throw new Error(`解析 overrides 失败: ${overridesPath} — ${e.message}`)
  }
}

export function mergeAnnotations(base, overrides) {
  const merged = structuredClone(base)
  for (const [key, patch] of Object.entries(overrides)) {
    const id = Number(key)
    if (!merged[id]) {
      merged[id] = patch
      continue
    }
    const prev = merged[id]
    merged[id] = {
      ...prev,
      ...patch,
      sections: patch.sections
        ? { ...(prev.sections || {}), ...patch.sections }
        : prev.sections
    }
    if (patch.markdown && !patch.sections) {
      merged[id].markdown = patch.markdown
    }
  }
  return merged
}

export async function applyPrdAnnotationOverrides(appCode) {
  const paths = resolveAppPaths(appCode)
  const overrides = loadOverridesJson(paths.overridesPath)
  const base = await loadBaseAnnotations(paths.annotationsPath, paths.exportName)
  const merged = mergeAnnotations(base, overrides)
  const source = generateAnnotationsSource(paths.exportName, merged)
  writeFileSync(paths.annotationsPath, source, 'utf8')
  return {
    appCode,
    annotationsPath: paths.annotationsPath,
    overridesPath: paths.overridesPath,
    overrideKeys: Object.keys(overrides).length,
    annotationCount: Object.keys(merged).length
  }
}

export function writeOverridesJson(appCode, overrides) {
  const paths = resolveAppPaths(appCode)
  writeFileSync(paths.overridesPath, JSON.stringify(overrides, null, 2), 'utf8')
  return paths.overridesPath
}
