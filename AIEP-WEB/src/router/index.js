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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router