/** 子应用 folder，用于浮窗同步到代码 */
export const PRD_ANNOTATION_APP = 'sample-app'

/** 开发/演示时开启 PRD 页面标注；生产构建可关闭 */
export const PRD_ANNOTATION_ENABLED =
  import.meta.env.VITE_PRD_ANNOTATION === 'true' ||
  (import.meta.env.DEV && import.meta.env.VITE_PRD_ANNOTATION !== 'false')

/** 浮窗内直接编辑（仅开发态默认开启） */
export const PRD_ANNOTATION_EDIT_ENABLED =
  import.meta.env.VITE_PRD_ANNOTATION_EDIT === 'true' ||
  (import.meta.env.DEV && import.meta.env.VITE_PRD_ANNOTATION_EDIT !== 'false')
