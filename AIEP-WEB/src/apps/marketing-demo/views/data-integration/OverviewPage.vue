<template>
  <div>
    <h1 class="md-page-title">数据接入总览</h1>
    <p class="md-page-desc">工商、交易、结算三类数据源接入状态与最近同步记录</p>

    <div class="md-stat-row">
      <div v-for="(task, key) in store.integration" :key="key" class="md-stat-card">
        <div>
          <div class="md-stat-label">{{ task.name }}</div>
          <div class="md-stat-value" style="font-size:20px">{{ task.count }} 家</div>
          <div style="font-size:12px;color:#909399;margin-top:4px">最近同步：{{ task.lastSync || '未同步' }}</div>
          <span class="md-tag" :class="task.status === 'success' ? 'md-tag--success' : 'md-tag--warning'">{{ task.status === 'success' ? '正常' : '待同步' }}</span>
          <button type="button" class="md-btn md-btn--primary" style="margin-top:12px" :disabled="syncing === key" @click="doSync(key)">
            {{ syncing === key ? '同步中…' : '立即同步' }}
          </button>
        </div>
      </div>
    </div>

    <div class="md-card">
      <h3 class="md-page-title">同步日志</h3>
      <table class="md-table">
        <thead><tr><th>时间</th><th>数据源</th><th>结果</th><th>说明</th></tr></thead>
        <tbody>
          <tr v-for="log in store.syncLogs" :key="log.id">
            <td>{{ log.time }}</td>
            <td>{{ log.source }}</td>
            <td><span class="md-tag md-tag--success">{{ log.result }}</span></td>
            <td>{{ log.message }}</td>
          </tr>
          <tr v-if="!store.syncLogs.length"><td colspan="4" class="md-empty">暂无同步记录</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { marketingStore as store } from '../../store/marketingStore.js'
import { syncIntegration } from '../../mock/api.js'

const syncing = ref('')

async function doSync(source) {
  syncing.value = source
  await syncIntegration(source)
  syncing.value = ''
}
</script>
