import { reactive, computed } from 'vue'
import {
  customers as initCustomers,
  leads as initLeads,
  opportunities as initOpportunities,
  users as initUsers,
  roles as initRoles,
  orgs as initOrgs,
  auditLogs as initAuditLogs,
  stages as initStages,
  dashboardStats as initStats,
  funnelStages as initFunnel
} from '../mock/crmMock.js'

function cloneList(list) {
  return list.map((item) => ({ ...item }))
}

function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}`
}

export const crmStore = reactive({
  customers: cloneList(initCustomers),
  leads: cloneList(initLeads),
  opportunities: cloneList(initOpportunities),
  users: cloneList(initUsers),
  roles: cloneList(initRoles),
  orgs: cloneList(initOrgs),
  auditLogs: cloneList(initAuditLogs),
  stages: cloneList(initStages),
  poolConfig: { reclaimDays: 7, dailyLimit: 5, protectDays: 3 },
  stats: cloneList(initStats),
  funnel: cloneList(initFunnel),
  messages: [
    { id: 'm1', type: 'follow', title: '跟进提醒', body: '「云服务扩容」已 3 天未联系', time: '10 分钟前', read: false },
    { id: 'm2', type: 'ai', title: 'AI 建议', body: '向华东智造发送方案摘要', time: '1 小时前', read: false },
    { id: 'm3', type: 'lead', title: '新线索', body: '公海有新线索可领取', time: '昨天', read: false }
  ],
  currentUser: '张明'
})

export const unreadCount = computed(() => crmStore.messages.filter((m) => !m.read).length)

// —— 客户 ——
export function addCustomer(payload) {
  const row = {
    id: genId('c'),
    name: payload.name,
    level: payload.level || 'B',
    industry: payload.industry || '',
    owner: payload.owner || crmStore.currentUser,
    score: payload.score ?? 50,
    followAt: new Date().toISOString().slice(0, 10),
    phone: payload.phone || ''
  }
  crmStore.customers.unshift(row)
  bumpStat('leads', 0)
  return row
}

export function updateCustomer(id, patch) {
  const row = crmStore.customers.find((c) => c.id === id)
  if (row) Object.assign(row, patch)
  return row
}

export function batchAssignCustomers(ids, owner) {
  ids.forEach((id) => updateCustomer(id, { owner }))
}

// —— 线索 ——
export function addLead(payload) {
  const inPool = !!payload.pool
  const row = {
    id: genId('l'),
    name: payload.name,
    source: payload.source || '手工录入',
    status: inPool ? '新线索' : '跟进中',
    owner: inPool ? '' : (payload.owner || crmStore.currentUser),
    score: payload.score ?? 60,
    pool: inPool
  }
  crmStore.leads.unshift(row)
  bumpStat('leads', 1)
  return row
}

export function claimLead(id) {
  const row = crmStore.leads.find((l) => l.id === id)
  if (!row || !row.pool) return null
  row.pool = false
  row.owner = crmStore.currentUser
  row.status = '跟进中'
  return row
}

export function convertLead(id) {
  const lead = crmStore.leads.find((l) => l.id === id)
  if (!lead) return null
  const customer = addCustomer({
    name: lead.name.replace(/^(展会-|官网留资-|转介绍-)/, ''),
    industry: lead.source,
    owner: lead.owner || crmStore.currentUser,
    score: lead.score
  })
  lead.status = '已转化'
  return customer
}

export function followLead(id) {
  const row = crmStore.leads.find((l) => l.id === id)
  if (row) row.status = '跟进中'
  return row
}

// —— 商机 ——
export function addOpportunity(payload) {
  const row = {
    id: genId('o'),
    name: payload.name,
    customer: payload.customer,
    amount: Number(payload.amount) || 0,
    stage: payload.stage || crmStore.stages[1]?.name || '需求确认',
    probability: payload.probability ?? 30,
    date: payload.date || '',
    owner: payload.owner || crmStore.currentUser
  }
  crmStore.opportunities.unshift(row)
  return row
}

export function updateOpportunityStage(id, stageName) {
  const row = crmStore.opportunities.find((o) => o.id === id)
  if (!row) return null
  const stage = crmStore.stages.find((s) => s.name === stageName)
  row.stage = stageName
  if (stage) row.probability = stage.probability
  return row
}

// —— 用户 ——
export function addUser(payload) {
  const row = {
    id: genId('u'),
    account: payload.account,
    name: payload.name,
    phone: payload.phone || '',
    role: payload.role || '销售',
    org: payload.org || '华东一组',
    status: '正常'
  }
  crmStore.users.unshift(row)
  return row
}

export function updateUser(id, patch) {
  const row = crmStore.users.find((u) => u.id === id)
  if (row) Object.assign(row, patch)
  return row
}

export function resetUserPassword(id) {
  return crmStore.users.find((u) => u.id === id)
}

// —— 角色 ——
export function addRole(payload) {
  const row = {
    id: genId('r'),
    code: payload.code,
    name: payload.name,
    permissions: payload.permissions || '',
    userCount: 0,
    status: '启用'
  }
  crmStore.roles.unshift(row)
  return row
}

export function updateRole(id, patch) {
  const row = crmStore.roles.find((r) => r.id === id)
  if (row) Object.assign(row, patch)
  return row
}

// —— 组织 ——
export function addOrg(payload) {
  const row = {
    id: genId('org'),
    code: payload.code,
    name: payload.name,
    parent: payload.parent || '总部',
    leader: payload.leader || '',
    memberCount: 0,
    status: '正常'
  }
  crmStore.orgs.unshift(row)
  return row
}

export function updateOrg(id, patch) {
  const row = crmStore.orgs.find((o) => o.id === id)
  if (row) Object.assign(row, patch)
  return row
}

// —— 阶段 ——
export function updateStage(code, patch) {
  const row = crmStore.stages.find((s) => s.code === code)
  if (row) Object.assign(row, patch)
  return row
}

// —— 公海 ——
export function savePoolConfig(config) {
  Object.assign(crmStore.poolConfig, config)
}

// —— 导入 ——
export function importRecords(type, count = 3) {
  const names = ['演示导入A', '演示导入B', '演示导入C']
  for (let i = 0; i < Math.min(count, names.length); i++) {
    if (type === 'customer') {
      addCustomer({ name: names[i], industry: '导入', level: 'C' })
    } else if (type === 'lead') {
      addLead({ name: names[i], source: '导入' })
    } else {
      addOpportunity({ name: names[i] + '商机', customer: crmStore.customers[0]?.name || '演示客户', amount: 10 + i })
    }
  }
  return { ok: count - 1, fail: 1 }
}

// —— 跟进记录（客户详情时间线）——
export function addFollowUp(customerId, content, type = '电话') {
  const c = crmStore.customers.find((x) => x.id === customerId)
  if (c) {
    c.followAt = new Date().toISOString().slice(0, 10)
    if (content) c.lastFollow = { content, type, at: c.followAt }
  }
}

// —— 消息 ——
export function dismissMessage(id) {
  const m = crmStore.messages.find((x) => x.id === id)
  if (m) m.read = true
}

export function adoptAiMessage(id) {
  dismissMessage(id)
}

function bumpStat(key, delta) {
  const s = crmStore.stats.find((x) => x.key === key)
  if (s && delta) s.value += delta
}
