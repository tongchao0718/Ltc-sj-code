import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import '@arco-design/web-vue/dist/arco.css';
import '../../style.css';
import PowerFeeProtocolCheckApp from './PowerFeeProtocolCheckApp.vue';
import ProtocolTemplateListPage from './views/ProtocolTemplateListPage.vue';
import ProtocolFullFlowPage from './views/ProtocolFullFlowPage.vue';
import ModuleWorkbenchPage from './views/ModuleWorkbenchPage.vue';
import SampleAnnotationPage from './views/SampleAnnotationPage.vue';
import RulePublishPage from './views/RulePublishPage.vue';
import TaskStrategyPage from './views/TaskStrategyPage.vue';
import CheckExecutionPage from './views/CheckExecutionPage.vue';

const MODULE_LEGACY_REDIRECT = {
  M02: '/sample',
  M03: '/rule',
  M04: '/task',
  M05: '/check',
  M06: '/extract',
  M07: '/parse',
  M08: '/verify',
  M09: '/problem',
  M10: '/govern',
  M11: '/task-monitor',
  M12: '/result-monitor',
  M13: '/optimize',
  M14: '/review'
};

const routes = [
  { path: '/', redirect: '/template' },
  { path: '/template', name: 'PowerFeeTemplateStandalone', component: ProtocolTemplateListPage },
  { path: '/sample', name: 'PowerFeeSampleAnnotationStandalone', component: SampleAnnotationPage },
  { path: '/rule', name: 'PowerFeeRulePublishStandalone', component: RulePublishPage },
  { path: '/task', name: 'PowerFeeTaskStrategyStandalone', component: TaskStrategyPage },
  { path: '/check', name: 'PowerFeeCheckExecutionStandalone', component: CheckExecutionPage },
  {
    path: '/extract',
    name: 'PowerFeeProtocolExtractStandalone',
    component: ModuleWorkbenchPage,
    meta: { pfcModule: 'M06' }
  },
  {
    path: '/parse',
    name: 'PowerFeeProtocolParseStandalone',
    component: ModuleWorkbenchPage,
    meta: { pfcModule: 'M07' }
  },
  {
    path: '/verify',
    name: 'PowerFeeProtocolVerifyStandalone',
    component: ModuleWorkbenchPage,
    meta: { pfcModule: 'M08' }
  },
  {
    path: '/problem',
    name: 'PowerFeeProtocolProblemStandalone',
    component: ModuleWorkbenchPage,
    meta: { pfcModule: 'M09' }
  },
  {
    path: '/govern',
    name: 'PowerFeeProtocolGovernStandalone',
    component: ModuleWorkbenchPage,
    meta: { pfcModule: 'M10' }
  },
  {
    path: '/task-monitor',
    name: 'PowerFeeProtocolTaskMonitorStandalone',
    component: ModuleWorkbenchPage,
    meta: { pfcModule: 'M11' }
  },
  {
    path: '/result-monitor',
    name: 'PowerFeeProtocolResultMonitorStandalone',
    component: ModuleWorkbenchPage,
    meta: { pfcModule: 'M12' }
  },
  {
    path: '/optimize',
    name: 'PowerFeeProtocolOptimizeStandalone',
    component: ModuleWorkbenchPage,
    meta: { pfcModule: 'M13' }
  },
  {
    path: '/review',
    name: 'PowerFeeProtocolReviewStandalone',
    component: ModuleWorkbenchPage,
    meta: { pfcModule: 'M14' }
  },
  { path: '/full-flow', name: 'PowerFeeFullFlowStandalone', component: ProtocolFullFlowPage },
  { path: '/sample-annotation', redirect: '/sample' },
  { path: '/rule-publish', redirect: '/rule' },
  { path: '/task-strategy', redirect: '/task' },
  { path: '/check-execution', redirect: '/check' },
  {
    path: '/module/:moduleCode',
    redirect: (to) => MODULE_LEGACY_REDIRECT[to.params.moduleCode] || '/template'
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

const app = createApp(PowerFeeProtocolCheckApp);
app.use(ArcoVue);
app.use(ArcoVueIcon);
app.use(router);
app.mount('#app');
