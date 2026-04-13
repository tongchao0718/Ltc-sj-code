import { defineStore } from 'pinia';
import apiService from '../../api/apiService';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    dashboardData: null,
    loading: false,
    error: null
  }),
  getters: {
    totalContent: (state) => state.dashboardData?.totalContent || 0,
    activeContent: (state) => state.dashboardData?.activeContent || 0,
    dailyComments: (state) => state.dashboardData?.dailyComments || 0,
    growthRate: (state) => state.dashboardData?.growthRate || 0
  },
  actions: {
    async fetchDashboardData() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.get('/dashboard/data');
        if (response.success) {
          this.dashboardData = response.data;
        } else {
          this.error = response.message || 'Failed to fetch dashboard data';
        }
      } catch (error) {
        this.error = error.message || 'Network error';
      } finally {
        this.loading = false;
      }
    }
  }
});