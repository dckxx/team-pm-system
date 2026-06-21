<template>
  <button
    class="app-button inline-flex items-center justify-center font-medium rounded transition-all ease-standard focus:outline-none focus:ring-2 focus:ring-primary-300 select-none"
    :class="[variantClasses, sizeClasses, stateClasses]"
    :disabled="isDisabled"
    :aria-disabled="isDisabled"
    :aria-busy="loading"
    @click="handleClick"
  >
    <i v-if="loading" class="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const isDisabled = computed(() => props.disabled || props.loading)

const variantClasses = computed(() => {
  const map: Record<ButtonVariant, string> = {
    primary: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white border border-transparent',
    secondary: 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 border border-transparent',
    ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-600 border border-transparent',
    danger: 'bg-danger-500 hover:bg-danger-600 active:bg-danger-700 text-white border border-transparent',
  }
  return map[props.variant]
})

const sizeClasses = computed(() => {
  const map: Record<ButtonSize, string> = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-body',
    lg: 'px-6 py-3 text-lg',
  }
  return map[props.size]
})

const stateClasses = computed(() => {
  if (isDisabled.value) return 'opacity-50 cursor-not-allowed'
  return 'cursor-pointer active:scale-[0.98]'
})

function handleClick(event: MouseEvent) {
  if (isDisabled.value) return
  emit('click', event)
}
</script>
