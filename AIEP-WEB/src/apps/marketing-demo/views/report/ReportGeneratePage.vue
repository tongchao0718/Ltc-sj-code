<template>
  <div class="md-list-page">
    <div class="md-panel">
      <MdSectionTitle title="一键报告生成" />
      <p class="md-page-desc md-page-desc--panel">选择企业与模板，生成 PDF/Word 报告（Demo 模拟）</p>
      <MdFilterForm
        :filters="generateFilters"
        :form="form"
        :loading="loading"
        :show-reset="false"
        :search-label="loading ? '生成中…' : '生成报告'"
        @search="generate"
      />
    </div>

    <div v-if="result" class="md-panel md-panel--success">
      ✅ 报告已生成：{{ result.title }}（{{ form.format.toUpperCase() }}）<br />
      <small>生成时间：{{ result.generatedAt }}</small>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import MdSectionTitle from '../../components/MdSectionTitle.vue'
import MdFilterForm from '../../components/MdFilterForm.vue'
import { marketingStore as store } from '../../store/marketingStore.js'
import { generateReport } from '../../mock/api.js'

const enabledTemplates = computed(() =>
  (store.reportTemplates || []).filter((t) => t.status === '启用')
)

const form = reactive({
  template: enabledTemplates.value[0]?.name || '',
  companyId: store.companies[0]?.id,
  format: 'pdf'
})

const generateFilters = computed(() => [
  {
    key: 'template',
    label: '报告模板',
    type: 'select',
    options: enabledTemplates.value.map((t) => ({ value: t.name, label: t.name }))
  },
  {
    key: 'companyId',
    label: '目标企业',
    type: 'select',
    options: store.companies.map((c) => ({ value: c.id, label: c.name }))
  },
  {
    key: 'format',
    label: '输出格式',
    type: 'select',
    options: [
      { value: 'pdf', label: 'PDF' },
      { value: 'docx', label: 'Word' }
    ]
  }
])

const loading = ref(false)
const result = ref(null)

async function generate() {
  loading.value = true
  result.value = await generateReport(form.template, form)
  loading.value = false
}
</script>
