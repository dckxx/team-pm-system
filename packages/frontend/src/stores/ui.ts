import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

let toastIdSeed = 0

export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(false)
  const currentRouteName = ref<string>('')
  const explicitPageTitle = ref<string | null>(null)
  const activeModal = ref<string | null>(null)
  const toasts = ref<Toast[]>([])

  const pageTitle = computed<string | null>(() => explicitPageTitle.value)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setPageTitle(title: string | null) {
    explicitPageTitle.value = title
  }

  function openModal(name: string) {
    activeModal.value = name
  }

  function closeModal() {
    activeModal.value = null
  }

  const showModal = openModal
  const hideModal = closeModal

  function showToast(type: Toast['type'], message: string) {
    const id = ++toastIdSeed
    toasts.value.push({ id, type, message })
    setTimeout(() => {
      removeToast(id)
    }, 3000)
  }

  function addToast(message: string, type: Toast['type'] = 'info', duration: number = 3000) {
    const id = ++toastIdSeed
    toasts.value.push({ id, type, message })
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  function removeToast(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    sidebarCollapsed,
    currentRouteName,
    pageTitle,
    activeModal,
    toasts,
    toggleSidebar,
    setPageTitle,
    openModal,
    closeModal,
    showModal,
    hideModal,
    showToast,
    addToast,
    removeToast,
  }
})
