/** 开发/演示时开启 PRD 页面标注；生产构建可关闭 */
export const PRD_ANNOTATION_ENABLED =
  import.meta.env.VITE_PRD_ANNOTATION === 'true' ||
  (import.meta.env.DEV && import.meta.env.VITE_PRD_ANNOTATION !== 'false');
