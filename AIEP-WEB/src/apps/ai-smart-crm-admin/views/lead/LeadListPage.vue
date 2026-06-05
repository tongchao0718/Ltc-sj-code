<template>
  <div class="page-wrap">
    <div class="breadcrumb">客户中心 / 线索管理</div>
    <h1 class="page-title">线索管理</h1>
    <p class="page-desc">含公海池领取与分配（P-WEB-03）</p>
    <a-card :bordered="false">
      <div class="toolbar">
        <a-button type="primary" @click="createVisible = true">新建线索</a-button>
      </div>
      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="mine" title="我的线索">
          <a-table :data="mineLeads" :pagination="false" row-key="id">
            <template #columns>
              <a-table-column title="线索名称" data-index="name" />
              <a-table-column title="来源" data-index="source" />
              <a-table-column title="状态" data-index="status">
                <template #cell="{ record }">
                  <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="评分" data-index="score" />
              <a-table-column title="操作">
                <template #cell="{ record }">
                  <a-button
                    type="text"
                    size="small"
                    :disabled="record.status === '已转化'"
                    @click="onConvert(record)"
                  >
                    转化
                  </a-button>
                  <a-button type="text" size="small" @click="onFollow(record)">跟进</a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="pool" title="公海池">
          <a-table :data="poolLeads" :pagination="false" row-key="id">
            <template #columns>
              <a-table-column title="线索名称" data-index="name" />
              <a-table-column title="来源" data-index="source" />
              <a-table-column title="评分" data-index="score" />
              <a-table-column title="操作">
                <template #cell="{ record }">
                  <a-button type="outline" size="small" @click="onClaim(record)">领取</a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <a-modal v-model:visible="createVisible" title="新建线索" @ok="saveLead">
      <a-form :model="form" layout="vertical">
        <a-form-item label="线索名称" required>
          <a-input v-model="form.name" placeholder="如：展会-某某科技" />
        </a-form-item>
        <a-form-item label="来源">
          <a-select v-model="form.source">
            <a-option>展会</a-option>
            <a-option>官网</a-option>
            <a-option>转介绍</a-option>
            <a-option>手工录入</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="放入公海">
          <a-switch v-model="form.pool" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="followVisible" title="记录跟进" @ok="saveFollow" @cancel="followNote = ''">
      <a-textarea v-model="followNote" placeholder="记录本次沟通内容…" :auto-size="{ minRows: 3 }" />
    </a-modal>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { crmStore, addLead, claimLead, convertLead, followLead } from '../../store/crmStore.js'

const activeTab = ref('mine')
const createVisible = ref(false)
const followVisible = ref(false)
const followTarget = ref(null)
const followNote = ref('')
const form = reactive({ name: '', source: '手工录入', pool: false })

const mineLeads = computed(() => crmStore.leads.filter((l) => !l.pool))
const poolLeads = computed(() => crmStore.leads.filter((l) => l.pool))

function statusColor(status) {
  if (status === '已转化') return 'green'
  if (status === '新线索') return 'orangered'
  return 'arcoblue'
}

function onClaim(record) {
  claimLead(record.id)
  Message.success(`已领取线索「${record.name}」`)
  activeTab.value = 'mine'
}

function onConvert(record) {
  const customer = convertLead(record.id)
  if (customer) Message.success(`已转化为客户「${customer.name}」`)
}

function onFollow(record) {
  followTarget.value = record
  followNote.value = ''
  followVisible.value = true
}

function saveFollow() {
  if (followTarget.value) {
    followLead(followTarget.value.id)
    Message.success('跟进记录已保存')
  }
  followVisible.value = false
}

function saveLead() {
  if (!form.name.trim()) {
    Message.warning('请填写线索名称')
    return
  }
  const row = addLead({ name: form.name, source: form.source, pool: form.pool })
  if (form.pool) activeTab.value = 'pool'
  Message.success(`线索「${row.name}」已创建`)
  form.name = ''
  form.pool = false
  createVisible.value = false
}
</script>

<style scoped>
.toolbar { margin-bottom: 16px; }
</style>
