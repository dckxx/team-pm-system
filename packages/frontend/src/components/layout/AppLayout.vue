<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Mobile backdrop -->
    <transition name="fade">
      <div
        v-if="mobileOpen"
        class="fixed inset-0 z-20 bg-black/50 lg:hidden"
        @click="mobileOpen = false"
      />
    </transition>

    <!-- Mobile sidebar (overlay, transform) — fullscreen on <md, w-64 on md-lg -->
    <transition name="slide">
      <div v-if="mobileOpen" class="fixed inset-0 z-30 lg:hidden">
        <Sidebar />
      </div>
    </transition>

    <!-- Desktop sidebar (fixed) -->
    <div class="hidden lg:block">
      <Sidebar />
    </div>

    <!-- Main content area -->
    <div class="flex min-h-screen flex-1 flex-col lg:ml-64">
      <Header @toggle-mobile="mobileOpen = !mobileOpen" />
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
const mobileOpen = ref(false)

// Sync mobile sidebar state with store for cross-component awareness.
// When the overlay sidebar is open on tablet/mobile, reflect it as non-collapsed.
watch(mobileOpen, (val) => {
  uiStore.sidebarCollapsed = !val
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
