/**
 * 1.0 根目录散落框架文档 → 核心文档 自动迁入
 * 升级时：同名比对合并后删除根目录副本；问答场景0527.md 保留在根目录。
 */
export const ROOT_DOC_KEEP_AT_ROOT = ['问答场景0527.md']

/** 根目录文件名 → 迁入目标（相对项目根） */
export const ROOT_LEGACY_DOC_MAPPINGS = {
  '产品设计文档.md': '核心文档/框架核心文档/产品设计文档.md',
  '创建指南.md': '核心文档/框架核心文档/创建指南.md',
  '快速初始化.md': '核心文档/框架核心文档/新手入门.md',
  '框架基线.md': '核心文档/框架核心文档/框架基线.md',
  '文档对齐清单.md': '核心文档/框架核心文档/文档对齐清单.md',
  '文档清单.md': '核心文档/框架核心文档/文档清单.md',
  '一键更新指南.md': '核心文档/框架核心文档/一键更新指南.md',
  '执行说明.txt': '核心文档/执行说明.txt',
  '主应用打包指南.md': '核心文档/框架核心文档/主应用打包指南.md',
  '子应用打包指南.md': '核心文档/框架核心文档/子应用打包指南.md',
  '更新分发方案.md': '核心文档/框架核心文档/更新分发方案.md',
  '过程规范文档.md': '核心文档/框架核心文档/过程规范文档.md',
  '主应用子应用接入规范.md': '核心文档/框架核心文档/主应用子应用接入规范.md',
  '安装指南.md': '核心文档/框架核心文档/安装指南.md',
  '新手入门.md': '核心文档/框架核心文档/新手入门.md',
  '营销设计规范.md': '核心文档/框架核心文档/营销设计规范.md',
  '文档联动更新规范.md': '核心文档/框架核心文档/文档联动更新规范.md',
  '系统设计规范-ant.md': '核心文档/框架核心文档/系统设计规范-ant.md'
}

/** 根目录待清理路径（迁入后或已废止） */
export const ROOT_LEGACY_PURGE_PATHS = Object.keys(ROOT_LEGACY_DOC_MAPPINGS)

export function normalizeDocText(text) {
  return String(text ?? '').replace(/\r\n/g, '\n').trim()
}

/** 目标文档为基准；根目录有新增内容时追加迁移节 */
export function mergeDocContent(targetContent, rootContent, rootFilename) {
  const normTarget = normalizeDocText(targetContent)
  const normRoot = normalizeDocText(rootContent)
  if (!normRoot) return targetContent
  if (normRoot === normTarget) return targetContent
  if (normTarget.includes(normRoot)) return targetContent

  const date = new Date().toISOString().split('T')[0]
  const marker =
    `\n\n---\n\n## 根目录遗留内容（升级时自动合并）\n\n` +
    `> 以下内容来自升级前项目根目录的 \`${rootFilename}\`，于 ${date} 自动迁入。\n\n`
  return targetContent.replace(/\s*$/, '') + marker + rootContent.trim() + '\n'
}

function removeRootLegacyFile(fs, filePath) {
  if (!fs.existsSync(filePath)) return
  const stat = fs.statSync(filePath)
  if (stat.isDirectory()) {
    fs.rmSync(filePath, { recursive: true, force: true })
    return
  }
  fs.unlinkSync(filePath)
}

/**
 * 将根目录遗留框架文档迁入核心文档，并删除根目录副本。
 * @returns {{ migrated: number, removed: number, skipped: number }}
 */
export function migrateRootLegacyDocs(repoRoot, fs, path, { dryRun = false } = {}) {
  const stats = { migrated: 0, removed: 0, skipped: 0 }
  const plans = []

  for (const [rootName, targetRel] of Object.entries(ROOT_LEGACY_DOC_MAPPINGS)) {
    const rootPath = path.join(repoRoot, rootName)
    if (!fs.existsSync(rootPath)) continue

    const targetPath = path.join(repoRoot, targetRel)
    const rootContent = fs.readFileSync(rootPath, 'utf8')

    if (dryRun) {
      plans.push({
        rootName,
        targetRel,
        action: fs.existsSync(targetPath) ? 'merge' : 'move'
      })
      continue
    }

    fs.mkdirSync(path.dirname(targetPath), { recursive: true })

    if (!fs.existsSync(targetPath)) {
      fs.writeFileSync(targetPath, rootContent)
      console.log(`  ✓ 迁入 ${rootName} → ${targetRel}`)
      stats.migrated++
    } else {
      const targetContent = fs.readFileSync(targetPath, 'utf8')
      const merged = mergeDocContent(targetContent, rootContent, rootName)
      if (merged !== targetContent) {
        fs.writeFileSync(targetPath, merged)
        console.log(`  ✓ 合并 ${rootName} → ${targetRel}`)
        stats.migrated++
      } else {
        console.log(`  · ${rootName} 与 ${targetRel} 无新增内容`)
        stats.skipped++
      }
    }

    removeRootLegacyFile(fs, rootPath)
    if (fs.existsSync(rootPath)) {
      throw new Error(`无法删除根目录遗留文档: ${rootName}`)
    }
    console.log(`  ✓ 删除根目录遗留: ${rootName}`)
    stats.removed++
  }

  if (dryRun) return { plans, ...stats }
  return stats
}
