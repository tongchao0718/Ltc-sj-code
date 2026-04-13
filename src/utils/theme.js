const STORAGE_KEY = 'app-theme-preference'

/** @returns {'light' | 'dark'} */
export function getStoredTheme() {
  const v = localStorage.getItem(STORAGE_KEY)
  if (v === 'dark' || v === 'light') return v
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

/** @param {'light' | 'dark'} mode */
export function applyTheme(mode) {
  document.documentElement.dataset.theme = mode
  localStorage.setItem(STORAGE_KEY, mode)
}

export function initTheme() {
  applyTheme(getStoredTheme())
}
