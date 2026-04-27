import * as echarts from 'echarts'

/** 与 Arco 浅色工作台图表风格接近的 ECharts 配色 */
export const C = {
  text: '#4e5969',
  textWeak: '#86909c',
  axis: '#e5e6eb',
  split: '#f2f3f5',
  primary: '#165dff',
  purple: '#722ed1',
  orange: '#ff7d00',
  cyan: '#14c9c9',
  green: '#00b42a',
  red: '#f53f3f'
}

export function lineAreaOption({ dates, values, maxY = 100000 }) {
  return {
    color: [C.primary],
    grid: { left: 52, right: 20, top: 28, bottom: 28 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: { lineStyle: { color: C.axis } },
      axisLabel: { color: C.textWeak, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      max: maxY,
      splitNumber: 5,
      axisLine: { show: false },
      axisLabel: { color: C.textWeak, fontSize: 11 },
      splitLine: { lineStyle: { color: C.split } }
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: C.primary },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(22, 93, 255, 0.35)' },
              { offset: 0.6, color: 'rgba(114, 46, 209, 0.12)' },
              { offset: 1, color: 'rgba(22, 93, 255, 0.02)' }
            ]
          }
        },
        data: values
      }
    ]
  }
}

export function donutOption(items) {
  return {
    color: [C.primary, C.purple, C.orange, C.cyan, C.green],
    tooltip: { trigger: 'item' },
    legend: {
      bottom: 0,
      left: 'center',
      textStyle: { color: C.text, fontSize: 12 }
    },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '46%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: {
          formatter: '{b}\n{d}%',
          color: C.text,
          fontSize: 11
        },
        data: items
      }
    ]
  }
}

export function dualLineOption({ dates, series }) {
  return {
    color: [C.primary, C.orange],
    tooltip: { trigger: 'axis' },
    legend: {
      bottom: 0,
      left: 'center',
      textStyle: { color: C.text, fontSize: 12 }
    },
    grid: { left: 48, right: 20, top: 28, bottom: 48 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: { lineStyle: { color: C.axis } },
      axisLabel: { color: C.textWeak, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: C.split } },
      axisLabel: { color: C.textWeak, fontSize: 11 }
    },
    series: series.map((s, i) => ({
      name: s.name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { width: 2 },
      data: s.data,
      areaStyle:
        i === 0
          ? {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(22, 93, 255, 0.2)' },
                  { offset: 1, color: 'rgba(22, 93, 255, 0.02)' }
                ]
              }
            }
          : undefined
    }))
  }
}

export function funnelOption(data) {
  return {
    color: [C.primary, C.purple, C.orange, C.cyan],
    tooltip: { trigger: 'item', formatter: '{b}: {c}' },
    series: [
      {
        type: 'funnel',
        left: '6%',
        top: 16,
        bottom: 16,
        width: '88%',
        min: 0,
        max: 100,
        sort: 'descending',
        gap: 4,
        label: { position: 'inside', fontSize: 11, color: '#fff' },
        itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 4 },
        data
      }
    ]
  }
}

export function barOption(categories, values, horizontal = false) {
  const base = {
    color: [C.primary],
    grid: { left: horizontal ? 100 : 48, right: 24, top: 16, bottom: horizontal ? 16 : 40 },
    tooltip: { trigger: 'axis' },
    xAxis: horizontal
      ? { type: 'value', splitLine: { lineStyle: { color: C.split } }, axisLabel: { color: C.textWeak } }
      : {
          type: 'category',
          data: categories,
          axisLine: { lineStyle: { color: C.axis } },
          axisLabel: { color: C.textWeak, rotate: categories.length > 6 ? 30 : 0 }
        },
    yAxis: horizontal
      ? {
          type: 'category',
          data: categories,
          axisLine: { lineStyle: { color: C.axis } },
          axisLabel: { color: C.textWeak }
        }
      : { type: 'value', splitLine: { lineStyle: { color: C.split } }, axisLabel: { color: C.textWeak } },
    series: [
      {
        type: 'bar',
        barMaxWidth: 28,
        itemStyle: {
          borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]
        },
        data: values
      }
    ]
  }
  return base
}

/**
 * Arco Pro 工作台「内容数据」折线图（对齐 src/views/dashboard/workplace/components/content-chart.vue）
 */
export function workplaceContentChartOption({ dates, values }) {
  const graphic = echarts.graphic
  return {
    grid: {
      left: '2.6%',
      right: '2.6%',
      top: '10',
      bottom: '30',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      offset: 2,
      data: dates,
      boundaryGap: false,
      axisLabel: {
        color: '#4E5969',
        fontSize: 12,
        formatter(value, idx) {
          if (idx === 0) return ''
          if (idx === dates.length - 1) return ''
          return value
        }
      },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        interval: (idx) => {
          if (idx === 0) return false
          if (idx === dates.length - 1) return false
          return true
        },
        lineStyle: { color: '#E5E8EF' }
      },
      axisPointer: {
        show: true,
        lineStyle: { color: '#23ADFF', width: 2 }
      }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      axisLabel: {
        color: '#4E5969',
        fontSize: 12,
        formatter(value) {
          if (value === 0) return '0'
          return `${value}k`
        }
      },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: '#E5E8EF' }
      }
    },
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      formatter(params) {
        const [first] = params
        const v = Number(first.value)
        const num = (v * 10000).toLocaleString('zh-CN')
        return `<div><p style="margin:0 0 6px;font-weight:600">${first.axisValueLabel}</p><div><span style="color:#86909c">总内容量</span><span style="margin-left:12px;font-weight:600">${num}</span></div></div>`
      }
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbolSize: 12,
        showSymbol: false,
        data: values,
        lineStyle: {
          width: 3,
          color: new graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: 'rgba(30, 231, 255, 1)' },
            { offset: 0.5, color: 'rgba(36, 154, 255, 1)' },
            { offset: 1, color: 'rgba(111, 66, 251, 1)' }
          ])
        },
        areaStyle: {
          opacity: 0.8,
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(17, 126, 255, 0.16)' },
            { offset: 1, color: 'rgba(17, 128, 255, 0)' }
          ])
        }
      }
    ]
  }
}

/**
 * Arco Pro 工作台「内容类型占比」饼图（对齐 categories-percent.vue）
 */
export function workplaceCategoriesPieOption() {
  return {
    legend: {
      left: 'center',
      bottom: 0,
      data: ['纯文本', '图文类', '视频类'],
      icon: 'circle',
      itemWidth: 8,
      textStyle: { color: '#4E5969', fontSize: 12 },
      itemStyle: { borderWidth: 0 }
    },
    tooltip: { trigger: 'item' },
    graphic: {
      elements: [
        {
          type: 'text',
          left: 'center',
          top: '40%',
          style: {
            text: '内容量',
            textAlign: 'center',
            fill: '#4E5969',
            fontSize: 14
          }
        },
        {
          type: 'text',
          left: 'center',
          top: '50%',
          style: {
            text: '928,531',
            textAlign: 'center',
            fill: '#1D2129',
            fontSize: 16,
            fontWeight: 500
          }
        }
      ]
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '50%'],
        label: {
          formatter: '{d}%',
          fontSize: 14,
          color: '#4E5969'
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        data: [
          { value: 148564, name: '纯文本', itemStyle: { color: '#249EFF' } },
          { value: 334271, name: '图文类', itemStyle: { color: '#313CA9' } },
          { value: 445694, name: '视频类', itemStyle: { color: '#21CCFF' } }
        ]
      }
    ]
  }
}
