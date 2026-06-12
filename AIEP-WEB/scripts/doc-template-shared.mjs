/**
 * 子应用文档章节结构校验（对照 02-子应用通用模板）
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const WEB_SRC = path.join(__dirname, '..', 'src')
export const REPO_ROOT = path.join(__dirname, '..', '..')
export const TEMPLATE_DIR = path.join(REPO_ROOT, '核心文档', 'AI+产品落地', '02-子应用通用模板')

/** @typedef {{ id: string, label: string, resolve: (config: object, app: string) => string|null, headings: RegExp[], subHeadings?: RegExp[], minLength?: number, gates: ('G2'|'G3')[] }} DocSpec */

/** @type {DocSpec[]} */
export const DOC_SPECS = [
  {
    id: 'requirements',
    label: '01-需求说明书',
    resolve: (config, app) =>
      config.paths?.requirements_doc
        ? resolveDocPath(config.paths.requirements_doc)
        : path.join(WEB_SRC, 'docs', '子应用文档', app, '01-需求与设计', '01-需求说明书.md'),
    gates: ['G2', 'G3'],
    minLength: 500,
    headings: [
      /^##\s+1\.\s*范围/m,
      /^##\s+2\.\s*功能需求/m,
      /^##\s+3\.\s*非功能需求/m,
      /^##\s+4\.\s*用户故事地图/m,
      /^##\s+5\.\s*需求追踪矩阵/m,
      /^##\s+6\.\s*变更记录/m,
    ],
    subHeadings: [/^###\s+2\.1\s*需求详尽化说明/m],
  },
  {
    id: 'sdd_md',
    label: 'SDD 正文',
    resolve: (config, app) => {
      const jsonRel = config.paths?.sdd_json
      if (jsonRel) {
        const mdRel = jsonRel.replace(/\.json$/i, '.md')
        const resolved = resolveDocPath(mdRel)
        if (fs.existsSync(resolved)) return resolved
      }
      const base = path.join(WEB_SRC, 'docs', '子应用文档', app, '01-需求与设计')
      if (!fs.existsSync(base)) return null
      const candidates = fs.readdirSync(base).filter((name) => /^SDD-v.*\.md$/i.test(name))
      return candidates.length ? path.join(base, candidates[0]) : null
    },
    gates: ['G2', 'G3'],
    minLength: 800,
    headings: [
      /^##\s+1\.\s*文档元信息/m,
      /^##\s+2\.\s*业务范围/m,
      /^##\s+4\.\s*用户故事地图/m,
      /^##\s+5\.\s*功能点清单/m,
      /^##\s+6\.\s*API契约/m,
      /^##\s+7\.\s*数据模型/m,
      /^##\s+10\.\s*验收脚本/m,
      /^##\s+11\.\s*风险与回滚/m,
    ],
  },
  {
    id: 'sdd_lite_md',
    label: 'SDD-Lite 正文',
    resolve: (_config, app) => {
      const base = path.join(WEB_SRC, 'docs', '子应用文档', app, '01-需求与设计')
      if (!fs.existsSync(base)) return null
      const candidates = fs.readdirSync(base).filter((name) => /^SDD-v.*\.md$/i.test(name))
      return candidates.length ? path.join(base, candidates[0]) : null
    },
    gates: [],
    minLength: 300,
    headings: [
      /^##\s+1\.\s*文档元信息/m,
      /^##\s+2\.\s*业务范围/m,
      /^##\s+3\.\s*API\s*契约摘要/m,
      /^##\s+5\.\s*验收脚本/m,
      /^##\s+6\.\s*风险与回滚/m,
    ],
  },
  {
    id: 'prd',
    label: '03-PRD设计评审文档',
    resolve: (config, app) =>
      config.paths?.prd_doc
        ? resolveDocPath(config.paths.prd_doc)
        : path.join(WEB_SRC, 'docs', '子应用文档', app, '01-需求与设计', '03-PRD设计评审文档.md'),
    gates: ['G3'],
    minLength: 1000,
    headings: [
      /^##\s+文档信息/m,
      /^##\s+版本变更记录/m,
      /^##\s+一、项目概述/m,
      /^##\s+二、系统流程/m,
      /^##\s+三、用户故事/m,
      /^##\s+四、功能说明/m,
      /^##\s+五、其他非功能需求/m,
      /^##\s+六、物理模型/m,
      /^##\s+七、标准编码/m,
      /^##\s+八、开发实施交付附录/m,
    ],
    subHeadings: [/^###\s+4\.2/m],
  },
  {
    id: 'ui_design',
    label: '04-界面设计文档',
    resolve: (_config, app) =>
      path.join(WEB_SRC, 'docs', '子应用文档', app, '01-需求与设计', '04-界面设计文档.md'),
    gates: ['G3'],
    minLength: 200,
    headings: [/^##\s+文档信息/m, /^##\s+(一、)?页面清单/m, /^##\s+变更记录/m],
  },
]

export function resolveDocPath(rel) {
  const normalized = rel.replace(/\\/g, '/')
  if (normalized.startsWith('docs/')) {
    return path.join(WEB_SRC, normalized)
  }
  return path.join(REPO_ROOT, normalized)
}

export function loadGateConfig(app) {
  const candidates = [
    path.join(WEB_SRC, 'docs', '子应用文档', app, '04-AI治理与审计', 'gate-config.json'),
    path.join(WEB_SRC, 'docs', '子应用文档', app, '04-AI治理与审计', '03-gate-config.json'),
  ]
  const gateConfigPath = candidates.find((p) => fs.existsSync(p))
  if (!gateConfigPath) {
    return { config: null, path: null }
  }
  return { config: JSON.parse(fs.readFileSync(gateConfigPath, 'utf8')), path: gateConfigPath }
}

function isSddLite(text) {
  return /^##\s+3\.\s*API\s*契约摘要/m.test(text)
}

function pickSddSpec(text) {
  if (isSddLite(text)) {
    return DOC_SPECS.find((s) => s.id === 'sdd_lite_md')
  }
  return DOC_SPECS.find((s) => s.id === 'sdd_md')
}

/**
 * @param {string} text
 * @param {RegExp[]} patterns
 * @returns {RegExp[]}
 */
export function missingHeadings(text, patterns) {
  return patterns.filter((re) => !re.test(text))
}

/**
 * @param {object} options
 * @param {string} options.app
 * @param {'G2'|'G3'|'all'} [options.gate='all']
 * @param {string[]|null} [options.onlyDocs=null]
 * @returns {{ failed: string[], warnings: string[], checked: object[] }}
 */
export function validateDocTemplates({ app, gate = 'all', onlyDocs = null }) {
  const failed = []
  const warnings = []
  const checked = []

  const { config } = loadGateConfig(app)

  const specs = DOC_SPECS.filter((spec) => {
    if (spec.id === 'sdd_lite_md') return false
    if (onlyDocs && !onlyDocs.includes(spec.id)) return false
    if (gate === 'all') return true
    return spec.gates.includes(gate)
  })

  for (const spec of specs) {
    if (spec.id === 'sdd_md') {
      const filePath = spec.resolve(config || {}, app)
      if (!filePath || !fs.existsSync(filePath)) {
        if (gate !== 'all' && spec.gates.includes(gate)) {
          failed.push(`${spec.label}: 文件不存在 (${filePath || '未解析路径'})`)
        }
        checked.push({ id: spec.id, path: filePath, status: 'missing' })
        continue
      }
      const text = fs.readFileSync(filePath, 'utf8')
      const activeSpec = pickSddSpec(text) || spec
      const result = validateOneDoc(activeSpec, filePath, text)
      failed.push(...result.failed)
      warnings.push(...result.warnings)
      checked.push({ id: activeSpec.id, path: filePath, status: result.failed.length ? 'failed' : 'passed' })
      continue
    }

    const filePath = spec.resolve(config || {}, app)
    if (!filePath || !fs.existsSync(filePath)) {
      if (gate !== 'all' && spec.gates.includes(gate)) {
        failed.push(`${spec.label}: 文件不存在 (${filePath || '未解析路径'})`)
      } else if (gate === 'all') {
        warnings.push(`${spec.label}: 跳过（文件不存在）`)
      }
      checked.push({ id: spec.id, path: filePath, status: 'missing' })
      continue
    }

    const text = fs.readFileSync(filePath, 'utf8')
    const result = validateOneDoc(spec, filePath, text)
    failed.push(...result.failed)
    warnings.push(...result.warnings)
    checked.push({ id: spec.id, path: filePath, status: result.failed.length ? 'failed' : 'passed' })
  }

  return { failed, warnings, checked }
}

/**
 * @param {DocSpec} spec
 * @param {string} filePath
 * @param {string} text
 */
function validateOneDoc(spec, filePath, text) {
  const failed = []
  const warnings = []
  const rel = path.relative(REPO_ROOT, filePath).replace(/\\/g, '/')

  if (spec.minLength && text.trim().length < spec.minLength) {
    warnings.push(`${spec.label} (${rel}): 内容过短 (${text.trim().length} < ${spec.minLength})`)
  }

  for (const re of missingHeadings(text, spec.headings)) {
    failed.push(`${spec.label} (${rel}): 缺少必填章节，期望匹配 ${re.source}`)
  }

  if (spec.subHeadings) {
    for (const re of missingHeadings(text, spec.subHeadings)) {
      failed.push(`${spec.label} (${rel}): 缺少必填子章节，期望匹配 ${re.source}`)
    }
  }

  return { failed, warnings }
}
