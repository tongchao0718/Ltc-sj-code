<template>
  <div class="page-shell">
    <div class="page-head">
      <h1 class="page-title">协议模板库</h1>
      <p class="page-subtitle">增删改查：新建 / 编辑 / 删除（仅草稿可删）→ 列表刷新；支持查看字段与档案基准</p>
    </div>

    <a-card class="filter-card" :bordered="false">
      <a-space wrap>
        <span class="filter-label">模板类型</span>
        <a-select v-model="queryType" allow-clear placeholder="全部" style="width: 200px">
          <a-option value="TYPE_A">TYPE_A</a-option>
          <a-option value="TYPE_B">TYPE_B</a-option>
          <a-option value="TYPE_C">TYPE_C</a-option>
        </a-select>
        <a-button type="primary" :loading="loading" @click="loadList">查询</a-button>
        <a-button type="primary" status="success" @click="openCreate">新建模板</a-button>
      </a-space>
    </a-card>

    <a-card :bordered="false">
      <a-spin :loading="loading" style="width: 100%">
        <a-table row-key="templateCode" :columns="columns" :data="rows" :pagination="false" :bordered="{ cell: true }">
          <template #status="{ record }">
            <a-tag :color="record.status === 'enabled' ? 'green' : 'orangered'">{{ record.status }}</a-tag>
          </template>
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="openDetail(record)">字段与映射</a-button>
              <a-button type="text" size="small" @click="openEdit(record)">编辑</a-button>
              <a-popconfirm
                content="仅允许删除非「enabled」模板，确定删除？"
                :disabled="record.status === 'enabled'"
                @ok="runDelete(record)"
              >
                <a-button type="text" size="small" status="danger" :disabled="record.status === 'enabled'">删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table>
        <div v-if="total > 0" class="table-footer">共 {{ total }} 条</div>
      </a-spin>
    </a-card>

    <a-drawer v-model:visible="drawerVisible" width="520" :title="drawerTitle" unmount-on-close>
      <a-spin :loading="drawerLoading">
        <a-typography-title :heading="6">模板字段</a-typography-title>
        <a-table row-key="fieldCode" :columns="fieldColumns" :data="fieldRows" :pagination="false" size="small" />
        <a-divider />
        <a-typography-title :heading="6">档案基准（抽样）</a-typography-title>
        <a-table row-key="baselineId" :columns="baselineColumns" :data="baselineRows" :pagination="false" size="small" />
      </a-spin>
    </a-drawer>

    <a-modal v-model:visible="createVisible" title="新建模板" :on-before-ok="submitCreate" @cancel="createVisible = false">
      <a-form :model="createForm" layout="vertical">
        <a-form-item label="模板编码" required><a-input v-model="createForm.templateCode" placeholder="唯一，如 TMP_XXX" /></a-form-item>
        <a-form-item label="模板名称" required><a-input v-model="createForm.templateName" /></a-form-item>
        <a-form-item label="模板类型">
          <a-select v-model="createForm.templateType">
            <a-option value="TYPE_A">TYPE_A</a-option>
            <a-option value="TYPE_B">TYPE_B</a-option>
            <a-option value="TYPE_C">TYPE_C</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="初始版本"><a-input v-model="createForm.versionNo" /></a-form-item>
        <a-form-item label="状态">
          <a-select v-model="createForm.status">
            <a-option value="draft">draft（草稿）</a-option>
            <a-option value="enabled">enabled（慎用）</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="editVisible" title="编辑模板" :on-before-ok="submitEdit" @cancel="editVisible = false">
      <a-form :model="editForm" layout="vertical">
        <a-form-item label="模板编码"><a-input v-model="editForm.templateCode" readonly /></a-form-item>
        <a-form-item label="模板名称"><a-input v-model="editForm.templateName" /></a-form-item>
        <a-form-item label="模板类型">
          <a-select v-model="editForm.templateType">
            <a-option value="TYPE_A">TYPE_A</a-option>
            <a-option value="TYPE_B">TYPE_B</a-option>
            <a-option value="TYPE_C">TYPE_C</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="版本号"><a-input v-model="editForm.versionNo" /></a-form-item>
        <a-form-item label="状态">
          <a-select v-model="editForm.status">
            <a-option value="draft">draft</a-option>
            <a-option value="enabled">enabled</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import {
  fetchTemplateList,
  fetchTemplateFields,
  fetchBaselineList,
  createTemplate,
  updateTemplate,
  deleteTemplate
} from '../api/protocolDomainApi.js';
import { pickData, toastOk } from '../composables/usePfcResult.js';

const queryType = ref('');
const loading = ref(false);
const rows = ref([]);
const total = ref(0);

const columns = [
  { title: '模板编码', dataIndex: 'templateCode' },
  { title: '模板名称', dataIndex: 'templateName' },
  { title: '模板类型', dataIndex: 'templateType', width: 100 },
  { title: '版本', dataIndex: 'versionNo', width: 100 },
  { title: '状态', slotName: 'status', width: 110 },
  { title: '更新时间', dataIndex: 'updatedAt', width: 170 },
  { title: '操作', slotName: 'actions', width: 260 }
];

const drawerVisible = ref(false);
const drawerLoading = ref(false);
const activeTemplate = ref(null);
const fieldRows = ref([]);
const baselineRows = ref([]);

const drawerTitle = computed(() =>
  activeTemplate.value ? `模板详情 · ${activeTemplate.value.templateName}` : '模板详情'
);

const fieldColumns = [
  { title: '字段编码', dataIndex: 'fieldCode' },
  { title: '字段名称', dataIndex: 'fieldName' },
  { title: '类型', dataIndex: 'fieldType', width: 90 },
  { title: '必填', dataIndex: 'requiredFlag', width: 70 }
];

const baselineColumns = [
  { title: '基准ID', dataIndex: 'baselineId' },
  { title: '户号', dataIndex: 'customerNo' },
  { title: '户名', dataIndex: 'customerName' },
  { title: '交费方式', dataIndex: 'payMode', width: 100 }
];

async function loadList() {
  loading.value = true;
  try {
    const res = await fetchTemplateList({
      type: queryType.value || undefined,
      pageNo: 1,
      pageSize: 50
    });
    const data = pickData(res, '模板列表：');
    if (!data) return;
    rows.value = data.list || [];
    total.value = data.total ?? rows.value.length;
  } finally {
    loading.value = false;
  }
}

function resetAndLoad() {
  queryType.value = '';
  loadList();
}

async function openDetail(record) {
  activeTemplate.value = record;
  drawerVisible.value = true;
}

async function loadDrawerData() {
  if (!activeTemplate.value) return;
  drawerLoading.value = true;
  fieldRows.value = [];
  baselineRows.value = [];
  try {
    const code = activeTemplate.value.templateCode;
    const [fRes, bRes] = await Promise.all([
      fetchTemplateFields({ templateCode: code }),
      fetchBaselineList({ pageNo: 1, pageSize: 20 })
    ]);
    const fData = pickData(fRes, '字段：');
    const bData = pickData(bRes, '基准：');
    fieldRows.value = fData?.list || [];
    baselineRows.value = bData?.list || [];
  } finally {
    drawerLoading.value = false;
  }
}

watch(drawerVisible, (open) => {
  if (open) loadDrawerData();
});

const createVisible = ref(false);
const editVisible = ref(false);
const createForm = reactive({
  templateCode: '',
  templateName: '',
  templateType: 'TYPE_A',
  versionNo: '0.0.1',
  status: 'draft'
});
const editForm = reactive({
  templateCode: '',
  templateName: '',
  templateType: 'TYPE_A',
  versionNo: '',
  status: 'draft'
});

function openCreate() {
  createForm.templateCode = '';
  createForm.templateName = '';
  createForm.templateType = 'TYPE_A';
  createForm.versionNo = '0.0.1';
  createForm.status = 'draft';
  createVisible.value = true;
}

async function submitCreate() {
  if (!createForm.templateCode?.trim() || !createForm.templateName?.trim()) return false;
  const res = await createTemplate({ ...createForm });
  if (!pickData(res, '新建：')) return false;
  toastOk('模板已创建');
  await loadList();
  return true;
}

function openEdit(record) {
  editForm.templateCode = record.templateCode;
  editForm.templateName = record.templateName;
  editForm.templateType = record.templateType;
  editForm.versionNo = record.versionNo;
  editForm.status = record.status;
  editVisible.value = true;
}

async function submitEdit() {
  const res = await updateTemplate({ ...editForm });
  if (!pickData(res, '保存：')) return false;
  toastOk('模板已更新');
  editVisible.value = false;
  await loadList();
  return true;
}

async function runDelete(record) {
  const res = await deleteTemplate({ templateCode: record.templateCode });
  if (!pickData(res, '删除：')) return;
  toastOk('已删除');
  if (activeTemplate.value?.templateCode === record.templateCode) drawerVisible.value = false;
  await loadList();
}

onMounted(loadList);
</script>

<style scoped>
.page-head {
  margin-bottom: 12px;
}
.filter-card {
  margin-bottom: 16px;
}
.filter-label {
  color: var(--color-text-2);
}
.table-footer {
  margin-top: 12px;
  color: var(--color-text-3);
  font-size: 13px;
}
</style>
