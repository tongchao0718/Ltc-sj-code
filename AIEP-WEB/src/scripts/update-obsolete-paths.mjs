/**
 * 框架升级后必须删除的废弃文档（1.0 / 过渡版遗留）
 * 权威替换见 replacement 字段。
 */
export const OBSOLETE_FILENAMES = [
  '环境安装指南.md',
  '依赖安装指南.md',
  'A-安装说明.txt',
  '系统设计规范.md'
]

/** 相对项目根的路径清单（安装结束时强制删除，存在则删） */
export const OBSOLETE_REL_PATHS = [
  ...OBSOLETE_FILENAMES.map((f) => `核心文档/框架核心文档/${f}`),
  '核心文档/环境安装指南.md',
  '核心文档/依赖安装指南.md',
  '核心文档/系统设计规范.md',
  '核心文档/A-安装说明.txt',
  'A-安装说明.txt',
  '环境安装指南.md',
  '依赖安装指南.md',
  '系统设计规范.md'
]

export const OBSOLETE_REPLACEMENTS = {
  '环境安装指南.md': '核心文档/框架核心文档/安装指南.md',
  '依赖安装指南.md': '核心文档/框架核心文档/安装指南.md',
  'A-安装说明.txt': '核心文档/执行说明.txt',
  '系统设计规范.md': '核心文档/框架核心文档/创建指南.md（§3.3.4）与 安装指南.md'
}
