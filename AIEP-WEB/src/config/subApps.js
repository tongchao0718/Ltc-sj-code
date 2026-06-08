/**
 * 子应用注册表（应用中心 + 首页指标 + 主应用嵌入前缀 — 单一真值）
 */
export const MAIN_PAGE_COUNT = 6

/** @typedef {'marketing' | 'arco' | 'ant'} DesignSystem */

export const subApps = [
  {
    id: 'sample',
    appCode: 'sample-app',
    name: '示例应用',
    folder: 'sample-app',
    designSystem: 'arco',
    desc: '多分组菜单与业务演示页（仪表盘、可视化、列表、表单、结果与异常页等）。',
    icon: '📋',
    to: '/sample-app/dashboard/workplace',
    tag: '可用',
    tagClass: 'tag-success',
    pageCount: 19
  },
  {
    id: 'ai-smart-crm-admin',
    appCode: 'ai-smart-crm',
    name: 'AI 智能 CRM',
    folder: 'ai-smart-crm-admin',
    designSystem: 'arco',
    desc: 'Web 管理台 14 页 + APP 手机壳：客户/线索/商机、阶段与公海、用户/角色/组织/审计。',
    icon: '🤝',
    to: '/ai-smart-crm-admin/dashboard',
    tag: 'MVP 可演示',
    tagClass: 'tag-success',
    pageCount: 14
  },
  {
    id: 'marketing-demo',
    appCode: 'marketing-demo',
    name: '营销系统 Demo',
    folder: 'marketing-demo',
    designSystem: 'marketing',
    desc: '售电公司业务 Demo：数据接入、九维查询、多维分析、画像、报告、结算协议与履约管控。',
    icon: '⚡',
    to: '/marketing-demo/dashboard',
    tag: '开发测试中',
    tagClass: 'tag-warning',
    pageCount: 29
  }
]

/** 从子应用默认入口解析主应用路由前缀 */
export function routePrefixFromTo(to) {
  const parts = String(to ?? '').split('/').filter(Boolean)
  return parts.length ? `/${parts[0]}` : ''
}

/** 主应用嵌入模式需匹配的路由前缀（App.vue 直接引用，勿手改） */
export function getSubAppEmbedPrefixes() {
  return [...new Set(subApps.map((app) => routePrefixFromTo(app.to)).filter(Boolean))]
}

/** 判断当前路径是否处于子应用嵌入区 */
export function isSubAppEmbedPath(path) {
  return getSubAppEmbedPrefixes().some((prefix) => path.startsWith(prefix))
}

export function getSubAppMetrics() {
  return {
    appCount: subApps.length,
    pageCount: MAIN_PAGE_COUNT + subApps.reduce((sum, app) => sum + app.pageCount, 0)
  }
}
