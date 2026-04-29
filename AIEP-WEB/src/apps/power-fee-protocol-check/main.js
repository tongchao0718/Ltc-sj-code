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

const routes = [
  { path: '/', redirect: '/template' },
  { path: '/template', name: 'PowerFeeTemplateStandalone', component: ProtocolTemplateListPage },
  { path: '/sample-annotation', name: 'PowerFeeSampleAnnotationStandalone', component: SampleAnnotationPage },
  { path: '/rule-publish', name: 'PowerFeeRulePublishStandalone', component: RulePublishPage },
  { path: '/task-strategy', name: 'PowerFeeTaskStrategyStandalone', component: TaskStrategyPage },
  { path: '/check-execution', name: 'PowerFeeCheckExecutionStandalone', component: CheckExecutionPage },
  { path: '/module/:moduleCode', name: 'PowerFeeModuleStandalone', component: ModuleWorkbenchPage },
  { path: '/full-flow', name: 'PowerFeeFullFlowStandalone', component: ProtocolFullFlowPage }
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
