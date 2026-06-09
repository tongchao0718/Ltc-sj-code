const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

import { marketingStore, persistStore } from '../store/marketingStore.js'
import { COMPANIES, BUSINESS_INFO_CATEGORIES, buildBusinessInfoCategory } from '../mock/initialData.js'
import { buildDetailItems, COMPANY_DETAIL_FIELDS } from '../config/fieldLabels.js'

const SOURCE_ALIAS = {
  business: 'tianyancha',
  trade: 'tradeCenter',
  settlement: 'marketing'
}

export async function syncIntegration(source) {
  await delay(800)
  const now = new Date().toLocaleString('zh-CN', { hour12: false })
  const key = SOURCE_ALIAS[source] || source
  const task = marketingStore.integration[key]
  if (task) {
    task.lastSync = now
    task.status = 'success'
    task.count = marketingStore.companies.length
  }
  marketingStore.syncLogs.unshift({
    id: `log-${Date.now()}`,
    source,
    time: now,
    result: 'success',
    message: `${task?.name || source} 同步完成，更新 ${marketingStore.companies.length} 家企业`
  })
  persistStore()
  return { success: true }
}

export async function queryCompanies(params = {}) {
  await delay()
  let rows = [...marketingStore.companies]
  const kw = (params.keyword || '').trim()
  if (kw) {
    rows = rows.filter(
      (c) => c.name.includes(kw) || c.creditCode.includes(kw)
    )
  }
  const total = rows.length
  const pageNo = params.pageNo || 1
  const pageSize = params.pageSize || 10
  const start = (pageNo - 1) * pageSize
  return { rows: rows.slice(start, start + pageSize), total, pageNo, pageSize }
}

export async function queryList(dataset, params = {}) {
  await delay()
  let rows = [...(marketingStore[dataset] || [])]
  if (params.companyName) {
    rows = rows.filter((r) => r.companyName?.includes(params.companyName))
  }
  if (params.creditCode) {
    rows = rows.filter((r) => r.creditCode?.includes(params.creditCode))
  }
  if (params.yearMonth) {
    rows = rows.filter((r) => r.yearMonth === params.yearMonth || r.period === params.yearMonth)
  }
  if (params.status) {
    rows = rows.filter((r) => r.status === params.status)
  }
  if (dataset === 'guarantees' && params.expiryDays != null) {
    const limit = Number(params.expiryDays)
    const today = new Date()
    rows = rows.filter((r) => {
      const diff = (new Date(r.expireDate) - today) / 86400000
      return diff >= 0 && diff <= limit
    })
  }
  const total = rows.length
  const pageNo = params.pageNo || 1
  const pageSize = params.pageSize || 10
  const start = (pageNo - 1) * pageSize
  return { rows: rows.slice(start, start + pageSize), total, pageNo, pageSize }
}

export async function exportMock(format) {
  await delay(600)
  return { success: true, format, fileName: `export-${Date.now()}.${format === 'pdf' ? 'pdf' : 'xlsx'}` }
}

export async function getBusinessInfoTabs(companyId) {
  await delay(300)
  const company = marketingStore.companies.find((c) => c.id === companyId) || COMPANIES[0]
  return BUSINESS_INFO_CATEGORIES.map((cat, index) => {
    const block = buildBusinessInfoCategory(company, cat, index)
    const result = {
      category: cat,
      count: block.count,
      displayType: block.displayType
    }
    if (block.displayType === 'form') {
      result.formItems = buildDetailItems(company, COMPANY_DETAIL_FIELDS.map((f) => ({
        ...f,
        tag: f.key === 'creditLevel',
        span: ['address', 'businessScope', 'term'].includes(f.key) ? 2 : undefined
      })))
    } else {
      result.columns = block.columns
      result.rows = block.rows
    }
    return result
  })
}

export async function saveGovernance(data) {
  await delay(400)
  Object.assign(marketingStore.governance, data)
  persistStore()
  return { success: true }
}

export async function saveExpiryDays(days) {
  await delay(300)
  marketingStore.expiryDays = days
  persistStore()
  return { success: true }
}

export async function updateAgreementStatus(id, status, remark) {
  await delay(500)
  const ag = marketingStore.agreements.find((a) => a.id === id)
  if (ag) {
    ag.status = status
    ag.remark = remark
    ag.updatedAt = new Date().toISOString()
  }
  persistStore()
  return { success: true }
}

export async function generateReport(template, options) {
  await delay(1200)
  return {
    success: true,
    title: template,
    generatedAt: new Date().toISOString(),
    options
  }
}

export async function runAssessment(companyId) {
  await delay(900)
  const scores = {
    credit: 85, scale: 78, finance: 72, guarantee: 88, arrears: 65, market: 80
  }
  const avg = Object.values(scores).reduce((a, b) => a + b, 0) / 6
  const level = avg >= 85 ? '优秀' : avg >= 75 ? '良好' : avg >= 65 ? '一般' : avg >= 55 ? '预警' : '高风险'
  const report = { companyId, scores, level, at: new Date().toISOString() }
  marketingStore.assessmentReports.unshift(report)
  persistStore()
  return report
}

export function getPurchaseCostDetail(companyId) {
  const fields = [
    '调节量收益', '调频机会成本分摊', '跨月电量退补', '跨月偏差退补', '启动分摊',
    '日前偏差', '实时偏差', '市场力分摊', '特殊机组分摊', '退补费用',
    '银东竞价', '银东双边', '用户侧中长期偏差收益回收', '政府授权', '中长期合约'
  ]
  const c = marketingStore.companies.find((x) => x.id === companyId) || marketingStore.companies[0]
  const row = { companyId: c.id, companyName: c.name, yearMonth: '2026-05', purchaseCost: 4200000, salesRevenue: 4500000 }
  fields.forEach((f, i) => { row[f] = 80000 + i * 12000 })
  return row
}

export function getRetailPackages(companyId) {
  const c = marketingStore.companies.find((x) => x.id === companyId) || marketingStore.companies[0]
  return [
    { id: 'pkg-1', companyId: c.id, companyName: c.name, yearMonth: '2026-05', type: '分时套餐', name: '峰谷平价套餐A', users: 320, volume: 4500, fee: 1850000, avgPrice: 0.411 },
    { id: 'pkg-2', companyId: c.id, companyName: c.name, yearMonth: '2026-05', type: '固定价', name: '工业稳价套餐B', users: 180, volume: 2800, fee: 1120000, avgPrice: 0.4 }
  ]
}

export function getRiskCredit(companyId) {
  const c = marketingStore.companies.find((x) => x.id === companyId) || marketingStore.companies[0]
  return {
    companyId: c.id,
    companyName: c.name,
    yearMonth: '2026-05',
    lawsuits: 1,
    executed: 0,
    dishonest: 0,
    penalties: 0,
    creditLevel: c.creditLevel,
    creditReason: '履约良好',
    creditRecovery: '-'
  }
}

// —— CRUD API ——

function paginate(rows, params) {
  const total = rows.length
  const pageNo = params.pageNo || 1
  const pageSize = params.pageSize || 10
  const start = (pageNo - 1) * pageSize
  return { rows: rows.slice(start, start + pageSize), total, pageNo, pageSize }
}

export async function crudList(apiKey, params = {}) {
  await delay()
  let rows = [...(marketingStore[apiKey] || [])]
  if (apiKey === 'companies') {
    const name = (params.name || '').trim()
    const creditCode = (params.creditCode || '').trim()
    const region = (params.region || '').trim()
    if (name) rows = rows.filter((c) => c.name.includes(name))
    if (creditCode) rows = rows.filter((c) => c.creditCode.includes(creditCode))
    if (region) rows = rows.filter((c) => c.region === region)
  } else {
    Object.keys(params).forEach((k) => {
      const v = (params[k] || '').trim()
      if (v && k !== 'pageNo' && k !== 'pageSize') {
        rows = rows.filter((r) => String(r[k] ?? '').includes(v))
      }
    })
  }
  return paginate(rows, params)
}

export async function crudCreate(apiKey, data) {
  await delay(500)
  const prefix = apiKey === 'companies' ? 'c' : apiKey === 'reportTemplates' ? 'rt' : 'tpl'
  const id = `${prefix}-${Date.now()}`
  const row = { id, ...data, updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ') }
  marketingStore[apiKey].unshift(row)
  if (apiKey === 'companies') syncProfileForCompany(row, 'create')
  persistStore()
  return { success: true, row }
}

export async function crudUpdate(apiKey, id, data) {
  await delay(500)
  const list = marketingStore[apiKey]
  const idx = list.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error('记录不存在')
  Object.assign(list[idx], data, { updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ') })
  if (apiKey === 'companies') syncProfileForCompany(list[idx], 'update')
  persistStore()
  return { success: true, row: list[idx] }
}

export async function crudDelete(apiKey, id) {
  await delay(500)
  const list = marketingStore[apiKey]
  const idx = list.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error('记录不存在')
  const [removed] = list.splice(idx, 1)
  if (apiKey === 'companies') syncProfileForCompany(removed, 'delete')
  persistStore()
  return { success: true }
}

function syncProfileForCompany(company, action) {
  if (action === 'delete') {
    const pi = marketingStore.profiles.findIndex((p) => p.companyId === company.id)
    if (pi !== -1) marketingStore.profiles.splice(pi, 1)
    return
  }
  const profile = marketingStore.profiles.find((p) => p.companyId === company.id)
  if (profile) {
    profile.companyName = company.name
    profile.region = company.region
    profile.creditLevel = company.creditLevel
  } else if (action === 'create') {
    marketingStore.profiles.push({
      companyId: company.id,
      companyName: company.name,
      region: company.region,
      creditLevel: company.creditLevel,
      tags: ['新建企业'],
      summary: [
        { label: '代理用户', value: '—' },
        { label: '结算电量', value: '—' },
        { label: '信用等级', value: company.creditLevel },
        { label: '风险标签', value: '待评估' }
      ],
      meta: { scale: company.registeredCapitalLevel, background: '—', tradeMode: '—' },
      history: [{ at: new Date().toISOString().slice(0, 10), tag: '建档', from: '—', to: '已入库' }]
    })
  }
}
