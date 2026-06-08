<template>
  <div class="md-page-stack">
    <MdQueryLayout :config="expiryConfig" />
    <div class="md-panel">
      <MdSectionTitle title="临期阈值配置" />
      <div class="md-form-item md-form-item--inline" style="max-width:480px">
        <label>临期阈值（天）</label>
        <input v-model.number="days" type="number" class="md-input" style="max-width:120px" />
        <button type="button" class="md-btn md-btn--primary" @click="saveDays">保存阈值</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MdQueryLayout from '../../components/MdQueryLayout.vue'
import MdSectionTitle from '../../components/MdSectionTitle.vue'
import { queryConfigs } from '../../config/queryConfigs.js'
import { marketingStore as store } from '../../store/marketingStore.js'
import { saveExpiryDays } from '../../mock/api.js'
import { useMdMessage } from '../../composables/useMdMessage.js'

const msg = useMdMessage()

const expiryConfig = {
  ...queryConfigs.guarantee,
  title: '保函临期查询',
  desc: '按临期天数筛选履约保函，支撑履约管控'
}

const days = ref(store.expiryDays)

async function saveDays() {
  await saveExpiryDays(days.value)
  msg.success(`临期阈值已设为 ${days.value} 天`)
}
</script>
