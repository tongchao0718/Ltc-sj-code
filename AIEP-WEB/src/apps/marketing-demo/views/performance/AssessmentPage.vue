<template>
  <div class="md-list-page">
    <div class="md-panel">
      <MdSectionTitle title="售电能力评估" />
      <p class="md-page-desc md-page-desc--panel">六维评分模型生成能力等级报告</p>
      <MdFilterForm
        :filters="assessmentFilters"
        :form="filterForm"
        :loading="loading"
        :show-reset="false"
        :search-label="loading ? '评估中…' : '开始评估'"
        @search="run"
      />
    </div>

    <div v-if="report" class="md-panel">
      <MdSectionTitle title="评估结果">
        <template #extra>
          <span class="md-tag md-tag--info">{{ report.level }}</span>
        </template>
      </MdSectionTitle>
      <MdLineChart :option="radarOption" :height="320" />
      <div class="md-table-wrap" style="margin-top:16px">
        <table class="md-table">
          <thead><tr><th>维度</th><th>得分</th></tr></thead>
          <tbody>
            <tr v-for="(score, dim) in report.scores" :key="dim">
              <td>{{ dimLabels[dim] || dim }}</td>
              <td>{{ score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="store.assessmentReports.length" class="md-panel md-panel--table">
      <MdSectionTitle title="历史评估" />
      <div class="md-table-wrap">
        <table class="md-table">
          <thead><tr><th>企业</th><th>等级</th><th>时间</th></tr></thead>
          <tbody>
            <tr v-for="(r, idx) in store.assessmentReports" :key="idx">
              <td>{{ companyName(r.companyId) }}</td>
              <td><span class="md-tag md-tag--info">{{ r.level }}</span></td>
              <td>{{ r.at?.slice(0, 10) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import MdSectionTitle from '../../components/MdSectionTitle.vue'
import MdFilterForm from '../../components/MdFilterForm.vue'
import MdLineChart from '../../components/MdLineChart.vue'
import { marketingStore as store } from '../../store/marketingStore.js'
import { runAssessment } from '../../mock/api.js'

const filterForm = reactive({ companyId: store.companies[0]?.id })
const assessmentFilters = computed(() => [{
  key: 'companyId',
  label: '评估对象',
  type: 'select',
  options: store.companies.map((c) => ({ value: c.id, label: c.name }))
}])

const loading = ref(false)
const report = ref(null)

const dimLabels = {
  credit: '信用状况',
  scale: '代理规模',
  finance: '财务能力',
  guarantee: '保函履约',
  arrears: '欠费情况',
  market: '市场表现'
}

function companyName(id) {
  return store.companies.find((c) => c.id === id)?.name || id
}

const radarOption = computed(() => {
  if (!report.value) return {}
  const dims = Object.keys(report.value.scores)
  return {
    radar: { indicator: dims.map((d) => ({ name: dimLabels[d] || d, max: 100 })) },
    series: [{ type: 'radar', data: [{ value: dims.map((d) => report.value.scores[d]) }] }]
  }
})

async function run() {
  loading.value = true
  report.value = await runAssessment(filterForm.companyId)
  loading.value = false
}
</script>
