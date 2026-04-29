<template>
  <div class="page-shell app-center-page">
    <h1 class="page-title">应用中心</h1>
    <p class="page-subtitle">子应用入口一览；后续接入的应用将在此展示。</p>

    <div class="grid-9" role="list">
      <router-link
        v-for="app in apps"
        :key="app.id"
        :to="app.to"
        class="grid-cell ds-card"
        role="listitem"
      >
        <div class="cell-icon" aria-hidden="true">{{ app.icon }}</div>
        <h3 class="cell-title">{{ app.name }}</h3>
        <p class="cell-folder">{{ app.folder }}</p>
        <p class="cell-desc">{{ app.desc }}</p>
        <span v-if="app.tag" class="tag" :class="app.tagClass">{{ app.tag }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
const apps = [
  {
    id: 'sample',
    name: '示例应用',
    folder: 'sample-app',
    desc: '多分组菜单与业务演示页（仪表盘、可视化、列表、表单、结果与异常页等）。',
    icon: '📋',
    to: '/sample-app/dashboard/workplace',
    tag: '可用',
    tagClass: 'tag-success'
  },
  {
    id: 'power-fee-protocol-check',
    name: '电费协议核查',
    folder: 'power-fee-protocol-check',
    desc: 'M01~M14 模块入口 + API-02~API-08 全链路验证工作台。',
    icon: '⚙️',
    to: '/power-fee-protocol-check/full-flow',
    tag: '开发中',
    tagClass: 'tag-warning'
  }
]
</script>

<style scoped>
.app-center-page {
  width: 100%;
  max-width: 960px;
  box-sizing: border-box;
  min-width: 0;
}

.grid-9 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .grid-9 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .grid-9 {
    grid-template-columns: 1fr;
  }
}

.grid-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  text-decoration: none;
  color: inherit;
  min-height: 160px;
  cursor: pointer;
  padding: 20px;
}

.cell-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.cell-title {
  font-size: var(--font-size-title-sm);
  font-weight: 600;
  color: var(--color-text-1);
  margin-bottom: 4px;
}

.cell-folder {
  font-family: Monaco, Menlo, Consolas, monospace;
  font-size: var(--font-size-caption);
  color: var(--color-primary);
  margin-bottom: 8px;
  padding: 2px 8px;
  background: var(--color-primary-bg);
  border-radius: 4px;
  align-self: flex-start;
}

.cell-desc {
  font-size: var(--font-size-caption);
  color: var(--color-text-3);
  line-height: 1.5;
  flex: 1;
}

.grid-cell .tag {
  margin-top: 12px;
}
</style>
