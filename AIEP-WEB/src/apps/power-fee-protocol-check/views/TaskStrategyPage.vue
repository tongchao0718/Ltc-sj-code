<template>
  <div class="page-shell">
    <div class="page-head">
      <h1 class="page-title">核查任务策略管理</h1>
      <p class="page-subtitle">策略增删改 → 生成任务 → 任务列表（策略无任务可物理删，有任务则停用）</p>
    </div>

    <a-row :gutter="16">
      <a-col :xs="24" :lg="10">
        <a-card title="策略列表" :bordered="false" class="mb">
          <a-space class="mb" wrap>
            <a-button type="primary" status="success" size="small" @click="openCreateStrategy">新建策略</a-button>
            <a-button size="small" :loading="strLoading" @click="loadStrategies">刷新策略</a-button>
          </a-space>
          <a-spin :loading="strLoading">
            <a-table row-key="strategyId" :columns="strategyColumns" :data="strategies" :pagination="false" size="small">
              <template #st="{ record }">
                <a-tag>{{ record.status || 'enabled' }}</a-tag>
              </template>
              <template #actions="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="fillGenerate(record)">用于生成</a-button>
                  <a-button type="text" size="small" @click="openEditStrategy(record)">编辑</a-button>
                  <a-popconfirm content="无关联任务则删除；有关联任务则停用。继续？" @ok="runDeleteStrategy(record)">
                    <a-button type="text" size="small" status="danger">删除/停用</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </a-table>
          </a-spin>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="14">
        <a-card title="生成任务" :bordered="false" class="mb">
          <a-form :model="genForm" layout="vertical">
            <a-form-item label="策略ID"><a-input v-model="genForm.strategyId" allow-clear /></a-form-item>
            <a-form-item label="场景编码"><a-input v-model="genForm.sceneCode" allow-clear /></a-form-item>
            <a-form-item label="单位编码（逗号分隔）"><a-input v-model="unitCodesText" allow-clear /></a-form-item>
            <a-form-item label="幂等键（可选，重复提交返回同一任务）"><a-input v-model="genForm.idempotencyKey" allow-clear placeholder="如 batch-20260511-01" /></a-form-item>
            <a-button type="primary" :loading="genLoading" @click="runGenerate">生成任务</a-button>
          </a-form>
          <a-alert v-if="genSummary" type="success" show-icon class="mt">{{ genSummary }}</a-alert>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="任务列表" :bordered="false">
      <a-space class="mb" wrap>
        <span class="muted">任务状态</span>
        <a-select v-model="taskStatus" allow-clear placeholder="全部" style="width: 140px" @change="reloadTasks">
          <a-option value="pending">pending</a-option>
          <a-option value="running">running</a-option>
          <a-option value="done">done</a-option>
        </a-select>
        <a-button :loading="taskLoading" @click="reloadTasks">刷新任务</a-button>
      </a-space>
      <a-spin :loading="taskLoading">
        <a-table row-key="taskId" :columns="taskColumns" :data="tasks" :pagination="taskPagination" @page-change="onTaskPage" @page-size-change="onTaskPageSize">
          <template #taskStatus="{ record }">
            <a-tag>{{ record.taskStatus }}</a-tag>
          </template>
          <template #progress="{ record }">
            {{ record.totalCount }}/{{ record.successCount }}/{{ record.failedCount }}
          </template>
        </a-table>
      </a-spin>
    </a-card>

    <a-modal v-model:visible="strCreateVisible" title="新建策略" :on-before-ok="submitCreateStrategy" @cancel="strCreateVisible = false">
      <a-form :model="strCreateForm" layout="vertical">
        <a-form-item label="策略ID（可空自动生成）"><a-input v-model="strCreateForm.strategyId" allow-clear /></a-form-item>
        <a-form-item label="策略名称" required><a-input v-model="strCreateForm.strategyName" /></a-form-item>
        <a-form-item label="单位编码"><a-input v-model="strCreateForm.orgCode" /></a-form-item>
        <a-form-item label="场景编码"><a-input v-model="strCreateForm.sceneCode" /></a-form-item>
        <a-form-item label="执行模式">
          <a-select v-model="strCreateForm.executeMode">
            <a-option value="auto">auto</a-option>
            <a-option value="batch">batch</a-option>
            <a-option value="manual">manual</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model="strCreateForm.status">
            <a-option value="enabled">enabled</a-option>
            <a-option value="disabled">disabled</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="strEditVisible" title="编辑策略" :on-before-ok="submitEditStrategy" @cancel="strEditVisible = false">
      <a-form :model="strEditForm" layout="vertical">
        <a-form-item label="策略ID"><a-input v-model="strEditForm.strategyId" readonly /></a-form-item>
        <a-form-item label="策略名称"><a-input v-model="strEditForm.strategyName" /></a-form-item>
        <a-form-item label="单位编码"><a-input v-model="strEditForm.orgCode" /></a-form-item>
        <a-form-item label="场景编码"><a-input v-model="strEditForm.sceneCode" /></a-form-item>
        <a-form-item label="执行模式">
          <a-select v-model="strEditForm.executeMode">
            <a-option value="auto">auto</a-option>
            <a-option value="batch">batch</a-option>
            <a-option value="manual">manual</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model="strEditForm.status">
            <a-option value="enabled">enabled</a-option>
            <a-option value="disabled">disabled</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import {
  fetchStrategyList,
  fetchTaskList,
  generateTask,
  createStrategy,
  updateStrategy,
  deleteStrategy
} from '../api/protocolDomainApi.js';
import { pickData, toastOk } from '../composables/usePfcResult.js';

const strLoading = ref(false);
const strategies = ref([]);

const strategyColumns = [
  { title: '策略ID', dataIndex: 'strategyId', ellipsis: true, tooltip: true },
  { title: '名称', dataIndex: 'strategyName' },
  { title: '场景', dataIndex: 'sceneCode', width: 100 },
  { title: '模式', dataIndex: 'executeMode', width: 90 },
  { title: '状态', slotName: 'st', width: 90 },
  { title: '操作', slotName: 'actions', width: 220 }
];

const strCreateVisible = ref(false);
const strEditVisible = ref(false);
const strCreateForm = reactive({
  strategyId: '',
  strategyName: '',
  orgCode: 'ORG01',
  sceneCode: 'SCENE_A',
  executeMode: 'auto',
  status: 'enabled'
});
const strEditForm = reactive({
  strategyId: '',
  strategyName: '',
  orgCode: '',
  sceneCode: '',
  executeMode: 'auto',
  status: 'enabled'
});

const genForm = reactive({
  strategyId: 'strategy_demo_001',
  sceneCode: 'SCENE_A',
  idempotencyKey: ''
});
const unitCodesText = ref('UNIT001,UNIT002');
const genLoading = ref(false);
const genSummary = ref('');

const taskStatus = ref('');
const taskLoading = ref(false);
const tasks = ref([]);
const taskTotal = ref(0);
const taskPageNo = ref(1);
const taskPageSize = ref(10);

const unitCodes = computed(() =>
  unitCodesText.value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
);

const taskColumns = [
  { title: '任务ID', dataIndex: 'taskId', ellipsis: true, tooltip: true },
  { title: '策略', dataIndex: 'strategyId', width: 140 },
  { title: '场景', dataIndex: 'sceneCode', width: 100 },
  { title: '状态', slotName: 'taskStatus', width: 100 },
  { title: '总数/成功/失败', slotName: 'progress', width: 140 },
  { title: '创建时间', dataIndex: 'createdAt', width: 170 }
];

const taskPagination = computed(() => ({
  current: taskPageNo.value,
  pageSize: taskPageSize.value,
  total: taskTotal.value,
  showTotal: true,
  showPageSize: true
}));

async function loadStrategies() {
  strLoading.value = true;
  try {
    const res = await fetchStrategyList();
    const data = pickData(res, '策略：');
    if (!data) return;
    strategies.value = data.list || [];
  } finally {
    strLoading.value = false;
  }
}

async function reloadTasks() {
  taskLoading.value = true;
  try {
    const res = await fetchTaskList({
      taskStatus: taskStatus.value || undefined,
      pageNo: taskPageNo.value,
      pageSize: taskPageSize.value
    });
    const data = pickData(res, '任务：');
    if (!data) return;
    tasks.value = data.list || [];
    taskTotal.value = data.total ?? 0;
  } finally {
    taskLoading.value = false;
  }
}

function onTaskPage(p) {
  taskPageNo.value = p;
  reloadTasks();
}

function onTaskPageSize(s) {
  taskPageSize.value = s;
  taskPageNo.value = 1;
  reloadTasks();
}

function fillGenerate(record) {
  genForm.strategyId = record.strategyId;
  genForm.sceneCode = record.sceneCode;
}

async function runGenerate() {
  genLoading.value = true;
  genSummary.value = '';
  try {
    const res = await generateTask({
      strategyId: genForm.strategyId,
      sceneCode: genForm.sceneCode,
      unitCodes: unitCodes.value.length ? unitCodes.value : ['UNIT001'],
      idempotencyKey: genForm.idempotencyKey || undefined
    });
    const data = pickData(res, '生成任务：');
    if (!data) return;
    genSummary.value = `已生成任务 taskId=${data.taskId}，状态=${data.taskStatus}`;
    toastOk('任务已生成');
    await reloadTasks();
    await loadStrategies();
  } finally {
    genLoading.value = false;
  }
}

function openCreateStrategy() {
  strCreateForm.strategyId = '';
  strCreateForm.strategyName = `新策略 ${new Date().toLocaleString()}`;
  strCreateForm.orgCode = 'ORG01';
  strCreateForm.sceneCode = 'SCENE_A';
  strCreateForm.executeMode = 'auto';
  strCreateForm.status = 'enabled';
  strCreateVisible.value = true;
}

async function submitCreateStrategy() {
  if (!strCreateForm.strategyName?.trim()) {
    Message.warning('请填写策略名称');
    return false;
  }
  const payload = {
    strategyName: strCreateForm.strategyName.trim(),
    orgCode: strCreateForm.orgCode || 'ORG01',
    sceneCode: strCreateForm.sceneCode || 'SCENE_A',
    executeMode: strCreateForm.executeMode,
    status: strCreateForm.status
  };
  if (strCreateForm.strategyId?.trim()) payload.strategyId = strCreateForm.strategyId.trim();
  const res = await createStrategy(payload);
  if (!pickData(res, '新建策略：')) return false;
  toastOk('策略已创建');
  await loadStrategies();
  return true;
}

function openEditStrategy(record) {
  strEditForm.strategyId = record.strategyId;
  strEditForm.strategyName = record.strategyName;
  strEditForm.orgCode = record.orgCode;
  strEditForm.sceneCode = record.sceneCode;
  strEditForm.executeMode = record.executeMode;
  strEditForm.status = record.status || 'enabled';
  strEditVisible.value = true;
}

async function submitEditStrategy() {
  const res = await updateStrategy({ ...strEditForm });
  if (!pickData(res, '保存策略：')) return false;
  toastOk('策略已更新');
  strEditVisible.value = false;
  await loadStrategies();
  return true;
}

async function runDeleteStrategy(record) {
  const res = await deleteStrategy({ strategyId: record.strategyId });
  const d = pickData(res, '删除策略：');
  if (!d) return;
  if (d.disabled) toastOk('策略已停用（存在历史任务）');
  else toastOk('策略已删除');
  await loadStrategies();
}

onMounted(async () => {
  await loadStrategies();
  await reloadTasks();
});
</script>

<style scoped>
.page-head {
  margin-bottom: 12px;
}
.mb {
  margin-bottom: 16px;
}
.mt {
  margin-top: 12px;
}
.muted {
  color: var(--color-text-3);
  font-size: 13px;
}
</style>
