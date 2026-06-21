<template>
  <header
    class="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-6 shadow-sm"
  >
    <!-- Hamburger (mobile) + App name -->
    <button
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 lg:hidden"
      @click="$emit('toggle-mobile')"
    >
      <i class="fas fa-bars text-lg" />
    </button>
    <span class="text-title text-gray-800 hidden sm:inline">蓝本</span>

    <!-- Spacer -->
    <div class="flex-1" />

    <!-- User info -->
    <div class="flex items-center gap-3">
      <span class="text-sm font-medium text-gray-800 hidden sm:inline">{{ userName }}</span>

      <!-- Role badge -->
      <span
        v-if="authStore.user?.role"
        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-label font-medium"
        :class="roleBadgeClass"
      >
        {{ userRoleLabel }}
      </span>

      <!-- Logout button -->
      <button
        class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        title="退出登录"
        @click="handleLogout"
      >
        <i class="fas fa-sign-out-alt text-sm" />
        <span class="hidden sm:inline">退出</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

defineEmits<{
  (e: 'toggle-mobile'): void
}>()

const authStore = useAuthStore()

const userName = computed(() => authStore.user?.name || '用户')

const userRoleLabel = computed(() => {
  if (!authStore.user?.role) return ''
  const roleMap: Record<string, string> = {
    pm: '产品经理',
    dev: '开发人员',
  }
  return roleMap[authStore.user.role] || authStore.user.role
})

const roleBadgeClass = computed(() => {
  if (authStore.user?.role === 'pm') {
    return 'bg-primary-50 text-primary-600'
  }
  return 'bg-success-50 text-success-600'
})

function handleLogout(): void {
  authStore.logout()
}
</script>
