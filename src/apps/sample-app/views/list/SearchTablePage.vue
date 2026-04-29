<template>
  <ArcoDemoShell title="查询表格" :crumbs="['列表页', '查询表格']">
    <div class="st">
      <div class="filter">
        <div class="filter-grid">
          <label class="fg">
            <span class="fl">集合编号</span>
            <input v-model="form.number" type="text" class="inp" placeholder="请输入集合编号" />
          </label>
          <label class="fg">
            <span class="fl">集合名称</span>
            <input v-model="form.name" type="text" class="inp" placeholder="请输入集合名称" />
          </label>
          <label class="fg">
            <span class="fl">内容体裁</span>
            <select v-model="form.contentType" class="inp sel">
              <option value="">全部</option>
              <option value="img">图文</option>
              <option value="horizontalVideo">横版短视频</option>
              <option value="verticalVideo">竖版小视频</option>
            </select>
          </label>
          <label class="fg">
            <span class="fl">筛选方式</span>
            <select v-model="form.filterType" class="inp sel">
              <option value="">全部</option>
              <option value="artificial">人工筛选</option>
              <option value="rules">规则筛选</option>
            </select>
          </label>
          <label class="fg fg-wide">
            <span class="fl">创建时间</span>
            <input type="text" class="inp" placeholder="开始日期 — 结束日期" readonly />
          </label>
          <label class="fg">
            <span class="fl">状态</span>
            <select v-model="form.status" class="inp sel">
              <option value="">全部</option>
              <option value="online">已上线</option>
              <option value="offline">已下线</option>
            </select>
          </label>
        </div>
        <div class="filter-actions">
          <button type="button" class="btn-primary btn-sm" @click="onSearch">查询</button>
          <button type="button" class="btn-secondary btn-sm" @click="onReset">重置</button>
        </div>
      </div>

      <div class="toolbar">
        <button type="button" class="btn-primary btn-sm">新建</button>
        <button type="button" class="btn-secondary btn-sm">批量导入</button>
        <button type="button" class="btn-secondary btn-sm">下载</button>
        <span class="spacer" />
        <span class="tool-text">刷新</span>
        <span class="tool-text">密度</span>
        <span class="tool-text">列设置</span>
      </div>

      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>集合编号</th>
              <th>集合名称</th>
              <th>内容体裁</th>
              <th>筛选方式</th>
              <th>内容量</th>
              <th>创建时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in rows" :key="row.number">
              <td>{{ i + 1 }}</td>
              <td>{{ row.number }}</td>
              <td>{{ row.name }}</td>
              <td>{{ ctLabel(row.contentType) }}</td>
              <td>{{ ftLabel(row.filterType) }}</td>
              <td>{{ row.count }}</td>
              <td>{{ row.createdTime }}</td>
              <td><span :class="['tag', row.status === 'online' ? 'tag-success' : 'tag-muted']">{{ stLabel(row.status) }}</span></td>
              <td><button type="button" class="btn-text btn-sm">查看</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pager">
        <span class="total">共 {{ rows.length }} 条</span>
        <div class="pg-btns">
          <button type="button" class="btn-secondary btn-sm" disabled>上一页</button>
          <span class="pg-cur">1</span>
          <button type="button" class="btn-secondary btn-sm" disabled>下一页</button>
        </div>
      </div>
    </div>
  </ArcoDemoShell>
</template>

<script setup>
import { reactive } from 'vue'
import ArcoDemoShell from '../../components/ArcoDemoShell.vue'

const form = reactive({
  number: '',
  name: '',
  contentType: '',
  filterType: '',
  status: ''
})

const rows = [
  {
    number: 'C-908772',
    name: '图文内容合集',
    contentType: 'img',
    filterType: 'artificial',
    count: 1280,
    createdTime: '2024-01-12 10:20:00',
    status: 'online'
  },
  {
    number: 'C-908773',
    name: '横版短视频合集',
    contentType: 'horizontalVideo',
    filterType: 'rules',
    count: 456,
    createdTime: '2024-01-15 14:08:00',
    status: 'online'
  },
  {
    number: 'C-908774',
    name: '竖版小视频合集',
    contentType: 'verticalVideo',
    filterType: 'artificial',
    count: 89,
    createdTime: '2024-02-01 09:00:00',
    status: 'offline'
  }
]

function ctLabel(v) {
  const m = { img: '图文', horizontalVideo: '横版短视频', verticalVideo: '竖版小视频' }
  return m[v] || v
}

function ftLabel(v) {
  const m = { artificial: '人工筛选', rules: '规则筛选' }
  return m[v] || v
}

function stLabel(v) {
  return v === 'online' ? '已上线' : '已下线'
}

function onSearch() {}

function onReset() {
  form.number = ''
  form.name = ''
  form.contentType = ''
  form.filterType = ''
  form.status = ''
}
</script>

<style scoped>
.st {
  margin-top: 0;
}

.filter {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px 20px;
  margin-bottom: 16px;
}

@media (max-width: 900px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
}

.fg-wide {
  grid-column: span 2;
}

@media (max-width: 900px) {
  .fg-wide {
    grid-column: span 1;
  }
}

.fg {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fl {
  font-size: var(--font-size-body);
  color: var(--color-text-2);
  font-weight: 500;
}

.inp {
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  font-family: var(--font-family);
  font-size: var(--font-size-body);
}

.inp.sel {
  background: var(--color-bg-2);
  color: var(--color-text-1);
}

.filter-actions {
  display: flex;
  gap: 12px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.spacer {
  flex: 1;
  min-width: 8px;
}

.tool-text {
  font-size: var(--font-size-body);
  color: var(--color-primary);
  cursor: default;
  padding: 0 4px;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  margin-bottom: 16px;
}

.tbl {
  width: 100%;
  min-width: 960px;
  border-collapse: collapse;
  font-size: var(--font-size-body);
}

.tbl th,
.tbl td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.tbl thead th {
  background: var(--color-fill-1);
  font-weight: 600;
  color: var(--color-text-2);
}

.tbl tbody tr:hover {
  background: var(--color-fill-1);
}

.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  font-size: var(--font-size-body);
  color: var(--color-text-3);
}

.pg-btns {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pg-cur {
  min-width: 28px;
  text-align: center;
  color: var(--color-primary);
  font-weight: 500;
}
</style>
