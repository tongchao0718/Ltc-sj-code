import { ROOT_LEGACY_PURGE_PATHS } from './update-root-doc-migration.mjs'

/**
 * 框架升级后必须删除的废弃文档（1.0 / 过渡版遗留）
 * 权威替换见 replacement 字段。
 *
 * 注意：`系统设计规范.md` 在 `核心文档/框架核心文档/` 下为 v2.1 权威 Arco 规范，
 * 仅项目根 / `核心文档/` 下的同名 1.0 副本废止。
 */
export const OBSOLETE_FILENAMES = [
  '环境安装指南.md',
  '依赖安装指南.md',
  'A-安装说明.txt',
  '系统设计规范.md'
]

/** 打入更新包时从 `files/核心文档/框架核心文档/` 排除的文件（不含 v2.1 仍使用的 `系统设计规范.md`） */
export const OBSOLETE_PACKAGE_EXCLUDE_FILENAMES = [
  '环境安装指南.md',
  '依赖安装指南.md',
  'A-安装说明.txt'
]

/** 按文件名扫描时保留的 v2.1 权威路径（同名但非 1.0 废止） */
export const OBSOLETE_PROTECTED_REL_PATHS = new Set([
  '核心文档/框架核心文档/系统设计规范.md'
])

/** 1.0 废止文档确切路径（安装结束时删除；不含 v2.1 权威 `核心文档/框架核心文档/系统设计规范.md`） */
export const OBSOLETE_DOC_PATHS = [
  '核心文档/框架核心文档/环境安装指南.md',
  '核心文档/框架核心文档/依赖安装指南.md',
  '核心文档/框架核心文档/A-安装说明.txt',
  '核心文档/环境安装指南.md',
  '核心文档/依赖安装指南.md',
  '核心文档/系统设计规范.md',
  '核心文档/A-安装说明.txt',
  'A-安装说明.txt',
  '环境安装指南.md',
  '依赖安装指南.md',
  '系统设计规范.md'
]

/** 备份副本中可安全剔除的废止文档（勿含 ROOT_LEGACY_PURGE_PATHS，回滚需保留根目录文档） */
export const OBSOLETE_BACKUP_STRIP_PATHS = [...OBSOLETE_DOC_PATHS]

/** 相对项目根的路径清单（安装结束时强制删除，存在则删） */
export const OBSOLETE_REL_PATHS = [...OBSOLETE_DOC_PATHS, ...ROOT_LEGACY_PURGE_PATHS]

export const OBSOLETE_REPLACEMENTS = {
  '环境安装指南.md': '核心文档/框架核心文档/安装指南.md',
  '依赖安装指南.md': '核心文档/框架核心文档/安装指南.md',
  'A-安装说明.txt': '核心文档/执行说明.txt',
  '系统设计规范.md': '核心文档/框架核心文档/系统设计规范.md（v2.1 Arco 规范）'
}

/** 按文件名扫描删除时的常见目录（1.x 根目录散落 + 核心文档） */
export const OBSOLETE_FILENAME_SCAN_DIRS = [
  '',
  '核心文档',
  '核心文档/框架核心文档',
  'docs',
  '文档'
]

const OBSOLETE_SCAN_SKIP_DIRS = new Set([
  'node_modules',
  'backups',
  'dist',
  '.git',
  'files',
  'AIEP-WEB',
  'AIEP-SERVER',
  '.cursor',
  'scripts'
])

/**
 * 在项目内按文件名扫描删除 1.0 废止文档（覆盖非标准路径，如 Versions/ 下散落副本）
 * @returns {string[]} 已删除的相对路径
 */
export function findObsoleteFilenameMatches(repoRoot, fs, path, { maxDepth = 5 } = {}) {
  const found = []
  const root = path.resolve(repoRoot)

  function walk(dir, depth) {
    if (depth > maxDepth) return
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (OBSOLETE_SCAN_SKIP_DIRS.has(entry.name)) continue
        if (/^ltc-demo-update-v/i.test(entry.name)) continue
        walk(full, depth + 1)
      } else if (OBSOLETE_FILENAMES.includes(entry.name)) {
        const rel = path.relative(root, full).replace(/\\/g, '/')
        if (OBSOLETE_PROTECTED_REL_PATHS.has(rel)) continue
        found.push(rel)
      }
    }
  }

  walk(root, 0)
  return [...new Set(found)]
}
