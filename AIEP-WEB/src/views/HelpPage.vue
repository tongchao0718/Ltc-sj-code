<template>
  <div class="page-shell static-page">
    <router-link to="/dashboard" class="back-link">← 返回首页</router-link>
    <h1 class="page-title">使用帮助</h1>
    <p class="page-subtitle">主应用操作说明，以及设计人员与评审专家工作指引</p>

    <div class="ds-card content-block">
      <section class="help-section">
        <h2 class="section-h">快速上手</h2>
        <ol class="steps">
          <li>在顶栏点击 <strong>首页</strong>，查看工作台统计与「快速访问」入口。</li>
          <li>点击 <strong>应用中心</strong>，浏览已接入子应用卡片并进入对应应用。</li>
          <li>进入子应用后，使用左侧菜单切换功能；顶栏仍为主应用导航，可随时返回首页或应用中心。</li>
        </ol>
      </section>

      <section class="help-section">
        <h2 class="section-h">主应用导航</h2>
        <ul>
          <li>
            <router-link to="/dashboard">首页 / 工作台</router-link>：系统概览、指标与快捷入口。
          </li>
          <li>
            <router-link to="/app-center">应用中心</router-link>：子应用统一入口（与注册表同步）。
          </li>
          <li>
            <router-link to="/profile">个人资料</router-link>（个人中心下拉）：编辑显示名、账号信息与
            <strong>主题模式</strong>（浅色 / 深色，偏好保存在本地）。
          </li>
          <li>
            <router-link to="/review-center">项目审查</router-link>：对照需求与设计文档进行评审留痕（当前为框架占位，可接入工作流后扩展）。
          </li>
          <li>
            <router-link to="/about">关于我们</router-link>：系统版本、团队与版权信息。
          </li>
        </ul>
      </section>

      <section class="help-section">
        <h2 class="section-h">已接入子应用</h2>
        <p class="hint">以下列表来自应用中心注册表，新增子应用后会自动出现在应用中心与本节。</p>
        <ul class="app-list">
          <li v-for="app in subApps" :key="app.id" class="app-item">
            <span class="app-icon" aria-hidden="true">{{ app.icon }}</span>
            <div class="app-body">
              <router-link :to="app.to" class="app-name">{{ app.name }}</router-link>
              <span v-if="app.tag" class="tag" :class="app.tagClass">{{ app.tag }}</span>
              <p class="app-desc">{{ app.desc }}</p>
              <p class="app-meta">目录 <code>{{ app.folder }}</code> · 默认入口 <code>{{ app.to }}</code></p>
            </div>
          </li>
        </ul>
      </section>

      <section class="help-section">
        <h2 class="section-h">设计人员指南</h2>
        <ul>
          <li>使用 Vue 3 Composition API 开发组件，遵循项目目录结构与命名规范。</li>
          <li>使用 CSS 变量（《系统设计规范》）保持主应用与子应用视觉一致。</li>
          <li>新子应用按《主应用子应用接入规范》登记 <code>src/config/subApps.js</code> 并配置嵌套路由。</li>
          <li>需求与设计文档放在 <code>src/docs/子应用文档/&lt;appCode&gt;/</code>，与 SDD、PRD 模板对齐。</li>
          <li>确保响应式布局；子应用嵌入主应用时顶栏固定、主区高度由双栏布局承接。</li>
        </ul>
      </section>

      <section class="help-section">
        <h2 class="section-h">评审专家指南</h2>
        <ul>
          <li>在 <router-link to="/review-center">项目审查中心</router-link> 对照清单开展评审（规范、打包、单据等待办以页面为准）。</li>
          <li>核对子应用 PRD / SDD、门禁配置（<code>04-AI治理与审计/gate-config.json</code>）与验收覆盖。</li>
          <li>检查代码是否符合项目规范，验证功能、性能与可维护性。</li>
          <li>关注接口契约、状态机与异常路径是否在设计文档中有据可查。</li>
          <li>对问题给出可执行的修改建议，并在评审文档中留痕。</li>
        </ul>
      </section>

      <section class="help-section help-section--last">
        <h2 class="section-h">开发与部署（参考）</h2>
        <p class="hint">详细步骤见仓库 <code>src/docs/系统文档/使用说明.md</code>。</p>
        <ul>
          <li>主应用开发：<code>npm run dev</code>（默认 <code>http://localhost:5173</code>）</li>
          <li>主应用构建：<code>npm run build</code> → <code>dist/</code></li>
          <li>示例子应用独立调试：<code>npm run dev:sample-app</code></li>
          <li>系统更新与回滚：<code>npm run update</code> / <code>npm run rollback</code>（见一键更新指南）</li>
        </ul>
      </section>

      <p class="version">当前版本：{{ systemVersion }} · 与<router-link to="/about">关于我们</router-link>保持一致</p>
    </div>
  </div>
</template>

<script setup>
import { subApps } from '../config/subApps.js'

const systemVersion = 'V2.3.0'
</script>

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
  margin-bottom: 28px;
}

.help-section--last {
  margin-bottom: 0;
}

.section-h {
  font-size: var(--font-size-title-sm);
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 12px;
}

.hint {
  margin: 0 0 12px;
  font-size: var(--font-size-caption);
  color: var(--color-text-3);
  line-height: 1.6;
}

.help-section ul,
.help-section ol {
  padding-left: 1.25rem;
  margin: 0;
  color: var(--color-text-2);
  line-height: 1.7;
}

.help-section li {
  margin-bottom: 8px;
}

.steps {
  padding-left: 1.35rem;
}

.help-section a {
  color: var(--color-primary);
  text-decoration: none;
}

.help-section a:hover {
  text-decoration: underline;
}

.help-section code {
  font-size: 0.9em;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--color-fill-1);
  color: var(--color-text-1);
}

.app-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.app-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-bg-1);
}

.app-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
  line-height: 1;
}

.app-body {
  min-width: 0;
  flex: 1;
}

.app-name {
  font-weight: 600;
  font-size: var(--font-size-body);
  margin-right: 8px;
}

.app-desc {
  margin: 6px 0 4px;
  font-size: var(--font-size-body);
  color: var(--color-text-2);
}

.app-meta {
  margin: 0;
  font-size: var(--font-size-caption);
  color: var(--color-text-3);
}

.version {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-caption);
  color: var(--color-text-3);
}

.version a {
  color: var(--color-primary);
  text-decoration: none;
}

.version a:hover {
  text-decoration: underline;
}
</style>
