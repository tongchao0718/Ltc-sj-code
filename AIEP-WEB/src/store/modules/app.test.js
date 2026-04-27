import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './app'
import { createPinia, setActivePinia } from 'pinia'

describe('useAppStore', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  it('should have initial state', () => {
    const store = useAppStore()
    expect(store.theme).toBe('light')
    expect(store.language).toBe('zh-CN')
    expect(store.sidebar.opened).toBe(true)
  })

  it('should set theme', () => {
    const store = useAppStore()
    store.setTheme('dark')
    expect(store.theme).toBe('dark')
  })

  it('should set language', () => {
    const store = useAppStore()
    store.setLanguage('en-US')
    expect(store.language).toBe('en-US')
  })

  it('should toggle sidebar', () => {
    const store = useAppStore()
    expect(store.sidebar.opened).toBe(true)
    store.toggleSidebar()
    expect(store.sidebar.opened).toBe(false)
    store.toggleSidebar()
    expect(store.sidebar.opened).toBe(true)
  })

  it('should get theme via getter', () => {
    const store = useAppStore()
    expect(store.getTheme).toBe('light')
    store.setTheme('dark')
    expect(store.getTheme).toBe('dark')
  })

  it('should get language via getter', () => {
    const store = useAppStore()
    expect(store.getLanguage).toBe('zh-CN')
    store.setLanguage('en-US')
    expect(store.getLanguage).toBe('en-US')
  })

  it('should get sidebar opened status via getter', () => {
    const store = useAppStore()
    expect(store.getSidebarOpened).toBe(true)
    store.toggleSidebar()
    expect(store.getSidebarOpened).toBe(false)
  })
})