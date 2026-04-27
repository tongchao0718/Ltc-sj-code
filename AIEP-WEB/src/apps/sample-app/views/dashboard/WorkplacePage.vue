<template>
  <!-- 与 vue-pro.arco.design/dashboard/workplace 一致：页面内不含面包屑（由主框架承担） -->
  <div class="wp-root">
    <div class="wp-left">
      <div class="wp-stack">
        <header class="wp-banner">
          <h1 class="wp-greet">欢迎回来！{{ userName }}</h1>
        </header>
        <div class="wp-divider" />
        <section class="wp-stats">
          <div v-for="(s, i) in statBlocks" :key="s.key" class="wp-stat" :class="{ 'wp-stat--last': i === 3 }">
            <div class="wp-stat-inner">
              <img class="wp-stat-avatar" :src="s.img" width="54" height="54" alt="" />
              <div class="wp-stat-txt">
                <div class="wp-stat-title">{{ s.title }}</div>
                <div class="wp-stat-valrow">
                  <template v-if="s.key === 'a'">
                    <span class="num">{{ dashboardStore.totalContent }}</span><span class="unit">个</span>
                  </template>
                  <template v-else-if="s.key === 'b'">
                    <span class="num">{{ dashboardStore.activeContent }}</span><span class="unit">个</span>
                  </template>
                  <template v-else-if="s.key === 'c'">
                    <span class="num">{{ dashboardStore.dailyComments }}</span><span class="unit">个</span>
                  </template>
                  <template v-else>
                    <span class="num">{{ dashboardStore.growthRate }}</span><span class="pct">%</span>
                    <span class="caret-up" aria-hidden="true">▲</span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div class="wp-divider" />
        <section class="wp-chart-block">
          <div class="wp-card-hd">
            <span class="wp-card-title">内容数据</span>
            <span class="wp-card-extra">查看更多</span>
          </div>
          <div class="wp-chart-wrap">
            <EChart :option="contentChartOption" height="289px" />
          </div>
        </section>
      </div>

      <div class="wp-bottom-grid">
        <section class="wp-card popular-card">
          <div class="wp-card-hd">
            <span class="wp-card-title">线上热门内容</span>
            <span class="wp-card-extra">查看更多</span>
          </div>
          <div class="seg">
            <button
              v-for="t in hotTabs"
              :key="t.k"
              type="button"
              class="seg-btn"
              :class="{ active: hotType === t.k }"
              @click="hotType = t.k"
            >
              {{ t.label }}
            </button>
          </div>
          <div class="tbl-scroll">
            <table class="data-tbl">
              <thead>
                <tr>
                  <th>排名</th>
                  <th>内容标题</th>
                  <th>点击量</th>
                  <th>日涨幅</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in currentHotList" :key="r.key">
                  <td>{{ r.key }}</td>
                  <td class="title-cell">{{ r.title }}</td>
                  <td>{{ r.clickNumber }}</td>
                  <td>
                    <span class="inc-wrap">
                      <span>{{ r.increases }}%</span>
                      <span v-if="r.increases !== 0" class="inc-caret" aria-hidden="true">▲</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="wp-card pie-card">
          <div class="wp-card-hd">
            <span class="wp-card-title">内容类型占比</span>
          </div>
          <EChart :option="categoriesPieOption" height="310px" />
        </section>
      </div>
    </div>

    <aside class="wp-right">
      <div class="moduler-wrap">
        <div class="wp-card wp-card--flat">
          <div class="wp-card-hd">
            <span class="wp-card-title">快捷操作</span>
            <span class="wp-card-extra">管理</span>
          </div>
          <div class="quick-grid">
            <div v-for="q in quickLinks" :key="q.label" class="quick-cell">
              <div class="quick-icon" v-html="q.svg" />
              <span class="quick-tx">{{ q.label }}</span>
            </div>
          </div>
          <div class="wp-divider tight" />
        </div>
        <div class="wp-card wp-card--flat wp-card--recent">
          <div class="wp-card-hd">
            <span class="wp-card-title">最近访问</span>
          </div>
          <div class="recent-grid">
            <div v-for="r in recentLinks" :key="r.label" class="recent-cell">
              <div class="quick-icon" v-html="r.svg" />
              <span class="quick-tx">{{ r.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="wp-carousel">
        <img :src="carouselSrc[0]" class="car-single" width="280" height="170" alt="" />
        <div class="car-dots"><span v-for="n in carouselSrc.length" :key="n" class="dot" /></div>
      </div>

      <section class="wp-card anno-card">
        <div class="wp-card-hd">
          <span class="wp-card-title">公告</span>
          <span class="wp-card-extra">查看更多</span>
        </div>
        <div class="anno-body">
          <div v-for="(a, idx) in announcements" :key="idx" class="anno-row">
            <span class="anno-tag" :class="'t-' + a.type">{{ a.label }}</span>
            <span class="anno-txt">{{ a.content }}</span>
          </div>
        </div>
      </section>

      <section class="wp-card docs-card">
        <div class="wp-card-hd">
          <span class="wp-card-title">帮助文档</span>
          <span class="wp-card-extra">查看更多</span>
        </div>
        <div class="docs-grid">
          <span class="doc-link">产品概要</span>
          <span class="doc-link">使用指南</span>
          <span class="doc-link">接入流程</span>
          <span class="doc-link">接口文档</span>
        </div>
      </section>
    </aside>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
// import ArcoDemoShell from '../../components/ArcoDemoShell.vue'
import EChart from '../../components/EChart.vue'
import { workplaceContentChartOption, workplaceCategoriesPieOption } from '../../utils/chartTheme.js'
import { useDashboardStore } from '../../store/modules/dashboard'
import { useUserStore } from '../../store/modules/user'

const dashboardStore = useDashboardStore()
const userStore = useUserStore()

const userName = computed(() => userStore.userName)

onMounted(async () => {
  // 加载用户信息和仪表盘数据
  await Promise.all([
    userStore.fetchUserInfo(),
    dashboardStore.fetchDashboardData()
  ])
})

const statImgBase = 'https://p3-armor.byteimg.com/tos-cn-i-49unhts6dw'
const statBlocks = [
  {
    key: 'a',
    title: '线上总内容',
    img: `${statImgBase}/288b89194e657603ff40db39e8072640.svg~tplv-49unhts6dw-image.image`
  },
  {
    key: 'b',
    title: '投放中内容',
    img: `${statImgBase}/fdc66b07224cdf18843c6076c2587eb5.svg~tplv-49unhts6dw-image.image`
  },
  {
    key: 'c',
    title: '日新增评论',
    img: `${statImgBase}/77d74c9a245adeae1ec7fb5d4539738d.svg~tplv-49unhts6dw-image.image`
  },
  {
    key: 'd',
    title: '较昨日新增',
    img: `${statImgBase}/c8b36e26d2b9bb5dbf9b74dd6d7345af.svg~tplv-49unhts6dw-image.image`
  }
]

/** 与 mock.ts /api/content-data 一致 */
const chartY = [58, 81, 53, 90, 64, 88, 49, 79]

function lastNDates(n) {
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    out.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    )
  }
  return out
}

const chartDates = lastNDates(8)

// 图表配置
const contentChartOption = computed(() =>
  workplaceContentChartOption({ dates: chartDates, values: chartY })
)

const categoriesPieOption = computed(() => workplaceCategoriesPieOption())

/** arco-design-pro-vite mock.ts 热门列表 */
const textList = [
  { key: 1, clickNumber: '346.3w+', title: '经济日报：财政政策要精准提升…', increases: 35 },
  { key: 2, clickNumber: '324.2w+', title: '双12遇冷，消费者厌倦了电商平…', increases: 22 },
  { key: 3, clickNumber: '318.9w+', title: '致敬坚守战“疫”一线的社区工作…', increases: 9 },
  { key: 4, clickNumber: '257.9w+', title: '普高还是职高？家长们陷入选择…', increases: 17 },
  { key: 5, clickNumber: '124.2w+', title: '人民快评：没想到“浓眉大眼”的…', increases: 37 }
]
const imageList = [
  { key: 1, clickNumber: '15.3w+', title: '杨涛接替陆慷出任外交部美大司…', increases: 15 },
  { key: 2, clickNumber: '12.2w+', title: '图集：龙卷风袭击美国多州房屋…', increases: 26 },
  { key: 3, clickNumber: '18.9w+', title: '52岁大姐贴钱照顾自闭症儿童八…', increases: 9 },
  { key: 4, clickNumber: '7.9w+', title: '杭州一家三口公园宿营取暖中毒', increases: 0 },
  { key: 5, clickNumber: '5.2w+', title: '派出所副所长威胁市民？警方调…', increases: 4 }
]
const videoList = [
  { key: 1, clickNumber: '367.6w+', title: '这是今日10点的南京', increases: 5 },
  { key: 2, clickNumber: '352.2w+', title: '立陶宛不断挑衅致经济受损民众…', increases: 17 },
  { key: 3, clickNumber: '348.9w+', title: '韩国艺人刘在石确诊新冠', increases: 30 },
  { key: 4, clickNumber: '346.3w+', title: '关于北京冬奥会，文在寅表态', increases: 12 },
  { key: 5, clickNumber: '271.2w+', title: '95后现役军人荣立一等功', increases: 2 }
]

const hotTabs = [
  { k: 'text', label: '文本' },
  { k: 'image', label: '图片' },
  { k: 'video', label: '视频' }
]
const hotType = ref('text')

const currentHotList = computed(() => {
  if (hotType.value === 'image') return imageList
  if (hotType.value === 'video') return videoList
  return textList
})

const svgFile = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>`
const svgStorage = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`
const svgSettings = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
const svgMobile = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M12 18h.01"/></svg>`
const svgFire = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`

const quickLinks = [
  { label: '内容管理', svg: svgFile },
  { label: '内容分析', svg: svgStorage },
  { label: '高级管理', svg: svgSettings },
  { label: '线上推广', svg: svgMobile },
  { label: '内容投放', svg: svgFire }
]

const recentLinks = [
  { label: '内容管理', svg: svgStorage },
  { label: '内容分析', svg: svgFile },
  { label: '高级管理', svg: svgSettings }
]

const carouselSrc = [
  'https://p3-armor.byteimg.com/tos-cn-i-49unhts6dw/5cc3cd1d994b7ef9db6a1f619a22addd.jpg~tplv-49unhts6dw-image.image',
  'https://p3-armor.byteimg.com/tos-cn-i-49unhts6dw/f256cbcc287139e191fecea9d255a1f0.jpg~tplv-49unhts6dw-image.image',
  'https://p3-armor.byteimg.com/tos-cn-i-49unhts6dw/b557ff0cd44146a2e471b477af2f30d0.jpg~tplv-49unhts6dw-image.image',
  'https://p3-armor.byteimg.com/tos-cn-i-49unhts6dw/665106f4bbd2a2df96eaf7aec52f7bc3.jpg~tplv-49unhts6dw-image.image',
  'https://p3-armor.byteimg.com/tos-cn-i-49unhts6dw/ea095a2c9c72b5d8f2f2818040db736d.jpg~tplv-49unhts6dw-image.image'
]

const announcements = [
  { type: 'orangered', label: '活动', content: '内容最新优惠活动' },
  { type: 'cyan', label: '消息', content: '新增内容尚未通过审核，详情请点击查看。' },
  { type: 'blue', label: '通知', content: '当前产品试用期即将结束，如需续费请点击查看。' },
  { type: 'blue', label: '通知', content: '1月新系统升级计划通知' },
  { type: 'cyan', label: '消息', content: '新增内容已经通过审核，详情请点击查看。' }
]
</script>

<style scoped>
.wp-root {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px 0;
  padding-bottom: 16px;
  background: var(--color-fill-1);
  margin: -16px -16px 0;
  min-height: calc(100vh - 48px);
  box-sizing: border-box;
}

.wp-left {
  flex: 1;
  min-width: 0;
}

.wp-stack {
  background: var(--color-bg-2);
  border-radius: 4px;
  overflow: hidden;
}

.wp-banner {
  padding: 20px 20px 0;
}

.wp-greet {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: var(--color-text-1);
}

.wp-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0;
}

.wp-divider.tight {
  margin: 16px -20px 0;
}

.wp-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (max-width: 1100px) {
  .wp-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

.wp-stat {
  padding: 16px 0 16px 43px;
  border-right: 1px solid var(--color-border);
}

.wp-stat--last {
  border-right: none;
}

.wp-stat-inner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.wp-stat-avatar {
  border-radius: 50%;
  background: var(--color-fill-1);
  flex-shrink: 0;
}

.wp-stat-title {
  font-size: 12px;
  color: var(--color-text-3);
  margin-bottom: 2px;
}

.wp-stat-valrow {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0 4px;
  color: var(--color-text-1);
}

.wp-stat-valrow .num {
  font-size: 24px;
  font-weight: 500;
  line-height: 32px;
}

.suffix-w {
  font-size: 14px;
  font-weight: 500;
}

.unit {
  margin-left: 8px;
  font-size: 12px;
  color: var(--color-text-2);
}

.pct {
  font-size: 24px;
  font-weight: 500;
}

.caret-up {
  color: var(--color-danger);
  margin-left: 2px;
  vertical-align: middle;
}

.wp-chart-block {
  padding: 0 20px 4px;
  min-width: 0;
  box-sizing: border-box;
}

.wp-chart-wrap {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
}

.wp-chart-wrap :deep(.echart-host) {
  max-width: 100%;
  box-sizing: border-box;
}

.wp-bottom-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;
}

@media (max-width: 960px) {
  .wp-bottom-grid {
    grid-template-columns: 1fr;
  }

  .wp-root {
    flex-direction: column;
  }
}

.wp-right {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wp-card {
  background: var(--color-bg-2);
  border-radius: 4px;
  padding: 0 20px 16px;
  border: none;
  box-shadow: none;
}

.wp-card--flat {
  padding-top: 0;
}

.wp-card--recent {
  padding-bottom: 8px;
}

.popular-card {
  min-height: 395px;
}

.pie-card {
  padding-bottom: 8px;
}

.wp-card-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 0;
}

.wp-card-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-1);
}

.wp-card-extra {
  font-size: 13px;
  color: var(--color-primary);
  cursor: default;
  font-weight: 400;
}

.seg {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0;
  margin-bottom: 10px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.seg-btn {
  padding: 4px 12px;
  font-size: 13px;
  border: none;
  background: var(--color-bg-2);
  color: var(--color-text-2);
  cursor: pointer;
  font-family: inherit;
  border-right: 1px solid var(--color-border);
}

.seg-btn:last-child {
  border-right: none;
}

.seg-btn.active {
  color: var(--color-primary);
  background: var(--color-primary-bg);
  font-weight: 500;
}

.tbl-scroll {
  overflow-x: auto;
  max-height: 280px;
}

.data-tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-tbl th,
.data-tbl td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  height: 44px;
  box-sizing: border-box;
}

.data-tbl thead th {
  background: transparent;
  font-weight: 500;
  color: var(--color-text-2);
}

.data-tbl tbody tr:hover {
  background: var(--color-fill-1);
}

.title-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inc-wrap {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.inc-caret {
  color: var(--color-danger);
  flex-shrink: 0;
  font-size: 8px;
  line-height: 1;
}

.moduler-wrap {
  background: var(--color-bg-2);
  border-radius: 4px;
  overflow: hidden;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0 8px;
  padding: 8px 0 0;
}

.quick-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px 4px 12px;
  cursor: default;
  border-radius: 4px;
}

.quick-cell:hover .quick-icon {
  color: var(--color-primary);
  background: #e8f3ff;
}

.quick-cell:hover .quick-tx {
  color: var(--color-primary);
}

.quick-icon {
  width: 32px;
  height: 32px;
  line-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-fill-1);
  border-radius: 4px;
  color: var(--color-text-2);
  margin-bottom: 4px;
}

.quick-icon :deep(svg) {
  display: block;
}

.quick-tx {
  font-size: 12px;
  line-height: 1.4;
  color: var(--color-text-2);
}

.recent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 8px 0 16px;
}

.recent-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.wp-carousel {
  background: var(--color-bg-2);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.car-single {
  display: block;
  width: 100%;
  height: 170px;
  object-fit: cover;
  border-radius: 4px;
}

.car-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 8px;
}

.car-dots .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-border);
}

.anno-card .anno-body {
  padding: 4px 0 8px;
}

.anno-row {
  display: flex;
  align-items: center;
  height: 24px;
  margin-bottom: 4px;
  font-size: 13px;
}

.anno-tag {
  flex-shrink: 0;
  padding: 0 6px;
  height: 20px;
  line-height: 20px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 500;
}

.anno-tag.t-orangered {
  background: rgba(255, 125, 0, 0.15);
  color: #f77234;
}

.anno-tag.t-cyan {
  background: rgba(14, 165, 233, 0.12);
  color: #0fc6c2;
}

.anno-tag.t-blue {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.anno-txt {
  flex: 1;
  min-width: 0;
  margin-left: 4px;
  color: var(--color-text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: default;
}

.docs-card {
  min-height: 166px;
  padding-bottom: 12px;
}

.docs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 12px;
  padding-top: 4px;
}

.doc-link {
  margin: 10px 0;
  font-size: 13px;
  color: var(--color-text-2);
  cursor: pointer;
}

.doc-link:hover {
  color: var(--color-primary);
}
</style>
