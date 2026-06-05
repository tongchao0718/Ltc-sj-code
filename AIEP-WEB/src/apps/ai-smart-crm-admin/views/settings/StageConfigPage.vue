<template>
  <div class="page-wrap">
    <div class="breadcrumb">系统管理 / 销售阶段</div>
    <h1 class="page-title">销售阶段配置</h1>
    <p class="page-desc">P-WEB-05 · 发布后 APP 新商机默认阶段生效</p>
    <a-card :bordered="false">
      <a-table :data="crmStore.stages" :pagination="false" row-key="code">
        <template #columns>
          <a-table-column title="顺序" :width="80">
            <template #cell="{ rowIndex }">{{ rowIndex + 1 }}</template>
          </a-table-column>
          <a-table-column title="阶段名称" data-index="name" />
          <a-table-column title="颜色" data-index="color">
            <template #cell="{ record }">
              <span class="stage-dot" :style="{ background: record.color }" />
              {{ record.color }}
            </template>
          </a-table-column>
          <a-table-column title="默认概率" data-index="probability">
            <template #cell="{ record }">{{ record.probability }}%</template>
          </a-table-column>
          <a-table-column title="操作">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="openEdit(record)">编辑</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
      <div style="margin-top: 20px">
        <a-button type="primary" @click="publish">保存并发布</a-button>
      </div>
    </a-card>

    <a-modal v-model:visible="editVisible" title="编辑阶段" @ok="saveStage">
      <a-form :model="form" layout="vertical">
        <a-form-item label="阶段名称">
          <a-input v-model="form.name" />
        </a-form-item>
        <a-form-item label="颜色">
          <a-input v-model="form.color" placeholder="#2563EB" />
        </a-form-item>
        <a-form-item label="默认概率(%)">
          <a-input-number v-model="form.probability" :min="0" :max="100" style="width:100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { crmStore, updateStage } from '../../store/crmStore.js'

const editVisible = ref(false)
const editingCode = ref(null)
const form = reactive({ name: '', color: '', probability: 0 })

function openEdit(record) {
  editingCode.value = record.code
  Object.assign(form, { name: record.name, color: record.color, probability: record.probability })
  editVisible.value = true
}

function saveStage() {
  if (!editingCode.value) return
  updateStage(editingCode.value, { ...form })
  Message.success('阶段配置已更新（发布前仅本地预览生效）')
  editVisible.value = false
}

function publish() {
  Modal.confirm({
    title: '确认发布',
    content: '发布后 APP 端新商机将使用最新阶段配置，是否继续？',
    onOk: () => Message.success('配置已发布')
  })
}
</script>

<style scoped>
.stage-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}
</style>
