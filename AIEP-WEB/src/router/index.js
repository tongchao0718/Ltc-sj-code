import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/app-center',
    name: 'AppCenter',
    component: () => import('../views/AppCenter.vue')
  },
  {
    path: '/profile',
    name: 'ProfileCenter',
    component: () => import('../views/ProfileCenter.vue')
  },
  {
    path: '/review-center',
    name: 'ReviewCenter',
    component: () => import('../views/ReviewCenter.vue')
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('../views/HelpPage.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutPage.vue')
  },
  {
    path: '/sample-app',
    name: 'SampleApp',
    component: () => import('../apps/sample-app/SampleApp.vue'),
    children: [
      {
        path: '',
        redirect: '/sample-app/dashboard/workplace'
      },
      {
        path: 'home',
        redirect: '/sample-app/dashboard/workplace'
      },
      {
        path: 'workplace',
        redirect: '/sample-app/dashboard/workplace'
      },
      {
        path: 'profile',
        redirect: '/sample-app/user/info'
      },
      {
        path: 'settings',
        redirect: '/sample-app/user/setting'
      },
      {
        path: 'user/security',
        redirect: '/sample-app/user/setting'
      },
      {
        path: 'user/binding',
        redirect: '/sample-app/user/setting'
      },
      {
        path: 'protocol/:pathMatch(.*)*',
        redirect: '/sample-app/dashboard/workplace'
      },
      {
        path: 'dashboard/workplace',
        name: 'SampleDashboardWorkplace',
        component: () => import('../apps/sample-app/views/dashboard/WorkplacePage.vue')
      },
      {
        path: 'dashboard/monitor',
        name: 'SampleDashboardMonitor',
        component: () => import('../apps/sample-app/arco-pages/monitor/index.vue')
      },
      {
        path: 'visualization/data-analysis',
        name: 'SampleVizDataAnalysis',
        component: () => import('../apps/sample-app/views/visualization/DataAnalysisPage.vue')
      },
      {
        path: 'visualization/multi-dimension-data-analysis',
        name: 'SampleVizMultiDim',
        component: () => import('../apps/sample-app/views/visualization/MultiDimensionPage.vue')
      },
      {
        path: 'visualization/shandong-board',
        name: 'SampleVizShandongBoard',
        component: () => import('../apps/sample-app/views/visualization/ShandongMapBoardPage.vue')
      },
      {
        path: 'list/search-table',
        name: 'SampleListSearchTable',
        component: () => import('../apps/sample-app/views/list/SearchTablePage.vue')
      },
      {
        path: 'list/card',
        name: 'SampleListCard',
        component: () => import('../apps/sample-app/views/list/CardListPage.vue')
      },
      {
        path: 'form/step',
        name: 'SampleFormStep',
        component: () => import('../apps/sample-app/views/form/StepFormPage.vue')
      },
      {
        path: 'form/group',
        name: 'SampleFormGroup',
        component: () => import('../apps/sample-app/arco-pages/form/GroupFormArco.vue')
      },
      {
        path: 'profile/basic',
        name: 'SampleProfileBasic',
        component: () => import('../apps/sample-app/arco-pages/profile/basic/index.vue')
      },
      {
        path: 'result/success',
        name: 'SampleResultSuccess',
        component: () => import('../apps/sample-app/views/result/SuccessPage.vue')
      },
      {
        path: 'result/error',
        name: 'SampleResultError',
        component: () => import('../apps/sample-app/views/result/ErrorPage.vue')
      },
      {
        path: 'exception/403',
        name: 'SampleException403',
        component: () => import('../apps/sample-app/views/exception/ForbiddenPage.vue')
      },
      {
        path: 'exception/404',
        name: 'SampleException404',
        component: () => import('../apps/sample-app/views/exception/NotFoundPage.vue')
      },
      {
        path: 'exception/500',
        name: 'SampleException500',
        component: () => import('../apps/sample-app/views/exception/ServerErrorPage.vue')
      },
      {
        path: 'user/info',
        name: 'SampleUserInfo',
        component: () => import('../apps/sample-app/views/user/UserInfo.vue')
      },
      {
        path: 'user/setting',
        name: 'SampleUserSetting',
        component: () => import('../apps/sample-app/views/user/UserSetting.vue')
      },
      {
        path: 'mobile/cases',
        name: 'SampleMobileCases',
        component: () => import('../apps/sample-app/views/mobile/MobileCasesPage.vue')
      },
      {
        path: 'test',
        name: 'SampleTestPage',
        component: () => import('../apps/sample-app/views/test/TestPage.vue')
      }
    ]
  },
  {
    path: '/ai-smart-crm-admin',
    name: 'AiSmartCrmAdminApp',
    component: () => import('../apps/ai-smart-crm-admin/AiSmartCrmAdminApp.vue'),
    children: [
      {
        path: '',
        redirect: '/ai-smart-crm-admin/login'
      },
      {
        path: 'login',
        name: 'CrmAdminLogin',
        component: () => import('../apps/ai-smart-crm-admin/views/auth/LoginPage.vue')
      },
      {
        path: 'dashboard',
        name: 'CrmAdminDashboard',
        component: () => import('../apps/ai-smart-crm-admin/views/dashboard/AdminDashboardPage.vue')
      },
      {
        path: 'customers',
        name: 'CrmAdminCustomers',
        component: () => import('../apps/ai-smart-crm-admin/views/customer/CustomerListPage.vue')
      },
      {
        path: 'leads',
        name: 'CrmAdminLeads',
        component: () => import('../apps/ai-smart-crm-admin/views/lead/LeadListPage.vue')
      },
      {
        path: 'opportunities',
        name: 'CrmAdminOpportunities',
        component: () => import('../apps/ai-smart-crm-admin/views/opportunity/OpportunityListPage.vue')
      },
      {
        path: 'import',
        name: 'CrmAdminImport',
        component: () => import('../apps/ai-smart-crm-admin/views/import/ImportPage.vue')
      },
      {
        path: 'reports',
        name: 'CrmAdminReports',
        component: () => import('../apps/ai-smart-crm-admin/views/report/ReportPage.vue')
      },
      {
        path: 'settings/stages',
        name: 'CrmAdminStageConfig',
        component: () => import('../apps/ai-smart-crm-admin/views/settings/StageConfigPage.vue')
      },
      {
        path: 'settings/pool',
        name: 'CrmAdminPoolConfig',
        component: () => import('../apps/ai-smart-crm-admin/views/settings/PoolConfigPage.vue')
      },
      {
        path: 'system/users',
        name: 'CrmAdminUsers',
        component: () => import('../apps/ai-smart-crm-admin/views/system/UserListPage.vue')
      },
      {
        path: 'mobile/preview',
        name: 'CrmAdminMobilePreview',
        component: () => import('../apps/ai-smart-crm-admin/views/mobile/AppMobilePreviewPage.vue')
      }
    ]
  },
  {
    path: '/marketing-demo',
    name: 'MarketingDemoApp',
    component: () => import('../apps/marketing-demo/MarketingDemoApp.vue'),
    children: [
      { path: '', redirect: '/marketing-demo/dashboard' },
      { path: 'dashboard', name: 'MdDashboard', component: () => import('../apps/marketing-demo/views/dashboard/DashboardPage.vue'), meta: { title: '首页' } },
      { path: 'data-integration/overview', name: 'MdIntegrationOverview', component: () => import('../apps/marketing-demo/views/data-integration/OverviewPage.vue'), meta: { title: '接入总览' } },
      { path: 'data-integration/business-info', name: 'MdBusinessInfo', component: () => import('../apps/marketing-demo/views/data-integration/BusinessInfoPage.vue'), meta: { title: '工商信息接入' } },
      { path: 'data-integration/trade-data', name: 'MdTradeData', component: () => import('../apps/marketing-demo/views/data-integration/TradeDataPage.vue'), meta: { title: '交易数据接入' } },
      { path: 'data-integration/settlement-data', name: 'MdSettlementData', component: () => import('../apps/marketing-demo/views/data-integration/SettlementDataPage.vue'), meta: { title: '结算信息接入' } },
      { path: 'data-integration/governance', name: 'MdGovernance', component: () => import('../apps/marketing-demo/views/data-integration/GovernancePage.vue'), meta: { title: '接入治理' } },
      { path: 'query/basic', name: 'MdQueryBasic', component: () => import('../apps/marketing-demo/views/query/BasicQueryPage.vue'), meta: { title: '基础信息' } },
      { path: 'query/arrears', name: 'MdQueryArrears', component: () => import('../apps/marketing-demo/views/query/ArrearsQueryPage.vue'), meta: { title: '欠费记录' } },
      { path: 'query/guarantee', name: 'MdQueryGuarantee', component: () => import('../apps/marketing-demo/views/query/GuaranteeQueryPage.vue'), meta: { title: '履约保函' } },
      { path: 'query/agency-scale', name: 'MdQueryAgency', component: () => import('../apps/marketing-demo/views/query/AgencyScaleQueryPage.vue'), meta: { title: '代理规模' } },
      { path: 'query/trade-settlement', name: 'MdQuerySettlement', component: () => import('../apps/marketing-demo/views/query/TradeSettlementQueryPage.vue'), meta: { title: '交易结算' } },
      { path: 'query/purchase-cost', name: 'MdQueryCost', component: () => import('../apps/marketing-demo/views/query/PurchaseCostQueryPage.vue'), meta: { title: '购电成本明细' } },
      { path: 'query/retail-package', name: 'MdQueryPackage', component: () => import('../apps/marketing-demo/views/query/RetailPackageQueryPage.vue'), meta: { title: '售电套餐' } },
      { path: 'query/risk-credit', name: 'MdQueryRisk', component: () => import('../apps/marketing-demo/views/query/RiskCreditQueryPage.vue'), meta: { title: '风险与信用' } },
      { path: 'query/daily-pnl', name: 'MdQueryPnl', component: () => import('../apps/marketing-demo/views/query/DailyPnlQueryPage.vue'), meta: { title: '月内损益' } },
      { path: 'analysis/benefit', name: 'MdAnalysisBenefit', component: () => import('../apps/marketing-demo/views/analysis/BenefitAnalysisPage.vue'), meta: { title: '经营效益' } },
      { path: 'analysis/market', name: 'MdAnalysisMarket', component: () => import('../apps/marketing-demo/views/analysis/MarketAnalysisPage.vue'), meta: { title: '市场表现' } },
      { path: 'analysis/risk-alert', name: 'MdAnalysisRisk', component: () => import('../apps/marketing-demo/views/analysis/RiskAlertPage.vue'), meta: { title: '风险预警' } },
      { path: 'analysis/compare', name: 'MdAnalysisCompare', component: () => import('../apps/marketing-demo/views/analysis/CompareAnalysisPage.vue'), meta: { title: '对比分析' } },
      { path: 'profile/list', name: 'MdProfileList', component: () => import('../apps/marketing-demo/views/profile/ProfileListPage.vue'), meta: { title: '画像列表' } },
      { path: 'profile/:companyId', name: 'MdProfileDetail', component: () => import('../apps/marketing-demo/views/profile/ProfileDetailPage.vue'), meta: { title: '企业画像' } },
      { path: 'report/templates', name: 'MdReportTemplates', component: () => import('../apps/marketing-demo/views/report/ReportTemplatesPage.vue'), meta: { title: '报告模板' } },
      { path: 'report/generate', name: 'MdReportGenerate', component: () => import('../apps/marketing-demo/views/report/ReportGeneratePage.vue'), meta: { title: '报告生成' } },
      { path: 'agreement/templates', name: 'MdAgreementTemplates', component: () => import('../apps/marketing-demo/views/agreement/TemplateListPage.vue'), meta: { title: '模板管理' } },
      { path: 'agreement/lifecycle', name: 'MdAgreementLifecycle', component: () => import('../apps/marketing-demo/views/agreement/LifecyclePage.vue'), meta: { title: '全生命周期' } },
      { path: 'agreement/upload', name: 'MdAgreementUpload', component: () => import('../apps/marketing-demo/views/agreement/UploadPage.vue'), meta: { title: '协议上传' } },
      { path: 'performance/expiry-query', name: 'MdPerfExpiry', component: () => import('../apps/marketing-demo/views/performance/ExpiryQueryPage.vue'), meta: { title: '保函临期' } },
      { path: 'performance/process', name: 'MdPerfProcess', component: () => import('../apps/marketing-demo/views/performance/ProcessPage.vue'), meta: { title: '执行流程' } },
      { path: 'performance/assessment', name: 'MdPerfAssessment', component: () => import('../apps/marketing-demo/views/performance/AssessmentPage.vue'), meta: { title: '能力评估' } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router