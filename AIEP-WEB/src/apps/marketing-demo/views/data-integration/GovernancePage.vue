<template>
  <div>
    <h1 class="md-page-title">接入治理配置</h1>
    <p class="md-page-desc">脱敏规则、同步策略与数据质量管控</p>
    <div class="md-card">
      <form @submit.prevent="save">
        <div class="md-form-item" style="margin-bottom:12px">
          <label><input v-model="form.desensitize" type="checkbox" /> 启用敏感字段脱敏</label>
        </div>
        <div class="md-form-item" style="margin-bottom:12px">
          <label><input v-model="form.maskBank" type="checkbox" /> 银行账号掩码显示</label>
        </div>
        <div class="md-form-item" style="margin-bottom:16px">
          <label>定时同步 Cron</label>
          <input v-model="form.syncCron" class="md-input" style="width:240px" />
        </div>
        <button type="submit" class="md-btn md-btn--primary" :disabled="saving">{{ saving ? '保存中…' : '保存配置' }}</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { marketingStore as store } from '../../store/marketingStore.js'
import { saveGovernance } from '../../mock/api.js'
import { useMdMessage } from '../../composables/useMdMessage.js'

const msg = useMdMessage()

const form = reactive({ ...store.governance })
const saving = ref(false)

async function save() {
  saving.value = true
  await saveGovernance(form)
  Object.assign(store.governance, form)
  saving.value = false
  msg.success('治理配置已保存')
}
</script>
