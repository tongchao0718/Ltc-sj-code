import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import '@arco-design/web-vue/dist/arco.css'
import '../../style.css'
import AiSmartCrmAdminApp from './AiSmartCrmAdminApp.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('./views/auth/LoginPage.vue') },
  { path: '/dashboard', component: () => import('./views/dashboard/AdminDashboardPage.vue') },
  { path: '/customers', component: () => import('./views/customer/CustomerListPage.vue') },
  { path: '/leads', component: () => import('./views/lead/LeadListPage.vue') },
  { path: '/opportunities', component: () => import('./views/opportunity/OpportunityListPage.vue') },
  { path: '/import', component: () => import('./views/import/ImportPage.vue') },
  { path: '/reports', component: () => import('./views/report/ReportPage.vue') },
  { path: '/settings/stages', component: () => import('./views/settings/StageConfigPage.vue') },
  { path: '/settings/pool', component: () => import('./views/settings/PoolConfigPage.vue') },
  { path: '/system/users', component: () => import('./views/system/UserListPage.vue') },
  { path: '/system/roles', component: () => import('./views/system/RoleListPage.vue') },
  { path: '/system/orgs', component: () => import('./views/system/OrgListPage.vue') },
  { path: '/system/audit', component: () => import('./views/system/AuditLogPage.vue') },
  { path: '/mobile/preview', component: () => import('./views/mobile/AppMobilePreviewPage.vue') }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const app = createApp(AiSmartCrmAdminApp)
app.use(ArcoVue)
app.use(ArcoVueIcon)
app.use(router)
app.mount('#app')
