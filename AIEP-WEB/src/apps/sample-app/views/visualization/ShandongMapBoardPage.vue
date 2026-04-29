<template>
  <div class="board-page">
    <header class="board-head">
      <div>
        <h1>山东地图大屏</h1>
        <p>支持省级总览、地市下钻到区县点位，并展示关键业务指标。</p>
      </div>
      <div class="head-actions">
        <button type="button" class="ghost" @click="resetView">返回省级</button>
      </div>
    </header>

    <section class="board-main">
      <div ref="chartRef" class="map-board" />
      <aside class="side-panel">
        <h3>{{ currentTitle }}</h3>
        <ul>
          <li v-for="item in currentMarkers" :key="item.name">
            <span>{{ item.name }}</span>
            <strong>{{ item.value[2] }}</strong>
          </li>
        </ul>
      </aside>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import chinaGeo from 'china-map-geojson'

const chartRef = ref(null)
const activeCity = ref('')

const cityMarkers = [
  { name: '济南市', value: [117.120, 36.651, 320] },
  { name: '青岛市', value: [120.382, 36.067, 410] },
  { name: '淄博市', value: [118.054, 36.813, 190] },
  { name: '烟台市', value: [121.391, 37.539, 260] },
  { name: '潍坊市', value: [119.107, 36.709, 230] },
  { name: '临沂市', value: [118.356, 35.104, 280] }
]

const countyMarkers = {
  济南市: [
    { name: '历下区', value: [117.076, 36.665, 88] },
    { name: '市中区', value: [116.997, 36.651, 74] },
    { name: '槐荫区', value: [116.902, 36.652, 62] },
    { name: '历城区', value: [117.063, 36.68, 79] }
  ],
  青岛市: [
    { name: '市南区', value: [120.385, 36.067, 92] },
    { name: '市北区', value: [120.376, 36.087, 78] },
    { name: '崂山区', value: [120.467, 36.107, 68] },
    { name: '黄岛区', value: [120.043, 35.871, 95] }
  ],
  淄博市: [
    { name: '张店区', value: [118.034, 36.807, 55] },
    { name: '淄川区', value: [117.967, 36.643, 44] },
    { name: '博山区', value: [117.862, 36.497, 38] }
  ],
  烟台市: [
    { name: '芝罘区', value: [121.39, 37.542, 60] },
    { name: '福山区', value: [121.264, 37.498, 49] },
    { name: '莱山区', value: [121.441, 37.511, 56] }
  ],
  潍坊市: [
    { name: '潍城区', value: [119.103, 36.706, 51] },
    { name: '奎文区', value: [119.13, 36.708, 59] },
    { name: '寒亭区', value: [119.218, 36.774, 40] }
  ],
  临沂市: [
    { name: '兰山区', value: [118.348, 35.058, 65] },
    { name: '罗庄区', value: [118.284, 34.997, 47] },
    { name: '河东区', value: [118.398, 35.088, 53] }
  ]
}

const currentMarkers = computed(() =>
  activeCity.value ? countyMarkers[activeCity.value] || [] : cityMarkers
)

const currentTitle = computed(() => (activeCity.value ? `${activeCity.value}区县点位` : '山东省地市点位'))

const shandongMap = {
  type: 'FeatureCollection',
  features: (chinaGeo.features || []).filter((feature) => feature.properties?.name === '山东')
}

let chart
let resizeObserver

function buildOption() {
  const maxVal = Math.max(...currentMarkers.value.map((item) => item.value[2]), 1)
  return {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const value = Array.isArray(params.value) ? params.value[2] : params.value || 0
        return `${params.name}<br/>指标值: ${value}`
      }
    },
    visualMap: {
      min: 0,
      max: maxVal,
      left: 10,
      bottom: 10,
      text: ['高', '低'],
      calculable: true,
      inRange: { color: ['#cde6ff', '#165dff'] }
    },
    geo: {
      map: 'shandong',
      roam: true,
      zoom: 1.1,
      itemStyle: {
        areaColor: '#ecf5ff',
        borderColor: '#165dff',
        borderWidth: 1
      },
      emphasis: {
        itemStyle: {
          areaColor: '#d0e5ff'
        }
      }
    },
    series: [
      {
        name: '打点',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: currentMarkers.value,
        symbolSize: (value) => Math.max(10, value[2] / 8),
        itemStyle: {
          color: activeCity.value ? '#00b42a' : '#f53f3f'
        },
        label: {
          show: true,
          formatter: '{b}',
          position: 'right',
          color: '#1d2129',
          fontSize: 12
        }
      }
    ]
  }
}

function renderMap() {
  if (!chartRef.value) return
  if (!chart) {
    chart = echarts.init(chartRef.value)
    chart.on('click', (params) => {
      if (!activeCity.value && countyMarkers[params.name]) {
        activeCity.value = params.name
      }
    })
  }
  echarts.registerMap('shandong', shandongMap)
  chart.setOption(buildOption(), true)
}

function resetView() {
  activeCity.value = ''
}

onMounted(() => {
  renderMap()
  resizeObserver = new ResizeObserver(() => chart?.resize())
  if (chartRef.value) resizeObserver.observe(chartRef.value)
})

watch(activeCity, () => {
  renderMap()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.board-page {
  padding: 16px 20px;
  height: calc(100vh - 90px);
  min-height: 640px;
  background: #06132a;
  color: #fff;
}

.board-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.board-head h1 {
  margin: 0;
  font-size: 24px;
}

.board-head p {
  margin: 6px 0 0;
  color: #b5ceff;
}

.board-main {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 14px;
  height: calc(100% - 70px);
}

.map-board {
  border: 1px solid #1f3f73;
  border-radius: 10px;
  background: radial-gradient(circle at center, #0e2345, #08162d);
}

.side-panel {
  border: 1px solid #1f3f73;
  border-radius: 10px;
  background: rgba(7, 21, 44, 0.95);
  padding: 14px;
}

.side-panel h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #9ec1ff;
}

.side-panel ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

.side-panel li {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed #21457e;
  padding-bottom: 6px;
}

.head-actions .ghost {
  background: transparent;
  color: #9ec1ff;
  border: 1px solid #4273c2;
  border-radius: 6px;
  height: 32px;
  padding: 0 12px;
  cursor: pointer;
}

@media (max-width: 980px) {
  .board-main {
    grid-template-columns: 1fr;
  }

  .board-page {
    min-height: 760px;
    height: auto;
  }

  .map-board {
    min-height: 460px;
  }
}
</style>
