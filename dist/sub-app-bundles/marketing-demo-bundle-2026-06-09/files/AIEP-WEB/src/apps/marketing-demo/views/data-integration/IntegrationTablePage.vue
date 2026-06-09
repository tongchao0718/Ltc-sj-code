<template>
  <div>
    <h1 class="md-page-title">{{ title }}</h1>
    <p class="md-page-desc">{{ desc }}</p>
    <div class="md-card">
      <button type="button" class="md-btn md-btn--primary" :disabled="syncing" @click="doSync">{{ syncing ? '同步中…' : '立即同步' }}</button>
      <table class="md-table" style="margin-top:16px">
        <thead>
          <tr>
            <th>企业名称</th><th>月份</th><th>结算电量(MWh)</th><th>结算电费(元)</th><th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in store.tradeSettlement" :key="r.id">
            <td>{{ r.companyName }}</td>
            <td>{{ r.yearMonth }}</td>
            <td>{{ r.settleVolume }}</td>
            <td>{{ r.settleFee?.toLocaleString() }}</td>
            <td><span class="md-tag md-tag--success">{{ r.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { marketingStore as store } from '../../store/marketingStore.js'
import { syncIntegration } from '../../mock/api.js'

const props = defineProps({
  source: { type: String, default: 'trade' },
  title: String,
  desc: String
})

const syncing = ref(false)
async function doSync() {
  syncing.value = true
  await syncIntegration(props.source)
  syncing.value = false
}
</script>
