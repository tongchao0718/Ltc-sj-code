<template>
  <div v-if="profile">
    <h1 class="md-page-title">{{ profile.companyName }} — 业务画像</h1>
    <p class="md-page-desc">整合基础信息、交易结算、风险信用等 9 维数据</p>

    <div class="md-stat-row">
      <div v-for="s in profile.summary" :key="s.label" class="md-stat-card">
        <div class="md-stat-value" style="font-size:22px">{{ s.value }}</div>
        <div class="md-stat-label">{{ s.label }}</div>
      </div>
    </div>

    <div class="md-grid-2">
      <div class="md-card">
        <h3>基础信息</h3>
        <MdDescriptions :items="companyItems" />
      </div>
      <div class="md-card">
        <h3>风险标签</h3>
        <p v-for="t in profile.tags" :key="t"><span class="md-tag md-tag--warning">{{ t }}</span></p>
        <MdLineChart :option="pnlChart" :height="220" />
      </div>
    </div>
  </div>
  <div v-else class="md-empty">未找到该企业画像</div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MdLineChart from '../../components/MdLineChart.vue'
import MdDescriptions from '../../components/MdDescriptions.vue'
import { marketingStore as store } from '../../store/marketingStore.js'
import { buildDetailItems, COMPANY_DETAIL_FIELDS } from '../../config/fieldLabels.js'

const route = useRoute()
const companyId = computed(() => route.params.companyId)

const profile = computed(() => store.profiles.find((p) => p.companyId === companyId.value))
const company = computed(() => store.companies.find((c) => c.id === companyId.value))

const companyItems = computed(() => {
  if (!company.value) return []
  return buildDetailItems(company.value, COMPANY_DETAIL_FIELDS.map((f) => ({
    ...f,
    tag: f.key === 'creditLevel'
  })))
})

const pnlChart = computed(() => {
  const rows = store.dailyPnl.filter((d) => d.companyId === companyId.value).slice(0, 10)
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: rows.map((r) => r.date) },
    yAxis: { type: 'value' },
    series: [{ type: 'line', data: rows.map((r) => r.profit), itemStyle: { color: '#3a96fe' } }]
  }
})
</script>
