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
    path: '/power-fee-protocol-check',
    name: 'PowerFeeProtocolCheckApp',
    component: () => import('../apps/power-fee-protocol-check/PowerFeeProtocolCheckApp.vue'),
    children: [
      {
        path: '',
        redirect: '/power-fee-protocol-check/template'
      },
      {
        path: 'template',
        name: 'PowerFeeProtocolTemplateList',
        component: () => import('../apps/power-fee-protocol-check/views/ProtocolTemplateListPage.vue')
      },
      {
        path: 'sample',
        name: 'PowerFeeSampleAnnotation',
        component: () => import('../apps/power-fee-protocol-check/views/SampleAnnotationPage.vue')
      },
      {
        path: 'rule',
        name: 'PowerFeeRulePublish',
        component: () => import('../apps/power-fee-protocol-check/views/RulePublishPage.vue')
      },
      {
        path: 'task',
        name: 'PowerFeeTaskStrategy',
        component: () => import('../apps/power-fee-protocol-check/views/TaskStrategyPage.vue')
      },
      {
        path: 'check',
        name: 'PowerFeeCheckExecution',
        component: () => import('../apps/power-fee-protocol-check/views/CheckExecutionPage.vue')
      },
      {
        path: 'extract',
        name: 'PowerFeeProtocolExtract',
        meta: { pfcModule: 'M06' },
        component: () => import('../apps/power-fee-protocol-check/views/ModuleWorkbenchPage.vue')
      },
      {
        path: 'parse',
        name: 'PowerFeeProtocolParse',
        meta: { pfcModule: 'M07' },
        component: () => import('../apps/power-fee-protocol-check/views/ModuleWorkbenchPage.vue')
      },
      {
        path: 'verify',
        name: 'PowerFeeProtocolVerify',
        meta: { pfcModule: 'M08' },
        component: () => import('../apps/power-fee-protocol-check/views/ModuleWorkbenchPage.vue')
      },
      {
        path: 'problem',
        name: 'PowerFeeProtocolProblem',
        meta: { pfcModule: 'M09' },
        component: () => import('../apps/power-fee-protocol-check/views/ModuleWorkbenchPage.vue')
      },
      {
        path: 'govern',
        name: 'PowerFeeProtocolGovern',
        meta: { pfcModule: 'M10' },
        component: () => import('../apps/power-fee-protocol-check/views/ModuleWorkbenchPage.vue')
      },
      {
        path: 'task-monitor',
        name: 'PowerFeeProtocolTaskMonitor',
        meta: { pfcModule: 'M11' },
        component: () => import('../apps/power-fee-protocol-check/views/ModuleWorkbenchPage.vue')
      },
      {
        path: 'result-monitor',
        name: 'PowerFeeProtocolResultMonitor',
        meta: { pfcModule: 'M12' },
        component: () => import('../apps/power-fee-protocol-check/views/ModuleWorkbenchPage.vue')
      },
      {
        path: 'optimize',
        name: 'PowerFeeProtocolOptimize',
        meta: { pfcModule: 'M13' },
        component: () => import('../apps/power-fee-protocol-check/views/ModuleWorkbenchPage.vue')
      },
      {
        path: 'review',
        name: 'PowerFeeProtocolReview',
        meta: { pfcModule: 'M14' },
        component: () => import('../apps/power-fee-protocol-check/views/ModuleWorkbenchPage.vue')
      },
      {
        path: 'full-flow',
        name: 'PowerFeeProtocolFullFlow',
        component: () => import('../apps/power-fee-protocol-check/views/ProtocolFullFlowPage.vue')
      },
      { path: 'sample-annotation', redirect: { name: 'PowerFeeSampleAnnotation' } },
      { path: 'rule-publish', redirect: { name: 'PowerFeeRulePublish' } },
      { path: 'task-strategy', redirect: { name: 'PowerFeeTaskStrategy' } },
      { path: 'check-execution', redirect: { name: 'PowerFeeCheckExecution' } },
      {
        path: 'module/:moduleCode',
        redirect: (to) => {
          const map = {
            M02: 'PowerFeeSampleAnnotation',
            M03: 'PowerFeeRulePublish',
            M04: 'PowerFeeTaskStrategy',
            M05: 'PowerFeeCheckExecution',
            M06: 'PowerFeeProtocolExtract',
            M07: 'PowerFeeProtocolParse',
            M08: 'PowerFeeProtocolVerify',
            M09: 'PowerFeeProtocolProblem',
            M10: 'PowerFeeProtocolGovern',
            M11: 'PowerFeeProtocolTaskMonitor',
            M12: 'PowerFeeProtocolResultMonitor',
            M13: 'PowerFeeProtocolOptimize',
            M14: 'PowerFeeProtocolReview'
          };
          const name = map[to.params.moduleCode];
          return name ? { name } : { path: '/power-fee-protocol-check/template' };
        }
      }
    ]
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router