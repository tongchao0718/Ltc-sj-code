<template>
  <div class="page-shell review-page">
    <h1 class="page-title">项目审查中心</h1>
    <p class="page-subtitle">对照需求与设计文档进行评审与留痕（当前为框架占位页，可接入工作流后扩展）。</p>

    <div class="ds-card review-card">
      <h2 class="ds-card__title">审查清单</h2>
      <ul class="checklist">
        <li><span class="tag tag-success">就绪</span> 系统设计规范 · 颜色与组件令牌</li>
        <li><span class="tag tag-success">就绪</span> 子应用打包指南 · Hash + 相对路径</li>
        <li><span class="tag tag-muted">待办</span> 接入真实评审单据与权限</li>
      </ul>
      <div class="actions">
        <router-link to="/app-center" class="btn-secondary">返回应用中心</router-link>
        <router-link to="/dashboard" class="btn-primary">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.review-page {
  padding-top: 8px;
}

.review-card {
  max-width: 720px;
}

.checklist {
  list-style: none;
  margin: 0 0 24px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: var(--font-size-body);
  color: var(--color-text-2);
}

.checklist li {
  display: flex;
  align-items: center;
  gap: 12px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.actions a {
  text-decoration: none;
}
</style>
