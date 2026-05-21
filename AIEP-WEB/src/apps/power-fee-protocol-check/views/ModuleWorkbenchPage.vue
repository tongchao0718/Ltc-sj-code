<template>
  <div class="page-shell">
    <div class="page-head">
      <h1 class="page-title">{{ meta.title }}</h1>
      <p class="page-subtitle">{{ meta.subtitle }}</p>
    </div>

    <!-- M06 提取 -->
    <template v-if="code === 'M06'">
      <a-card title="执行增量提取" :bordered="false" class="mb">
        <a-space wrap>
          <a-input v-model="m06.customerNo" placeholder="户号" style="width: 200px" />
          <a-select v-model="m06.protocolType" style="width: 160px">
            <a-option value="TYPE_A">TYPE_A</a-option>
            <a-option value="TYPE_B">TYPE_B</a-option>
          </a-select>
          <a-button type="primary" :loading="m06.running" @click="doM06Extract">执行提取</a-button>
        </a-space>
        <a-alert v-if="m06.last" type="success" show-icon class="mt">{{ m06.last }}</a-alert>
      </a-card>
      <a-card title="提取对象列表" :bordered="false">
        <a-button class="mb" @click="loadM06List">刷新</a-button>
        <a-table row-key="objectId" :columns="m06cols" :data="m06rows" :pagination="false" :loading="m06.loading" />
      </a-card>
    </template>

    <!-- M07 解析 -->
    <template v-else-if="code === 'M07'">
      <a-card title="发起解析" :bordered="false" class="mb">
        <a-space wrap>
          <a-input v-model="m07.fileId" placeholder="文件ID" style="width: 220px" />
          <a-select v-model="m07.protocolType" style="width: 140px">
            <a-option value="TYPE_A">TYPE_A</a-option>
            <a-option value="TYPE_B">TYPE_B</a-option>
          </a-select>
          <a-button type="primary" :loading="m07.running" @click="doM07Parse">解析</a-button>
        </a-space>
      </a-card>
      <a-card title="解析结果列表" :bordered="false">
        <a-button class="mb" @click="loadM07List">刷新</a-button>
        <a-table row-key="parseId" :columns="m07cols" :data="m07rows" :pagination="false" :loading="m07.loading" />
      </a-card>
    </template>

    <!-- M08 校核 -->
    <template v-else-if="code === 'M08'">
      <a-card title="发起校核" :bordered="false" class="mb">
        <a-space direction="vertical" fill>
          <a-space wrap>
            <span class="muted">选用最近一次解析的 parseId（或手填）</span>
          </a-space>
          <a-space wrap>
            <a-input v-model="m08.parseId" placeholder="parseId" style="width: 280px" />
            <a-select v-model="m08.verifyMode" style="width: 120px">
              <a-option value="full">full</a-option>
              <a-option value="overview">overview</a-option>
            </a-select>
            <a-button @click="fillParseFromList">从列表首行填入</a-button>
            <a-button type="primary" :loading="m08.running" @click="doM08Verify">校核</a-button>
          </a-space>
        </a-space>
      </a-card>
      <a-card title="校核记录" :bordered="false">
        <a-button class="mb" @click="loadM08List">刷新</a-button>
        <a-table row-key="verifyId" :columns="m08cols" :data="m08rows" :pagination="false" :loading="m08.loading" />
      </a-card>
    </template>

    <!-- M09 问题 -->
    <template v-else-if="code === 'M09'">
      <a-card title="登记问题" :bordered="false" class="mb">
        <a-space wrap>
          <a-input v-model="m09.problemId" placeholder="问题ID（可空自动生成）" style="width: 240px" />
          <a-input v-model="m09.description" placeholder="描述" style="width: 260px" />
          <a-button type="primary" :loading="m09.running" @click="doM09Create">创建</a-button>
        </a-space>
      </a-card>
      <a-card title="问题列表" :bordered="false">
        <a-button class="mb" @click="loadM09List">刷新</a-button>
        <a-table row-key="problemId" :columns="m09cols" :data="m09rows" :pagination="false" :loading="m09.loading" />
      </a-card>
    </template>

    <!-- M10 治理 -->
    <template v-else-if="code === 'M10'">
      <a-row :gutter="16">
        <a-col :xs="24" :md="12">
          <a-card title="派发工单" :bordered="false" class="mb">
            <a-space direction="vertical" fill>
              <a-input v-model="m10.problemId" placeholder="problemId" />
              <a-input v-model="m10.assignee" placeholder="受理人" />
              <a-button type="primary" :loading="m10.runD" @click="doM10Dispatch">派发</a-button>
            </a-space>
          </a-card>
          <a-card title="工单流转" :bordered="false">
            <a-space direction="vertical" fill>
              <a-input v-model="m10.ticketId" placeholder="ticketId（从列表复制）" />
              <a-select v-model="m10.action" style="width: 100%">
                <a-option value="resolve">resolve</a-option>
                <a-option value="close">close</a-option>
                <a-option value="processing">processing</a-option>
              </a-select>
              <a-button :loading="m10.runT" @click="doM10Transition">提交流转</a-button>
            </a-space>
          </a-card>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-card title="工单列表" :bordered="false">
            <a-button class="mb" @click="loadM10Tickets">刷新</a-button>
            <a-table row-key="ticketId" :columns="m10cols" :data="m10rows" :pagination="false" :loading="m10.loading" />
          </a-card>
        </a-col>
      </a-row>
    </template>

    <!-- M11 任务监控 -->
    <template v-else-if="code === 'M11'">
      <a-card title="监控日志" :bordered="false">
        <a-space class="mb">
          <a-button @click="loadM11">刷新</a-button>
          <a-button type="outline" @click="doM11Ping">写入一条演示日志</a-button>
        </a-space>
        <a-table row-key="logId" :columns="m11cols" :data="m11rows" :pagination="false" :loading="m11.loading" />
      </a-card>
    </template>

    <!-- M12 结果监控 -->
    <template v-else-if="code === 'M12'">
      <a-card title="结果与治理汇总" :bordered="false">
        <a-button class="mb" type="primary" @click="loadM12">刷新看板</a-button>
        <a-descriptions v-if="m12.data" bordered :column="2">
          <a-descriptions-item label="核查总数">{{ m12.data.totalChecks }}</a-descriptions-item>
          <a-descriptions-item label="解析总数">{{ m12.data.totalParses }}</a-descriptions-item>
          <a-descriptions-item label="校核通过">{{ m12.data.passedVerify }}</a-descriptions-item>
          <a-descriptions-item label="校核失败">{{ m12.data.failedVerify }}</a-descriptions-item>
          <a-descriptions-item label="待关闭问题">{{ m12.data.openProblems }}</a-descriptions-item>
          <a-descriptions-item label="在途工单">{{ m12.data.openTickets }}</a-descriptions-item>
          <a-descriptions-item label="更新时间" :span="2">{{ m12.data.lastUpdatedAt || '-' }}</a-descriptions-item>
        </a-descriptions>
      </a-card>
    </template>

    <!-- M13 优化 -->
    <template v-else-if="code === 'M13'">
      <a-card title="触发优化迭代" :bordered="false" class="mb">
        <a-space wrap>
          <a-input v-model="m13.feedbackId" placeholder="feedbackId" style="width: 200px" />
          <a-input v-model="m13.modelVersion" placeholder="modelVersion" style="width: 160px" />
          <a-button type="primary" :loading="m13.running" @click="doM13">执行迭代</a-button>
        </a-space>
      </a-card>
      <a-card title="迭代记录" :bordered="false">
        <a-button class="mb" @click="loadM13List">刷新</a-button>
        <a-table row-key="iterationId" :columns="m13cols" :data="m13rows" :pagination="false" :loading="m13.loading" />
      </a-card>
    </template>

    <!-- M14 复核 -->
    <template v-else-if="code === 'M14'">
      <a-card title="提交复核结论" :bordered="false" class="mb">
        <a-space direction="vertical" fill style="max-width: 480px">
          <a-input v-model="m14.sourceId" placeholder="来源ID" />
          <a-select v-model="m14.conclusion">
            <a-option value="accepted">accepted</a-option>
            <a-option value="corrected">corrected</a-option>
          </a-select>
          <a-textarea v-model="m14.corrections" placeholder="纠偏说明（corrected 时写入易错字库）" />
          <a-button type="primary" :loading="m14.running" @click="doM14Submit">提交</a-button>
        </a-space>
      </a-card>
      <a-row :gutter="16">
        <a-col :xs="24" :md="12">
          <a-card title="复核记录" :bordered="false">
            <a-button class="mb" @click="loadM14Reviews">刷新</a-button>
            <a-table row-key="reviewTaskId" :columns="m14rcols" :data="m14rrows" :pagination="false" :loading="m14.loading" />
          </a-card>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-card title="易错字库" :bordered="false">
            <a-button class="mb" @click="loadM14Corpus">刷新</a-button>
            <a-table row-key="corpusId" :columns="m14ccols" :data="m14crows" :pagination="false" :loading="m14.cload" />
          </a-card>
        </a-col>
      </a-row>
    </template>

    <a-empty v-else description="未知模块，请从侧栏进入 M06–M14 路由" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import {
  createProblem,
  fetchErrorCorpus,
  fetchExtractList,
  fetchOptimizeList,
  fetchParseList,
  fetchProblemList,
  fetchResultMonitorOverview,
  fetchReviewList,
  fetchTaskMonitorList,
  fetchTicketList,
  fetchVerifyList,
  generateTask,
  governDispatch,
  governTransition,
  iterateOptimize,
  reviewSubmit,
  runExtract,
  runParse,
  runVerify
} from '../api/protocolDomainApi.js';
import { pickData, toastOk } from '../composables/usePfcResult.js';

const META = {
  M06: { title: '协议信息提取引擎', subtitle: '增量提取 → 对象入池 → 列表可查' },
  M07: { title: '协议信息解析', subtitle: '解析入档 → 结果列表' },
  M08: { title: '识别结果校核', subtitle: '按 parseId 校核 → 结论可查' },
  M09: { title: '识别问题结果记录', subtitle: '问题建档 → 列表追溯' },
  M10: { title: '问题分析及治理', subtitle: '派发工单 → 流转闭环' },
  M11: { title: '核查任务监控', subtitle: '监控日志查询（可触发任务产生日志）' },
  M12: { title: '核查结果监控', subtitle: '质效与治理汇总看板' },
  M13: { title: '协议识别能力优化', subtitle: '迭代记录与效果字段' },
  M14: { title: '协同复核', subtitle: '复核提交与易错字库沉淀' }
};

const route = useRoute();
const code = computed(() => route.meta.pfcModule || route.params.moduleCode || '');
const meta = computed(() => META[code.value] || { title: '模块工作台', subtitle: '请选择功能模块' });

const m06 = reactive({ customerNo: 'CN10002', protocolType: 'TYPE_A', running: false, loading: false, last: '', rows: [] });
const m06cols = [
  { title: '对象ID', dataIndex: 'objectId', ellipsis: true },
  { title: '户号', dataIndex: 'customerNo' },
  { title: '协议类型', dataIndex: 'protocolType' },
  { title: '状态', dataIndex: 'extractStatus' },
  { title: '创建时间', dataIndex: 'createdAt' }
];
const m06rows = computed(() => m06.rows);

const m07 = reactive({ fileId: 'file_parse_ui', protocolType: 'TYPE_B', running: false, loading: false, rows: [] });
const m07cols = [
  { title: 'parseId', dataIndex: 'parseId', ellipsis: true },
  { title: '文件', dataIndex: 'fileId' },
  { title: '类型', dataIndex: 'protocolType', width: 90 },
  { title: '状态', dataIndex: 'parseStatus', width: 100 },
  { title: '置信度', dataIndex: 'confidence', width: 90 },
  { title: '时间', dataIndex: 'createdAt', width: 170 }
];
const m07rows = computed(() => m07.rows);

const m08 = reactive({ parseId: '', verifyMode: 'full', running: false, loading: false, rows: [] });
const m08cols = [
  { title: 'verifyId', dataIndex: 'verifyId', ellipsis: true },
  { title: 'parseId', dataIndex: 'parseId' },
  { title: '状态', dataIndex: 'verifyStatus', width: 100 },
  { title: '模式', dataIndex: 'verifyMode', width: 100 },
  { title: '时间', dataIndex: 'createdAt', width: 170 }
];
const m08rows = computed(() => m08.rows);

const m09 = reactive({ problemId: '', description: '界面登记：字段缺失', running: false, loading: false, rows: [] });
const m09cols = [
  { title: 'problemId', dataIndex: 'problemId' },
  { title: '类型', dataIndex: 'problemType', width: 100 },
  { title: '级别', dataIndex: 'issueLevel', width: 80 },
  { title: '状态', dataIndex: 'issueStatus', width: 100 },
  { title: '描述', dataIndex: 'description', ellipsis: true, tooltip: true }
];
const m09rows = computed(() => m09.rows);

const m10 = reactive({
  problemId: 'issue_demo_010',
  assignee: 'LTC',
  ticketId: '',
  action: 'resolve',
  runD: false,
  runT: false,
  loading: false,
  rows: []
});
const m10cols = [
  { title: 'ticketId', dataIndex: 'ticketId', ellipsis: true },
  { title: 'problemId', dataIndex: 'problemId' },
  { title: '状态', dataIndex: 'ticketStatus', width: 100 },
  { title: '受理人', dataIndex: 'assignee', width: 100 }
];
const m10rows = computed(() => m10.rows);

const m11 = reactive({ loading: false, rows: [] });
const m11cols = [
  { title: '时间', dataIndex: 'createdAt', width: 170 },
  { title: '级别', dataIndex: 'level', width: 80 },
  { title: '任务', dataIndex: 'taskId', width: 120 },
  { title: '消息', dataIndex: 'message', ellipsis: true, tooltip: true }
];
const m11rows = computed(() => m11.rows);

const m12 = reactive({ data: null });

const m13 = reactive({ feedbackId: 'feedback_demo_013', modelVersion: 'model_v2', running: false, loading: false, rows: [] });
const m13cols = [
  { title: 'iterationId', dataIndex: 'iterationId', ellipsis: true },
  { title: '反馈', dataIndex: 'feedbackId' },
  { title: '模型版本', dataIndex: 'modelVersion' },
  { title: '状态', dataIndex: 'iterationStatus', width: 100 },
  { title: '时间', dataIndex: 'createdAt', width: 170 }
];
const m13rows = computed(() => m13.rows);

const m14 = reactive({
  sourceId: 'src_ui_001',
  conclusion: 'corrected',
  corrections: '户名同音字纠正',
  running: false,
  loading: false,
  cload: false,
  rrows: [],
  crows: []
});
const m14rcols = [
  { title: 'reviewTaskId', dataIndex: 'reviewTaskId', ellipsis: true },
  { title: '结论', dataIndex: 'conclusion', width: 100 },
  { title: '复核人', dataIndex: 'reviewer', width: 100 },
  { title: '时间', dataIndex: 'createdAt', width: 170 }
];
const m14ccols = [
  { title: 'corpusId', dataIndex: 'corpusId', ellipsis: true },
  { title: '错误片段', dataIndex: 'wrongToken', ellipsis: true },
  { title: '时间', dataIndex: 'createdAt', width: 170 }
];
const m14rrows = computed(() => m14.rrows);
const m14crows = computed(() => m14.crows);

async function loadM06List() {
  m06.loading = true;
  try {
    const res = await fetchExtractList({ pageNo: 1, pageSize: 20 });
    const d = pickData(res, '');
    m06.rows = d?.list || [];
  } finally {
    m06.loading = false;
  }
}
async function doM06Extract() {
  m06.running = true;
  m06.last = '';
  try {
    const res = await runExtract({ customerNo: m06.customerNo, protocolType: m06.protocolType });
    const d = pickData(res, '提取：');
    if (!d) return;
    m06.last = `objectId=${d.object?.objectId}，状态=${d.object?.extractStatus}`;
    toastOk('提取已执行');
    await loadM06List();
  } finally {
    m06.running = false;
  }
}

async function loadM07List() {
  m07.loading = true;
  try {
    const res = await fetchParseList({ pageNo: 1, pageSize: 20 });
    const d = pickData(res, '');
    m07.rows = d?.list || [];
  } finally {
    m07.loading = false;
  }
}
async function doM07Parse() {
  m07.running = true;
  try {
    const res = await runParse({ fileId: m07.fileId, protocolType: m07.protocolType });
    if (!pickData(res, '解析：')) return;
    toastOk('解析完成');
    await loadM07List();
  } finally {
    m07.running = false;
  }
}

async function loadM08List() {
  m08.loading = true;
  try {
    const res = await fetchVerifyList({ pageNo: 1, pageSize: 20 });
    const d = pickData(res, '');
    m08.rows = d?.list || [];
  } finally {
    m08.loading = false;
  }
}
function fillParseFromList() {
  loadM07List().then(() => {
    const first = m07.rows[0];
    if (first?.parseId) m08.parseId = first.parseId;
    else Message.info('请先在「协议信息解析」页生成解析记录');
  });
}
async function doM08Verify() {
  if (!m08.parseId) {
    Message.warning('请填写 parseId');
    return;
  }
  m08.running = true;
  try {
    const res = await runVerify({ parseId: m08.parseId, verifyMode: m08.verifyMode });
    if (!pickData(res, '校核：')) return;
    toastOk('校核完成');
    await loadM08List();
  } finally {
    m08.running = false;
  }
}

async function loadM09List() {
  m09.loading = true;
  try {
    const res = await fetchProblemList({ pageNo: 1, pageSize: 20 });
    const d = pickData(res, '');
    m09.rows = d?.list || [];
  } finally {
    m09.loading = false;
  }
}
async function doM09Create() {
  m09.running = true;
  try {
    const res = await createProblem({
      problemId: m09.problemId || undefined,
      description: m09.description,
      operator: 'LTC'
    });
    if (!pickData(res, '建档：')) return;
    toastOk('问题已创建');
    m09.problemId = '';
    await loadM09List();
  } finally {
    m09.running = false;
  }
}

async function loadM10Tickets() {
  m10.loading = true;
  try {
    const res = await fetchTicketList({ pageNo: 1, pageSize: 20 });
    const d = pickData(res, '');
    m10.rows = d?.list || [];
  } finally {
    m10.loading = false;
  }
}
async function doM10Dispatch() {
  m10.runD = true;
  try {
    const res = await governDispatch({
      problemId: m10.problemId,
      assignee: m10.assignee,
      operator: 'LTC'
    });
    const d = pickData(res, '派发：');
    if (!d?.ticket) return;
    m10.ticketId = d.ticket.ticketId;
    toastOk('工单已派发');
    await loadM10Tickets();
  } finally {
    m10.runD = false;
  }
}
async function doM10Transition() {
  if (!m10.ticketId) {
    Message.warning('请填写 ticketId');
    return;
  }
  m10.runT = true;
  try {
    const res = await governTransition({
      ticketId: m10.ticketId,
      action: m10.action,
      operator: 'LTC',
      remark: '界面闭环'
    });
    if (!pickData(res, '流转：')) return;
    toastOk('工单已更新');
    await loadM10Tickets();
  } finally {
    m10.runT = false;
  }
}

async function loadM11() {
  m11.loading = true;
  try {
    const res = await fetchTaskMonitorList({ pageNo: 1, pageSize: 30 });
    const d = pickData(res, '');
    m11.rows = d?.list || [];
  } finally {
    m11.loading = false;
  }
}
async function doM11Ping() {
  const res = await generateTask({
    strategyId: 'strategy_monitor',
    sceneCode: 'SCENE_MONITOR',
    unitCodes: ['UNIT099']
  });
  if (!pickData(res, '')) return;
  toastOk('已生成任务并写入监控日志');
  await loadM11();
}

async function loadM12() {
  const res = await fetchResultMonitorOverview();
  const d = pickData(res, '看板：');
  m12.data = d;
}

async function loadM13List() {
  m13.loading = true;
  try {
    const res = await fetchOptimizeList({ pageNo: 1, pageSize: 20 });
    const d = pickData(res, '');
    m13.rows = d?.list || [];
  } finally {
    m13.loading = false;
  }
}
async function doM13() {
  m13.running = true;
  try {
    const res = await iterateOptimize({ feedbackId: m13.feedbackId, modelVersion: m13.modelVersion });
    if (!pickData(res, '优化：')) return;
    toastOk('迭代已记录');
    await loadM13List();
  } finally {
    m13.running = false;
  }
}

async function loadM14Reviews() {
  m14.loading = true;
  try {
    const res = await fetchReviewList({ pageNo: 1, pageSize: 20 });
    const d = pickData(res, '');
    m14.rrows = d?.list || [];
  } finally {
    m14.loading = false;
  }
}
async function loadM14Corpus() {
  m14.cload = true;
  try {
    const res = await fetchErrorCorpus({ pageNo: 1, pageSize: 20 });
    const d = pickData(res, '');
    m14.crows = d?.list || [];
  } finally {
    m14.cload = false;
  }
}
async function doM14Submit() {
  m14.running = true;
  try {
    const res = await reviewSubmit({
      reviewTaskId: m14.sourceId,
      conclusion: m14.conclusion,
      corrections: m14.conclusion === 'corrected' ? m14.corrections : '',
      operator: 'LTC'
    });
    if (!pickData(res, '复核：')) return;
    toastOk('复核已提交');
    await Promise.all([loadM14Reviews(), loadM14Corpus()]);
  } finally {
    m14.running = false;
  }
}

function refreshCurrent() {
  const c = code.value;
  if (c === 'M06') loadM06List();
  else if (c === 'M07') loadM07List();
  else if (c === 'M08') loadM08List();
  else if (c === 'M09') loadM09List();
  else if (c === 'M10') loadM10Tickets();
  else if (c === 'M11') loadM11();
  else if (c === 'M12') loadM12();
  else if (c === 'M13') loadM13List();
  else if (c === 'M14') {
    loadM14Reviews();
    loadM14Corpus();
  }
}

onMounted(refreshCurrent);

watch(code, () => {
  nextTick(() => refreshCurrent());
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
