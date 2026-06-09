import { reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMarketingBase } from './useMarketingBase.js'
import { findMenuTitle } from '../config/menu.js'

const HOME_PATH = '/dashboard'

const state = reactive({
  tabs: [{ key: HOME_PATH, title: '首页', path: HOME_PATH, closable: false }],
  activeKey: HOME_PATH
})

export function useMarketingTabs() {
  const route = useRoute()
  const router = useRouter()
  const { mdPath, relPath } = useMarketingBase()

  function openTab(path, title) {
    const full = path.startsWith('/') ? path : `/${path}`
    const exists = state.tabs.find((t) => t.path === full)
    if (!exists) {
      state.tabs.push({
        key: full,
        title: title || full,
        path: full,
        closable: full !== HOME_PATH
      })
    }
    state.activeKey = full
    router.push(mdPath(full))
  }

  function closeTab(key) {
    const idx = state.tabs.findIndex((t) => t.key === key)
    if (idx === -1 || !state.tabs[idx].closable) return
    state.tabs.splice(idx, 1)
    if (state.activeKey === key) {
      const next = state.tabs[Math.max(0, idx - 1)] || state.tabs[0]
      state.activeKey = next.path
      router.push(mdPath(next.path))
    }
  }

  function syncFromRoute() {
    const p = relPath.value || HOME_PATH
    state.activeKey = p
    if (!state.tabs.some((t) => t.path === p)) {
      state.tabs.push({ key: p, title: findMenuTitle(p), path: p, closable: p !== HOME_PATH })
    }
  }

  watch(relPath, syncFromRoute, { immediate: true })

  return { tabState: state, openTab, closeTab }
}
