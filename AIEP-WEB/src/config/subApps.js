/**
 * 子应用注册表（应用中心 + 首页指标与路由配置保持同步）
 */
export const MAIN_PAGE_COUNT = 6

export const subApps = [
  {
    id: 'sample',
    appCode: 'sample-app',
    name: '示例应用',
    folder: 'sample-app',
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
    desc: 'Web 管理台 + APP 手机壳原型：客户/线索/商机、阶段与公海配置、用户与导入。',
    icon: '🤝',
    to: '/ai-smart-crm-admin/dashboard',
    tag: '界面设计中',
    tagClass: 'tag-warning',
    pageCount: 11
  }
]

export function getSubAppMetrics() {
  return {
    appCount: subApps.length,
    pageCount: MAIN_PAGE_COUNT + subApps.reduce((sum, app) => sum + app.pageCount, 0)
  }
}
