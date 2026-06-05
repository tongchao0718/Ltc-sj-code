#!/usr/bin/env node
/**
 * SDD G2/G3 门禁校验（输出符合 12-G2-G3自动门禁脚本契约）
 * 用法: node AIEP-WEB/scripts/sdd-validate.mjs --app <app-code> [--gate G2]
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { validateRegistry } from './sub-app-registry-validate.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB_SRC = path.join(__dirname, '..', 'src')
const REPO_ROOT = path.join(__dirname, '..', '..')

const PLACEHOLDER_RE = /<[^>]+>|\bTODO\b/i

function parseArgs(argv) {
  const args = { app: null, gate: 'G2', writeReport: true }
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--app' && argv[i + 1]) args.app = argv[++i]
    else if (argv[i] === '--gate' && argv[i + 1]) args.gate = argv[++i]
    else if (argv[i] === '--no-report') args.writeReport = false
  }
  if (!args.app) {
    console.error('Usage: node sdd-validate.mjs --app <app-code> [--gate G2|G3]')
    process.exit(2)
  }
  return args
}

function resolveDocPath(rel) {
  const normalized = rel.replace(/\\/g, '/')
  if (normalized.startsWith('docs/')) {
    return path.join(WEB_SRC, normalized)
  }
  return path.join(REPO_ROOT, normalized)
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function validateRequiredFields(sdd, required, failed, warnings) {
  for (const key of required) {
    if (sdd[key] === undefined || sdd[key] === null) {
      failed.push(`SDD 缺少必填字段: ${key}`)
    } else if (Array.isArray(sdd[key]) && sdd[key].length === 0) {
      failed.push(`SDD 必填数组为空: ${key}`)
    } else if (typeof sdd[key] === 'string' && !sdd[key].trim()) {
      failed.push(`SDD 必填字段为空字符串: ${key}`)
    }
  }
}

function validatePlaceholders(obj, prefix, reject, failed) {
  if (!reject) return
  const walk = (val, p) => {
    if (typeof val === 'string' && PLACEHOLDER_RE.test(val)) {
      failed.push(`占位符未替换: ${p}`)
    } else if (Array.isArray(val)) {
      val.forEach((item, i) => walk(item, `${p}[${i}]`))
    } else if (val && typeof val === 'object') {
      Object.entries(val).forEach(([k, v]) => walk(v, `${p}.${k}`))
    }
  }
  walk(obj, prefix)
}

function validateAcceptanceMapping(sdd, failed, warnings) {
  const atIds = new Set((sdd.acceptance || []).map((a) => a.id))
  for (const f of sdd.features || []) {
    for (const ref of f.acceptance_ref || []) {
      if (!atIds.has(ref)) {
        failed.push(`功能 ${f.id} 的验收引用 ${ref} 在 acceptance 中不存在`)
      }
    }
  }
  if (!sdd.features?.length) {
    warnings.push('未定义 features 数组，跳过 F→AT 映射检查')
  }
}

function validateMappingTable(mappingPath, sdd, failed, warnings) {
  if (!fs.existsSync(mappingPath)) {
    failed.push(`映射表不存在: ${mappingPath}`)
    return
  }
  const text = fs.readFileSync(mappingPath, 'utf8')
  const apiPaths = (sdd.api_contracts || []).map((a) => a.path)
  for (const p of apiPaths) {
    if (!text.includes(p)) {
      warnings.push(`映射表可能未引用 API 路径: ${p}`)
    }
  }
}

function buildReport(gate, status, failed, warnings) {
  return {
    gate,
    status,
    failed_items: failed,
    warnings,
    checked_at: new Date().toISOString()
  }
}

function main() {
  const { app, gate, writeReport } = parseArgs(process.argv)
  const failed = []
  const warnings = []

  const gateConfigCandidates = [
    path.join(WEB_SRC, 'docs', '子应用文档', app, '04-AI治理与审计', 'gate-config.json'),
    path.join(WEB_SRC, 'docs', '子应用文档', app, '04-AI治理与审计', '03-gate-config.json')
  ]
  const gateConfigPath = gateConfigCandidates.find((p) => fs.existsSync(p))
  if (!gateConfigPath) {
    const report = buildReport(gate, 'blocked', [`未找到 gate-config: ${gateConfigCandidates.join(' 或 ')}`], [])
    console.log(JSON.stringify(report, null, 2))
    process.exit(1)
  }

  const config = loadJson(gateConfigPath)
  const sddRel = config.paths?.sdd_json
  if (!sddRel) {
    failed.push('gate-config 缺少 paths.sdd_json')
  }

  const sddPath = sddRel ? resolveDocPath(sddRel) : null
  if (sddPath && !fs.existsSync(sddPath)) {
    failed.push(`SDD JSON 不存在: ${sddPath}`)
  }

  let sdd = null
  if (sddPath && fs.existsSync(sddPath)) {
    try {
      sdd = loadJson(sddPath)
    } catch (e) {
      failed.push(`SDD JSON 解析失败: ${e.message}`)
    }
  }

  if (gate === 'G2' && sdd) {
    const g2 = config.g2_rules || {}
    const required =
      g2.sdd_required_fields ||
      ['sdd_id', 'version', 'owner', 'app_code', 'api_contracts', 'acceptance']
    validateRequiredFields(sdd, required, failed, warnings)
    validatePlaceholders(sdd, 'sdd', g2.reject_placeholders !== false, failed)
    validateAcceptanceMapping(sdd, failed, warnings)

    if (sdd.app_code && sdd.app_code !== config.app_code && config.app_code) {
      warnings.push(`SDD app_code (${sdd.app_code}) 与 gate-config (${config.app_code}) 不一致`)
    }

    if (g2.require_mapping_table && config.paths?.mapping_table) {
      validateMappingTable(resolveDocPath(config.paths.mapping_table), sdd, failed, warnings)
    }

    if (g2.require_main_app_registry) {
      const reg = validateRegistry({ appCode: config.app_code || app })
      if (reg.failed?.length) {
        failed.push(...reg.failed.map((item) => `主应用注册: ${item}`))
      }
      if (reg.warnings?.length) {
        warnings.push(...reg.warnings.map((item) => `主应用注册: ${item}`))
      }
    }
  }

  if (gate === 'G3') {
    warnings.push('G3 自动校验当前仅检查 SDD 存在与 G2 字段；提交 sdd_id、用例覆盖需 CI/人工补充')
    if (sdd) validateRequiredFields(sdd, ['sdd_id', 'acceptance'], failed, warnings)
  }

  const status = failed.length ? 'failed' : warnings.length ? 'passed' : 'passed'
  const report = buildReport(gate, status, failed, warnings)

  if (writeReport && config.pipeline?.output_report) {
    const reportPath = resolveDocPath(config.pipeline.output_report)
    fs.mkdirSync(path.dirname(reportPath), { recursive: true })
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8')
  }

  console.log(JSON.stringify(report, null, 2))
  process.exit(status === 'failed' || status === 'blocked' ? 1 : 0)
}

main()
