import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    isLoggedIn: false,
    token: ''
  }),
  getters: {
    getUserInfo: (state) => state.userInfo,
    getIsLoggedIn: (state) => state.isLoggedIn,
    getToken: (state) => state.token
  },
  actions: {
    setUserInfo(info) {
      this.userInfo = info
      this.isLoggedIn = true
    },
    setToken(token) {
      this.token = token
    },
    logout() {
      this.userInfo = null
      this.isLoggedIn = false
      this.token = ''
    }
  }
})