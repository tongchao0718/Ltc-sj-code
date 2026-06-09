#!/usr/bin/env node
/**
 * 推断子应用当前 AI+ 全流程步骤（§8.2）
 * 用法: node AIEP-WEB/scripts/infer-process-step.mjs --app <app-code> [--json]
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB_SRC = path.join(__dirname, '..', 'src')
const REPO_ROOT = path.join(__dirname, '..', '..')

const STEP_NAMES = {
  1: '需求生成',
  2: '需求确认',
  3: '界面生成',
  4: '界面确认',
  5: '开发测试',
  6: '发布上线'
}

/** 从 subApps.js 解析代码目录（appCode 与 folder 可能不一致） */
function resolveAppFolder(appCode) {
  try {
    const subAppsPath = path.join(WEB_SRC, 'config', 'subApps.js')
    const text = fs.readFileSync(subAppsPath, 'utf8')
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

function parseArgs(argv) {
  const args = { app: null, json: false }
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--app' && argv[i + 1]) args.app = argv[++i]
    else if (argv[i] === '--json') args.json = true
  }
  if (!args.app) {
    console.error('Usage: node infer-process-step.mjs --app <app-code> [--json]')
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

function readText(filePath) {
  if (!fs.existsSync(filePath)) return null
  return fs.readFileSync(filePath, 'utf8')
}

function hasDualSign(text) {
  if (!text) return false
  const po = /PO[\s\S]{0,80}(同意|通过|已确认)/i.test(text)
  const tl = /TL[\s\S]{0,80}(同意|通过|已确认)/i.test(text)
  return po && tl
}

function hasG2APass(text) {
  if (!text) return false
  if (!/\*\*通过\*\*|结论[\s\S]{0,20}通过/.test(text)) return false
  if (/Agent|待确认|blocked/i.test(text) && !/PO[\s\S]{0,120}\*\*通过\*\*/.test(text)) {
    return /PO[\s\S]{0,200}\*\*通过\*\*/.test(text)
  }
  return true
}

function hasPrdFrozen(text) {
  if (!text) return false
  return /冻结/.test(text)
}

function hasPlatformType(text) {
  if (!text) return false
  return /platform_type[\s|：:*]*[`']?(web-admin|web-marketing|web-mobile-h5|native-android|native-ios)/i.test(
    text
  )
}

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

function hasMockDataTrace(appDir) {
  const mockDataDir = path.join(appDir, '_resources', 'mock-data')
  if (fs.existsSync(mockDataDir)) {
    const jsonFiles = fs.readdirSync(mockDataDir).filter((f) => f.endsWith('.json'))
    if (jsonFiles.length > 0) return true
  }
  const mockDir = path.join(appDir, 'mock')
  if (fs.existsSync(mockDir)) {
    return fs.readdirSync(mockDir).some((f) => /\.(js|json|ts)$/.test(f))
  }
  return false
}

/** R1～R5 资源库机读门禁（子应用资源库规范 §六） */
function checkResources({ appFolder, platformType, auditDir }) {
  const appDir = path.join(WEB_SRC, 'apps', appFolder)
  const resourcesDir = path.join(appDir, '_resources')
  const checks = {
    R1: { pass: false, detail: '' },
    R2: { pass: false, detail: '' },
    R3: { pass: false, detail: '' },
    R4: { pass: false, detail: '' },
    R5: { pass: false, detail: '' }
  }
  const missing = []

  const themePath = path.join(resourcesDir, 'theme.json')
  const theme = readJson(themePath)
  if (!theme) {
    checks.R1.detail = '_resources/theme.json 缺失'
    missing.push('R1: _resources/theme.json 缺失')
  } else if (platformType && theme.platform_type && theme.platform_type !== platformType) {
    checks.R1.detail = `theme.platform_type=${theme.platform_type} 与需求说明书 ${platformType} 不一致`
    missing.push(`R1: theme.platform_type 与 platform_type 不一致`)
  } else {
    checks.R1.pass = true
    checks.R1.detail = 'theme.json 存在且 platform_type 一致'
  }

  const manifestPath = path.join(resourcesDir, 'components-manifest.json')
  const manifest = readJson(manifestPath)
  if (!manifest || !Array.isArray(manifest.entries) || manifest.entries.length === 0) {
    checks.R2.detail = 'components-manifest.json 缺失或 entries 为空'
    missing.push('R2: components-manifest.json 缺失或 entries 为空')
  } else {
    checks.R2.pass = true
    checks.R2.detail = `components-manifest 含 ${manifest.entries.length} 项`
  }

  if (!hasMockDataTrace(appDir)) {
    checks.R3.detail = '_resources/mock-data/*.json 或 mock/ 目录缺失'
    missing.push('R3: Mock 数据不可追溯')
  } else {
    checks.R3.pass = true
    checks.R3.detail = 'Mock 可追溯至 _resources/mock-data 或 mock/'
  }

  const preG2aPath = path.join(auditDir, 'G2-A预审报告.md')
  if (!fs.existsSync(preG2aPath)) {
    checks.R4.detail = '04-AI治理与审计/G2-A预审报告.md 缺失'
    missing.push('R4: G2-A预审报告.md 缺失（步骤 3→4 前须 design-review-pre-g2a）')
  } else {
    checks.R4.pass = true
    checks.R4.detail = 'G2-A预审报告.md 已落盘'
  }

  const memoryPath = path.join(auditDir, '00-项目记忆.md')
  if (!fs.existsSync(memoryPath)) {
    checks.R5.detail = '04-AI治理与审计/00-项目记忆.md 缺失'
    missing.push('R5: 00-项目记忆.md 缺失')
  } else {
    checks.R5.pass = true
    checks.R5.detail = '00-项目记忆.md 已存在'
  }

  const allPass = Object.values(checks).every((c) => c.pass)
  return { checks, allPass, missing }
}

function hasFullUiHint(appCode) {
  const folder = resolveAppFolder(appCode)
  const appDir = path.join(WEB_SRC, 'apps', folder)
  if (!fs.existsSync(appDir)) return false
  const viewsDir = path.join(appDir, 'views')
  if (!fs.existsSync(viewsDir)) return false
  let vueCount = 0
  const walk = (dir) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name)
      if (ent.isDirectory()) walk(p)
      else if (ent.name.endsWith('.vue')) vueCount++
    }
  }
  walk(viewsDir)
  return vueCount >= 5
}

function hasTestAcceptance(designDir) {
  const gwt = path.join(designDir, '..', '02-研发与测试', '验收脚本-GWT.md')
  const g2g3Candidates = [
    path.join(designDir, '..', '02-研发与测试', 'G2-G3关卡自动门禁检查.md'),
    path.join(designDir, '..', '04-AI治理与审计', 'G2-G3关卡自动门禁检查.md')
  ]
  const hasGwt = fs.existsSync(gwt)
  const hasG2g3 = g2g3Candidates.some((p) => fs.existsSync(p))
  return hasGwt && hasG2g3
}

function hasReleaseRecord(designDir) {
  const rel = path.join(designDir, '..', '03-发布与复盘', '发布记录单.md')
  const text = readText(rel)
  if (!text || /<[^>]+>/.test(text)) return false
  if (/待发布|占位|结论：待|结论：—/.test(text)) return false
  return /发布结论[\s\S]{0,400}(通过|已上线|已完成)/.test(text)
}

function inferStep(ctx) {
  const missing = [...(ctx.resourceMissing || [])]
  const evidence = [...(ctx.resourceEvidence || [])]

  if (!ctx.requirements) {
    evidence.push('无 01-需求说明书.md')
    return { step: 1, missing, evidence }
  }
  evidence.push('01-需求说明书.md 存在')

  if (!ctx.platformType) {
    missing.push('01-需求说明书 缺少 platform_type')
  }

  if (!ctx.confirmation || !ctx.dualSign) {
    evidence.push('17-需求确认单 未双签或缺失')
    return { step: 2, missing, evidence }
  }
  evidence.push('17-需求确认单 PO+TL 双签')

  const uiReady = ctx.fullUiHint && ctx.prdDraft && ctx.uiDesign

  if (uiReady && !ctx.resourcesAllPass) {
    evidence.push('全量界面已齐但 R1～R5 未全过 → 仍在步骤 3')
    return { step: 3, missing, evidence }
  }

  if (!uiReady) {
    if (!ctx.fullUiHint) missing.push(`全量可交互界面未齐（apps/${ctx.appFolder}/views）`)
    if (!ctx.prdDraft) missing.push('03-PRD 草案缺失')
    if (!ctx.uiDesign) missing.push('04-界面设计文档 缺失')
    evidence.push('全量界面或 PRD/04 未齐 → 步骤 3')
    return { step: 3, missing, evidence }
  }
  evidence.push('全量界面 + PRD/04 已存在')

  if (!ctx.g2aPass || !ctx.prdFrozen) {
    if (!ctx.g2aFile) missing.push('19-G2-A界面确认记录.md 缺失')
    else if (!ctx.g2aPass) missing.push('19-G2-A 无 PO 人工「通过」')
    if (!ctx.prdFrozen) missing.push('03-PRD 未标冻结')
    if (!ctx.mappingTable) missing.push('页面-路由-接口-数据表映射表 缺失')
    evidence.push('G2-A 或 PRD 冻结未完成 → 步骤 4')
    return { step: 4, missing, evidence }
  }
  evidence.push('19-G2-A 通过 + PRD 冻结 + 映射表')

  if (!ctx.testAcceptance) {
    missing.push('验收脚本-GWT 或 G2-G3关卡检查 缺失')
    evidence.push('测试验收未齐 → 步骤 5')
    return { step: 5, missing, evidence }
  }
  evidence.push('测试验收文档存在')

  if (!ctx.releaseRecord) {
    missing.push('03-发布与复盘/发布记录单.md 未完成')
    evidence.push('无发布记录 → 步骤 6')
    return { step: 6, missing, evidence }
  }

  evidence.push('发布记录已存在 → 流程已完成')
  return { step: 6, missing, evidence, completed: true }
}

function main() {
  const { app, json } = parseArgs(process.argv)
  const docsRoot = path.join(WEB_SRC, 'docs', '子应用文档', app)
  const designDir = path.join(docsRoot, '01-需求与设计')
  const auditDir = path.join(docsRoot, '04-AI治理与审计')

  if (!fs.existsSync(docsRoot)) {
    const out = { app, error: `文档根不存在: ${docsRoot}`, step: null }
    console.log(JSON.stringify(out, null, 2))
    process.exit(1)
  }

  const reqText = readText(path.join(designDir, '01-需求说明书.md'))
  const confirmText = readText(path.join(designDir, '17-需求确认单.md'))
  const prdText = readText(path.join(designDir, '03-PRD设计评审文档.md'))
  const g2aText = readText(path.join(designDir, '19-G2-A界面确认记录.md'))
  const mappingPath = path.join(designDir, '页面-路由-接口-数据表映射表.md')

  let platformType = null
  const ptMatch = reqText?.match(
    /platform_type[\s|：:*]*[`']?(web-admin|web-marketing|web-mobile-h5|native-android|native-ios)/i
  )
  if (ptMatch) platformType = ptMatch[1].toLowerCase()

  let flowType = 'standard'
  const ftMatch = reqText?.match(/flow_type[\s|：:*]*[`']?(standard|fast_track)/i)
  if (ftMatch) flowType = ftMatch[1].toLowerCase()

  const appFolder = resolveAppFolder(app)
  const resourceCheck = checkResources({
    appFolder,
    platformType: platformType,
    auditDir
  })

  const ctx = {
    appFolder,
    requirements: !!reqText,
    platformType: hasPlatformType(reqText),
    confirmation: !!confirmText,
    dualSign: hasDualSign(confirmText),
    prdDraft: !!prdText,
    prdFrozen: hasPrdFrozen(prdText),
    uiDesign: fs.existsSync(path.join(designDir, '04-界面设计文档.md')),
    g2aFile: !!g2aText,
    g2aPass: hasG2APass(g2aText),
    mappingTable: fs.existsSync(mappingPath),
    fullUiHint: hasFullUiHint(app),
    testAcceptance: hasTestAcceptance(designDir),
    releaseRecord: hasReleaseRecord(designDir),
    resourcesAllPass: resourceCheck.allPass,
    resourceMissing: resourceCheck.missing,
    resourceEvidence: resourceCheck.allPass
      ? ['R1～R5 资源库检查全过']
      : resourceCheck.missing.map((m) => `资源库: ${m}`)
  }

  const { step, missing, evidence, completed } = inferStep(ctx)

  const result = {
    app,
    step,
    step_name: STEP_NAMES[step],
    platform_type: platformType,
    flow_type: flowType,
    completed: !!completed,
    evidence,
    missing,
    resources_check: {
      all_pass: resourceCheck.allPass,
      checks: resourceCheck.checks
    },
    docs_root: `AIEP-WEB/src/docs/子应用文档/${app}/`,
    suggested_commands: [
      `npm run infer:process-step -- --app ${app}`,
      `npm run validate:sdd -- --app ${app} --gate G2`,
      `npm run validate:sdd -- --app ${app} --gate G3`
    ]
  }

  if (platformType?.startsWith('web-')) {
    result.suggested_commands.push(`npm run build:${app}`)
    result.suggested_commands.push(`npm run validate:sub-app-registry -- --app ${app}`)
  }

  if (json) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    console.log(`子应用: ${app}`)
    console.log(`推断步骤: ${step} — ${STEP_NAMES[step]}`)
    console.log(`platform_type: ${platformType || '(缺失)'} · flow_type: ${flowType}`)
    if (completed) console.log('状态: 全流程已完成')
    console.log('\n推断依据:')
    evidence.forEach((e) => console.log(`  - ${e}`))
    if (missing.length) {
      console.log('\n缺失/待补齐:')
      missing.forEach((m) => console.log(`  - ${m}`))
    }
    console.log('\n资源库 R1～R5:')
    for (const [id, c] of Object.entries(resourceCheck.checks)) {
      console.log(`  - ${id}: ${c.pass ? '✅' : '❌'} ${c.detail}`)
    }
  }

  const fatal =
    missing.some((m) => m.includes('platform_type')) ||
    (step === 3 && !resourceCheck.allPass && ctx.fullUiHint && ctx.prdDraft && ctx.uiDesign)
  process.exit(fatal ? 1 : 0)
}

main()
