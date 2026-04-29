<template>
  <div class="page-shell">
    <h1 class="page-title">电费协议核查全链路验证工作台</h1>
    <p class="page-subtitle">API-02 ~ API-08 一键触发（开发联调页）</p>

    <div class="action-row ds-card">
      <button class="btn" @click="runAll">一键执行全链路验证</button>
      <button class="btn btn-secondary" @click="clearLogs">清空日志</button>
    </div>

    <div class="ds-card">
      <table class="table">
        <thead>
          <tr>
            <th>步骤</th>
            <th>接口</th>
            <th>状态</th>
            <th>requestId</th>
            <th>结果摘要</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in logs" :key="row.step">
            <td>{{ row.step }}</td>
            <td>{{ row.api }}</td>
            <td>{{ row.status }}</td>
            <td>{{ row.requestId }}</td>
            <td>{{ row.summary }}</td>
          </tr>
          <tr v-if="logs.length === 0"><td colspan="5" class="empty">暂无执行记录</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { annotateSample, publishRule, generateTask, governIssue, iterateOptimize, runParse, runVerify } from '../api/protocolFullFlowApi.js';

const logs = ref([]);
function pushLog(step, api, result, summary) {
  logs.value.push({ step, api, status: result?.code === 0 ? 'success' : 'failed', requestId: result?.requestId || '-', summary });
}
async function runAll() {
  logs.value = [];
  const r1 = await annotateSample({ sampleId: 'sample_demo_001', operator: 'LTC' });
  pushLog('1', 'API-02 /sample/annotate', r1, r1?.data?.annotationId || '-');
  const r2 = await publishRule({ ruleId: 'rule_demo_001', versionNo: '1.0.0' });
  pushLog('2', 'API-03 /rule/publish', r2, r2?.data?.publishId || '-');
  const r3 = await generateTask({ strategyId: 'strategy_demo_001', sceneCode: 'SCENE_A' });
  pushLog('3', 'API-04 /task/generate', r3, r3?.data?.taskId || '-');
  const r4 = await runParse({ fileId: 'file_demo_001', protocolType: 'TYPE_A' });
  pushLog('4', 'API-07 /parse/run', r4, r4?.data?.parseId || '-');
  const r5 = await runVerify({ taskId: r3?.data?.taskId || 'task_demo_001', verifyMode: 'full' });
  pushLog('5', 'API-08 /verify/run', r5, r5?.data?.verifyId || '-');
  const r6 = await governIssue({ issueId: 'issue_demo_001', ticketAction: 'dispatch', assignee: 'LTC' });
  pushLog('6', 'API-05 /issue/govern', r6, r6?.data?.governId || '-');
  const r7 = await iterateOptimize({ feedbackId: 'feedback_demo_001', modelVersion: 'model_v1' });
  pushLog('7', 'API-06 /optimize/iterate', r7, r7?.data?.iterationId || '-');
}
function clearLogs() { logs.value = []; }
</script>

<style scoped>
.action-row { display: flex; gap: 10px; margin-bottom: 16px; }
.btn { border: 1px solid #165dff; background: #165dff; color: #fff; padding: 7px 14px; border-radius: 6px; cursor: pointer; }
.btn-secondary { background: #fff; color: #165dff; }
.table { width: 100%; border-collapse: collapse; }
th, td { border-bottom: 1px solid var(--color-border-2); text-align: left; padding: 10px; }
.empty { text-align: center; color: var(--color-text-3); }
</style>
