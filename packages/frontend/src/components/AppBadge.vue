<template>
  <span class="app-badge relative inline-flex align-middle">
    <slot />
    <sup
      v-if="showBadge"
      class="app-badge__content absolute -top-1.5 -right-1.5 inline-flex items-center justify-center rounded-full font-medium leading-none text-white pointer-events-none"
      :class="[dot ? 'w-2 h-2 min-w-0 p-0' : 'min-w-[18px] h-[18px] px-1.5 text-xs', colorClasses]"
    >
      <template v-if="!dot">{{ displayCount }}</template>
    </sup>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  count?: number
  dot?: boolean
  color?: string
}>(), {
  dot: false,
  color: 'danger-500',
})

const showBadge = computed(() => {
  if (props.dot) return true
  return props.count !== undefined && props.count !== null && props.count > 0
})

const displayCount = computed(() => {
  if (props.count === undefined || props.count === null) return ''
  if (props.count > 99) return '99+'
  return String(props.count)
})

const colorClasses = computed(() => {
  const map: Record<string, string> = {
    'danger-500': 'bg-danger-500',
    'primary-500': 'bg-primary-500',
    'success-500': 'bg-success-500',
    'warning-500': 'bg-warning-500',
    'gray-500': 'bg-gray-500',
  }
  return map[props.color] || 'bg-danger-500'
})
</script>
