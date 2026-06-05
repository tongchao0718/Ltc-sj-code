<template>
  <div class="page-wrap">
    <div class="breadcrumb">系统管理 / 公海规则</div>
    <h1 class="page-title">公海规则配置</h1>
    <p class="page-desc">P-WEB-06</p>
    <a-card :bordered="false" style="max-width: 560px">
      <a-form :model="form" layout="vertical">
        <a-form-item label="超期未跟进回收天数">
          <a-input-number v-model="form.reclaimDays" :min="1" :max="90" style="width: 100%" />
        </a-form-item>
        <a-form-item label="每日领取上限">
          <a-input-number v-model="form.dailyLimit" :min="1" :max="50" style="width: 100%" />
        </a-form-item>
        <a-form-item label="保护期（天）">
          <a-input-number v-model="form.protectDays" :min="0" :max="30" style="width: 100%" />
        </a-form-item>
        <a-button type="primary" @click="save">保存</a-button>
      </a-form>
      <a-alert v-if="savedAt" type="success" style="margin-top:16px">
        已于 {{ savedAt }} 保存，当前规则：{{ form.reclaimDays }} 天回收 / 每日 {{ form.dailyLimit }} 条 / 保护期 {{ form.protectDays }} 天
      </a-alert>
    </a-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { crmStore, savePoolConfig } from '../../store/crmStore.js'

const form = reactive({ reclaimDays: 7, dailyLimit: 5, protectDays: 3 })
const savedAt = ref('')

onMounted(() => {
  Object.assign(form, crmStore.poolConfig)
})

function save() {
  savePoolConfig({ ...form })
  savedAt.value = new Date().toLocaleTimeString()
  Message.success('公海规则已保存')
}
</script>
