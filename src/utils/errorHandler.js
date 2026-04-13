/**
 * 统一错误上报与日志（可按项目接入监控 SDK）
 * @param {unknown} err
 * @param {string} [context]
 */
export function reportError(err, context = '') {
  console.error('[app-system]', context, err)
}
