<template>
  <div class="md-list-page">
    <!-- 查询区 -->
    <div class="md-panel">
      <MdSectionTitle :title="config.title" />
      <MdFilterForm
        :filters="config.filters"
        :form="form"
        :loading="loading"
        @search="search"
        @reset="reset"
      />
    </div>

    <!-- 列表区 -->
    <div class="md-panel md-panel--table">
      <MdSectionTitle :title="listTitle">
        <template #extra>
          <button type="button" class="md-link" :disabled="loading || !rows.length" @click="doExport('xlsx')">导出 Excel</button>
        </template>
      </MdSectionTitle>

      <div v-if="loading" class="md-loading">加载中…</div>
      <div v-else-if="error" class="md-empty">{{ error }}</div>
      <div v-else-if="!rows.length" class="md-empty">暂无数据，请调整查询条件</div>
      <template v-else>
        <div class="md-table-wrap">
          <table class="md-table">
            <thead>
              <tr>
                <th v-for="col in config.columns" :key="col.key">{{ col.label }}</th>
                <th style="width:120px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id || row.companyId + (row.period || row.date || '')">
                <td v-for="col in config.columns" :key="col.key">
                  <span v-if="col.tag" class="md-tag" :class="tagClass(row[col.key])">{{ formatCell(row[col.key], col.format) }}</span>
                  <span v-else>{{ formatCell(row[col.key], col.format) }}</span>
                </td>
                <td class="md-table-actions">
                  <button type="button" class="md-link" @click="openDetail(row)">详情</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <MdPagination
          :total="total"
          :page-no="pageNo"
          :page-size="pageSize"
          @change="changePage"
          @size-change="changeSize"
        />
      </template>
    </div>

    <!-- 详情弹窗 -->
    <MdDetailModal
      :visible="detailVisible"
      :title="detailTitle"
      :size="detailModalSize"
      @close="detailVisible = false"
    >
      <MdDetailView
        :basic-items="detailBasic"
        :basic-columns="detailBasicColumns"
        :extra-title="detailExtraTitle"
        :extra-items="detailExtra"
        :extra-columns="detailExtraColumns"
        :extra-layout="detailExtraLayout"
        :extra-table-columns="detailTableColumns"
        :extra-table-rows="detailTableRows"
      />
    </MdDetailModal>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import MdSectionTitle from './MdSectionTitle.vue'
import MdFilterForm from './MdFilterForm.vue'
import MdDetailModal from './MdDetailModal.vue'
import MdDetailView from './MdDetailView.vue'
import MdPagination from './MdPagination.vue'
import {
  queryCompanies,
  queryList,
  exportMock,
  getPurchaseCostDetail,
  getRetailPackages,
  getRiskCredit
} from '../mock/api.js'
import { marketingStore } from '../store/marketingStore.js'
import {
  buildDetailItems,
  buildDetailItemsFromRow,
  COMPANY_DETAIL_FIELDS,
  FIELD_LABELS
} from '../config/fieldLabels.js'
import { useMdMessage } from '../composables/useMdMessage.js'

const msg = useMdMessage()

const props = defineProps({
  config: { type: Object, required: true }
})

const listTitle = computed(() => props.config.listTitle || `${props.config.title.replace(/查询$/, '')}列表`)

const form = reactive(Object.fromEntries((props.config.filters || []).map((f) => [f.key, ''])))
const loading = ref(false)
const error = ref('')
const rows = ref([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(10)

const detailVisible = ref(false)
const detailTitle = ref('详情')
const detailModalSize = ref('lg')
const detailBasic = ref([])
const detailBasicColumns = ref(2)
const detailExtra = ref([])
const detailExtraColumns = ref(2)
const detailExtraTitle = ref('扩展信息')
const detailExtraLayout = ref('form')
const detailTableColumns = ref([])
const detailTableRows = ref([])

function tagClass(v) {
  if (['A', '正常', '已结清', '已生效'].includes(v)) return 'md-tag--success'
  if (['B', '预警', '未结清'].includes(v)) return 'md-tag--warning'
  if (['C', '高风险', '临期'].includes(v)) return 'md-tag--danger'
  return 'md-tag--info'
}

function formatCell(v, fmt) {
  if (fmt === 'money' && typeof v === 'number') return v.toLocaleString('zh-CN')
  return v ?? '-'
}

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    const params = { ...form, pageNo: pageNo.value, pageSize: pageSize.value }
    const cfg = props.config
    if (cfg.mode === 'companies') {
      const res = await queryCompanies(params)
      rows.value = res.rows
      total.value = res.total
    } else if (cfg.mode === 'purchaseCost') {
      const list = marketingStore.companies.filter((c) => !form.companyName || c.name.includes(form.companyName))
      rows.value = list.map((c) => getPurchaseCostDetail(c.id))
      total.value = rows.value.length
    } else if (cfg.mode === 'retailPackage') {
      const list = marketingStore.companies.filter((c) => !form.companyName || c.name.includes(form.companyName))
      rows.value = list.flatMap((c) => getRetailPackages(c.id))
      total.value = rows.value.length
    } else if (cfg.mode === 'riskCredit') {
      const list = marketingStore.companies.filter((c) => !form.companyName || c.name.includes(form.companyName))
      rows.value = list.map((c) => getRiskCredit(c.id))
      total.value = rows.value.length
    } else {
      const res = await queryList(cfg.dataset, params)
      rows.value = res.rows
      total.value = res.total
    }
  } catch (e) {
    error.value = '查询失败，请稍后重试'
    rows.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function search() {
  pageNo.value = 1
  fetchData()
}

function reset() {
  Object.keys(form).forEach((k) => { form[k] = '' })
  search()
}

function changePage(p) {
  pageNo.value = p
  fetchData()
}

function changeSize(size) {
  pageSize.value = size
  pageNo.value = 1
  fetchData()
}

function openDetail(row) {
  const cfg = props.config
  detailModalSize.value = 'lg'
  detailExtraLayout.value = 'form'
  detailTableColumns.value = []
  detailTableRows.value = []
  detailExtra.value = []

  if (cfg.mode === 'companies') {
    detailTitle.value = `${row.name} — 详情`
    const all = buildDetailItems(row, COMPANY_DETAIL_FIELDS.map((f) => ({
      ...f,
      tag: f.key === 'creditLevel',
      full: f.key === 'businessScope' || f.key === 'address'
    })))
    detailBasic.value = all.filter((i) => !['注册地址', '经营范围'].includes(i.label))
    if (all.some((i) => ['注册地址', '经营范围'].includes(i.label))) {
      detailExtraTitle.value = '补充信息'
      detailExtra.value = all.filter((i) => ['注册地址', '经营范围'].includes(i.label)).map((i) => ({ ...i, span: 2 }))
    }
  } else if (cfg.mode === 'purchaseCost') {
    const detail = getPurchaseCostDetail(row.companyId)
    detailTitle.value = `${row.companyName} — 购电成本详情`
    const summaryKeys = ['companyName', 'yearMonth', 'purchaseCost', 'salesRevenue']
    detailBasic.value = buildDetailItems(detail, summaryKeys.map((k) => ({
      key: k,
      label: FIELD_LABELS[k] || k,
      format: ['purchaseCost', 'salesRevenue'].includes(k) ? 'money' : undefined
    })))
    detailExtraTitle.value = '成本分项明细'
    detailExtraLayout.value = 'table'
    detailTableColumns.value = [
      { key: 'name', label: '科目名称' },
      { key: 'value', label: '金额(元)', format: 'money' }
    ]
    detailTableRows.value = Object.keys(detail)
      .filter((k) => !summaryKeys.includes(k) && k !== 'companyId')
      .map((k) => ({
        name: FIELD_LABELS[k] || k,
        value: detail[k]
      }))
  } else {
    detailTitle.value = `${row.companyName || row.name || ''} — 详情`.replace(/^ — /, '')
    const all = buildDetailItemsFromRow(row, cfg.columns, cfg.detailFields || [])
    detailBasic.value = all.slice(0, Math.min(6, all.length))
    if (all.length > 6) {
      detailExtraTitle.value = '其他信息'
      detailExtra.value = all.slice(6)
    }
  }
  detailVisible.value = true
}

async function doExport(fmt) {
  loading.value = true
  const res = await exportMock(fmt)
  loading.value = false
  msg.success(`已生成 ${res.fileName}（Demo 模拟导出）`)
}

search()
</script>
