import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    theme: 'light',
    language: 'zh-CN',
    sidebar: {
      opened: true
    }
  }),
  getters: {
    getTheme: (state) => state.theme,
    getLanguage: (state) => state.language,
    getSidebarOpened: (state) => state.sidebar.opened
  },
  actions: {
    setTheme(theme) {
      this.theme = theme
    },
    setLanguage(language) {
      this.language = language
    },
    toggleSidebar() {
      this.sidebar.opened = !this.sidebar.opened
    }
  }
})