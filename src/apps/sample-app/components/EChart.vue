<template>
  <div ref="host" class="echart-host" :style="{ height, minHeight: height }" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  option: { type: Object, required: true },
  height: { type: String, default: '280px' }
})

const host = ref(null)
let chart = null
let ro = null

onMounted(() => {
  if (!host.value) return
  chart = echarts.init(host.value, undefined, { renderer: 'canvas' })
  chart.setOption(props.option)
  ro = new ResizeObserver(() => chart?.resize())
  ro.observe(host.value)
})

watch(
  () => props.option,
  (op) => {
    chart?.setOption(op, true)
  },
  { deep: true }
)

onUnmounted(() => {
  ro?.disconnect()
  ro = null
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.echart-host {
  width: 100%;
}
</style>
