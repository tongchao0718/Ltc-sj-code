<template>
  <div class="page-shell">
    <div class="page-head">
      <h1 class="page-title">协议识别核查执行</h1>
      <p class="page-subtitle">推荐：一键闭环（解析→校核→必要时问题建档）；亦可分步调试</p>
    </div>

    <a-tabs default-active-key="one">
      <a-tab-pane key="one" title="一键核查闭环">
        <a-card :bordered="false">
          <a-form :model="checkForm" layout="vertical" class="form-grid">
            <a-form-item label="文件ID"><a-input v-model="checkForm.fileId" /></a-form-item>
            <a-form-item label="协议类型">
              <a-select v-model="checkForm.protocolType">
                <a-option value="TYPE_A">TYPE_A（预期通过）</a-option>
                <a-option value="TYPE_B">TYPE_B</a-option>
                <a-option value="TYPE_C">TYPE_C</a-option>
                <a-option value="TYPE_D">TYPE_D（演示校核失败→问题单）</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="校核模式">
              <a-select v-model="checkForm.verifyMode">
                <a-option value="full">full</a-option>
                <a-option value="overview">overview</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="关联任务ID（可选）"><a-input v-model="checkForm.taskId" placeholder="可空" /></a-form-item>
            <a-form-item label="模拟不一致（强制校核失败）">
              <a-switch v-model="checkForm.simulateMismatch" />
            </a-form-item>
          </a-form>
          <a-button type="primary" :loading="checkLoading" @click="runOneClick">执行一键核查</a-button>

          <a-descriptions v-if="checkResult" title="闭环结果" :column="1" bordered class="mt" size="large">
            <a-descriptions-item label="计划">{{ checkResult.plan?.planId }} / {{ checkResult.plan?.planStatus }}</a-descriptions-item>
            <a-descriptions-item label="解析 parseId">{{ checkResult.parse?.parseId }}</a-descriptions-item>
            <a-descriptions-item label="校核 verifyId / 状态">
              {{ checkResult.verify?.verifyId }} — {{ checkResult.verify?.verifyStatus }}
            </a-descriptions-item>
            <a-descriptions-item label="自动生成问题单">{{ checkResult.problemId || '无' }}</a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-tab-pane>

      <a-tab-pane key="two" title="分步（解析 → 校核）">
        <a-card :bordered="false">
          <a-form :model="stepForm" layout="vertical" class="form-grid">
            <a-form-item label="文件ID"><a-input v-model="stepForm.fileId" /></a-form-item>
            <a-form-item label="协议类型">
              <a-select v-model="stepForm.protocolType">
                <a-option value="TYPE_A">TYPE_A</a-option>
                <a-option value="TYPE_B">TYPE_B</a-option>
                <a-option value="TYPE_C">TYPE_C</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="校核模式">
              <a-select v-model="stepForm.verifyMode">
                <a-option value="full">full</a-option>
                <a-option value="overview">overview</a-option>
              </a-select>
            </a-form-item>
          </a-form>
          <a-button type="primary" :loading="stepLoading" @click="runSteps">执行解析并校核</a-button>

          <a-table v-if="steps.length" class="mt" row-key="step" :columns="stepColumns" :data="steps" :pagination="false" />
        </a-card>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { runCheckPlan, runParse, runVerify } from '../api/protocolDomainApi.js';
import { pickData, toastOk } from '../composables/usePfcResult.js';

const checkForm = reactive({
  fileId: 'file_demo_001',
  protocolType: 'TYPE_A',
  verifyMode: 'full',
  taskId: '',
  simulateMismatch: false
});
const checkLoading = ref(false);
const checkResult = ref(null);

const stepForm = reactive({
  fileId: 'file_demo_001',
  protocolType: 'TYPE_A',
  verifyMode: 'full'
});
const stepLoading = ref(false);
const steps = ref([]);

const stepColumns = [
  { title: '步骤', dataIndex: 'step', width: 70 },
  { title: '接口', dataIndex: 'api' },
  { title: 'requestId', dataIndex: 'requestId' },
  { title: '摘要', dataIndex: 'summary' }
];

async function runOneClick() {
  checkLoading.value = true;
  checkResult.value = null;
  try {
    const res = await runCheckPlan({
      fileId: checkForm.fileId,
      protocolType: checkForm.protocolType,
      verifyMode: checkForm.verifyMode,
      taskId: checkForm.taskId || undefined,
      simulateMismatch: checkForm.simulateMismatch,
      operator: 'LTC'
    });
    const data = pickData(res, '核查：');
    if (!data) return;
    checkResult.value = data;
    toastOk('核查闭环已执行');
  } finally {
    checkLoading.value = false;
  }
}

async function runSteps() {
  stepLoading.value = true;
  steps.value = [];
  try {
    const pRes = await runParse({ fileId: stepForm.fileId, protocolType: stepForm.protocolType });
    const pData = pickData(pRes, '解析：');
    if (!pData) return;
    steps.value.push({
      step: '1',
      api: '/parse/run',
      requestId: pRes.requestId || '-',
      summary: pData.parseId || '-'
    });
    const vRes = await runVerify({
      parseId: pData.parseId,
      verifyMode: stepForm.verifyMode,
      fileId: stepForm.fileId,
      protocolType: stepForm.protocolType
    });
    const vData = pickData(vRes, '校核：');
    if (!vData) return;
    steps.value.push({
      step: '2',
      api: '/verify/run',
      requestId: vRes.requestId || '-',
      summary: `${vData.verifyId} / ${vData.verifyStatus}`
    });
    toastOk('分步执行完成');
  } finally {
    stepLoading.value = false;
  }
}
</script>

<style scoped>
.page-head {
  margin-bottom: 12px;
}
.form-grid {
  max-width: 520px;
}
.mt {
  margin-top: 16px;
}
</style>
