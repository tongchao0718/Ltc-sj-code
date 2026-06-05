import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/** 独立 Hash / file 打包 vs 主应用嵌入 */
export function useCrmBase() {
  const route = useRoute()
  const router = useRouter()

  const base = computed(() => {
    const isStandalone =
      window.location.hash.startsWith('#/') || window.location.protocol === 'file:'
    return isStandalone ? '' : '/ai-smart-crm-admin'
  })

  const relPath = computed(() => {
    const p = route.path
    const b = base.value
    return b ? p.slice(b.length) || '/' : p
  })

  function crmPath(sub) {
    const path = sub.startsWith('/') ? sub : `/${sub}`
    return `${base.value}${path}`
  }

  function pushCrm(sub) {
    return router.push(crmPath(sub))
  }

  return { base, relPath, crmPath, pushCrm }
}
