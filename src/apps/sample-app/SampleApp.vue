<template>
  <div class="app-layout sample-app-scope">
    <aside class="app-sidebar" aria-label="侧栏菜单">
      <div class="sidebar-title">示例应用</div>
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
import { computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import './styles/sample-arco.css'

const menuGroups = [
  {
    key: 'dashboard',
    label: '仪表盘',
    children: [
      { to: '/dashboard/workplace', label: '工作台' },
      { to: '/dashboard/monitor', label: '实时监控' }
    ]
  },
  {
    key: 'visualization',
    label: '数据可视化',
    children: [
      { to: '/visualization/data-analysis', label: '数据分析' },
      { to: '/visualization/multi-dimension-data-analysis', label: '多维数据分析' }
    ]
  },
  {
    key: 'list',
    label: '列表页',
    children: [
      { to: '/list/search-table', label: '查询表格' },
      { to: '/list/card', label: '卡片列表' }
    ]
  },
  {
    key: 'form',
    label: '表单页',
    children: [
      { to: '/form/step', label: '分步表单' },
      { to: '/form/group', label: '分组表单' }
    ]
  },
  {
    key: 'profile',
    label: '详情页',
    children: [{ to: '/profile/basic', label: '基础详情页' }]
  },
  {
    key: 'result',
    label: '结果页',
    children: [
      { to: '/result/success', label: '成功页' },
      { to: '/result/error', label: '失败页' }
    ]
  },
  {
    key: 'exception',
    label: '异常页',
    children: [
      { to: '/exception/403', label: '403' },
      { to: '/exception/404', label: '404' },
      { to: '/exception/500', label: '500' }
    ]
  },
  {
    key: 'user',
    label: '个人中心',
    children: [
      { to: '/user/info', label: '个人资料' },
      { to: '/user/setting', label: '用户设置' }
    ]
  }
]

const route = useRoute()
const base = computed(() => (route.path.startsWith('/sample-app') ? '/sample-app' : ''))

const expanded = reactive(
  Object.fromEntries(menuGroups.map((g) => [g.key, true]))
)

function toggle(key) {
  expanded[key] = !expanded[key]
}

function syncOpenFromRoute() {
  const p = route.path
  const b = base.value
  const rel = b ? p.slice(b.length) || '/' : p
  for (const g of menuGroups) {
    const hit = g.children.some((c) => rel === c.to || rel.startsWith(`${c.to}/`))
    if (hit) expanded[g.key] = true
  }
}

watch(
  () => route.path,
  () => syncOpenFromRoute(),
  { immediate: true }
)
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
  background: var(--color-bg-1);
}

.app-sidebar {
  width: 228px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  align-self: stretch;
  background: var(--color-bg-2);
  border-right: 1px solid var(--color-border);
  overflow: hidden;
}

.sidebar-title {
  flex-shrink: 0;
  padding: 14px 16px 10px;
  font-size: var(--font-size-title-sm);
  font-weight: 600;
  color: var(--color-text-1);
  line-height: 24px;
  border-bottom: 1px solid var(--color-border);
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
  border-radius: var(--radius-button);
  background: transparent;
  font-family: inherit;
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-text-1);
  cursor: pointer;
  text-align: left;
}

.group-head:hover {
  background: var(--color-fill-1);
}

.chev {
  font-size: 10px;
  color: var(--color-text-3);
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
  border-radius: var(--radius-button);
  font-size: var(--font-size-body);
  font-weight: 400;
  color: var(--color-text-2);
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.menu-link:hover {
  color: var(--color-primary);
  background: var(--color-fill-1);
}

.menu-link--active {
  color: var(--color-primary);
  background: var(--color-primary-bg);
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
  background: var(--color-bg-1);
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
