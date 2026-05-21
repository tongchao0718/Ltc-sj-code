<template>
  <div class="page-shell">
    <div class="page-head">
      <h1 class="page-title">协议样本标注管理</h1>
      <p class="page-subtitle">增删改：新建样本 → 列表；编辑元数据；失效（软删）→ 预处理 / 标注 → 刷新</p>
    </div>

    <a-card :bordered="false" class="mb">
      <a-space wrap>
        <span class="muted">协议类型</span>
        <a-select v-model="protocolType" allow-clear placeholder="全部" style="width: 160px" @change="onFilterChange">
          <a-option value="TYPE_A">TYPE_A</a-option>
          <a-option value="TYPE_B">TYPE_B</a-option>
          <a-option value="TYPE_C">TYPE_C</a-option>
          <a-option value="TYPE_D">TYPE_D</a-option>
        </a-select>
        <a-button type="primary" :loading="loading" @click="loadList">刷新列表</a-button>
        <a-button type="primary" status="success" @click="openCreateSample">新增样本</a-button>
      </a-space>
    </a-card>

    <a-card title="样本列表与操作" :bordered="false">
      <a-spin :loading="loading">
        <a-table
          row-key="sampleId"
          :columns="columns"
          :data="rows"
          :pagination="pagination"
          @page-change="onPageChange"
          @page-size-change="onPageSizeChange"
        >
          <template #sampleStatus="{ record }">
            <a-tag color="arcoblue">{{ record.sampleStatus }}</a-tag>
          </template>
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="openAnnotate(record)">标注</a-button>
              <a-button type="text" size="small" :loading="busyId === record.sampleId && busyKind === 'pre'" @click="runPreprocess(record)">
                预处理
              </a-button>
              <a-button type="text" size="small" @click="openEditSample(record)">编辑</a-button>
              <a-popconfirm content="将样本标记为失效（软删），是否继续？" @ok="runInvalidate(record)">
                <a-button type="text" size="small" status="danger" :disabled="record.sampleStatus === 'invalidated'">失效</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table>
      </a-spin>
    </a-card>

    <a-modal v-model:visible="modalVisible" title="提交标注" :on-before-ok="handleBeforeOk" @cancel="modalVisible = false">
      <a-form :model="form" layout="vertical">
        <a-form-item label="样本ID">
          <a-input v-model="form.sampleId" readonly />
        </a-form-item>
        <a-form-item label="标注结论">
          <a-select v-model="form.annotationResult">
            <a-option value="valid">valid（通过）</a-option>
            <a-option value="invalid">invalid（不通过）</a-option>
            <a-option value="needs_review">needs_review（待复核）</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="操作人">
          <a-input v-model="form.operator" />
        </a-form-item>
      </a-form>
      <div v-if="lastResult" class="result-block muted">最近一次接口 requestId：{{ lastResult.requestId || '-' }}</div>
    </a-modal>

    <a-modal v-model:visible="createSampleVisible" title="新增样本" :on-before-ok="submitCreateSample" @cancel="createSampleVisible = false">
      <a-form :model="sampleCreateForm" layout="vertical">
        <a-form-item label="样本ID（可空自动生成）"><a-input v-model="sampleCreateForm.sampleId" allow-clear /></a-form-item>
        <a-form-item label="文件ID" required><a-input v-model="sampleCreateForm.fileId" /></a-form-item>
        <a-form-item label="协议类型">
          <a-select v-model="sampleCreateForm.protocolType">
            <a-option value="TYPE_A">TYPE_A</a-option>
            <a-option value="TYPE_B">TYPE_B</a-option>
            <a-option value="TYPE_C">TYPE_C</a-option>
            <a-option value="TYPE_D">TYPE_D</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="来源系统"><a-input v-model="sampleCreateForm.sourceSystem" /></a-form-item>
        <a-form-item label="质量分"><a-input-number v-model="sampleCreateForm.qualityScore" :min="0" :max="100" :step="0.1" /></a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="editSampleVisible" title="编辑样本" :on-before-ok="submitEditSample" @cancel="editSampleVisible = false">
      <a-form :model="sampleEditForm" layout="vertical">
        <a-form-item label="样本ID"><a-input v-model="sampleEditForm.sampleId" readonly /></a-form-item>
        <a-form-item label="文件ID"><a-input v-model="sampleEditForm.fileId" /></a-form-item>
        <a-form-item label="协议类型">
          <a-select v-model="sampleEditForm.protocolType">
            <a-option value="TYPE_A">TYPE_A</a-option>
            <a-option value="TYPE_B">TYPE_B</a-option>
            <a-option value="TYPE_C">TYPE_C</a-option>
            <a-option value="TYPE_D">TYPE_D</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="来源系统"><a-input v-model="sampleEditForm.sourceSystem" /></a-form-item>
        <a-form-item label="质量分"><a-input-number v-model="sampleEditForm.qualityScore" :min="0" :max="100" :step="0.1" /></a-form-item>
      </a-form>
    </a-modal>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { fetchSampleList, preprocessSample, annotateSample, createSample, updateSample, deleteSample } from '../api/protocolDomainApi.js';
import { pickData, toastOk } from '../composables/usePfcResult.js';

const protocolType = ref('');
const loading = ref(false);
const rows = ref([]);
const total = ref(0);
const pageNo = ref(1);
const pageSize = ref(10);

const form = reactive({
  sampleId: '',
  annotationResult: 'valid',
  operator: 'LTC'
});

const modalVisible = ref(false);
const lastResult = ref(null);
const busyId = ref('');
const busyKind = ref('');

const pagination = computed(() => ({
  current: pageNo.value,
  pageSize: pageSize.value,
  total: total.value,
  showTotal: true,
  showPageSize: true
}));

const columns = [
  { title: '样本ID', dataIndex: 'sampleId', width: 160 },
  { title: '文件ID', dataIndex: 'fileId' },
  { title: '协议类型', dataIndex: 'protocolType', width: 100 },
  { title: '状态', slotName: 'sampleStatus', width: 130 },
  { title: '质量分', dataIndex: 'qualityScore', width: 90 },
  { title: '创建时间', dataIndex: 'createdAt', width: 170 },
  { title: '操作', slotName: 'actions', width: 280 }
];

async function loadList() {
  loading.value = true;
  try {
    const res = await fetchSampleList({
      protocolType: protocolType.value || undefined,
      pageNo: pageNo.value,
      pageSize: pageSize.value
    });
    const data = pickData(res, '样本列表：');
    if (!data) return;
    rows.value = data.list || [];
    total.value = data.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function onFilterChange() {
  pageNo.value = 1;
  loadList();
}

function onPageChange(p) {
  pageNo.value = p;
  loadList();
}

function onPageSizeChange(s) {
  pageSize.value = s;
  pageNo.value = 1;
  loadList();
}

async function runPreprocess(record) {
  busyId.value = record.sampleId;
  busyKind.value = 'pre';
  try {
    const res = await preprocessSample({ sampleId: record.sampleId });
    if (!pickData(res, '预处理：')) return;
    toastOk('预处理完成');
    await loadList();
  } finally {
    busyId.value = '';
    busyKind.value = '';
  }
}

function openAnnotate(record) {
  form.sampleId = record.sampleId;
  form.annotationResult = 'valid';
  form.operator = 'LTC';
  modalVisible.value = true;
}

async function handleBeforeOk() {
  if (!form.sampleId) {
    Message.warning('样本ID 无效');
    return false;
  }
  try {
    const res = await annotateSample({
      sampleId: form.sampleId,
      annotationResult: form.annotationResult,
      operator: form.operator || 'LTC'
    });
    if (!pickData(res, '标注：')) return false;
    lastResult.value = res;
    toastOk('标注已提交');
    await loadList();
    return true;
  } catch {
    return false;
  }
}

const createSampleVisible = ref(false);
const editSampleVisible = ref(false);
const sampleCreateForm = reactive({
  sampleId: '',
  fileId: '',
  protocolType: 'TYPE_A',
  sourceSystem: 'manual',
  qualityScore: null
});
const sampleEditForm = reactive({
  sampleId: '',
  fileId: '',
  protocolType: 'TYPE_A',
  sourceSystem: '',
  qualityScore: null
});

function openCreateSample() {
  sampleCreateForm.sampleId = '';
  sampleCreateForm.fileId = `file_${Date.now()}`;
  sampleCreateForm.protocolType = protocolType.value || 'TYPE_A';
  sampleCreateForm.sourceSystem = 'manual';
  sampleCreateForm.qualityScore = null;
  createSampleVisible.value = true;
}

async function submitCreateSample() {
  if (!sampleCreateForm.fileId?.trim()) {
    Message.warning('请填写文件ID');
    return false;
  }
  const payload = {
    fileId: sampleCreateForm.fileId.trim(),
    protocolType: sampleCreateForm.protocolType,
    sourceSystem: sampleCreateForm.sourceSystem || 'manual',
    qualityScore: sampleCreateForm.qualityScore
  };
  if (sampleCreateForm.sampleId?.trim()) payload.sampleId = sampleCreateForm.sampleId.trim();
  const res = await createSample(payload);
  if (!pickData(res, '新增：')) return false;
  toastOk('样本已创建');
  await loadList();
  return true;
}

function openEditSample(record) {
  sampleEditForm.sampleId = record.sampleId;
  sampleEditForm.fileId = record.fileId;
  sampleEditForm.protocolType = record.protocolType;
  sampleEditForm.sourceSystem = record.sourceSystem;
  sampleEditForm.qualityScore = record.qualityScore;
  editSampleVisible.value = true;
}

async function submitEditSample() {
  const res = await updateSample({ ...sampleEditForm });
  if (!pickData(res, '保存：')) return false;
  toastOk('样本已更新');
  await loadList();
  return true;
}

async function runInvalidate(record) {
  const res = await deleteSample({ sampleId: record.sampleId });
  if (!pickData(res, '失效：')) return;
  toastOk('样本已失效');
  await loadList();
}

onMounted(loadList);
</script>

<style scoped>
.page-head {
  margin-bottom: 12px;
}
.mb {
  margin-bottom: 16px;
}
.muted {
  color: var(--color-text-3);
  font-size: 13px;
}
.result-block {
  margin-top: 8px;
}
</style>
