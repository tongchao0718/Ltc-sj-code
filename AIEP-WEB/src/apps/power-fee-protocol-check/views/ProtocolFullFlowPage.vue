<template>
  <div class="page-shell">
    <div class="page-head">
      <h1 class="page-title">电费协议核查全链路验证</h1>
      <p class="page-subtitle">样本 → 规则 → 任务 → 一键核查闭环 → 治理派发 → 优化迭代 → 复核提交</p>
    </div>

    <a-card :bordered="false" class="mb">
      <a-space>
        <a-button type="primary" :loading="running" @click="runAll">一键执行全链路</a-button>
        <a-button @click="clearLogs">清空日志</a-button>
      </a-space>
    </a-card>

    <a-card :bordered="false">
      <a-table row-key="step" :columns="columns" :data="logs" :pagination="false">
        <template #status="{ record }">
          <a-tag :color="record.status === 'success' ? 'green' : 'red'">{{ record.status }}</a-tag>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  annotateSample,
  publishRule,
  generateTask,
  governIssue,
  iterateOptimize,
  runCheckPlan,
  reviewSubmit
} from '../api/protocolDomainApi.js';
import { pickData, toastOk } from '../composables/usePfcResult.js';

const running = ref(false);
const logs = ref([]);

const columns = [
  { title: '步骤', dataIndex: 'step', width: 60 },
  { title: '接口', dataIndex: 'api' },
  { title: '状态', slotName: 'status', width: 100 },
  { title: 'requestId', dataIndex: 'requestId' },
  { title: '结果摘要', dataIndex: 'summary' }
];

function pushLog(step, api, res, summary) {
  const ok = res && (res.code === undefined || res.code === 0);
  logs.value.push({
    step,
    api,
    status: ok ? 'success' : 'failed',
    requestId: res?.requestId || '-',
    summary
  });
}

async function runAll() {
  running.value = true;
  logs.value = [];
  try {
    const r1 = await annotateSample({
      sampleId: 'sample_demo_001',
      annotationResult: 'valid',
      operator: 'LTC'
    });
    const d1 = pickData(r1, '');
    pushLog('1', '/sample/annotate', r1, d1?.annotationId || r1?.message || '-');

    const r2 = await publishRule({ ruleId: 'rule_demo_001', versionNo: '1.0.0', changeNote: 'full-flow', operator: 'LTC' });
    const d2 = pickData(r2, '');
    pushLog('2', '/rule/publish', r2, d2?.publishId || '-');

    const r3 = await generateTask({
      strategyId: 'strategy_demo_001',
      sceneCode: 'SCENE_A',
      unitCodes: ['UNIT001'],
      idempotencyKey: `fullflow_${Date.now()}`
    });
    const d3 = pickData(r3, '');
    const taskId = d3?.taskId;
    pushLog('3', '/task/generate', r3, taskId || '-');

    const r4 = await runCheckPlan({
      fileId: 'file_demo_001',
      protocolType: 'TYPE_A',
      verifyMode: 'full',
      taskId,
      operator: 'LTC'
    });
    const d4 = pickData(r4, '');
    pushLog(
      '4',
      '/check/run',
      r4,
      d4 ? `plan=${d4.plan?.planId}, verify=${d4.verify?.verifyStatus}, problem=${d4.problemId || '-'}` : '-'
    );

    const r5 = await governIssue({ issueId: 'issue_demo_flow', ticketAction: 'dispatch', assignee: 'LTC', operator: 'LTC' });
    const d5 = pickData(r5, '');
    pushLog('5', '/issue/govern', r5, d5?.ticket?.ticketId || d5?.governId || '-');

    const r6 = await iterateOptimize({ feedbackId: 'feedback_demo_001', modelVersion: 'model_v1' });
    const d6 = pickData(r6, '');
    pushLog('6', '/optimize/iterate', r6, d6?.iterationId || '-');

    const r7 = await reviewSubmit({
      reviewTaskId: 'rev_src_fullflow',
      conclusion: 'corrected',
      operator: 'LTC',
      corrections: '易错词：交费→缴费'
    });
    const d7 = pickData(r7, '');
    pushLog('7', '/review/submit', r7, d7?.reviewTaskId || '-');

    toastOk('全链路步骤已执行（请查看失败项）');
  } finally {
    running.value = false;
  }
}

function clearLogs() {
  logs.value = [];
}
</script>

<style scoped>
.page-head {
  margin-bottom: 12px;
}
.mb {
  margin-bottom: 16px;
}
</style>
