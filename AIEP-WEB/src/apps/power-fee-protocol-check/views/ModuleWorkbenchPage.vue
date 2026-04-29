<template>
  <div class="page-shell">
    <h1 class="page-title">{{ current.name }}</h1>
    <p class="page-subtitle">{{ current.desc }}</p>

    <div class="ds-card">
      <div class="meta">
        <span>模块：{{ current.code }}</span>
        <span>状态：{{ current.status }}</span>
      </div>
      <p class="hint">当前为全量开发阶段统一工作台页，已接入模块路由与最小链路动作，可继续按模块拆分独立页面。</p>
      <button class="btn" @click="runAction">执行模块动作</button>
      <div class="result" v-if="resultText">{{ resultText }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { annotateSample, publishRule, generateTask, governIssue, iterateOptimize, runParse, runVerify } from '../api/protocolFullFlowApi.js';

const moduleMap = {
  M02: { code: 'M02', name: '协议样本标注管理', desc: '样本标注与质检流转', status: 'in_progress', action: () => annotateSample({ sampleId: 'sample_demo_001', operator: 'LTC' }) },
  M03: { code: 'M03', name: '核查规则管理', desc: '规则发布与版本管理', status: 'in_progress', action: () => publishRule({ ruleId: 'rule_demo_001', versionNo: '1.0.1' }) },
  M04: { code: 'M04', name: '核查任务策略管理', desc: '任务生成与状态跟踪', status: 'in_progress', action: () => generateTask({ strategyId: 'strategy_demo_001', sceneCode: 'SCENE_A' }) },
  M05: { code: 'M05', name: '协议识别核查执行', desc: '执行调度与断点续跑', status: 'todo', action: () => generateTask({ strategyId: 'strategy_demo_005', sceneCode: 'SCENE_CHECK' }) },
  M06: { code: 'M06', name: '协议信息提取引擎', desc: '增量对象提取与日志', status: 'todo', action: () => runParse({ fileId: 'file_extract_demo', protocolType: 'TYPE_A' }) },
  M07: { code: 'M07', name: '协议信息解析', desc: '解析结果输出与置信度', status: 'todo', action: () => runParse({ fileId: 'file_parse_demo', protocolType: 'TYPE_B' }) },
  M08: { code: 'M08', name: '识别结果校核', desc: '校核执行与差异明细', status: 'todo', action: () => runVerify({ taskId: 'task_demo_verify', verifyMode: 'full' }) },
  M09: { code: 'M09', name: '识别问题结果记录', desc: '问题建档与归并', status: 'todo', action: () => governIssue({ issueId: 'issue_demo_009', ticketAction: 'create', assignee: 'LTC' }) },
  M10: { code: 'M10', name: '问题分析及治理', desc: '工单流转与闭环治理', status: 'todo', action: () => governIssue({ issueId: 'issue_demo_010', ticketAction: 'dispatch', assignee: 'LTC' }) },
  M11: { code: 'M11', name: '核查任务监控', desc: '监控日志与告警', status: 'todo', action: () => generateTask({ strategyId: 'strategy_monitor', sceneCode: 'SCENE_MONITOR' }) },
  M12: { code: 'M12', name: '核查结果监控', desc: '看板指标与结果监控', status: 'todo', action: () => runVerify({ taskId: 'task_demo_012', verifyMode: 'overview' }) },
  M13: { code: 'M13', name: '协议识别能力优化', desc: '迭代优化与效果评估', status: 'todo', action: () => iterateOptimize({ feedbackId: 'feedback_demo_013', modelVersion: 'model_v2' }) },
  M14: { code: 'M14', name: '协同复核', desc: '人工复核与纠偏回写', status: 'todo', action: () => governIssue({ issueId: 'issue_demo_014', ticketAction: 'review', assignee: 'LTC' }) }
};

const route = useRoute();
const resultText = ref('');
const current = computed(() => moduleMap[route.params.moduleCode] || {
  code: 'UNKNOWN',
  name: '模块未定义',
  desc: '请通过侧栏进入已定义模块',
  status: 'unknown',
  action: null
});

async function runAction() {
  resultText.value = '';
  if (!current.value.action) {
    resultText.value = '当前模块未配置动作。';
    return;
  }
  const res = await current.value.action();
  resultText.value = `code=${res?.code}, requestId=${res?.requestId || '-'}, message=${res?.message || '-'}`;
}
</script>

<style scoped>
.meta { display: flex; gap: 16px; margin-bottom: 10px; color: var(--color-text-2); }
.hint { margin-bottom: 10px; color: var(--color-text-3); }
.btn { border: 1px solid #165dff; background: #165dff; color: #fff; padding: 7px 14px; border-radius: 6px; cursor: pointer; }
.result { margin-top: 12px; padding: 10px; background: #f2f3f5; border-radius: 6px; font-family: Consolas, monospace; }
</style>
