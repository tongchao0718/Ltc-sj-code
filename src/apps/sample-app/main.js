import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import '@arco-design/web-vue/dist/arco.css'
import '../../style.css'
import SampleApp from './SampleApp.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import i18n from './i18n.js'

const routes = [
  { path: '/', redirect: '/dashboard/workplace' },
  { path: '/home', redirect: '/dashboard/workplace' },
  { path: '/workplace', redirect: '/dashboard/workplace' },
  { path: '/profile', redirect: '/user/info' },
  { path: '/settings', redirect: '/user/setting' },
  { path: '/user/security', redirect: '/user/setting' },
  { path: '/user/binding', redirect: '/user/setting' },
  { path: '/protocol/:pathMatch(.*)*', redirect: '/dashboard/workplace' },
  {
    path: '/dashboard/workplace',
    name: 'StandaloneDashboardWorkplace',
    component: () => import('./views/dashboard/WorkplacePage.vue')
  },
  {
    path: '/dashboard/monitor',
    name: 'StandaloneDashboardMonitor',
    component: () => import('./arco-pages/monitor/index.vue')
  },
  {
    path: '/visualization/data-analysis',
    name: 'StandaloneVizDataAnalysis',
    component: () => import('./views/visualization/DataAnalysisPage.vue')
  },
  {
    path: '/visualization/multi-dimension-data-analysis',
    name: 'StandaloneVizMultiDim',
    component: () => import('./views/visualization/MultiDimensionPage.vue')
  },
  {
    path: '/list/search-table',
    name: 'StandaloneListSearchTable',
    component: () => import('./views/list/SearchTablePage.vue')
  },
  {
    path: '/list/card',
    name: 'StandaloneListCard',
    component: () => import('./views/list/CardListPage.vue')
  },
  {
    path: '/form/step',
    name: 'StandaloneFormStep',
    component: () => import('./views/form/StepFormPage.vue')
  },
  {
    path: '/form/group',
    name: 'StandaloneFormGroup',
    component: () => import('./arco-pages/form/GroupFormArco.vue')
  },
  {
    path: '/profile/basic',
    name: 'StandaloneProfileBasic',
    component: () => import('./arco-pages/profile/basic/index.vue')
  },
  {
    path: '/result/success',
    name: 'StandaloneResultSuccess',
    component: () => import('./views/result/SuccessPage.vue')
  },
  {
    path: '/result/error',
    name: 'StandaloneResultError',
    component: () => import('./views/result/ErrorPage.vue')
  },
  {
    path: '/exception/403',
    name: 'StandaloneException403',
    component: () => import('./views/exception/ForbiddenPage.vue')
  },
  {
    path: '/exception/404',
    name: 'StandaloneException404',
    component: () => import('./views/exception/NotFoundPage.vue')
  },
  {
    path: '/exception/500',
    name: 'StandaloneException500',
    component: () => import('./views/exception/ServerErrorPage.vue')
  },
  {
    path: '/user/info',
    name: 'StandaloneUserInfo',
    component: () => import('./views/user/UserInfo.vue')
  },
  {
    path: '/user/setting',
    name: 'StandaloneUserSetting',
    component: () => import('./views/user/UserSetting.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const app = createApp(SampleApp)
app.use(i18n)
app.use(ArcoVue)
app.use(ArcoVueIcon)
app.use(router)
app.mount('#app')
