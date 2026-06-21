import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@pm-system/shared'
import { login as apiLogin, getMe } from '@/api/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => token.value !== null)
  const userRole = computed<string | null>(() => user.value?.role ?? null)
  const isPM = computed(() => user.value?.role === 'pm')

  function setToken(newToken: string | null) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  async function login(email: string, password: string): Promise<User> {
    loading.value = true
    try {
      const res = await apiLogin(email, password)
      setToken(res.accessToken)
      user.value = res.user
      return res.user
    } finally {
      loading.value = false
    }
  }

  async function fetchMe(): Promise<User> {
    loading.value = true
    try {
      const res = await getMe()
      user.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  function logout() {
    setToken(null)
    user.value = null
    router.push('/login')
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    userRole,
    isPM,
    login,
    fetchMe,
    logout,
    setToken,
  }
})
