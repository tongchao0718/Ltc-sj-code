<template>
  <div class="page-wrap">
    <div class="breadcrumb">工作台 / 管理仪表盘</div>
    <h1 class="page-title">管理仪表盘</h1>
    <p class="page-desc">全公司销售 KPI 与漏斗概览（P-WEB-01）</p>

    <a-row :gutter="16" class="stat-row">
      <a-col v-for="s in stats" :key="s.key" :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic :title="s.title" :value="s.value" :suffix="s.suffix">
            <template #prefix>
              <span class="stat-icon" :style="{ background: s.color + '18', color: s.color }">●</span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="14">
        <a-card title="商机漏斗" :bordered="false">
          <div class="funnel">
            <div v-for="stage in funnel" :key="stage.name" class="funnel-row">
              <span class="funnel-name">{{ stage.name }}</span>
              <div class="funnel-bar-wrap">
                <div
                  class="funnel-bar"
                  :style="{ width: barWidth(stage.count) + '%' }"
                />
              </div>
              <span class="funnel-meta">{{ stage.count }} 个 · {{ stage.amount }}万</span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="10">
        <a-card title="业绩排行 Top5" :bordered="false">
          <a-list :bordered="false">
            <a-list-item v-for="(item, i) in ranking" :key="item.name">
              <a-list-item-meta :title="item.name" :description="item.owner">
                <template #avatar>
                  <a-avatar :style="{ background: i < 3 ? '#2563eb' : '#94a3b8' }">{{ i + 1 }}</a-avatar>
                </template>
              </a-list-item-meta>
              <template #actions>{{ item.amount }}万</template>
            </a-list-item>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { crmStore } from '../../store/crmStore.js'

const stats = computed(() => {
  const base = crmStore.stats
  return [
    { ...base[0], value: crmStore.leads.length + 125 },
    { ...base[1], value: crmStore.opportunities.reduce((s, o) => s + o.amount, 0) },
    base[2],
    base[3]
  ]
})
const funnel = computed(() => crmStore.funnel)
const ranking = [
  { name: '云服务扩容', owner: '李芳', amount: 120 },
  { name: '年度维保合同', owner: '张明', amount: 48 },
  { name: '供应链系统', owner: '张明', amount: 86 },
  { name: '数据平台二期', owner: '王磊', amount: 35 },
  { name: '运维外包', owner: '李芳', amount: 22 }
]

function barWidth(count) {
  const list = funnel.value
  const max = Math.max(...list.map((s) => s.count), 1)
  return Math.round((count / max) * 100)
}
</script>

<style scoped>
.stat-row .stat-card {
  border-radius: 8px;
}

.stat-icon {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-right: 8px;
  font-size: 10px;
}

.funnel-row {
  display: grid;
  grid-template-columns: 80px 1fr 120px;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 13px;
}

.funnel-bar-wrap {
  height: 10px;
  background: #f1f5f9;
  border-radius: 5px;
  overflow: hidden;
}

.funnel-bar {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  border-radius: 5px;
  transition: width 0.3s ease-out;
}

.funnel-meta {
  color: #64748b;
  text-align: right;
}
</style>
