<template>
  <Teleport to="body">
    <Transition name="app-modal">
      <div
        v-if="visible"
        class="app-modal fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4"
        role="dialog"
        :aria-modal="true"
        :aria-label="title || 'dialog'"
      >
        <div
          class="app-modal__overlay absolute inset-0 bg-black/50"
          aria-hidden="true"
          @click="handleOverlayClick"
        ></div>
        <div
          class="app-modal__panel relative bg-white shadow-modal w-full flex flex-col h-full md:h-auto md:max-h-[90vh] md:rounded-lg"
          :style="panelStyle"
        >
          <div class="app-modal__header flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <h3 class="text-title text-gray-800 m-0">{{ title }}</h3>
            <button
              class="app-modal__close inline-flex items-center justify-center w-8 h-8 rounded-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all focus:outline-none"
              @click="handleClose"
              type="button"
              :aria-label="'关闭'"
            >
              <i class="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
          <div class="app-modal__body px-6 py-5 overflow-y-auto">
            <slot />
          </div>
          <div
            v-if="$slots.footer"
            class="app-modal__footer flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted, useSlots } from 'vue'

const props = withDefaults(defineProps<{
  visible: boolean
  title?: string
  width?: string
}>(), {
  title: '',
  width: '520px',
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const $slots = useSlots()

const panelStyle = computed(() => ({
  maxWidth: props.width || '520px',
}))

function handleClose() {
  emit('update:visible', false)
}

function handleOverlayClick() {
  handleClose()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.visible) {
    handleClose()
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  if (props.visible) {
    document.body.style.overflow = 'hidden'
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.app-modal-enter-active,
.app-modal-leave-active {
  transition: opacity 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.app-modal-enter-active .app-modal__panel,
.app-modal-leave-active .app-modal__panel {
  transition: transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.app-modal-enter-from,
.app-modal-leave-to {
  opacity: 0;
}
.app-modal-enter-from .app-modal__panel,
.app-modal-leave-to .app-modal__panel {
  transform: scale(0.95);
}
</style>
