<template>
  <div class="page-wrap">
    <div class="breadcrumb">系统管理 / 审计日志</div>
    <h1 class="page-title">审计日志</h1>
    <p class="page-desc">P-WEB-12 · 关键操作留痕（Mock）</p>
    <a-card :bordered="false">
      <a-form :model="filters" layout="inline" style="margin-bottom: 16px">
        <a-form-item label="用户">
          <a-input v-model="filters.user" placeholder="账号/姓名" allow-clear />
        </a-form-item>
        <a-form-item label="模块">
          <a-select v-model="filters.module" placeholder="全部" allow-clear style="width: 140px">
            <a-option value="认证">认证</a-option>
            <a-option value="客户">客户</a-option>
            <a-option value="报表">报表</a-option>
            <a-option value="权限">权限</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="applyFilter">查询</a-button>
          <a-button style="margin-left: 8px" @click="resetFilter">重置</a-button>
        </a-form-item>
      </a-form>
      <a-table :data="displayRows" row-key="id" :pagination="{ pageSize: 10 }">
        <template #columns>
          <a-table-column title="时间" data-index="time" :width="160" />
          <a-table-column title="用户" data-index="user" />
          <a-table-column title="操作" data-index="action" />
          <a-table-column title="模块" data-index="module" />
          <a-table-column title="IP" data-index="ip" />
          <a-table-column title="结果" data-index="result">
            <template #cell="{ record }">
              <a-tag :color="record.result === '成功' ? 'green' : 'red'">{{ record.result }}</a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { crmStore } from '../../store/crmStore.js'

const filters = reactive({ user: '', module: '' })
const active = reactive({ user: '', module: '' })

const displayRows = computed(() =>
  crmStore.auditLogs.filter((row) => {
    const u = !active.user || row.user.includes(active.user)
    const m = !active.module || row.module === active.module
    return u && m
  })
)

function applyFilter() {
  active.user = filters.user.trim()
  active.module = filters.module || ''
}

function resetFilter() {
  filters.user = ''
  filters.module = ''
  active.user = ''
  active.module = ''
}
</script>
