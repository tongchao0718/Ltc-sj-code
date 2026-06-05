<template>
  <div class="ai-smart-crm-scope">
    <router-view v-if="isFullPage" />
    <div v-else class="app-layout ai-smart-crm-layout">
      <aside class="app-sidebar" aria-label="CRM 管理台导航">
        <div class="sidebar-brand">
          <strong>AI 智能 CRM</strong>
          <small>Web 管理台</small>
        </div>
        <nav class="sidebar-nav">
          <div v-for="group in menuGroups" :key="group.key" class="nav-group">
            <button
              type="button"
              class="group-head"
              :aria-expanded="expanded[group.key]"
              @click="toggle(group.key)"
            >
              <span>{{ group.label }}</span>
              <span>{{ expanded[group.key] ? '▼' : '▶' }}</span>
            </button>
            <div v-show="expanded[group.key]">
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
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import './styles/crm-admin.css'
import { useCrmBase } from './composables/useCrmBase.js'

const route = useRoute()
const { base, relPath } = useCrmBase()
const fullPageRoutes = ['/login', '/mobile/preview']

const isFullPage = computed(() => fullPageRoutes.includes(relPath.value))

const menuGroups = [
  {
    key: 'work',
    label: '工作台',
    children: [{ to: '/dashboard', label: '管理仪表盘' }]
  },
  {
    key: 'crm',
    label: '客户中心',
    children: [
      { to: '/customers', label: '客户管理' },
      { to: '/leads', label: '线索管理' }
    ]
  },
  {
    key: 'sales',
    label: '销售管理',
    children: [{ to: '/opportunities', label: '商机管理' }]
  },
  {
    key: 'data',
    label: '数据中心',
    children: [
      { to: '/import', label: '数据导入' },
      { to: '/reports', label: '经营报表' }
    ]
  },
  {
    key: 'settings',
    label: '系统管理',
    children: [
      { to: '/settings/stages', label: '销售阶段' },
      { to: '/settings/pool', label: '公海规则' },
      { to: '/system/users', label: '用户管理' }
    ]
  },
  {
    key: 'design',
    label: '界面设计',
    children: [{ to: '/mobile/preview', label: 'APP 移动端原型' }]
  }
]

const expanded = reactive({
  work: true,
  crm: true,
  sales: true,
  data: false,
  settings: false,
  design: true
})

function toggle(key) {
  expanded[key] = !expanded[key]
}

watch(
  relPath,
  (path) => {
    if (path.startsWith('/customers') || path.startsWith('/leads')) expanded.crm = true
    if (path.startsWith('/settings') || path.startsWith('/system')) expanded.settings = true
    if (path.startsWith('/mobile')) expanded.design = true
    if (path.startsWith('/import') || path.startsWith('/reports')) expanded.data = true
  },
  { immediate: true }
)
</script>
