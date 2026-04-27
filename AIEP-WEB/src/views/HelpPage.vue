<template>
  <div class="page-shell static-page">
    <router-link to="/dashboard" class="back-link">← 返回首页</router-link>
    <h1 class="page-title">使用帮助</h1>
    <p class="page-subtitle">设计人员与评审专家使用说明</p>

    <div class="ds-card content-block">
      <div class="help-section">
        <h2 class="section-h">设计人员指南</h2>
        <ul>
          <li>使用 Vue 3 Composition API 进行组件开发</li>
          <li>遵循项目的目录结构和命名规范</li>
          <li>使用 CSS 变量保持设计一致性</li>
          <li>确保组件的响应式设计</li>
          <li>编写清晰的组件文档</li>
        </ul>
      </div>
      <div class="help-section">
        <h2 class="section-h">评审专家指南</h2>
        <ul>
          <li>检查代码是否符合项目规范</li>
          <li>验证组件的功能和性能</li>
          <li>确保代码的可读性和可维护性</li>
          <li>检查是否存在潜在的安全问题</li>
          <li>提供建设性的反馈和建议</li>
        </ul>
      </div>
      <p class="version">当前版本：V1.1.0</p>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.back-link {
  display: inline-block;
  margin-bottom: 16px;
  font-size: var(--font-size-body);
  color: var(--color-primary);
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.content-block {
  padding: 24px;
}

.help-section {
  margin-bottom: 24px;
}

.section-h {
  font-size: var(--font-size-title-sm);
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 12px;
}

.help-section ul {
  padding-left: 1.25rem;
  margin: 0;
  color: var(--color-text-2);
  line-height: 1.7;
}

.help-section li {
  margin-bottom: 8px;
}

.version {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-caption);
  color: var(--color-text-3);
}
</style>
