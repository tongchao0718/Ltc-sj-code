<template>
  <div class="page-wrap">
    <div class="breadcrumb">系统管理 / 角色权限</div>
    <h1 class="page-title">角色权限</h1>
    <p class="page-desc">P-WEB-10 · 角色与权限矩阵（Mock）</p>
    <a-card :bordered="false">
      <a-button type="primary" style="margin-bottom: 16px" @click="openCreate">新建角色</a-button>
      <a-table :data="crmStore.roles" row-key="id">
        <template #columns>
          <a-table-column title="编码" data-index="code" />
          <a-table-column title="角色名称" data-index="name" />
          <a-table-column title="权限范围" data-index="permissions" />
          <a-table-column title="用户数" data-index="userCount" />
          <a-table-column title="状态" data-index="status">
            <template #cell="{ record }">
              <a-badge :status="record.status === '启用' ? 'success' : 'default'" :text="record.status" />
            </template>
          </a-table-column>
          <a-table-column title="操作">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="openEdit(record)">编辑</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="showModal" :title="editingId ? '编辑角色' : '新建角色'" @ok="saveRole">
      <a-form :model="form" layout="vertical">
        <a-form-item label="编码" required>
          <a-input v-model="form.code" :disabled="!!editingId" />
        </a-form-item>
        <a-form-item label="角色名称" required>
          <a-input v-model="form.name" />
        </a-form-item>
        <a-form-item label="权限范围">
          <a-textarea v-model="form.permissions" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { crmStore, addRole, updateRole } from '../../store/crmStore.js'

const showModal = ref(false)
const editingId = ref(null)
const form = reactive({ code: '', name: '', permissions: '' })

function openCreate() {
  editingId.value = null
  Object.assign(form, { code: '', name: '', permissions: '' })
  showModal.value = true
}

function openEdit(record) {
  editingId.value = record.id
  Object.assign(form, { code: record.code, name: record.name, permissions: record.permissions })
  showModal.value = true
}

function saveRole() {
  if (!form.code || !form.name) {
    Message.warning('请填写编码与名称')
    return
  }
  if (editingId.value) {
    updateRole(editingId.value, { name: form.name, permissions: form.permissions })
  } else {
    addRole({ ...form })
  }
  showModal.value = false
  Message.success('已保存')
}
</script>
