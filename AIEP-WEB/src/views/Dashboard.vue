<template>
  <div class="page-shell dashboard">
    <div class="dashboard-header">
      <div class="dashboard-intro">
        <h1 class="page-title">工作台</h1>
        <p class="page-subtitle">AIEP 主应用 · 框架 v2.2.0 · 子应用统一入口与运行概览</p>
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
        <router-link
          v-for="item in quickLinks"
          :key="item.key"
          :to="item.to"
          class="quick-link ds-card"
        >
          <span class="link-icon" aria-hidden="true">{{ item.icon }}</span>
          <div>
            <div class="link-text">{{ item.name }}</div>
            <div class="link-sub">{{ item.sub }}</div>
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
import { computed } from 'vue'
import { subApps, getSubAppMetrics, MAIN_PAGE_COUNT } from '../config/subApps.js'

const QUICK_LINK_LIMIT = 3

const metrics = computed(() => getSubAppMetrics())

/** 首页快速入口：仅展示 3 个子应用（应用中心见顶栏导航） */
const quickLinks = computed(() =>
  subApps.slice(0, QUICK_LINK_LIMIT).map((app) => ({
    key: app.id,
    to: app.to,
    icon: app.icon,
    name: app.name,
    sub: app.desc
  }))
)

const stats = computed(() => [
  { title: '已接入子应用', value: String(metrics.value.appCount), desc: '注册表 subApps.js 驱动' },
  { title: '路由页面合计', value: String(metrics.value.pageCount), desc: `主系统 ${MAIN_PAGE_COUNT} 页 + 子应用路由` },
  { title: '框架版本', value: 'v2.2.0', desc: '离线更新包 · Agent Skills 已同步' },
  { title: '构建状态', value: '正常', desc: '主应用与子应用独立构建' }
])
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .quick-links {
    grid-template-columns: 1fr;
  }
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
