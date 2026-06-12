/**
 * 将 annotations/prd-annotation-overrides.json 合并写入 *Annotations.js
 *
 * 用法（仓库根目录）：
 *   npm run apply:prd-annotations -- --app sample-app
 */
import { applyPrdAnnotationOverrides, PRD_ANNOTATION_APPS } from './prd-annotation-shared.mjs'

function parseArgs(argv) {
  const args = { app: 'sample-app' }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--app' && argv[i + 1]) args.app = argv[++i]
    if (argv[i] === '--help' || argv[i] === '-h') args.help = true
  }
  return args
}

const args = parseArgs(process.argv.slice(2))

if (args.help) {
  console.log(`
apply-prd-annotation-overrides — 浮窗 overrides → annotations/*.js

  npm run apply:prd-annotations -- --app sample-app

已注册 app: ${Object.keys(PRD_ANNOTATION_APPS).join(', ')}

流程：浏览器浮窗「同步到代码」→ 生成 prd-annotation-overrides.json → 本脚本写入 *Annotations.js
`)
  process.exit(0)
}

try {
  const result = await applyPrdAnnotationOverrides(args.app)
  console.log(`[apply:prd-annotations] ok app=${result.appCode}`)
  console.log(`  overrides: ${result.overrideKeys} 条 → ${result.overridesPath}`)
  console.log(`  写入: ${result.annotationsPath}（共 ${result.annotationCount} 条标注）`)
} catch (e) {
  console.error(`[apply:prd-annotations] fail: ${e.message}`)
  process.exit(1)
}
