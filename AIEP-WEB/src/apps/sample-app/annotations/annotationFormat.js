/**
 * PRD 标注结构化四段式（与 prd-page-annotation Skill 对齐）
 */
export const ANNOTATION_SECTION_KEYS = [
  { key: 'functional', label: '功能说明' },
  { key: 'interaction', label: '交互逻辑' },
  { key: 'dataModel', label: '数据模型与标准编码引用' },
  { key: 'other', label: '其他说明' }
]

/** 人工编辑占位示例（纯文本，勿写 Markdown 语法） */
export const SECTION_EDIT_PLACEHOLDERS = {
  functional:
    '直接写展示内容、字段、状态等。\n换行即分段；可用 1. 或 - 开头写条目，无需 ##、** 等符号。',
  interaction:
    '1. 点击查询按钮刷新列表\n2. 重置清空筛选条件\n3. 校验失败时在字段下方提示',
  dataModel: '表名 sample_list_item；接口详见 SDD 第 3 章；枚举 status：draft / published',
  other: '验收 AT-02；性能：列表首屏 2 秒内；走查备注…'
}

/**
 * 进入编辑态时将存量 Markdown 转为人工友好的纯文本（去掉标题/加粗等符号，保留正文与条目）
 */
export function sectionTextForEdit(text) {
  if (!text) return ''
  return String(text)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function emptySections() {
  return {
    functional: '',
    interaction: '',
    dataModel: '',
    other: ''
  }
}

/** 从旧版 markdown 条目生成四段式（尽力拆分，新标注请直接用 sections） */
export function sectionsFromLegacyMarkdown(md) {
  const sections = emptySections()
  if (!md) return sections

  const blocks = { functional: [], interaction: [], dataModel: [], other: [] }
  let current = 'functional'
  const headingMap = {
    显示样式: 'functional',
    功能说明: 'functional',
    需求来源: 'functional',
    交互与排序: 'interaction',
    交互逻辑: 'interaction',
    业务定义: 'dataModel',
    数据模型: 'dataModel',
    备注: 'other',
    其他说明: 'other'
  }

  for (const raw of String(md).split('\n')) {
    const line = raw.trimEnd()
    const h = line.match(/^###\s+(.+)$/)
    if (h) {
      const name = h[1].replace(/\s+/g, '')
      for (const [k, v] of Object.entries(headingMap)) {
        if (name.includes(k)) {
          current = v
          break
        }
      }
      continue
    }
    if (line.trim()) blocks[current].push(line)
  }

  for (const { key } of ANNOTATION_SECTION_KEYS) {
    sections[key] = blocks[key].join('\n').trim()
  }
  return sections
}

export function normalizeAnnotationEntry(entry) {
  if (!entry) return null
  const sections = entry.sections
    ? { ...emptySections(), ...entry.sections }
    : sectionsFromLegacyMarkdown(entry.markdown || '')

  return {
    featureId: entry.featureId || '',
    featureName: entry.featureName || entry.moduleName || '',
    moduleName: entry.moduleName || entry.featureName || '',
    pageRoute: entry.pageRoute || '',
    sections
  }
}

export function sectionsToMarkdown(sections) {
  const parts = []
  for (const { key, label } of ANNOTATION_SECTION_KEYS) {
    const text = (sections[key] || '').trim()
    if (text) {
      parts.push(`### ${label}\n\n${text}`)
    }
  }
  return parts.join('\n\n')
}
