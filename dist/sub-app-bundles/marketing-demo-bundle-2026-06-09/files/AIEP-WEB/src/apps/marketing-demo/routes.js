/** 嵌入主应用与独立打包共用的子路由 */
export const marketingDemoRoutes = [
  { path: '', redirect: '/marketing-demo/dashboard' },
  { path: 'dashboard', name: 'MdDashboard', component: () => import('./views/dashboard/DashboardPage.vue'), meta: { title: '首页' } },
  { path: 'data-integration/overview', name: 'MdIntegrationOverview', component: () => import('./views/data-integration/OverviewPage.vue'), meta: { title: '接入总览' } },
  { path: 'data-integration/business-info', name: 'MdBusinessInfo', component: () => import('./views/data-integration/BusinessInfoPage.vue'), meta: { title: '工商信息接入' } },
  { path: 'data-integration/trade-data', name: 'MdTradeData', component: () => import('./views/data-integration/TradeDataPage.vue'), meta: { title: '交易数据接入' } },
  { path: 'data-integration/settlement-data', name: 'MdSettlementData', component: () => import('./views/data-integration/SettlementDataPage.vue'), meta: { title: '结算信息接入' } },
  { path: 'data-integration/governance', name: 'MdGovernance', component: () => import('./views/data-integration/GovernancePage.vue'), meta: { title: '接入治理' } },
  { path: 'query/basic', name: 'MdQueryBasic', component: () => import('./views/query/BasicQueryPage.vue'), meta: { title: '基础信息' } },
  { path: 'query/arrears', name: 'MdQueryArrears', component: () => import('./views/query/ArrearsQueryPage.vue'), meta: { title: '欠费记录' } },
  { path: 'query/guarantee', name: 'MdQueryGuarantee', component: () => import('./views/query/GuaranteeQueryPage.vue'), meta: { title: '履约保函' } },
  { path: 'query/agency-scale', name: 'MdQueryAgency', component: () => import('./views/query/AgencyScaleQueryPage.vue'), meta: { title: '代理规模' } },
  { path: 'query/trade-settlement', name: 'MdQuerySettlement', component: () => import('./views/query/TradeSettlementQueryPage.vue'), meta: { title: '交易结算' } },
  { path: 'query/purchase-cost', name: 'MdQueryCost', component: () => import('./views/query/PurchaseCostQueryPage.vue'), meta: { title: '购电成本明细' } },
  { path: 'query/retail-package', name: 'MdQueryPackage', component: () => import('./views/query/RetailPackageQueryPage.vue'), meta: { title: '售电套餐' } },
  { path: 'query/risk-credit', name: 'MdQueryRisk', component: () => import('./views/query/RiskCreditQueryPage.vue'), meta: { title: '风险与信用' } },
  { path: 'query/daily-pnl', name: 'MdQueryPnl', component: () => import('./views/query/DailyPnlQueryPage.vue'), meta: { title: '月内损益' } },
  { path: 'analysis/benefit', name: 'MdAnalysisBenefit', component: () => import('./views/analysis/BenefitAnalysisPage.vue'), meta: { title: '经营效益' } },
  { path: 'analysis/market', name: 'MdAnalysisMarket', component: () => import('./views/analysis/MarketAnalysisPage.vue'), meta: { title: '市场表现' } },
  { path: 'analysis/risk-alert', name: 'MdAnalysisRisk', component: () => import('./views/analysis/RiskAlertPage.vue'), meta: { title: '风险预警' } },
  { path: 'analysis/compare', name: 'MdAnalysisCompare', component: () => import('./views/analysis/CompareAnalysisPage.vue'), meta: { title: '对比分析' } },
  { path: 'profile/list', name: 'MdProfileList', component: () => import('./views/profile/ProfileListPage.vue'), meta: { title: '画像列表' } },
  { path: 'profile/:companyId', name: 'MdProfileDetail', component: () => import('./views/profile/ProfileDetailPage.vue'), meta: { title: '企业画像' } },
  { path: 'report/templates', name: 'MdReportTemplates', component: () => import('./views/report/ReportTemplatesPage.vue'), meta: { title: '报告模板' } },
  { path: 'report/generate', name: 'MdReportGenerate', component: () => import('./views/report/ReportGeneratePage.vue'), meta: { title: '报告生成' } },
  { path: 'agreement/templates', name: 'MdAgreementTemplates', component: () => import('./views/agreement/TemplateListPage.vue'), meta: { title: '模板管理' } },
  { path: 'agreement/lifecycle', name: 'MdAgreementLifecycle', component: () => import('./views/agreement/LifecyclePage.vue'), meta: { title: '全生命周期' } },
  { path: 'agreement/upload', name: 'MdAgreementUpload', component: () => import('./views/agreement/UploadPage.vue'), meta: { title: '协议上传' } },
  { path: 'performance/expiry-query', name: 'MdPerfExpiry', component: () => import('./views/performance/ExpiryQueryPage.vue'), meta: { title: '保函临期' } },
  { path: 'performance/process', name: 'MdPerfProcess', component: () => import('./views/performance/ProcessPage.vue'), meta: { title: '执行流程' } },
  { path: 'performance/assessment', name: 'MdPerfAssessment', component: () => import('./views/performance/AssessmentPage.vue'), meta: { title: '能力评估' } }
]

/** 独立 Hash 路由（无前缀；路径须以 / 开头，否则生产构建 Vue Router 会抛 Invalid path） */
export function standaloneRoutes() {
  return [
    { path: '/', redirect: '/dashboard' },
    ...marketingDemoRoutes
      .filter((r) => r.path !== '')
      .map((r) => ({
        ...r,
        path: r.path.startsWith('/') ? r.path : `/${r.path}`
      }))
  ]
}
