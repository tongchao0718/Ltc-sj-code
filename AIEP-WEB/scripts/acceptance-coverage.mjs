#!/usr/bin/env node
/**
 * 从 SDD JSON 生成 acceptance_coverage.csv
 * 用法: node acceptance-coverage.mjs --app <app-code>
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB_SRC = path.join(__dirname, '..', 'src')

function parseArgs(argv) {
  let app = null
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--app' && argv[i + 1]) app = argv[++i]
  }
  if (!app) {
    console.error('Usage: node acceptance-coverage.mjs --app <app-code>')
    process.exit(2)
  }
  return app
}

function resolveDocPath(rel) {
  const normalized = rel.replace(/\\/g, '/')
  return normalized.startsWith('docs/')
    ? path.join(WEB_SRC, normalized)
    : path.join(WEB_SRC, '..', '..', normalized)
}

function main() {
  const app = parseArgs(process.argv)
  const cfgPath = [
    path.join(WEB_SRC, 'docs', '子应用文档', app, '04-AI治理与审计', 'gate-config.json'),
    path.join(WEB_SRC, 'docs', '子应用文档', app, '04-AI治理与审计', '03-gate-config.json')
  ].find((p) => fs.existsSync(p))

  if (!cfgPath) {
    console.error('gate-config not found for', app)
    process.exit(1)
  }
  const config = JSON.parse(fs.readFileSync(cfgPath, 'utf8'))
  const sddPath = resolveDocPath(config.paths.sdd_json)
  const sdd = JSON.parse(fs.readFileSync(sddPath, 'utf8'))

  const rows = [['acceptance_id', 'feature_ids', 'given', 'when', 'then', 'test_case_id', 'covered']]
  for (const a of sdd.acceptance || []) {
    const linked = (sdd.features || [])
      .filter((f) => (f.acceptance_ref || []).includes(a.id))
      .map((f) => f.id)
      .join(';')
    rows.push([
      a.id,
      linked,
      (a.given || '').replace(/"/g, '""'),
      (a.when || '').replace(/"/g, '""'),
      (a.then || '').replace(/"/g, '""'),
      '',
      'pending'
    ])
  }

  const outDir = path.join(WEB_SRC, 'docs', '子应用文档', app, '02-研发与测试')
  fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, 'acceptance_coverage.csv')
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  fs.writeFileSync(outFile, '\uFEFF' + csv, 'utf8')
  console.log('Wrote', outFile)
}

main()
