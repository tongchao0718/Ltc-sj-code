<template>
  <div class="page-wrap">
    <div class="breadcrumb">数据中心 / 数据导入</div>
    <h1 class="page-title">数据导入</h1>
    <p class="page-desc">P-WEB-07 · Excel 模板导入与行级错误报告</p>
    <a-card :bordered="false" style="max-width: 640px">
      <a-form layout="vertical">
        <a-form-item label="导入类型">
          <a-select v-model="importType" style="width: 100%">
            <a-option value="customer">客户</a-option>
            <a-option value="lead">线索</a-option>
            <a-option value="opportunity">商机</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="模板">
          <a-link @click="downloadTemplate">下载 {{ typeLabel }} 导入模板.xlsx</a-link>
        </a-form-item>
        <a-form-item label="上传文件">
          <a-upload draggable :auto-upload="false" :show-file-list="true" @change="onUpload">
            <template #upload-button>
              <div class="upload-trigger">点击或拖拽 Excel 文件到此处</div>
            </template>
          </a-upload>
        </a-form-item>
      </a-form>
      <a-alert v-if="result" :type="result.fail ? 'warning' : 'success'" style="margin-top: 16px">
        导入完成：成功 {{ result.ok }} 条，失败 {{ result.fail }} 条（已写入列表，可前往对应模块查看）
        <template v-if="result.fail">
          <a-link style="margin-left: 8px" @click="downloadErrors">下载错误明细</a-link>
        </template>
      </a-alert>
    </a-card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { importRecords } from '../../store/crmStore.js'

const importType = ref('customer')
const result = ref(null)

const typeLabel = computed(() => {
  const map = { customer: '客户', lead: '线索', opportunity: '商机' }
  return map[importType.value]
})

function downloadTemplate() {
  const content = `名称,行业,手机\n示例公司A,制造业,13800000001\n示例公司B,互联网,13900000002`
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${importType.value}-import-template.csv`
  a.click()
  URL.revokeObjectURL(url)
  Message.success('模板已下载')
}

function onUpload(fileList) {
  if (!fileList?.length) return
  result.value = importRecords(importType.value, 3)
  Message.success(`已导入 ${result.value.ok} 条${typeLabel.value}数据`)
}

function downloadErrors() {
  const blob = new Blob(['行号,错误原因\n3,手机号格式不正确\n'], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'import-errors.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.upload-trigger {
  padding: 32px;
  text-align: center;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
}
</style>
