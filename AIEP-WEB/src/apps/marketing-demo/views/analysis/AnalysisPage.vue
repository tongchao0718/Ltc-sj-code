<template>
  <div>
    <h1 class="md-page-title">{{ title }}</h1>
    <p class="md-page-desc">基于 Mock 数据的售电业务多维分析看板</p>
    <div class="md-card">
      <h3>{{ chartTitle }}</h3>
      <MdLineChart :option="chartOption" :height="320" />
    </div>
    <div class="md-card">
      <table class="md-table">
        <thead><tr><th>指标</th><th>本月</th><th>上月</th><th>环比</th></tr></thead>
        <tbody>
          <tr v-for="kpi in kpis" :key="kpi.name">
            <td>{{ kpi.name }}</td><td>{{ kpi.current }}</td><td>{{ kpi.prev }}</td>
            <td><span :style="{ color: kpi.change >= 0 ? '#52c41a' : '#f5222d' }">{{ kpi.change >= 0 ? '+' : '' }}{{ kpi.change }}%</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MdLineChart from '../../components/MdLineChart.vue'

const props = defineProps({
  title: String,
  chartTitle: String,
  series: { type: Array, default: () => [] }
})

const months = ['1月', '2月', '3月', '4月', '5月', '6月']

const chartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: props.series.map((s) => s.name), bottom: 0 },
  grid: { left: 48, right: 24, top: 24, bottom: 48 },
  xAxis: { type: 'category', data: months },
  yAxis: props.series.some((s) => s.yAxisIndex) ? [{ type: 'value' }, { type: 'value', axisLabel: { formatter: '{value}%' } }] : { type: 'value' },
  series: props.series.map((s) => ({
    name: s.name,
    type: s.type,
    data: s.data,
    yAxisIndex: s.yAxisIndex,
    itemStyle: { color: s.color }
  }))
}))

const kpis = [
  { name: '结算电量(MWh)', current: '9,800', prev: '10,200', change: -3.9 },
  { name: '代理用户(户)', current: '485', prev: '472', change: 2.8 },
  { name: '购售毛利(万元)', current: '430', prev: '452', change: -4.9 }
]
</script>
