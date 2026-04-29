<template>
  <div class="page-shell dashboard">
    <div class="dashboard-header">
      <div class="dashboard-intro">
        <h1 class="page-title">工作台</h1>
        <p class="page-subtitle">系统概览与快速入口（产品设计文档 · 仪表盘）</p>
      </div>
    </div>

    <div class="stat-grid">
      <div v-for="s in stats" :key="s.title" class="ds-card stat-card">
        <div class="ds-card__title">{{ s.title }}</div>
        <div class="stat-value">{{ s.value }}</div>
        <div class="stat-desc">{{ s.desc }}</div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">快速访问</h2>
      <div class="quick-links">
        <router-link to="/app-center" class="quick-link ds-card">
          <span class="link-icon" aria-hidden="true">🗂️</span>
          <div>
            <div class="link-text">应用中心</div>
            <div class="link-sub">从应用中心进入子应用</div>
          </div>
        </router-link>
        <router-link to="/sample-app/dashboard/workplace" class="quick-link ds-card">
          <span class="link-icon" aria-hidden="true">⚡</span>
          <div>
            <div class="link-text">示例应用</div>
            <div class="link-sub">侧栏分组菜单与业务页（自工作台进入）</div>
          </div>
        </router-link>
        <router-link to="/power-fee-protocol-check/template" class="quick-link ds-card">
          <span class="link-icon" aria-hidden="true">🧾</span>
          <div>
            <div class="link-text">电费协议核查</div>
            <div class="link-sub">M01 协议模板库列表（API-01）</div>
          </div>
        </router-link>
        <router-link to="/power-fee-protocol-check/full-flow" class="quick-link ds-card">
          <span class="link-icon" aria-hidden="true">🔗</span>
          <div>
            <div class="link-text">电费协议核查全链路验证</div>
            <div class="link-sub">API-02~API-08 执行验证工作台</div>
          </div>
        </router-link>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">指标概览</h2>
      <div class="metric-row">
        <div class="ds-card metric-card">
          <div class="metric-label">应用数量</div>
          <div class="metric-value">{{ metrics.appCount }}</div>
          <div class="metric-desc">已注册子应用（应用中心可见）</div>
        </div>
        <div class="ds-card metric-card">
          <div class="metric-label">页面数量</div>
          <div class="metric-value">{{ metrics.pageCount }}</div>
          <div class="metric-desc">主系统与子应用路由页合计（与当前路由配置一致）</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const stats = ref([
  { title: '已接入子应用', value: '2', desc: '可扩展为多应用架构' },
  { title: '今日访问（演示）', value: '—', desc: '接入统计服务后展示' },
  { title: '构建状态', value: '正常', desc: '主应用 + 子应用独立构建' },
  { title: '文档完备度', value: '基线', desc: '随业务迭代同步更新' }
])

/**
 * 与 `src/router/index.js` 当前配置保持一致，新增路由时请同步更新计数逻辑。
 * 主系统：dashboard、app-center、profile、review-center、help、about = 6
 * 示例子应用：dashboard×2 + visualization×2 + list×2 + form×2 + profile×1 + result×2 + exception×3 + user×2 = 16
 */
const metrics = computed(() => ({
  appCount: 2,
  pageCount: 6 + 16 + 1
}))

</script>

<style scoped>
.dashboard {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-intro {
  min-width: 0;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  min-height: 120px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-primary);
  line-height: 36px;
  margin-bottom: 4px;
}

.stat-desc {
  font-size: var(--font-size-caption);
  color: var(--color-text-3);
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: var(--font-size-title-sm);
  font-weight: 600;
  color: var(--color-text-1);
  margin-bottom: 12px;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  color: inherit;
}

.link-icon {
  font-size: 2rem;
}

.link-text {
  font-weight: 600;
  color: var(--color-text-1);
  margin-bottom: 4px;
}

.link-sub {
  font-size: var(--font-size-caption);
  color: var(--color-text-3);
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.metric-card {
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.metric-label {
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-text-2);
  margin-bottom: 8px;
}

.metric-value {
  font-size: 36px;
  font-weight: 600;
  line-height: 44px;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.metric-desc {
  font-size: var(--font-size-caption);
  color: var(--color-text-3);
  line-height: 1.5;
}

@media (max-width: 480px) {
  .stat-value {
    font-size: 22px;
    line-height: 28px;
  }

  .metric-value {
    font-size: 28px;
    line-height: 34px;
  }

  .link-icon {
    font-size: 1.5rem;
  }
}
</style>
