<template>
  <div class="page-shell static-page">
    <router-link to="/dashboard" class="back-link">← 返回首页</router-link>
    <h1 class="page-title">关于我们</h1>
    <p class="page-subtitle">系统信息与团队</p>

    <div class="ds-card content-block">
      <div class="block">
        <h2 class="section-h">系统信息</h2>
        <p><strong>系统名称：</strong>应用系统</p>
        <p><strong>当前版本：</strong>V1.2.1</p>
        <p><strong>开发框架：</strong>Vue 3 + Vite</p>
      </div>
      <div class="block">
        <h2 class="section-h">系统描述</h2>
        <p>
          本系统是一个基于 Vue 3 的多子应用架构系统框架，旨在为企业级应用提供统一的管理平台，支持多个独立子应用的集成、管理和部署。
        </p>
        <p>系统特点：</p>
        <ul>
          <li>统一管理：为多个子应用提供统一的入口和管理界面</li>
          <li>独立部署：每个子应用可以独立打包和部署，减少耦合</li>
          <li>灵活扩展：支持快速添加新的子应用，满足业务需求的快速变化</li>
          <li>本地访问：子应用支持本地直接打开 HTML 文件运行，无需服务器</li>
          <li>标准化：提供统一的开发规范和打包配置，确保开发效率和质量</li>
        </ul>
      </div>
      <div class="block">
        <h2 class="section-h">开发团队</h2>
        <p><strong>团队名称：</strong>LS-SD-设计开发部-设计团队（LTC）</p>
        <p><strong>团队成员：</strong>设计开发部全体成员</p>
        <p><strong>联系方式：</strong>系统内部沟通平台</p>
      </div>
      <div class="block">
        <h2 class="section-h">版权信息</h2>
        <p>© 2024 应用系统. 保留所有权利.</p>
        <p>本系统仅供内部使用，未经授权不得用于其他用途。</p>
      </div>
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

.block {
  margin-bottom: 24px;
}

.block:last-child {
  margin-bottom: 0;
}

.section-h {
  font-size: var(--font-size-title-sm);
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 12px;
}

.block p {
  margin-bottom: 8px;
  color: var(--color-text-2);
  line-height: 1.7;
}

.block ul {
  padding-left: 1.25rem;
  margin: 8px 0 0;
  color: var(--color-text-2);
  line-height: 1.7;
}

.block li {
  margin-bottom: 6px;
}
</style>
