<template>
  <div class="page-shell">
    <h1 class="page-title">协议样本标注管理（M02）</h1>
    <p class="page-subtitle">API-02 /api/protocol/sample/annotate</p>

    <div class="ds-card form">
      <label>
        <span>样本ID</span>
        <input v-model="form.sampleId" />
      </label>
      <label>
        <span>标注结果</span>
        <select v-model="form.annotationResult">
          <option value="valid">valid</option>
          <option value="invalid">invalid</option>
          <option value="needs_review">needs_review</option>
        </select>
      </label>
      <label>
        <span>操作人</span>
        <input v-model="form.operator" />
      </label>
      <button class="btn" @click="submit">提交标注</button>
    </div>

    <div class="ds-card" v-if="result">
      <div class="meta">requestId: {{ result.requestId }}</div>
      <pre class="json">{{ JSON.stringify(result.data, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { annotateSample } from '../api/protocolFullFlowApi.js';

const form = reactive({
  sampleId: 'sample_demo_001',
  annotationResult: 'valid',
  operator: 'LTC'
});

const result = ref(null);

async function submit() {
  result.value = await annotateSample({ ...form });
}
</script>

<style scoped>
.form { display: grid; grid-template-columns: repeat(3, minmax(180px, 1fr)); gap: 12px; align-items: end; margin-bottom: 16px; }
label { display: flex; flex-direction: column; gap: 6px; }
input, select { padding: 7px 8px; }
.btn { border: 1px solid #165dff; background: #165dff; color: #fff; padding: 7px 14px; border-radius: 6px; cursor: pointer; height: 34px; }
.meta { color: var(--color-text-2); margin-bottom: 8px; }
.json { margin: 0; white-space: pre-wrap; }
@media (max-width: 900px) { .form { grid-template-columns: 1fr; } }
</style>
