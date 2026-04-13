import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDashboardStore } from './dashboard'
import apiService from '../../api/apiService'

// Mock apiService
vi.mock('../../api/apiService', () => ({
  default: {
    get: vi.fn()
  }
}))

describe('useDashboardStore', () => {
  let store

  beforeEach(() => {
    vi.clearAllMocks()
    store = useDashboardStore()
    // Reset store state
    store.$reset()
  })

  describe('state', () => {
    it('should have initial state', () => {
      expect(store.dashboardData).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('getters', () => {
    it('should return 0 when dashboardData is null', () => {
      expect(store.totalContent).toBe(0)
      expect(store.activeContent).toBe(0)
      expect(store.dailyComments).toBe(0)
      expect(store.growthRate).toBe(0)
    })

    it('should return dashboard data when dashboardData exists', () => {
      store.dashboardData = {
        totalContent: 1234,
        activeContent: 890,
        dailyComments: 156,
        growthRate: 12.5
      }

      expect(store.totalContent).toBe(1234)
      expect(store.activeContent).toBe(890)
      expect(store.dailyComments).toBe(156)
      expect(store.growthRate).toBe(12.5)
    })
  })

  describe('actions', () => {
    describe('fetchDashboardData', () => {
      it('should fetch dashboard data successfully', async () => {
        const mockDashboardData = {
          totalContent: 1234,
          activeContent: 890,
          dailyComments: 156,
          growthRate: 12.5
        }

        apiService.get.mockResolvedValue({
          success: true,
          data: mockDashboardData
        })

        await store.fetchDashboardData()

        expect(store.loading).toBe(false)
        expect(store.error).toBeNull()
        expect(store.dashboardData).toEqual(mockDashboardData)
        expect(apiService.get).toHaveBeenCalledWith('/dashboard/data')
      })

      it('should handle fetch error', async () => {
        apiService.get.mockResolvedValue({
          success: false,
          message: 'Failed to fetch dashboard data'
        })

        await store.fetchDashboardData()

        expect(store.loading).toBe(false)
        expect(store.error).toBe('Failed to fetch dashboard data')
        expect(store.dashboardData).toBeNull()
      })

      it('should handle network error', async () => {
        apiService.get.mockRejectedValue(new Error('Network error'))

        await store.fetchDashboardData()

        expect(store.loading).toBe(false)
        expect(store.error).toBe('Network error')
        expect(store.dashboardData).toBeNull()
      })
    })
  })
})
