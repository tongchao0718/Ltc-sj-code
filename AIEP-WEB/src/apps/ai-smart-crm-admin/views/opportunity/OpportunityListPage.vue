<template>
  <div class="page-wrap">
    <div class="breadcrumb">销售管理 / 商机管理</div>
    <h1 class="page-title">商机管理</h1>
    <p class="page-desc">P-WEB-04 · 列表视图与阶段筛选</p>
    <a-card :bordered="false">
      <div class="toolbar">
        <a-button type="primary" @click="createVisible = true">新建商机</a-button>
      </div>
      <a-table :data="crmStore.opportunities" row-key="id">
        <template #columns>
          <a-table-column title="商机名称" data-index="name">
            <template #cell="{ record }">
              <a-link @click="openDetail(record)">{{ record.name }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="客户" data-index="customer" />
          <a-table-column title="金额(万)" data-index="amount" />
          <a-table-column title="阶段" data-index="stage">
            <template #cell="{ record }">
              <a-tag :color="stageColor(record.stage)">{{ record.stage }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="概率" data-index="probability">
            <template #cell="{ record }">{{ record.probability }}%</template>
          </a-table-column>
          <a-table-column title="预计成交" data-index="date" />
          <a-table-column title="负责人" data-index="owner" />
          <a-table-column title="操作">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="openDetail(record)">详情</a-button>
              <a-button type="text" size="small" @click="openStageChange(record)">变更阶段</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-drawer v-model:visible="detailVisible" title="商机详情" :width="480">
      <template v-if="current">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="商机名称">{{ current.name }}</a-descriptions-item>
          <a-descriptions-item label="客户">{{ current.customer }}</a-descriptions-item>
          <a-descriptions-item label="金额">{{ current.amount }} 万</a-descriptions-item>
          <a-descriptions-item label="阶段">
            <a-tag :color="stageColor(current.stage)">{{ current.stage }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="赢单概率">{{ current.probability }}%</a-descriptions-item>
          <a-descriptions-item label="预计成交">{{ current.date || '—' }}</a-descriptions-item>
          <a-descriptions-item label="负责人">{{ current.owner }}</a-descriptions-item>
        </a-descriptions>
        <a-button type="primary" style="margin-top:16px" @click="openStageChange(current)">变更阶段</a-button>
      </template>
    </a-drawer>

    <a-modal v-model:visible="stageVisible" title="变更阶段" @ok="saveStage">
      <a-form layout="vertical">
        <p style="margin-bottom:12px">商机：{{ stageTarget?.name }}</p>
        <a-form-item label="目标阶段">
          <a-select v-model="newStage">
            <a-option v-for="s in crmStore.stages" :key="s.code" :value="s.name">{{ s.name }}</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="createVisible" title="新建商机" @ok="saveOpp">
      <a-form :model="oppForm" layout="vertical">
        <a-form-item label="商机名称" required>
          <a-input v-model="oppForm.name" />
        </a-form-item>
        <a-form-item label="关联客户" required>
          <a-select v-model="oppForm.customer" placeholder="选择客户">
            <a-option v-for="c in crmStore.customers" :key="c.id" :value="c.name">{{ c.name }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="金额(万)">
          <a-input-number v-model="oppForm.amount" :min="0" style="width:100%" />
        </a-form-item>
        <a-form-item label="预计成交">
          <a-input v-model="oppForm.date" type="date" style="width:100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { crmStore, addOpportunity, updateOpportunityStage } from '../../store/crmStore.js'

const detailVisible = ref(false)
const stageVisible = ref(false)
const createVisible = ref(false)
const current = ref(null)
const stageTarget = ref(null)
const newStage = ref('')
const oppForm = reactive({ name: '', customer: '', amount: 0, date: '' })

function stageColor(stage) {
  const map = { '需求确认': 'blue', '方案报价': 'purple', '商务谈判': 'orangered', '赢单': 'green', '输单': 'red' }
  return map[stage] || 'gray'
}

function openDetail(record) {
  current.value = record
  detailVisible.value = true
}

function openStageChange(record) {
  stageTarget.value = record
  newStage.value = record.stage
  stageVisible.value = true
}

function saveStage() {
  if (!stageTarget.value) return
  updateOpportunityStage(stageTarget.value.id, newStage.value)
  if (current.value?.id === stageTarget.value.id) {
    current.value = crmStore.opportunities.find((o) => o.id === stageTarget.value.id)
  }
  Message.success(`阶段已更新为「${newStage.value}」`)
  stageVisible.value = false
}

function saveOpp() {
  if (!oppForm.name.trim() || !oppForm.customer) {
    Message.warning('请填写商机名称并选择客户')
    return
  }
  const row = addOpportunity({
    name: oppForm.name,
    customer: oppForm.customer,
    amount: oppForm.amount,
    date: oppForm.date ? String(oppForm.date).slice(0, 10) : ''
  })
  Message.success(`商机「${row.name}」已创建`)
  oppForm.name = ''
  oppForm.customer = ''
  oppForm.amount = 0
  oppForm.date = ''
  createVisible.value = false
}
</script>

<style scoped>
.toolbar { margin-bottom: 16px; }
</style>
