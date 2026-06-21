<template>
  <AppLayout v-if="!isLoginPage">
    <router-view />
  </AppLayout>
  <router-view v-else />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const authStore = useAuthStore()

const isLoginPage = computed(() => route.name === 'Login')

// On app init: if a token exists, restore the user session
onMounted(() => {
  if (authStore.token) {
    authStore.fetchMe().catch(() => authStore.logout())
  }
})
</script>
