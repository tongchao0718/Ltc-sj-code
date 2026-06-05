<template>
  <div class="page-wrap">
    <div class="breadcrumb">客户中心 / 客户管理</div>
    <h1 class="page-title">客户管理</h1>
    <p class="page-desc">P-WEB-02 · 列表筛选、详情抽屉、批量维护</p>

    <a-card :bordered="false">
      <a-form :model="filter" layout="inline" class="filter-form">
        <a-form-item label="客户名称">
          <a-input v-model="filter.keyword" placeholder="搜索名称/手机" allow-clear style="width: 200px" />
        </a-form-item>
        <a-form-item label="级别">
          <a-select v-model="filter.level" placeholder="全部" allow-clear style="width: 120px">
            <a-option value="A">A</a-option>
            <a-option value="B">B</a-option>
            <a-option value="C">C</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="onQuery">查询</a-button>
            <a-button @click="onReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <div class="toolbar">
        <a-space>
          <a-button type="primary" @click="openCreate">新建客户</a-button>
          <a-button :disabled="!selectedKeys.length" @click="assignVisible = true">批量分配</a-button>
          <a-button @click="onExport">导出</a-button>
        </a-space>
      </div>

      <a-table
        v-model:selected-keys="selectedKeys"
        :data="filteredRows"
        :pagination="{ pageSize: 10 }"
        row-key="id"
        :row-selection="{ type: 'checkbox', showCheckedAll: true }"
      >
        <template #columns>
          <a-table-column title="客户名称" data-index="name">
            <template #cell="{ record }">
              <a-link @click="openDetail(record)">{{ record.name }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="级别" data-index="level">
            <template #cell="{ record }">
              <span :class="['level-badge', 'level-' + record.level]">{{ record.level }}</span>
            </template>
          </a-table-column>
          <a-table-column title="行业" data-index="industry" />
          <a-table-column title="意向分" data-index="score">
            <template #cell="{ record }">
              <span class="score-badge">{{ record.score }}</span>
            </template>
          </a-table-column>
          <a-table-column title="负责人" data-index="owner" />
          <a-table-column title="最近跟进" data-index="followAt" />
          <a-table-column title="操作">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="openDetail(record)">查看</a-button>
              <a-button type="text" size="small" @click="openEdit(record)">编辑</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-drawer v-model:visible="drawerVisible" title="客户详情 360°" :width="560" unmount-on-close>
      <template v-if="current">
        <a-descriptions :column="1" bordered size="medium">
          <a-descriptions-item label="客户名称">{{ current.name }}</a-descriptions-item>
          <a-descriptions-item label="级别">
            <span :class="['level-badge', 'level-' + current.level]">{{ current.level }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="意向分">
            <span class="score-badge">{{ current.score }}</span>
            <span style="color:#64748b;font-size:12px;margin-left:8px">Top因子：跟进频次、商机阶段</span>
          </a-descriptions-item>
          <a-descriptions-item label="手机">{{ current.phone }}</a-descriptions-item>
          <a-descriptions-item label="负责人">{{ current.owner }}</a-descriptions-item>
        </a-descriptions>
        <a-tabs default-active-key="opp" style="margin-top:16px">
          <a-tab-pane key="opp" title="关联商机">
            <a-empty v-if="!opps.length" />
            <a-list v-else :data="opps" size="small">
              <template #item="{ item }">
                <a-list-item>{{ item.name }} · {{ item.amount }}万</a-list-item>
              </template>
            </a-list>
          </a-tab-pane>
          <a-tab-pane key="timeline" title="动态时间线">
            <a-timeline>
              <a-timeline-item v-if="current.lastFollow" :label="current.lastFollow.at">
                {{ current.lastFollow.type }} — {{ current.lastFollow.content }}
              </a-timeline-item>
              <a-timeline-item label="2026-06-04">电话跟进 — 确认方案需求</a-timeline-item>
              <a-timeline-item label="2026-06-01">拜访签到 — 总部会议室</a-timeline-item>
            </a-timeline>
          </a-tab-pane>
        </a-tabs>
        <div style="margin-top:16px">
          <a-button type="primary" @click="openEdit(current)">编辑客户</a-button>
        </div>
      </template>
    </a-drawer>

    <a-modal
      v-model:visible="formVisible"
      :title="editingId ? '编辑客户' : '新建客户'"
      @ok="saveCustomer"
      @cancel="resetForm"
    >
      <a-form :model="form" layout="vertical">
        <a-form-item label="客户名称" required>
          <a-input v-model="form.name" placeholder="请输入客户名称" />
        </a-form-item>
        <a-form-item label="级别">
          <a-select v-model="form.level">
            <a-option value="A">A</a-option>
            <a-option value="B">B</a-option>
            <a-option value="C">C</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="行业">
          <a-input v-model="form.industry" placeholder="如：制造业" />
        </a-form-item>
        <a-form-item label="手机">
          <a-input v-model="form.phone" placeholder="138****0000" />
        </a-form-item>
        <a-form-item label="负责人">
          <a-select v-model="form.owner">
            <a-option v-for="u in owners" :key="u" :value="u">{{ u }}</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="assignVisible" title="批量分配" @ok="doAssign">
      <a-form layout="vertical">
        <a-form-item label="目标负责人">
          <a-select v-model="assignOwner">
            <a-option v-for="u in owners" :key="u" :value="u">{{ u }}</a-option>
          </a-select>
        </a-form-item>
        <p style="color:#64748b;font-size:13px">已选 {{ selectedKeys.length }} 个客户</p>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { crmStore, addCustomer, updateCustomer, batchAssignCustomers } from '../../store/crmStore.js'

const filter = reactive({ keyword: '', level: '' })
const applied = reactive({ keyword: '', level: '' })
const drawerVisible = ref(false)
const formVisible = ref(false)
const assignVisible = ref(false)
const current = ref(null)
const editingId = ref(null)
const selectedKeys = ref([])
const assignOwner = ref('张明')
const form = reactive({ name: '', level: 'B', industry: '', phone: '', owner: '张明' })

const owners = computed(() =>
  [...new Set(crmStore.users.filter((u) => u.role !== '管理员').map((u) => u.name))]
)

const filteredRows = computed(() => {
  let list = crmStore.customers
  if (applied.keyword) {
    const kw = applied.keyword.toLowerCase()
    list = list.filter(
      (c) => c.name.toLowerCase().includes(kw) || (c.phone && c.phone.includes(kw))
    )
  }
  if (applied.level) list = list.filter((c) => c.level === applied.level)
  return list
})

const opps = computed(() =>
  current.value
    ? crmStore.opportunities.filter((o) => o.customer === current.value.name)
    : []
)

function onQuery() {
  applied.keyword = filter.keyword
  applied.level = filter.level
}

function onReset() {
  filter.keyword = ''
  filter.level = ''
  applied.keyword = ''
  applied.level = ''
}

function openDetail(record) {
  current.value = record
  drawerVisible.value = true
}

function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', level: 'B', industry: '', phone: '', owner: '张明' })
  formVisible.value = true
}

function openEdit(record) {
  editingId.value = record.id
  Object.assign(form, {
    name: record.name,
    level: record.level,
    industry: record.industry,
    phone: record.phone,
    owner: record.owner
  })
  formVisible.value = true
}

function resetForm() {
  editingId.value = null
}

function saveCustomer() {
  if (!form.name.trim()) {
    Message.warning('请填写客户名称')
    return
  }
  if (editingId.value) {
    updateCustomer(editingId.value, { ...form })
    if (current.value?.id === editingId.value) current.value = crmStore.customers.find((c) => c.id === editingId.value)
    Message.success('客户已更新')
  } else {
    const row = addCustomer({ ...form })
    Message.success(`客户「${row.name}」已创建`)
  }
  formVisible.value = false
}

function doAssign() {
  batchAssignCustomers(selectedKeys.value, assignOwner.value)
  Message.success(`已将 ${selectedKeys.value.length} 个客户分配给 ${assignOwner.value}`)
  selectedKeys.value = []
  assignVisible.value = false
}

function onExport() {
  const header = '客户名称,级别,行业,负责人,意向分\n'
  const body = filteredRows.value
    .map((c) => `${c.name},${c.level},${c.industry},${c.owner},${c.score}`)
    .join('\n')
  const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'customers.csv'
  a.click()
  URL.revokeObjectURL(url)
  Message.success('导出完成')
}
</script>

<style scoped>
.filter-form { margin-bottom: 16px; }
.toolbar { margin-bottom: 16px; }
</style>
