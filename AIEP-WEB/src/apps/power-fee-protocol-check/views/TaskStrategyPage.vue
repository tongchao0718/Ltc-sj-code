<template>
  <div class="page-shell">
    <h1 class="page-title">核查任务策略管理（M04）</h1>
    <p class="page-subtitle">API-04 /api/protocol/task/generate</p>

    <div class="ds-card form">
      <label>
        <span>策略ID</span>
        <input v-model="form.strategyId" />
      </label>
      <label>
        <span>场景编码</span>
        <input v-model="form.sceneCode" />
      </label>
      <label>
        <span>单位编码（逗号分隔）</span>
        <input v-model="unitCodesText" />
      </label>
      <button class="btn" @click="submit">生成任务</button>
    </div>

    <div class="ds-card" v-if="result">
      <div class="meta">requestId: {{ result.requestId }}</div>
      <pre class="json">{{ JSON.stringify(result.data, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { generateTask } from '../api/protocolFullFlowApi.js';

const form = reactive({
  strategyId: 'strategy_demo_001',
  sceneCode: 'SCENE_A'
});
const unitCodesText = ref('UNIT001,UNIT002');
const result = ref(null);

const unitCodes = computed(() =>
  unitCodesText.value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
);

async function submit() {
  result.value = await generateTask({
    strategyId: form.strategyId,
    sceneCode: form.sceneCode,
    unitCodes: unitCodes.value
  });
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
