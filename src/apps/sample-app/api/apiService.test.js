import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiService from './apiService'
import axios from 'axios'

// Mock axios
vi.mock('axios', () => ({
  default: vi.fn()
}))

describe('apiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isOnline', () => {
    it('should return true when online', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true
      })
      expect(apiService.isOnline()).toBe(true)
    })

    it('should return false when offline', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      })
      expect(apiService.isOnline()).toBe(false)
    })
  })

  describe('request', () => {
    it('should return mock data when offline', async () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      })

      const result = await apiService.request({ url: '/user/info', method: 'get' })
      expect(result).toEqual({
        success: true,
        data: {
          id: 1,
          name: 'Admin',
          email: 'admin@example.com',
          avatar: 'https://via.placeholder.com/100'
        }
      })
    })

    it('should return axios response when online', async () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true
      })

      // Mock axios response
      const mockResponse = {
        data: {
          success: true,
          data: { test: 'data' }
        }
      }
      axios.mockResolvedValue(mockResponse)

      const result = await apiService.request({ url: '/test', method: 'get' })
      expect(result).toEqual(mockResponse.data)
      expect(axios).toHaveBeenCalledWith({
        url: '/test',
        method: 'get',
        baseURL: '/api',
        timeout: 10000
      })
    })

    it('should return mock data when axios fails', async () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true
      })

      // Mock axios error
      axios.mockRejectedValue(new Error('Network error'))

      const result = await apiService.request({ url: '/user/info', method: 'get' })
      expect(result).toEqual({
        success: true,
        data: {
          id: 1,
          name: 'Admin',
          email: 'admin@example.com',
          avatar: 'https://via.placeholder.com/100'
        }
      })
    })
  })

  describe('getMockData', () => {
    it('should return mock data for existing endpoint', () => {
      const result = apiService.getMockData('/api/user/info', 'get')
      expect(result).toEqual({
        success: true,
        data: {
          id: 1,
          name: 'Admin',
          email: 'admin@example.com',
          avatar: 'https://via.placeholder.com/100'
        }
      })
    })

    it('should return error for non-existent endpoint', () => {
      const result = apiService.getMockData('/api/non-existent', 'get')
      expect(result).toEqual({
        success: false,
        message: 'No mock data available'
      })
    })
  })

  describe('shortcut methods', () => {
    it('should call request with get method', async () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      })

      const result = await apiService.get('/user/info', { id: 1 })
      expect(result).toEqual({
        success: true,
        data: {
          id: 1,
          name: 'Admin',
          email: 'admin@example.com',
          avatar: 'https://via.placeholder.com/100'
        }
      })
    })

    it('should call request with post method', async () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      })

      const result = await apiService.post('/user/login', { email: 'test@example.com', password: 'password' })
      expect(result).toEqual({
        success: false,
        message: 'No mock data available'
      })
    })
  })
})