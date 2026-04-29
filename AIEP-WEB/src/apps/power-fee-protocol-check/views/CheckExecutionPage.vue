<template>
  <div class="page-shell">
    <h1 class="page-title">协议识别核查执行（M05）</h1>
    <p class="page-subtitle">执行链路：API-07（解析）+ API-08（校核）</p>

    <div class="ds-card form">
      <label>
        <span>文件ID</span>
        <input v-model="form.fileId" />
      </label>
      <label>
        <span>协议类型</span>
        <select v-model="form.protocolType">
          <option value="TYPE_A">TYPE_A</option>
          <option value="TYPE_B">TYPE_B</option>
          <option value="TYPE_C">TYPE_C</option>
        </select>
      </label>
      <label>
        <span>校核模式</span>
        <select v-model="form.verifyMode">
          <option value="full">full</option>
          <option value="overview">overview</option>
        </select>
      </label>
      <button class="btn" @click="runPipeline">执行核查</button>
    </div>

    <div class="ds-card" v-if="steps.length">
      <table class="table">
        <thead>
          <tr><th>步骤</th><th>接口</th><th>requestId</th><th>结果</th></tr>
        </thead>
        <tbody>
          <tr v-for="s in steps" :key="s.step">
            <td>{{ s.step }}</td>
            <td>{{ s.api }}</td>
            <td>{{ s.requestId }}</td>
            <td>{{ s.summary }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { runParse, runVerify } from '../api/protocolFullFlowApi.js';

const form = reactive({
  fileId: 'file_demo_001',
  protocolType: 'TYPE_A',
  verifyMode: 'full'
});
const steps = ref([]);

async function runPipeline() {
  steps.value = [];
  const parseRes = await runParse({ fileId: form.fileId, protocolType: form.protocolType });
  steps.value.push({
    step: '1',
    api: 'API-07 /parse/run',
    requestId: parseRes?.requestId || '-',
    summary: parseRes?.data?.parseId || '-'
  });
  const verifyRes = await runVerify({ taskId: parseRes?.data?.parseId || 'task_demo_001', verifyMode: form.verifyMode });
  steps.value.push({
    step: '2',
    api: 'API-08 /verify/run',
    requestId: verifyRes?.requestId || '-',
    summary: verifyRes?.data?.verifyId || '-'
  });
}
</script>

<style scoped>
.form { display: grid; grid-template-columns: repeat(3, minmax(180px, 1fr)); gap: 12px; align-items: end; margin-bottom: 16px; }
label { display: flex; flex-direction: column; gap: 6px; }
input, select { padding: 7px 8px; }
.btn { border: 1px solid #165dff; background: #165dff; color: #fff; padding: 7px 14px; border-radius: 6px; cursor: pointer; height: 34px; }
.table { width: 100%; border-collapse: collapse; }
th, td { border-bottom: 1px solid var(--color-border-2); text-align: left; padding: 10px; }
@media (max-width: 900px) { .form { grid-template-columns: 1fr; } }
</style>
