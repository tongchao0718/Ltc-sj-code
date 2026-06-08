<template>
  <div class="page-wrap">
    <div class="breadcrumb">系统管理 / 组织管理</div>
    <h1 class="page-title">组织管理</h1>
    <p class="page-desc">P-WEB-11 · 组织树与负责人（Mock）</p>
    <a-card :bordered="false">
      <a-button type="primary" style="margin-bottom: 16px" @click="openCreate">新建组织</a-button>
      <a-table :data="crmStore.orgs" row-key="id">
        <template #columns>
          <a-table-column title="编码" data-index="code" />
          <a-table-column title="组织名称" data-index="name" />
          <a-table-column title="上级" data-index="parent" />
          <a-table-column title="负责人" data-index="leader" />
          <a-table-column title="人数" data-index="memberCount" />
          <a-table-column title="状态" data-index="status" />
          <a-table-column title="操作">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="openEdit(record)">编辑</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="showModal" :title="editingId ? '编辑组织' : '新建组织'" @ok="saveOrg">
      <a-form :model="form" layout="vertical">
        <a-form-item label="编码" required>
          <a-input v-model="form.code" :disabled="!!editingId" />
        </a-form-item>
        <a-form-item label="组织名称" required>
          <a-input v-model="form.name" />
        </a-form-item>
        <a-form-item label="上级组织">
          <a-input v-model="form.parent" />
        </a-form-item>
        <a-form-item label="负责人">
          <a-input v-model="form.leader" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { crmStore, addOrg, updateOrg } from '../../store/crmStore.js'

const showModal = ref(false)
const editingId = ref(null)
const form = reactive({ code: '', name: '', parent: '总部', leader: '' })

function openCreate() {
  editingId.value = null
  Object.assign(form, { code: '', name: '', parent: '总部', leader: '' })
  showModal.value = true
}

function openEdit(record) {
  editingId.value = record.id
  Object.assign(form, { code: record.code, name: record.name, parent: record.parent, leader: record.leader })
  showModal.value = true
}

function saveOrg() {
  if (!form.code || !form.name) {
    Message.warning('请填写编码与名称')
    return
  }
  if (editingId.value) {
    updateOrg(editingId.value, { name: form.name, parent: form.parent, leader: form.leader })
  } else {
    addOrg({ ...form })
  }
  showModal.value = false
  Message.success('已保存')
}
</script>
