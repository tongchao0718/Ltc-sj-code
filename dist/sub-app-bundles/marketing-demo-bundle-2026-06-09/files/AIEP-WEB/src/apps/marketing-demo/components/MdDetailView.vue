<template>
  <div class="md-detail-view">
    <MdModalSection title="基本信息">
      <MdFormView :items="basicItems" :columns="basicColumns" />
    </MdModalSection>

    <MdModalSection v-if="extraItems.length" :title="extraTitle">
      <MdFormView v-if="extraLayout === 'form'" :items="extraItems" :columns="extraColumns" />
      <div v-else class="md-table-wrap">
        <table class="md-table md-table--inner">
          <thead>
            <tr>
              <th v-for="col in extraTableColumns" :key="col.key">{{ col.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in extraTableRows" :key="idx">
              <td v-for="col in extraTableColumns" :key="col.key">{{ formatCell(row[col.key], col.format) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </MdModalSection>
  </div>
</template>

<script setup>
import MdModalSection from './MdModalSection.vue'
import MdFormView from './MdFormView.vue'

defineProps({
  basicItems: { type: Array, default: () => [] },
  basicColumns: { type: Number, default: 2 },
  extraTitle: { type: String, default: '扩展信息' },
  extraItems: { type: Array, default: () => [] },
  extraColumns: { type: Number, default: 2 },
  extraLayout: { type: String, default: 'form' }, // form | table
  extraTableColumns: { type: Array, default: () => [] },
  extraTableRows: { type: Array, default: () => [] }
})

function formatCell(v, fmt) {
  if (fmt === 'money' && typeof v === 'number') return v.toLocaleString('zh-CN')
  return v ?? '-'
}
</script>
