<template>
  <ArcoDemoShell variant="plain" :crumbs="['数据可视化', '多维数据分析']">
    <div class="multi">
      <section class="block">
        <h2 class="block-title">数据总览</h2>
        <EChart :option="overviewOption" height="280px" />
      </section>
      <section class="block">
        <h2 class="block-title">数据链路增长</h2>
        <EChart :option="growthOption" height="280px" />
      </section>
      <section class="block">
        <h2 class="block-title">用户行为分析</h2>
        <EChart :option="funnelOptionComputed" height="300px" />
      </section>
      <section class="block">
        <h2 class="block-title">内容类型分布</h2>
        <EChart :option="typeDistOption" height="280px" />
      </section>
      <section class="block">
        <h2 class="block-title">内容发布来源</h2>
        <EChart :option="sourceBarOption" height="280px" />
      </section>
    </div>
  </ArcoDemoShell>
</template>

<script setup>
import { computed } from 'vue'
import ArcoDemoShell from '../../components/ArcoDemoShell.vue'
import EChart from '../../components/EChart.vue'
import {
  lineAreaOption,
  donutOption,
  barOption,
  dualLineOption,
  funnelOption
} from '../../utils/chartTheme.js'

const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']

const overviewOption = computed(() =>
  dualLineOption({
    dates: weeks,
    series: [
      { name: '曝光', data: [120, 132, 101, 134, 190, 230, 210, 248] },
      { name: '转化', data: [22, 28, 25, 32, 48, 52, 46, 58] }
    ]
  })
)

const growthDates = ['1月', '2月', '3月', '4月', '5月', '6月']
const growthVals = [4200, 5100, 4800, 6200, 7800, 9100]

const growthOption = computed(() =>
  lineAreaOption({ dates: growthDates, values: growthVals, maxY: 10000 })
)

const funnelOptionComputed = computed(() =>
  funnelOption([
    { value: 100, name: '访问' },
    { value: 72, name: '浏览' },
    { value: 48, name: '互动' },
    { value: 26, name: '注册' },
    { value: 12, name: '付费' }
  ])
)

const typeDistOption = computed(() =>
  donutOption([
    { value: 42, name: '图文' },
    { value: 28, name: '短视频' },
    { value: 18, name: '直播' },
    { value: 12, name: '其他' }
  ])
)

const sourceCats = ['运营后台', '开放 API', '第三方同步', '导入工具', '移动端']
const sourceVals = [320, 210, 156, 98, 74]

const sourceBarOption = computed(() => barOption(sourceCats, sourceVals, false))
</script>

<style scoped>
.multi {
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
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-text-1);
}
</style>
