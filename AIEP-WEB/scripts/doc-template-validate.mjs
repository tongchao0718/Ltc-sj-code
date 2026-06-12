#!/usr/bin/env node
/**
 * 子应用文档模板章节结构校验
 * 用法: node AIEP-WEB/scripts/doc-template-validate.mjs --app <app-code> [--gate G2|G3|all] [--doc requirements|sdd_md|prd|ui_design]
 */
import { validateDocTemplates } from './doc-template-shared.mjs'

function parseArgs(argv) {
  const args = { app: null, gate: 'all', docs: null }
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--app' && argv[i + 1]) args.app = argv[++i]
    else if (argv[i] === '--gate' && argv[i + 1]) args.gate = argv[++i]
    else if (argv[i] === '--doc' && argv[i + 1]) {
      args.docs = argv[++i].split(',').map((s) => s.trim())
    }
  }
  if (!args.app) {
    console.error('Usage: node doc-template-validate.mjs --app <app-code> [--gate G2|G3|all] [--doc id1,id2]')
    process.exit(2)
  }
  return args
}

function main() {
  const { app, gate, docs } = parseArgs(process.argv)
  const { failed, warnings, checked } = validateDocTemplates({
    app,
    gate,
    onlyDocs: docs,
  })

  const status = failed.length ? 'failed' : warnings.length ? 'passed' : 'passed'
  const report = {
    validator: 'doc-template',
    app,
    gate,
    status,
    failed_items: failed,
    warnings,
    checked,
    checked_at: new Date().toISOString(),
  }

  console.log(JSON.stringify(report, null, 2))
  process.exit(status === 'failed' ? 1 : 0)
}

main()
