import { SAMPLE_APP_ANNOTATIONS } from './sampleAppAnnotations.js'
import { normalizeAnnotationEntry, sectionsToMarkdown } from './annotationFormat.js'
import {
  PRD_ANNOTATION_APP_META,
  getAnnotationsFileRelPath
} from './annotationAppMeta.js'

const STORAGE_KEY = `${PRD_ANNOTATION_APP_META.appCode}-prd-annotation-overrides`

function readOverrides() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeOverrides(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/** 合并基准 annotations 与本地编辑覆盖 */
export function getAnnotationById(id) {
  const base = SAMPLE_APP_ANNOTATIONS[id]
  if (!base) return null
  const overrides = readOverrides()
  const merged = { ...base, ...overrides[id] }
  if (overrides[id]?.sections) {
    merged.sections = { ...base.sections, ...overrides[id].sections }
  }
  return normalizeAnnotationEntry(merged)
}

export function saveAnnotationOverride(id, payload) {
  const overrides = readOverrides()
  overrides[id] = {
    ...overrides[id],
    ...payload,
    sections: payload.sections
  }
  writeOverrides(overrides)
}

export function clearAnnotationOverride(id) {
  const overrides = readOverrides()
  delete overrides[id]
  writeOverrides(overrides)
}

function escapeJsSingleQuoted(s) {
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function escapeJsTemplate(s) {
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

/** 复制片段头部：含子应用标识（仅注释，UI 不展示） */
export function buildCopySnippetHeader(id, entry, meta = PRD_ANNOTATION_APP_META) {
  const relPath = getAnnotationsFileRelPath(meta)
  const featureId = entry?.featureId ? ` feature-id=${entry.featureId}` : ''
  return [
    `// @aiep-prd-annotation app-code=${meta.appCode} annotation-id=${id}${featureId}`,
    `// target: ${relPath}`,
    `// action: 搜索「  ${id}: {」整段替换（含本行尾逗号）`
  ].join('\n')
}

/** 单条标注 → 可粘贴进 *Annotations.js 的代码块 */
export function formatAnnotationEntrySnippet(id, entry) {
  if (!entry) return ''
  const lines = [
    `  ${id}: {`,
    `    featureId: '${escapeJsSingleQuoted(entry.featureId)}',`,
    `    featureName: '${escapeJsSingleQuoted(entry.featureName)}',`,
    entry.moduleName && entry.moduleName !== entry.featureName
      ? `    moduleName: '${escapeJsSingleQuoted(entry.moduleName)}',`
      : null,
    entry.pageRoute ? `    pageRoute: '${escapeJsSingleQuoted(entry.pageRoute)}',` : null,
    '    sections: {',
    ...Object.entries(entry.sections || {}).map(
      ([k, v]) => `      ${k}: \`${escapeJsTemplate(v)}\`,`
    ),
    '    }',
    '  },'
  ].filter(Boolean)
  return lines.join('\n')
}

/**
 * 导出为可粘贴进 annotations/*.js 的片段（含子应用标识注释，UI 不展示）
 * @param {number} id
 * @param {object} [patch] 编辑态未保存的表单覆盖
 */
export function exportAnnotationSnippet(id, patch) {
  let entry = getAnnotationById(id)
  if (!entry) return ''
  if (patch) {
    entry = normalizeAnnotationEntry({
      ...entry,
      ...patch,
      sections: patch.sections ? { ...entry.sections, ...patch.sections } : entry.sections
    })
  }
  const body = formatAnnotationEntrySnippet(id, entry)
  return [buildCopySnippetHeader(id, entry), body].join('\n')
}

export function getPrdAnnotationAppMeta() {
  return { ...PRD_ANNOTATION_APP_META }
}

export function getPrdAnnotationTargetPath() {
  return getAnnotationsFileRelPath()
}

export function exportAllOverridesJson() {
  return JSON.stringify(readOverrides(), null, 2)
}

export function getAllOverrides() {
  return readOverrides()
}

/**
 * 开发态：将 localStorage overrides 同步到仓库 annotations/*.js
 * 依赖 Vite 插件 prd-annotation-dev-sync（dev server 运行时）
 */
export async function syncOverridesToRepo(appCode = 'sample-app') {
  const overrides = readOverrides()
  const res = await fetch('/__prd-annotation/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app: appCode, overrides })
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.ok) {
    throw new Error(data.error || `同步失败 (${res.status})`)
  }
  return data
}

export function getDisplayMarkdown(id) {
  const entry = getAnnotationById(id)
  if (!entry) return ''
  return sectionsToMarkdown(entry.sections)
}
