/**
 * 本子应用 PRD 标注元数据（供复制片段 / Agent 落盘定位，不在角标与浮窗 UI 展示）
 * 复制 PrdAnnotation 到其他子应用时，请同步改本文件。
 */
export const PRD_ANNOTATION_APP_META = {
  /** gate / 文档目录用 app-code */
  appCode: 'sample-app',
  /** src/apps/{folder}，与 appCode 不一致时单独配置 */
  appFolder: 'sample-app',
  annotationsFile: 'sampleAppAnnotations.js',
  exportName: 'SAMPLE_APP_ANNOTATIONS'
}

/** 标注数据文件相对仓库根路径（复制指引用） */
export function getAnnotationsFileRelPath(meta = PRD_ANNOTATION_APP_META) {
  return `AIEP-WEB/src/apps/${meta.appFolder}/annotations/${meta.annotationsFile}`
}
