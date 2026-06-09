<template>
  <AnalysisPage title="经营效益分析" chart-title="月度购售电毛利趋势" :series="benefitSeries" />
</template>
<script setup>
import AnalysisPage from './AnalysisPage.vue'
const benefitSeries = [
  { name: '购电成本', type: 'bar', data: [380, 395, 410, 420, 430, 425], color: '#909399' },
  { name: '售电收入', type: 'bar', data: [420, 435, 448, 460, 472, 468], color: '#3a96fe' },
  { name: '毛利率', type: 'line', yAxisIndex: 1, data: [9.5, 9.2, 8.5, 8.7, 8.9, 9.1], color: '#52c41a' }
]
</script>
