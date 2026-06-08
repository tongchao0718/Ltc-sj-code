<template>
  <div>
    <h1 class="md-page-title">对比分析</h1>
    <p class="md-page-desc">选择 2～5 家售电公司进行关键指标横向对比</p>
    <div class="md-card md-form-inline">
      <div v-for="c in store.companies" :key="c.id" class="md-form-item">
        <label><input v-model="selected" type="checkbox" :value="c.id" /> {{ c.name }}</label>
      </div>
      <button type="button" class="md-btn md-btn--primary" @click="compare">开始对比</button>
    </div>
    <div v-if="result.length" class="md-card">
      <MdLineChart :option="compareOption" :height="300" />
      <table class="md-table" style="margin-top:16px">
        <thead><tr><th>企业</th><th>代理用户</th><th>结算电量</th><th>信用等级</th></tr></thead>
        <tbody>
          <tr v-for="r in result" :key="r.id">
            <td>{{ r.name }}</td>
            <td>{{ r.users }}</td>
            <td>{{ r.volume }} MWh</td>
            <td><span class="md-tag md-tag--info">{{ r.creditLevel }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MdLineChart from '../../components/MdLineChart.vue'
import { marketingStore as store } from '../../store/marketingStore.js'

const selected = ref([])
const result = ref([])

function compare() {
  result.value = store.companies
    .filter((c) => selected.value.includes(c.id))
    .map((c) => {
      const scale = store.agencyScale.find((a) => a.companyId === c.id)
      return { id: c.id, name: c.name, users: scale?.userCount ?? '-', volume: scale?.volume ?? '-', creditLevel: c.creditLevel }
    })
}

const compareOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { bottom: 0 },
  xAxis: { type: 'category', data: result.value.map((r) => r.name) },
  yAxis: { type: 'value' },
  series: [
    { name: '代理用户', type: 'bar', data: result.value.map((r) => Number(r.users) || 0), itemStyle: { color: '#3a96fe' } },
    { name: '结算电量', type: 'bar', data: result.value.map((r) => Number(r.volume) || 0), itemStyle: { color: '#52c41a' } }
  ]
}))
</script>
