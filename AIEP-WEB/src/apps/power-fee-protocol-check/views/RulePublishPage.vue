<template>
  <div class="page-shell">
    <div class="page-head">
      <h1 class="page-title">核查规则管理</h1>
      <p class="page-subtitle">增删改查：新建草稿 → 编辑（仅草稿）→ 发布版本；草稿可删除</p>
    </div>

    <a-card :bordered="false" class="mb">
      <a-space wrap>
        <a-button type="primary" :loading="loading" @click="loadList">刷新规则</a-button>
        <a-button type="primary" status="success" @click="openCreate">新建规则（草稿）</a-button>
      </a-space>
    </a-card>

    <a-card title="规则库" :bordered="false">
      <a-spin :loading="loading">
        <a-table
          row-key="ruleId"
          :columns="columns"
          :data="rows"
          :pagination="pagination"
          @page-change="onPageChange"
          @page-size-change="onPageSizeChange"
        >
          <template #status="{ record }">
            <a-tag :color="record.status === 'enabled' ? 'green' : 'orangered'">{{ record.status }}</a-tag>
          </template>
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="openPublish(record)">发布</a-button>
              <a-button type="text" size="small" :disabled="record.status === 'enabled'" @click="openEdit(record)">编辑</a-button>
              <a-popconfirm content="仅草稿可删，确定删除？" :disabled="record.status === 'enabled'" @ok="runDelete(record)">
                <a-button type="text" size="small" status="danger" :disabled="record.status === 'enabled'">删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table>
      </a-spin>
    </a-card>

    <a-modal v-model:visible="publishVisible" title="发布规则版本" :on-before-ok="submitPublish" @cancel="publishVisible = false">
      <a-form :model="publishForm" layout="vertical">
        <a-form-item label="规则ID"><a-input v-model="publishForm.ruleId" readonly /></a-form-item>
        <a-form-item label="版本号"><a-input v-model="publishForm.versionNo" /></a-form-item>
        <a-form-item label="变更说明"><a-textarea v-model="publishForm.changeNote" :auto-size="{ minRows: 2, maxRows: 5 }" /></a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="createVisible" title="新建规则" :on-before-ok="submitCreate" @cancel="createVisible = false">
      <a-form :model="createForm" layout="vertical">
        <a-form-item label="规则ID（可空自动生成）"><a-input v-model="createForm.ruleId" allow-clear /></a-form-item>
        <a-form-item label="规则编码" required><a-input v-model="createForm.ruleCode" /></a-form-item>
        <a-form-item label="规则名称" required><a-input v-model="createForm.ruleName" /></a-form-item>
        <a-form-item label="规则类型">
          <a-select v-model="createForm.ruleType">
            <a-option value="integrity">integrity</a-option>
            <a-option value="consistency">consistency</a-option>
            <a-option value="compliance">compliance</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="适用模板类型">
          <a-select v-model="createForm.templateType">
            <a-option value="TYPE_A">TYPE_A</a-option>
            <a-option value="TYPE_B">TYPE_B</a-option>
            <a-option value="TYPE_C">TYPE_C</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="editVisible" title="编辑规则（草稿）" :on-before-ok="submitEdit" @cancel="editVisible = false">
      <a-form :model="editForm" layout="vertical">
        <a-form-item label="规则ID"><a-input v-model="editForm.ruleId" readonly /></a-form-item>
        <a-form-item label="规则编码"><a-input v-model="editForm.ruleCode" /></a-form-item>
        <a-form-item label="规则名称"><a-input v-model="editForm.ruleName" /></a-form-item>
        <a-form-item label="规则类型">
          <a-select v-model="editForm.ruleType">
            <a-option value="integrity">integrity</a-option>
            <a-option value="consistency">consistency</a-option>
            <a-option value="compliance">compliance</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="适用模板类型">
          <a-select v-model="editForm.templateType">
            <a-option value="TYPE_A">TYPE_A</a-option>
            <a-option value="TYPE_B">TYPE_B</a-option>
            <a-option value="TYPE_C">TYPE_C</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { fetchRuleList, publishRule, createRule, updateRule, deleteRule } from '../api/protocolDomainApi.js';
import { pickData, toastOk } from '../composables/usePfcResult.js';

const loading = ref(false);
const rows = ref([]);
const total = ref(0);
const pageNo = ref(1);
const pageSize = ref(10);

const publishVisible = ref(false);
const publishForm = reactive({
  ruleId: '',
  versionNo: '1.0.0',
  changeNote: ''
});

const createVisible = ref(false);
const createForm = reactive({
  ruleId: '',
  ruleCode: 'RULE_NEW',
  ruleName: '',
  ruleType: 'integrity',
  templateType: 'TYPE_A'
});

const editVisible = ref(false);
const editForm = reactive({
  ruleId: '',
  ruleCode: '',
  ruleName: '',
  ruleType: 'integrity',
  templateType: 'TYPE_A'
});

const pagination = computed(() => ({
  current: pageNo.value,
  pageSize: pageSize.value,
  total: total.value,
  showTotal: true,
  showPageSize: true
}));

const columns = [
  { title: '规则ID', dataIndex: 'ruleId', width: 140 },
  { title: '规则编码', dataIndex: 'ruleCode' },
  { title: '规则名称', dataIndex: 'ruleName' },
  { title: '类型', dataIndex: 'ruleType', width: 110 },
  { title: '适用模板类型', dataIndex: 'templateType', width: 120 },
  { title: '状态', slotName: 'status', width: 100 },
  { title: '操作', slotName: 'actions', width: 220 }
];

async function loadList() {
  loading.value = true;
  try {
    const res = await fetchRuleList({ pageNo: pageNo.value, pageSize: pageSize.value });
    const data = pickData(res, '规则列表：');
    if (!data) return;
    rows.value = data.list || [];
    total.value = data.total ?? 0;
  } finally {
    loading.value = false;
  }
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

function openPublish(record) {
  publishForm.ruleId = record.ruleId;
  publishForm.versionNo = '1.0.0';
  publishForm.changeNote = `发布 ${record.ruleName}`;
  publishVisible.value = true;
}

async function submitPublish() {
  const res = await publishRule({
    ruleId: publishForm.ruleId,
    versionNo: publishForm.versionNo,
    changeNote: publishForm.changeNote,
    operator: 'LTC'
  });
  if (!pickData(res, '发布：')) return false;
  toastOk('规则已发布');
  publishVisible.value = false;
  await loadList();
  return true;
}

function openCreate() {
  createForm.ruleId = '';
  createForm.ruleCode = `RULE_${Date.now().toString(36).toUpperCase()}`;
  createForm.ruleName = '新建核查规则';
  createForm.ruleType = 'integrity';
  createForm.templateType = 'TYPE_A';
  createVisible.value = true;
}

async function submitCreate() {
  if (!createForm.ruleCode?.trim() || !createForm.ruleName?.trim()) {
    Message.warning('请填写规则编码与名称');
    return false;
  }
  const payload = {
    ruleCode: createForm.ruleCode.trim(),
    ruleName: createForm.ruleName.trim(),
    ruleType: createForm.ruleType,
    templateType: createForm.templateType
  };
  if (createForm.ruleId?.trim()) payload.ruleId = createForm.ruleId.trim();
  const res = await createRule(payload);
  if (!pickData(res, '新建：')) return false;
  toastOk('规则草稿已创建');
  await loadList();
  return true;
}

function openEdit(record) {
  if (record.status === 'enabled') {
    Message.warning('已发布规则不可在此编辑');
    return;
  }
  editForm.ruleId = record.ruleId;
  editForm.ruleCode = record.ruleCode;
  editForm.ruleName = record.ruleName;
  editForm.ruleType = record.ruleType;
  editForm.templateType = record.templateType;
  editVisible.value = true;
}

async function submitEdit() {
  const res = await updateRule({ ...editForm });
  if (!pickData(res, '保存：')) return false;
  toastOk('规则已更新');
  editVisible.value = false;
  await loadList();
  return true;
}

async function runDelete(record) {
  const res = await deleteRule({ ruleId: record.ruleId });
  if (!pickData(res, '删除：')) return;
  toastOk('规则已删除');
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
</style>
