import { reactive } from 'vue'
import {
  COMPANIES,
  seedArrears,
  seedGuarantees,
  seedAgencyScale,
  seedTradeSettlement,
  seedDailyPnl,
  seedIntegrationTasks,
  seedAgreements,
  seedProfiles,
  seedReportTemplates
} from '../mock/initialData.js'

const STORAGE_KEY = 'marketing-demo-store-v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (!data.reportTemplates) data.reportTemplates = seedReportTemplates()
      return data
    }
  } catch (_) { /* ignore */ }
  return null
}

function createDefault() {
  return {
    companies: [...COMPANIES],
    arrears: seedArrears(),
    guarantees: seedGuarantees(),
    agencyScale: seedAgencyScale(),
    tradeSettlement: seedTradeSettlement(),
    dailyPnl: seedDailyPnl(),
    integration: seedIntegrationTasks(),
    syncLogs: [],
    agreements: seedAgreements(),
    agreementTemplates: [
      { id: 'tpl-1', name: '标准结算协议模板', version: 'V2.1', scope: '全省', status: '生效', effectiveAt: '2025-01-01', remark: '全省通用结算协议', updatedAt: '2025-01-01 10:00:00' },
      { id: 'tpl-2', name: '济南区域补充模板', version: 'V1.0', scope: '济南', status: '生效', effectiveAt: '2025-06-01', remark: '济南区域补充条款', updatedAt: '2025-06-01 09:00:00' }
    ],
    reportTemplates: seedReportTemplates(),
    profiles: seedProfiles(),
    expiryDays: 30,
    performanceProcesses: [],
    assessmentReports: [],
    governance: {
      desensitize: true,
      maskBank: true,
      syncCron: '0 8 * * *'
    },
    messages: [
      { id: 'm1', tag: '营销预警', title: '烟台港能售电保函将于12天后到期', time: '2026-06-06 09:00' },
      { id: 'm2', tag: '接入通知', title: '天眼查工商数据同步完成', time: '2026-06-06 08:30' }
    ],
    schedules: [
      { id: 's1', date: '2026-06-08', title: '潍坊恒信协议续签审核', desc: '待业务人员确认' }
    ]
  }
}

export const marketingStore = reactive(load() || createDefault())

export function persistStore() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(marketingStore))
  } catch (_) { /* ignore */ }
}

export function resetStore() {
  const d = createDefault()
  Object.keys(d).forEach((k) => { marketingStore[k] = d[k] })
  persistStore()
}
