<template>
  <div class="marketing-demo-scope" :class="theme === 'green' ? 'md-theme-green' : ''">
    <div class="md-shell">
      <header class="md-topbar">
        <div class="md-topbar-brand">
          <div class="md-topbar-logo">⚡</div>
          <span>YX-XT-DEMO</span>
        </div>
        <div class="md-topbar-actions">
          <div class="md-theme-switch" role="group" aria-label="主题切换">
            <button
              type="button"
              class="md-theme-btn"
              :class="{ 'md-theme-btn--active': theme === 'blue' }"
              title="蓝色主题"
              @click="setTheme('blue')"
            >蓝</button>
            <button
              type="button"
              class="md-theme-btn"
              :class="{ 'md-theme-btn--active': theme === 'green' }"
              title="绿色主题"
              @click="setTheme('green')"
            >绿</button>
          </div>
          <button
            type="button"
            class="md-layout-toggle"
            :title="collapsed ? '展开侧栏' : '收缩侧栏'"
            :aria-expanded="!collapsed"
            @click="toggleSidebar"
          >▦ {{ collapsed ? '' : '布局' }}</button>
          <button type="button">🔔 <span class="md-badge">{{ messageCount }}</span></button>
          <div class="md-user">
            <span class="md-avatar">江</span>
            <span>江小电</span>
          </div>
        </div>
      </header>

      <div class="md-tabs">
        <div
          v-for="tab in tabState.tabs"
          :key="tab.key"
          class="md-tab"
          :class="{ 'md-tab--active': tabState.activeKey === tab.path }"
          @click="openTab(tab.path, tab.title)"
        >
          {{ tab.title }}
          <button
            v-if="tab.closable"
            type="button"
            class="md-tab-close"
            @click.stop="closeTab(tab.key)"
          >×</button>
        </div>
      </div>

      <div class="md-body">
        <aside class="md-sidebar" :class="{ 'md-sidebar--collapsed': collapsed }">
          <nav>
            <div v-for="mod in menuModules" :key="mod.key" class="md-nav-module">
              <!-- 一级：直接子菜单（如首页） -->
              <template v-if="mod.children && !mod.subGroups">
                <button
                  type="button"
                  class="md-nav-l1"
                  :title="collapsed ? mod.label : undefined"
                  @click="onModuleClick(mod)"
                >
                  <span class="md-nav-label">
                    <span class="md-nav-icon" aria-hidden="true">{{ mod.icon }}</span>
                    <span class="md-nav-text">{{ mod.label }}</span>
                  </span>
                  <span v-if="!collapsed" class="md-nav-arrow">{{ expandedModules[mod.key] ? '▼' : '▶' }}</span>
                </button>
                <div v-show="!collapsed && expandedModules[mod.key]" class="md-nav-l2-wrap">
                  <a
                    v-for="item in mod.children"
                    :key="item.path"
                    href="#"
                    class="md-nav-link"
                    :class="{ 'md-nav-link--active': isNavActive(item.path, relPath) }"
                    @click.prevent="onNav(item)"
                  >{{ item.label }}</a>
                </div>
              </template>

              <!-- 一级：含二级分组（如售电公司 Demo） -->
              <template v-else-if="mod.subGroups">
                <button
                  type="button"
                  class="md-nav-l1"
                  :class="{ 'md-nav-l1--active': activeModuleKey === mod.key }"
                  :title="collapsed ? mod.label : undefined"
                  @click="onModuleClick(mod)"
                >
                  <span class="md-nav-label">
                    <span class="md-nav-icon" aria-hidden="true">{{ mod.icon }}</span>
                    <span class="md-nav-text">{{ mod.label }}</span>
                  </span>
                  <span v-if="!collapsed" class="md-nav-arrow">{{ expandedModules[mod.key] ? '▼' : '▶' }}</span>
                </button>
                <div v-show="!collapsed && expandedModules[mod.key]" class="md-nav-l2-wrap">
                  <div v-for="group in mod.subGroups" :key="group.key" class="md-nav-sub-group">
                    <button
                      type="button"
                      class="md-nav-l2"
                      :class="{ 'md-nav-l2--active': activeSubGroupKey === group.key }"
                      :title="collapsed ? group.label : undefined"
                      @click="toggleSubGroup(group.key)"
                    >
                      <span class="md-nav-label">
                        <span class="md-nav-icon" aria-hidden="true">{{ group.icon }}</span>
                        <span class="md-nav-text">{{ group.label }}</span>
                      </span>
                      <span v-if="!collapsed" class="md-nav-arrow md-nav-arrow--sm">{{ expandedSubGroups[group.key] ? '▼' : '▶' }}</span>
                    </button>
                    <div v-show="expandedSubGroups[group.key]" class="md-nav-l3-wrap">
                      <a
                        v-for="item in group.children"
                        :key="item.path"
                        href="#"
                        class="md-nav-link md-nav-link--l3"
                        :class="{ 'md-nav-link--active': isNavActive(item.path, relPath) }"
                        @click.prevent="onNav(item)"
                      >{{ item.label }}</a>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </nav>
        </aside>

        <main class="md-main">
          <MdBreadcrumb :items="breadcrumbItems" />
          <div class="md-main-scroll">
            <router-view />
          </div>
          <div id="md-modal-host" class="md-modal-host" aria-hidden="true"></div>
        </main>
      </div>
    </div>
    <MdMessage ref="messageHost" />
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch, onMounted } from 'vue'
import './styles/marketing-demo.css'
import {
  menuModules,
  findModuleKey,
  findSubGroupKey,
  findBreadcrumbTrail,
  isNavActive
} from './config/menu.js'
import { useMarketingBase } from './composables/useMarketingBase.js'
import { useMarketingTabs } from './composables/useMarketingTabs.js'
import { restoreMarketingTheme, useMarketingTheme } from './composables/useMarketingTheme.js'
import { marketingStore } from './store/marketingStore.js'
import { registerMessageHost } from './composables/useMdMessage.js'
import MdMessage from './components/MdMessage.vue'
import MdBreadcrumb from './components/MdBreadcrumb.vue'

const STORAGE_SIDEBAR = 'md-sidebar-collapsed'

const messageHost = ref(null)
const { theme, setTheme } = useMarketingTheme()

onMounted(() => {
  registerMessageHost(messageHost.value)
  restoreSidebarCollapsed()
  restoreMarketingTheme()
})

const { relPath } = useMarketingBase()
const { tabState, openTab, closeTab } = useMarketingTabs()

const breadcrumbItems = computed(() => findBreadcrumbTrail(relPath.value))

const collapsed = ref(false)
const messageCount = computed(() => marketingStore.messages.length)

function restoreSidebarCollapsed() {
  try {
    collapsed.value = localStorage.getItem(STORAGE_SIDEBAR) === 'true'
  } catch {
    collapsed.value = false
  }
}

function toggleSidebar() {
  collapsed.value = !collapsed.value
  try {
    localStorage.setItem(STORAGE_SIDEBAR, String(collapsed.value))
  } catch {
    /* ignore */
  }
}

const expandedModules = reactive(
  Object.fromEntries(menuModules.map((m) => [m.key, m.key === 'home' || m.key === 'power-sales-demo']))
)

const expandedSubGroups = reactive(
  Object.fromEntries(
    menuModules
      .flatMap((m) => m.subGroups || [])
      .map((g) => [g.key, ['integration', 'query'].includes(g.key)])
  )
)

const activeModuleKey = computed(() => findModuleKey(relPath.value))
const activeSubGroupKey = computed(() => findSubGroupKey(relPath.value))

watch(relPath, (path) => {
  const modKey = findModuleKey(path)
  if (modKey) expandedModules[modKey] = true
  const subKey = findSubGroupKey(path)
  if (subKey) expandedSubGroups[subKey] = true
}, { immediate: true })

function toggleModule(key) {
  expandedModules[key] = !expandedModules[key]
}

function onModuleClick(mod) {
  if (collapsed.value) {
    if (mod.children?.length) {
      onNav(mod.children[0])
    } else if (mod.subGroups?.length) {
      const firstPage = mod.subGroups[0]?.children?.[0]
      if (firstPage) onNav(firstPage)
    }
    return
  }
  toggleModule(mod.key)
}

function toggleSubGroup(key) {
  expandedSubGroups[key] = !expandedSubGroups[key]
}

function onNav(item) {
  openTab(item.path, item.label)
}
</script>
