<template>
  <div class="app-layout power-fee-scope">
    <aside class="app-sidebar" aria-label="侧栏菜单">
      <div class="sidebar-title">电费协议核查</div>
      <nav class="sidebar-nav">
        <div v-for="group in menuGroups" :key="group.key" class="nav-group">
          <button
            type="button"
            class="group-head"
            :aria-expanded="expanded[group.key]"
            @click="toggle(group.key)"
          >
            <span>{{ group.label }}</span>
            <span class="chev">{{ expanded[group.key] ? '▼' : '▶' }}</span>
          </button>
          <div v-show="expanded[group.key]" class="group-body">
            <router-link
              v-for="child in group.children"
              :key="child.to"
              :to="`${base}${child.to}`"
              class="menu-link"
              active-class="menu-link--active"
            >
              {{ child.label }}
            </router-link>
          </div>
        </div>
      </nav>
    </aside>
    <main class="app-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import { useRoute } from 'vue-router';
import './styles/power-fee-protocol-arco.css';

const menuGroups = [
  {
    key: 'protocol-mgmt',
    label: '协议核查管理',
    children: [
      { to: '/template', label: '协议模板库管理' },
      { to: '/sample', label: '协议样本标注管理' },
      { to: '/rule', label: '核查规则管理' },
      { to: '/task', label: '核查任务策略管理' }
    ]
  },
  {
    key: 'anomaly-govern',
    label: '异常分析及治理',
    children: [
      { to: '/check', label: '协议识别核查执行' },
      { to: '/extract', label: '协议信息提取引擎' },
      { to: '/parse', label: '协议信息解析' },
      { to: '/verify', label: '识别结果校核' },
      { to: '/problem', label: '识别问题结果记录' },
      { to: '/govern', label: '问题分析及治理' },
      { to: '/task-monitor', label: '核查任务监控' },
      { to: '/result-monitor', label: '核查结果监控' }
    ]
  },
  {
    key: 'capability-optimize',
    label: '识别能力优化',
    children: [
      { to: '/optimize', label: '协议识别能力优化' },
      { to: '/review', label: '协同复核' }
    ]
  },
  {
    key: 'aux-verify',
    label: '辅助验证',
    children: [{ to: '/full-flow', label: '全链路验证' }]
  }
];

const route = useRoute();
const base = computed(() => {
  const isStandalone = window.location.hash.startsWith('#/') || window.location.protocol === 'file:';
  return isStandalone ? '' : '/power-fee-protocol-check';
});

const expanded = reactive(Object.fromEntries(menuGroups.map((g) => [g.key, true])));

function toggle(key) {
  expanded[key] = !expanded[key];
}

function syncOpenFromRoute() {
  const p = route.path;
  const b = base.value;
  const rel = b ? p.slice(b.length) || '/' : p;
  for (const g of menuGroups) {
    const hit = g.children.some((c) => rel === c.to || rel.startsWith(`${c.to}/`));
    if (hit) expanded[g.key] = true;
  }
}

watch(
  () => route.path,
  () => syncOpenFromRoute(),
  { immediate: true }
);
</script>

<style scoped>
.app-layout {
  display: flex;
  flex: 1 1 0;
  align-items: stretch;
  min-height: 0;
  min-width: 0;
  width: 100%;
  overflow: hidden;
  background: #f0f2f5;
}

.app-sidebar {
  width: 228px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  align-self: stretch;
  background: #ffffff;
  border-right: 1px solid #e8e8e8;
  overflow: hidden;
}

.sidebar-title {
  flex-shrink: 0;
  padding: 14px 16px 10px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 24px;
  border-bottom: 1px solid #e8e8e8;
}

.sidebar-nav {
  flex: 1 1 0;
  min-height: 0;
  padding: 8px 0 12px;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.nav-group {
  margin-bottom: 4px;
}

.group-head {
  width: calc(100% - 16px);
  margin: 0 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 10px;
  border: none;
  border-radius: 4px;
  background: transparent;
  font-family: Arial, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  text-align: left;
}

.group-head:hover {
  background: #f0f0f0;
}

.chev {
  font-size: 10px;
  color: #999;
}

.group-body {
  padding: 4px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-link {
  display: flex;
  align-items: center;
  min-height: 36px;
  padding: 0 12px 0 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 400;
  color: #666;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.menu-link:hover {
  color: #165dff;
  background: #f0f0f0;
}

.menu-link--active {
  color: #165dff;
  background: #f0f9ff;
  font-weight: 500;
}

.app-content {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding: 16px 16px 28px;
  background: #f0f2f5;
}

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }

  .app-sidebar {
    width: 100%;
    flex: 0 0 auto;
    max-height: 42vh;
    min-height: 0;
    overflow: hidden;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  .sidebar-nav {
    max-height: 36vh;
  }

  .group-body {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
  }

  .menu-link {
    min-height: 34px;
    padding-left: 12px;
  }

  .app-content {
    flex: 1 1 0;
    min-height: 0;
    overflow-y: auto;
  }
}
</style>
