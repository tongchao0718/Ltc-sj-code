<template>
  <div class="page-wrap">
    <div class="breadcrumb">系统管理 / 用户管理</div>
    <h1 class="page-title">用户管理</h1>
    <p class="page-desc">P-WEB-09 · 独立账号创建（SA-20）</p>
    <a-card :bordered="false">
      <a-button type="primary" style="margin-bottom: 16px" @click="openCreate">新建用户</a-button>
      <a-table :data="crmStore.users" row-key="id">
        <template #columns>
          <a-table-column title="账号" data-index="account" />
          <a-table-column title="姓名" data-index="name" />
          <a-table-column title="手机" data-index="phone" />
          <a-table-column title="角色" data-index="role" />
          <a-table-column title="组织" data-index="org" />
          <a-table-column title="状态" data-index="status">
            <template #cell="{ record }">
              <a-badge :status="record.status === '正常' ? 'success' : 'danger'" :text="record.status" />
            </template>
          </a-table-column>
          <a-table-column title="操作">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="onResetPwd(record)">重置密码</a-button>
              <a-button type="text" size="small" @click="openEdit(record)">编辑</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="showModal"
      :title="editingId ? '编辑用户' : '新建用户'"
      @ok="saveUser"
    >
      <a-form :model="form" layout="vertical">
        <a-form-item label="账号" required>
          <a-input v-model="form.account" :disabled="!!editingId" />
        </a-form-item>
        <a-form-item label="姓名" required>
          <a-input v-model="form.name" />
        </a-form-item>
        <a-form-item label="手机">
          <a-input v-model="form.phone" />
        </a-form-item>
        <a-form-item label="角色">
          <a-select v-model="form.role">
            <a-option>销售</a-option>
            <a-option>主管</a-option>
            <a-option>管理员</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="组织">
          <a-input v-model="form.org" placeholder="华东一组" />
        </a-form-item>
        <a-form-item v-if="!editingId" label="初始密码">
          <a-input-password v-model="form.password" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { crmStore, addUser, updateUser, resetUserPassword } from '../../store/crmStore.js'

const showModal = ref(false)
const editingId = ref(null)
const form = reactive({ account: '', name: '', phone: '', role: '销售', org: '华东一组', password: '' })

function openCreate() {
  editingId.value = null
  Object.assign(form, { account: '', name: '', phone: '', role: '销售', org: '华东一组', password: '' })
  showModal.value = true
}

function openEdit(record) {
  editingId.value = record.id
  Object.assign(form, {
    account: record.account,
    name: record.name,
    phone: record.phone,
    role: record.role,
    org: record.org,
    password: ''
  })
  showModal.value = true
}

function saveUser() {
  if (!form.account.trim() || !form.name.trim()) {
    Message.warning('请填写账号和姓名')
    return
  }
  if (editingId.value) {
    updateUser(editingId.value, {
      name: form.name,
      phone: form.phone,
      role: form.role,
      org: form.org
    })
    Message.success('用户信息已更新')
  } else {
    addUser({ ...form })
    Message.success('用户已创建，可使用独立账号登录 APP')
  }
  showModal.value = false
}

function onResetPwd(record) {
  Modal.confirm({
    title: '重置密码',
    content: `确认为用户「${record.name}」重置密码？新密码将发送至手机 ${record.phone || '（未绑定）'}`,
    onOk: () => {
      resetUserPassword(record.id)
      Message.success('密码已重置为 Crm@2026，请通知用户尽快修改')
    }
  })
}
</script>
