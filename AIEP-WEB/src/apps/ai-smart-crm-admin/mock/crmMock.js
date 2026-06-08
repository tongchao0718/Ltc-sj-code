export const dashboardStats = [
  { key: 'leads', title: '本月新增线索', value: 128, suffix: '条', color: '#2563EB' },
  { key: 'opp', title: '在途商机金额', value: 386, suffix: '万', color: '#3B82F6' },
  { key: 'win', title: '赢单率', value: 32, suffix: '%', color: '#059669' },
  { key: 'overdue', title: '逾期跟进', value: 17, suffix: '条', color: '#DC2626' }
]

export const funnelStages = [
  { name: '线索', count: 86, amount: 0 },
  { name: '需求确认', count: 42, amount: 120 },
  { name: '方案报价', count: 28, amount: 210 },
  { name: '商务谈判', count: 15, amount: 156 },
  { name: '赢单', count: 9, amount: 98 }
]

export const customers = [
  { id: 'c1', name: '华东智造科技', level: 'A', industry: '制造业', owner: '张明', score: 82, followAt: '2026-06-04', phone: '138****2201' },
  { id: 'c2', name: '星海云服务', level: 'B', industry: '互联网', owner: '李芳', score: 67, followAt: '2026-06-03', phone: '139****8832' },
  { id: 'c3', name: '远航贸易', level: 'A', industry: '批发', owner: '张明', score: 91, followAt: '2026-06-05', phone: '137****0091' },
  { id: 'c4', name: '博远咨询', level: 'C', industry: '服务业', owner: '王磊', score: 45, followAt: '2026-05-28', phone: '136****7712' }
]

export const leads = [
  { id: 'l1', name: '展会-智创科技', source: '展会', status: '跟进中', owner: '张明', score: 72, pool: false },
  { id: 'l2', name: '官网留资-周先生', source: '官网', status: '新线索', owner: '', score: 58, pool: true },
  { id: 'l3', name: '转介绍-李总', source: '转介绍', status: '跟进中', owner: '李芳', score: 80, pool: false }
]

export const opportunities = [
  { id: 'o1', name: '年度维保合同', customer: '华东智造科技', amount: 48, stage: '方案报价', probability: 60, date: '2026-06-20', owner: '张明' },
  { id: 'o2', name: '云服务扩容', customer: '星海云服务', amount: 120, stage: '商务谈判', probability: 75, date: '2026-06-15', owner: '李芳' },
  { id: 'o3', name: '供应链系统', customer: '远航贸易', amount: 86, stage: '需求确认', probability: 40, date: '2026-07-01', owner: '张明' }
]

export const stages = [
  { code: 'LEAD', name: '线索', color: '#94A3B8', probability: 10 },
  { code: 'QUALIFY', name: '需求确认', color: '#3B82F6', probability: 30 },
  { code: 'PROPOSAL', name: '方案报价', color: '#6366F1', probability: 50 },
  { code: 'NEGOTIATE', name: '商务谈判', color: '#8B5CF6', probability: 70 },
  { code: 'WON', name: '赢单', color: '#059669', probability: 100 },
  { code: 'LOST', name: '输单', color: '#DC2626', probability: 0 }
]

export const users = [
  { id: 'u1', account: 'zhangming', name: '张明', phone: '13800002201', role: '销售', org: '华东一组', status: '正常' },
  { id: 'u2', account: 'lifang', name: '李芳', phone: '13900008832', role: '销售', org: '华东一组', status: '正常' },
  { id: 'u3', account: 'admin', name: '系统管理员', phone: '13700000001', role: '管理员', org: '总部', status: '正常' }
]

export const roles = [
  { id: 'r1', code: 'sales', name: '销售', permissions: '客户/线索/商机读写', userCount: 2, status: '启用' },
  { id: 'r2', code: 'manager', name: '主管', permissions: '团队数据+审批', userCount: 0, status: '启用' },
  { id: 'r3', code: 'admin', name: '管理员', permissions: '全量配置', userCount: 1, status: '启用' }
]

export const orgs = [
  { id: 'org1', code: 'HQ', name: '总部', parent: '—', leader: '王总', memberCount: 1, status: '正常' },
  { id: 'org2', code: 'EAST-1', name: '华东一组', parent: '总部', leader: '张明', memberCount: 2, status: '正常' }
]

export const auditLogs = [
  { id: 'a1', time: '2026-06-08 10:12', user: 'admin', action: '登录', module: '认证', ip: '192.168.1.10', result: '成功' },
  { id: 'a2', time: '2026-06-08 10:15', user: 'zhangming', action: '新建客户', module: '客户', ip: '192.168.1.21', result: '成功' },
  { id: 'a3', time: '2026-06-08 09:40', user: 'lifang', action: '导出报表', module: '报表', ip: '192.168.1.22', result: '成功' },
  { id: 'a4', time: '2026-06-07 18:02', user: 'admin', action: '修改角色', module: '权限', ip: '192.168.1.10', result: '成功' }
]

export const appTodos = [
  { id: 't1', type: 'follow', title: '跟进「云服务扩容」', sub: '已 3 天未联系', urgent: true },
  { id: 't2', type: 'lead', title: '新分配线索：官网留资', sub: '公海领取', urgent: false },
  { id: 't3', type: 'ai', title: 'AI建议：发送方案摘要', sub: '华东智造科技', urgent: false }
]

export const appKpis = [
  { label: '待跟进', value: 5 },
  { label: '本周线索', value: 12 },
  { label: '在途金额', value: '186万' },
  { label: '赢单率', value: '28%' }
]
