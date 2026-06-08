import { ref } from 'vue'

const STORAGE_THEME = 'md-theme'

/** @type {import('vue').Ref<'blue' | 'green'>} */
export const marketingTheme = ref('blue')

export function restoreMarketingTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_THEME)
    if (saved === 'green' || saved === 'blue') marketingTheme.value = saved
  } catch {
    marketingTheme.value = 'blue'
  }
}

export function setMarketingTheme(next) {
  marketingTheme.value = next === 'green' ? 'green' : 'blue'
  try {
    localStorage.setItem(STORAGE_THEME, marketingTheme.value)
  } catch {
    /* ignore */
  }
}

export function toggleMarketingTheme() {
  setMarketingTheme(marketingTheme.value === 'blue' ? 'green' : 'blue')
}

export function useMarketingTheme() {
  return {
    theme: marketingTheme,
    setTheme: setMarketingTheme,
    toggleTheme: toggleMarketingTheme
  }
}
