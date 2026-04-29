<template>
  <ArcoDemoShell variant="plain" :crumbs="['数据可视化', '数据分析']">
    <div class="viz">
      <section class="block">
        <h2 class="block-title">舆情分析</h2>
        <EChart :option="sentimentOption" height="220px" />
      </section>
      <section class="block">
        <h2 class="block-title">内容时段分析</h2>
        <EChart :option="hourBarOption" height="220px" />
      </section>
      <section class="block">
        <h2 class="block-title">内容发布比例</h2>
        <EChart :option="channelPieOption" height="240px" />
      </section>
      <section class="block">
        <h2 class="block-title">热门作者</h2>
        <EChart :option="authorBarOption" height="260px" />
      </section>
    </div>
  </ArcoDemoShell>
</template>

<script setup>
import { computed } from 'vue'
import ArcoDemoShell from '../../components/ArcoDemoShell.vue'
import EChart from '../../components/EChart.vue'
import { lineAreaOption, donutOption, barOption } from '../../utils/chartTheme.js'

const sentimentDates = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const sentimentVals = [3200, 4100, 3800, 5200, 4800, 3600, 2900]

const sentimentOption = computed(() =>
  lineAreaOption({ dates: sentimentDates, values: sentimentVals, maxY: 6000 })
)

const hours = Array.from({ length: 12 }, (_, i) => `${i * 2}:00`)
const hourVals = [120, 80, 45, 30, 55, 200, 340, 420, 380, 290, 180, 95]

const hourBarOption = computed(() => barOption(hours, hourVals, false))

const channelPieOption = computed(() =>
  donutOption([
    { value: 38, name: '站内' },
    { value: 28, name: '社媒' },
    { value: 22, name: '合作方' },
    { value: 12, name: '其他' }
  ])
)

const authorNames = ['作者 A', '作者 B', '作者 C', '作者 D', '作者 E', '作者 F']
const authorVals = [920, 780, 650, 520, 410, 320]

const authorBarOption = computed(() => barOption(authorNames, authorVals, true))
</script>

<style scoped>
.viz {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 0;
}

.block {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 16px 20px;
}

.block-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-1);
}
</style>
