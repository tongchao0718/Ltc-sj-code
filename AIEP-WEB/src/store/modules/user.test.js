import { describe, it, expect, beforeEach } from 'vitest'
import { useUserStore } from './user'
import { createPinia, setActivePinia } from 'pinia'

describe('useUserStore', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  it('should have initial state', () => {
    const store = useUserStore()
    expect(store.userInfo).toBe(null)
    expect(store.isLoggedIn).toBe(false)
    expect(store.token).toBe('')
  })

  it('should set user info', () => {
    const store = useUserStore()
    const userInfo = {
      id: 1,
      name: 'Admin',
      email: 'admin@example.com'
    }
    store.setUserInfo(userInfo)
    expect(store.userInfo).toEqual(userInfo)
    expect(store.isLoggedIn).toBe(true)
  })

  it('should set token', () => {
    const store = useUserStore()
    const token = 'test-token'
    store.setToken(token)
    expect(store.token).toBe(token)
  })

  it('should logout', () => {
    const store = useUserStore()
    const userInfo = {
      id: 1,
      name: 'Admin',
      email: 'admin@example.com'
    }
    const token = 'test-token'
    
    store.setUserInfo(userInfo)
    store.setToken(token)
    store.logout()
    
    expect(store.userInfo).toBe(null)
    expect(store.isLoggedIn).toBe(false)
    expect(store.token).toBe('')
  })

  it('should get user info via getter', () => {
    const store = useUserStore()
    const userInfo = {
      id: 1,
      name: 'Admin',
      email: 'admin@example.com'
    }
    store.setUserInfo(userInfo)
    expect(store.getUserInfo).toEqual(userInfo)
  })

  it('should get isLoggedIn via getter', () => {
    const store = useUserStore()
    expect(store.getIsLoggedIn).toBe(false)
    store.setUserInfo({ id: 1, name: 'Admin' })
    expect(store.getIsLoggedIn).toBe(true)
  })

  it('should get token via getter', () => {
    const store = useUserStore()
    const token = 'test-token'
    store.setToken(token)
    expect(store.getToken).toBe(token)
  })
})