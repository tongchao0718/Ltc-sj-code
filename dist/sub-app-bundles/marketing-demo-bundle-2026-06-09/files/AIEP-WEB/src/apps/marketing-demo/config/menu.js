/**
 * 侧栏菜单：一级模块 → 二级分组 → 三级页面
 * 后续可在 menuModules 中追加新一级模块（如其他 Demo）
 */

/** 售电公司 Demo 下的业务分组 */
export const powerSalesDemoGroups = [
  {
    key: 'integration',
    label: '数据接入',
    icon: '🔗',
    children: [
      { path: '/data-integration/overview', label: '接入总览' },
      { path: '/data-integration/business-info', label: '工商信息接入' },
      { path: '/data-integration/trade-data', label: '交易数据接入' },
      { path: '/data-integration/settlement-data', label: '结算信息接入' },
      { path: '/data-integration/governance', label: '接入治理' }
    ]
  },
  {
    key: 'query',
    label: '综合查询',
    icon: '🔍',
    children: [
      { path: '/query/basic', label: '基础信息' },
      { path: '/query/arrears', label: '欠费记录' },
      { path: '/query/guarantee', label: '履约保函' },
      { path: '/query/agency-scale', label: '代理规模' },
      { path: '/query/trade-settlement', label: '交易结算' },
      { path: '/query/purchase-cost', label: '购电成本明细' },
      { path: '/query/retail-package', label: '售电套餐' },
      { path: '/query/risk-credit', label: '风险与信用' },
      { path: '/query/daily-pnl', label: '月内损益' }
    ]
  },
  {
    key: 'analysis',
    label: '多维分析',
    icon: '📊',
    children: [
      { path: '/analysis/benefit', label: '经营效益' },
      { path: '/analysis/market', label: '市场表现' },
      { path: '/analysis/risk-alert', label: '风险预警' },
      { path: '/analysis/compare', label: '对比分析' }
    ]
  },
  {
    key: 'profile',
    label: '业务画像',
    icon: '👤',
    children: [{ path: '/profile/list', label: '画像列表' }]
  },
  {
    key: 'report',
    label: '一键报告',
    icon: '📄',
    children: [
      { path: '/report/templates', label: '报告模板' },
      { path: '/report/generate', label: '报告生成' }
    ]
  },
  {
    key: 'agreement',
    label: '结算协议',
    icon: '📝',
    children: [
      { path: '/agreement/templates', label: '模板管理' },
      { path: '/agreement/lifecycle', label: '全生命周期' },
      { path: '/agreement/upload', label: '协议上传' }
    ]
  },
  {
    key: 'performance',
    label: '履约管控',
    icon: '🛡️',
    children: [
      { path: '/performance/expiry-query', label: '保函临期' },
      { path: '/performance/process', label: '执行流程' },
      { path: '/performance/assessment', label: '能力评估' }
    ]
  }
]

/** 一级菜单模块 */
export const menuModules = [
  {
    key: 'home',
    label: '首页',
    icon: '🏠',
    children: [{ path: '/dashboard', label: '综合工作台' }]
  },
  {
    key: 'power-sales-demo',
    label: '售电公司 Demo',
    icon: '⚡',
    subGroups: powerSalesDemoGroups
  }
]

/** @deprecated 兼容旧引用，扁平化所有页面项 */
export const menuGroups = [
  ...menuModules.filter((m) => m.children).flatMap((m) => m.children.map((c) => ({ ...c, groupKey: m.key }))),
  ...powerSalesDemoGroups.flatMap((g) => g.children.map((c) => ({ ...c, groupKey: g.key })))
]

export function findBreadcrumbTrail(path) {
  for (const mod of menuModules) {
    if (mod.children) {
      for (const c of mod.children) {
        if (path === c.path || (c.path !== '/dashboard' && path.startsWith(c.path + '/'))) {
          return [
            { label: mod.label },
            { label: path === c.path ? c.label : findMenuTitle(path), current: true }
          ]
        }
      }
    }
    if (mod.subGroups) {
      for (const g of mod.subGroups) {
        for (const c of g.children) {
          if (path === c.path || path.startsWith(c.path + '/')) {
            return [
              { label: mod.label },
              { label: g.label },
              { label: path === c.path ? c.label : findMenuTitle(path), current: true }
            ]
          }
        }
      }
    }
  }
  return [{ label: findMenuTitle(path), current: true }]
}

export function findMenuTitle(path) {
  for (const mod of menuModules) {
    if (mod.children) {
      const hit = mod.children.find((c) => c.path === path)
      if (hit) return hit.label
    }
    if (mod.subGroups) {
      for (const g of mod.subGroups) {
        const hit = g.children.find((c) => c.path === path)
        if (hit) return hit.label
      }
    }
  }
  if (path.startsWith('/profile/') && path !== '/profile/list') return '企业画像'
  return '营销业务'
}

/** 当前路径所属一级模块 key */
export function findModuleKey(path) {
  if (path === '/dashboard' || path.startsWith('/dashboard/')) return 'home'
  for (const mod of menuModules) {
    if (!mod.subGroups) continue
    for (const g of mod.subGroups) {
      if (g.children.some((c) => path === c.path || path.startsWith(c.path + '/'))) {
        return mod.key
      }
    }
  }
  return 'home'
}

/** 当前路径所属二级分组 key */
export function findSubGroupKey(path) {
  for (const mod of menuModules) {
    if (!mod.subGroups) continue
    for (const g of mod.subGroups) {
      if (g.children.some((c) => path === c.path || path.startsWith(c.path + '/'))) {
        return g.key
      }
    }
  }
  return null
}

/** 是否匹配菜单路径 */
export function isNavActive(path, relPath) {
  return relPath === path || (path !== '/dashboard' && relPath.startsWith(path + '/'))
}
