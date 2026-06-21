<template>
  <aside
    class="fixed left-0 top-0 z-30 flex h-screen w-full flex-col border-r border-gray-200 bg-gray-50 shadow-sm md:w-64"
  >
    <!-- Logo -->
    <div class="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 px-5">
      <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-white shadow-sm">
        <i class="fas fa-tasks text-sm" />
      </div>
      <span class="text-lg font-bold text-gray-800 tracking-wide">蓝本</span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-5">
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="nav-link flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all duration-200"
        :class="navLinkClass(item.path)"
      >
        <i
          :class="['fas', item.icon, 'w-5 shrink-0 text-center text-base']"
        />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

interface NavItem {
  name: string
  label: string
  icon: string
  path: string
}

const route = useRoute()

const navItems: NavItem[] = [
  { name: 'Dashboard', label: '仪表盘', icon: 'fa-tachometer-alt', path: '/dashboard' },
  { name: 'Requirements', label: '需求管理', icon: 'fa-tasks', path: '/requirements' },
  { name: 'Kanban', label: '看板视图', icon: 'fa-columns', path: '/kanban' },
  { name: 'Team', label: '团队管理', icon: 'fa-users', path: '/team' },
  { name: 'Reports', label: '统计报表', icon: 'fa-chart-bar', path: '/reports' },
]

function navLinkClass(path: string): string {
  const isActive = route.path === path
  if (isActive) {
    return 'border-l-[3px] border-primary-500 pl-[9px] bg-primary-50 text-primary-600 font-semibold'
  }
  return 'border-l-[3px] border-transparent pl-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
}
</script>

<style scoped>
.nav-link {
  border-left-width: 3px;
  border-left-style: solid;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
</style>
