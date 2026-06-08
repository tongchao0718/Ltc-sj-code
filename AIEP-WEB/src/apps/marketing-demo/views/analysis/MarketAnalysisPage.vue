<template>
  <AnalysisPage title="市场表现分析" chart-title="区域市场份额对比" :series="marketSeries" />
</template>
<script setup>
import AnalysisPage from './AnalysisPage.vue'
const marketSeries = [
  { name: '济南', type: 'bar', data: [18, 19, 20, 21, 22, 22.5], color: '#3a96fe' },
  { name: '青岛', type: 'bar', data: [15, 15.5, 16, 16.2, 16.5, 17], color: '#52c41a' },
  { name: '烟台', type: 'bar', data: [8, 8.2, 8.5, 8.6, 8.8, 9], color: '#e6a23d' }
]
</script>
