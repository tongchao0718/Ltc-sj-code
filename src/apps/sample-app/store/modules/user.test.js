import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUserStore } from './user'
import apiService from '../../api/apiService'

// Mock apiService
vi.mock('../../api/apiService', () => ({
  default: {
    get: vi.fn()
  }
}))

describe('useUserStore', () => {
  let store

  beforeEach(() => {
    vi.clearAllMocks()
    store = useUserStore()
    // Reset store state
    store.$reset()
  })

  describe('state', () => {
    it('should have initial state', () => {
      expect(store.userInfo).toBeNull()
      expect(store.token).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('getters', () => {
    it('isLoggedIn should return false when token is null', () => {
      expect(store.isLoggedIn).toBe(false)
    })

    it('isLoggedIn should return true when token exists', () => {
      store.token = 'test-token'
      expect(store.isLoggedIn).toBe(true)
    })

    it('userName should return Guest when userInfo is null', () => {
      expect(store.userName).toBe('Guest')
    })

    it('userName should return user name when userInfo exists', () => {
      store.userInfo = { name: 'Test User' }
      expect(store.userName).toBe('Test User')
    })
  })

  describe('actions', () => {
    describe('fetchUserInfo', () => {
      it('should fetch user info successfully', async () => {
        const mockUserInfo = {
          id: 1,
          name: 'Test User',
          email: 'test@example.com'
        }

        apiService.get.mockResolvedValue({
          success: true,
          data: mockUserInfo
        })

        await store.fetchUserInfo()

        expect(store.loading).toBe(false)
        expect(store.error).toBeNull()
        expect(store.userInfo).toEqual(mockUserInfo)
        expect(apiService.get).toHaveBeenCalledWith('/user/info')
      })

      it('should handle fetch error', async () => {
        apiService.get.mockResolvedValue({
          success: false,
          message: 'Failed to fetch user info'
        })

        await store.fetchUserInfo()

        expect(store.loading).toBe(false)
        expect(store.error).toBe('Failed to fetch user info')
        expect(store.userInfo).toBeNull()
      })

      it('should handle network error', async () => {
        apiService.get.mockRejectedValue(new Error('Network error'))

        await store.fetchUserInfo()

        expect(store.loading).toBe(false)
        expect(store.error).toBe('Network error')
        expect(store.userInfo).toBeNull()
      })
    })

    describe('setToken', () => {
      it('should set token', () => {
        store.setToken('test-token')
        expect(store.token).toBe('test-token')
      })
    })

    describe('logout', () => {
      it('should reset user state', () => {
        store.userInfo = { name: 'Test User' }
        store.token = 'test-token'
        store.error = 'Some error'

        store.logout()

        expect(store.userInfo).toBeNull()
        expect(store.token).toBeNull()
        expect(store.error).toBeNull()
      })
    })
  })
})
