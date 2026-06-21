import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { UserRole } from '@pm-system/shared'
import { useAuthStore } from '@/stores/auth'

// Mock API module
vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  getMe: vi.fn(),
}))

// Mock router
vi.mock('@/router', () => ({
  default: {
    push: vi.fn(),
  },
}))

import * as authApi from '@/api/auth'

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('populates user and token after successful login', async () => {
    const mockUser = {
      id: '1',
      name: '测试用户',
      email: 'test@example.com',
      role: UserRole.PM,
      devRoles: [],
      avatarUrl: null,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'test-jwt-token',
      user: mockUser,
    })

    const store = useAuthStore()
    const result = await store.login('test@example.com', 'password')

    expect(result).toEqual(mockUser)
    expect(store.user).toEqual(mockUser)
    expect(store.token).toBe('test-jwt-token')
    expect(localStorage.getItem('token')).toBe('test-jwt-token')
  })

  it('clears user and token after logout', () => {
    const store = useAuthStore()
    // Set initial authenticated state
    store.token = 'test-jwt-token'
    store.user = {
      id: '1',
      name: '测试用户',
      email: 'test@example.com',
      role: UserRole.PM,
      devRoles: [],
      avatarUrl: null,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }
    localStorage.setItem('token', 'test-jwt-token')

    store.logout()

    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })
})
