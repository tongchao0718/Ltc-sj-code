<template>
  <div>
    <div class="md-stat-row">
      <div v-for="s in stats" :key="s.label" class="md-stat-card">
        <div class="md-stat-icon" :style="{ background: s.bg, color: s.color }">{{ s.icon }}</div>
        <div>
          <div class="md-stat-value" :style="{ color: s.color }">{{ s.value }}</div>
          <div class="md-stat-label">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <div class="md-grid-3-1">
      <div>
        <div class="md-card">
          <h3 class="md-page-title">常用功能</h3>
          <div class="md-shortcuts">
            <div v-for="sc in shortcuts" :key="sc.path" class="md-shortcut" @click="go(sc.path)">
              <div class="md-shortcut-icon">{{ sc.icon }}</div>
              <div>{{ sc.label }}</div>
            </div>
          </div>
        </div>
        <div class="md-card">
          <h3 class="md-page-title">统计监测</h3>
          <MdLineChart :option="chartOption" :height="300" />
        </div>
      </div>
      <div>
        <div class="md-card">
          <h3 class="md-page-title">站内信 / 公告</h3>
          <div v-for="m in store.messages" :key="m.id" class="md-list-item">
            <span><span class="md-tag md-tag--info">{{ m.tag }}</span> {{ m.title }}</span>
            <span style="color:#909399;font-size:12px">{{ m.time }}</span>
          </div>
        </div>
        <div class="md-card">
          <h3 class="md-page-title">日程安排</h3>
          <div v-for="s in store.schedules" :key="s.id" class="md-list-item">
            <div>
              <div>{{ s.title }}</div>
              <div style="font-size:12px;color:#909399">{{ s.desc }}</div>
            </div>
            <span>{{ s.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MdLineChart from '../../components/MdLineChart.vue'
import { marketingStore as store } from '../../store/marketingStore.js'
import { useMarketingTabs } from '../../composables/useMarketingTabs.js'

const { openTab } = useMarketingTabs()

const stats = computed(() => [
  { label: '待办事项', value: 12, icon: '📋', bg: '#edf5ff', color: '#3a96fe' },
  { label: '告警信息', value: store.guarantees.filter((g) => g.status === '临期').length, icon: '⚠️', bg: '#fdf6ec', color: '#e6a23d' },
  { label: '风险预警', value: store.companies.filter((c) => c.creditLevel === 'C').length, icon: '🔴', bg: '#fef1f0', color: '#f5222d' },
  { label: '运行正常', value: store.companies.length, icon: '✅', bg: '#f0faeb', color: '#52c41a' }
])

const shortcuts = [
  { label: '基础信息', path: '/query/basic', icon: '🔍' },
  { label: '保函临期', path: '/performance/expiry-query', icon: '🛡️' },
  { label: '经营效益', path: '/analysis/benefit', icon: '📊' },
  { label: '企业画像', path: '/profile/list', icon: '👤' },
  { label: '报告生成', path: '/report/generate', icon: '📄' },
  { label: '协议管理', path: '/agreement/lifecycle', icon: '📝' }
]

const chartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['结算电量', '代理用户'], bottom: 0 },
  grid: { left: 48, right: 24, top: 24, bottom: 48 },
  xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
  yAxis: [{ type: 'value', name: 'MWh' }, { type: 'value', name: '户' }],
  series: [
    { name: '结算电量', type: 'bar', data: [8200, 9100, 8800, 9500, 10200, 9800], itemStyle: { color: '#3a96fe' } },
    { name: '代理用户', type: 'line', yAxisIndex: 1, data: [420, 435, 448, 460, 472, 485], itemStyle: { color: '#52c41a' } }
  ]
}))

function go(path) {
  openTab(path, shortcuts.find((s) => s.path === path)?.label || path)
}
</script>
