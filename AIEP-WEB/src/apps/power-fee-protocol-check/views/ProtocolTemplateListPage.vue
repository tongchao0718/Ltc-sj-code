<template>
  <div class="page-shell">
    <h1 class="page-title">协议模板库（M01）</h1>
    <p class="page-subtitle">API-01 /api/protocol/template/list 最小联调页</p>

    <div class="filter-row ds-card">
      <label class="field">
        <span>模板类型</span>
        <select v-model="type">
          <option value="">全部</option>
          <option value="TYPE_A">TYPE_A</option>
          <option value="TYPE_B">TYPE_B</option>
          <option value="TYPE_C">TYPE_C</option>
        </select>
      </label>
      <button class="btn" @click="loadData">查询</button>
    </div>

    <div class="ds-card">
      <div class="meta">
        <span>总数：{{ total }}</span>
        <span>请求ID：{{ requestId }}</span>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>模板编码</th>
            <th>模板名称</th>
            <th>模板类型</th>
            <th>版本</th>
            <th>状态</th>
            <th>更新时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.templateCode">
            <td>{{ row.templateCode }}</td>
            <td>{{ row.templateName }}</td>
            <td>{{ row.templateType }}</td>
            <td>{{ row.versionNo }}</td>
            <td>{{ row.status }}</td>
            <td>{{ row.updatedAt }}</td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="6" class="empty">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { fetchProtocolTemplateList } from '../api/protocolTemplateApi.js';

const type = ref('');
const rows = ref([]);
const total = ref(0);
const requestId = ref('-');

async function loadData() {
  const result = await fetchProtocolTemplateList({
    type: type.value,
    pageNo: 1,
    pageSize: 10
  });
  rows.value = result?.data?.list || [];
  total.value = result?.data?.total || 0;
  requestId.value = result?.requestId || '-';
}

onMounted(loadData);
</script>

<style scoped>
.filter-row { display: flex; gap: 12px; align-items: flex-end; margin-bottom: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
select { min-width: 180px; padding: 6px 8px; }
.btn { border: 1px solid #165dff; background: #165dff; color: #fff; padding: 7px 14px; border-radius: 6px; cursor: pointer; }
.meta { display: flex; gap: 16px; margin-bottom: 12px; color: var(--color-text-2); }
.table { width: 100%; border-collapse: collapse; }
th, td { border-bottom: 1px solid var(--color-border-2); text-align: left; padding: 10px; }
.empty { text-align: center; color: var(--color-text-3); }
</style>
