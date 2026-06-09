import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const EMBED_PREFIX = '/marketing-demo'

export function useMarketingBase() {
  const route = useRoute()
  const router = useRouter()

  const base = computed(() => {
    const isStandalone =
      window.location.hash.startsWith('#/') || window.location.protocol === 'file:'
    return isStandalone ? '' : EMBED_PREFIX
  })

  const relPath = computed(() => {
    const p = route.path
    const b = base.value
    return b ? p.slice(b.length) || '/' : p
  })

  function mdPath(sub) {
    const path = sub.startsWith('/') ? sub : `/${sub}`
    return `${base.value}${path}`
  }

  function pushMd(sub) {
    return router.push(mdPath(sub))
  }

  return { base, relPath, mdPath, pushMd }
}
