import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@pm-system/shared'
import { getUsers, getUserById, updateUser as apiUpdateUser } from '@/api/users'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const current = ref<User | null>(null)
  const loading = ref(false)

  async function fetchUsers(): Promise<User[]> {
    loading.value = true
    try {
      const res = await getUsers()
      users.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string): Promise<User> {
    loading.value = true
    try {
      const res = await getUserById(id)
      current.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id: string, data: Partial<User>): Promise<User> {
    loading.value = true
    try {
      const res = await apiUpdateUser(id, data)
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        users.value[index] = res
      }
      return res
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    current,
    loading,
    fetchUsers,
    fetchById,
    updateUser,
  }
})
