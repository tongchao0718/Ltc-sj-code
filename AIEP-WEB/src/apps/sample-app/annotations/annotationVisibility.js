import { computed, ref } from 'vue'
import { PRD_ANNOTATION_ENABLED } from './enabled.js'

const STORAGE_KEY = 'sample-app-prd-annotation-visible'

function readStoredVisible() {
  if (typeof localStorage === 'undefined') return true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw === null ? true : raw === 'true'
  } catch {
    return true
  }
}

/** 用户是否显示角标（localStorage 持久化） */
export const prdAnnotationVisible = ref(readStoredVisible())

export function setPrdAnnotationUserVisible(value) {
  prdAnnotationVisible.value = value
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false')
  } catch {
    /* ignore */
  }
}

export function togglePrdAnnotationUserVisible() {
  setPrdAnnotationUserVisible(!prdAnnotationVisible.value)
}

/** 环境变量开启且用户未隐藏 */
export function usePrdAnnotationVisible() {
  return computed(() => PRD_ANNOTATION_ENABLED && prdAnnotationVisible.value)
}
