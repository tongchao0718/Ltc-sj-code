<template>
  <div>
    <h1 class="md-page-title">协议上传</h1>
    <p class="md-page-desc">上传已签署协议扫描件并关联企业</p>
    <div class="md-card">
      <form @submit.prevent="upload">
        <div class="md-form-item" style="margin-bottom:12px">
          <label>关联企业</label>
          <select v-model="form.companyId" class="md-select">
            <option v-for="c in store.companies" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="md-form-item" style="margin-bottom:12px">
          <label>协议文件</label>
          <input type="file" accept=".pdf,.jpg,.png" @change="onFile" />
        </div>
        <button type="submit" class="md-btn md-btn--primary" :disabled="!form.fileName || uploading">{{ uploading ? '上传中…' : '提交上传' }}</button>
      </form>
      <p v-if="done" style="color:#52c41a;margin-top:12px">✅ 已上传 {{ form.fileName }} 并创建协议记录</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { marketingStore as store, persistStore } from '../../store/marketingStore.js'

const form = reactive({ companyId: store.companies[0]?.id, fileName: '' })
const uploading = ref(false)
const done = ref(false)

function onFile(e) {
  form.fileName = e.target.files?.[0]?.name || ''
}

async function upload() {
  uploading.value = true
  await new Promise((r) => setTimeout(r, 800))
  const c = store.companies.find((x) => x.id === form.companyId)
  store.agreements.unshift({
    id: `ag-${Date.now()}`,
    companyId: c.id,
    companyName: c.name,
    code: `XY-${Date.now().toString().slice(-6)}`,
    status: '待审核',
    signedAt: new Date().toISOString().slice(0, 10),
    expireAt: '2027-12-31',
    fileName: form.fileName
  })
  persistStore()
  uploading.value = false
  done.value = true
}
</script>
