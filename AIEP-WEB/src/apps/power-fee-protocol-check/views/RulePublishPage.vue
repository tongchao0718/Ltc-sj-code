<template>
  <div class="page-shell">
    <h1 class="page-title">核查规则管理（M03）</h1>
    <p class="page-subtitle">API-03 /api/protocol/rule/publish</p>

    <div class="ds-card form">
      <label>
        <span>规则ID</span>
        <input v-model="form.ruleId" />
      </label>
      <label>
        <span>版本号</span>
        <input v-model="form.versionNo" />
      </label>
      <label>
        <span>变更说明</span>
        <input v-model="form.changeNote" />
      </label>
      <button class="btn" @click="submit">发布规则</button>
    </div>

    <div class="ds-card" v-if="result">
      <div class="meta">requestId: {{ result.requestId }}</div>
      <pre class="json">{{ JSON.stringify(result.data, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { publishRule } from '../api/protocolFullFlowApi.js';

const form = reactive({
  ruleId: 'rule_demo_001',
  versionNo: '1.0.0',
  changeNote: 'initial publish'
});

const result = ref(null);

async function submit() {
  result.value = await publishRule({ ...form });
}
</script>

<style scoped>
.form { display: grid; grid-template-columns: repeat(3, minmax(180px, 1fr)); gap: 12px; align-items: end; margin-bottom: 16px; }
label { display: flex; flex-direction: column; gap: 6px; }
input { padding: 7px 8px; }
.btn { border: 1px solid #165dff; background: #165dff; color: #fff; padding: 7px 14px; border-radius: 6px; cursor: pointer; height: 34px; }
.meta { color: var(--color-text-2); margin-bottom: 8px; }
.json { margin: 0; white-space: pre-wrap; }
@media (max-width: 900px) { .form { grid-template-columns: 1fr; } }
</style>
