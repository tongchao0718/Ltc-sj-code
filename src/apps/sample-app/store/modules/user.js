import { defineStore } from 'pinia';
import apiService from '../../api/apiService';

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: null,
    loading: false,
    error: null
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.userInfo?.name || 'Guest'
  },
  actions: {
    async fetchUserInfo() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.get('/user/info');
        if (response.success) {
          this.userInfo = response.data;
        } else {
          this.error = response.message || 'Failed to fetch user info';
        }
      } catch (error) {
        this.error = error.message || 'Network error';
      } finally {
        this.loading = false;
      }
    },
    setToken(token) {
      this.token = token;
    },
    logout() {
      this.userInfo = null;
      this.token = null;
      this.error = null;
    }
  },
  persist: {
    paths: ['token', 'userInfo']
  }
});