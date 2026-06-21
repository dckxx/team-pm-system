<template>
  <div
    class="app-avatar inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none"
    :class="sizeClasses"
    :style="avatarStyle"
    :title="name"
  >
    <img
      v-if="src"
      :src="src"
      :alt="name"
      class="w-full h-full object-cover"
    />
    <span
      v-else
      class="text-white font-medium leading-none"
      :class="textSizeClasses"
    >
      {{ initial }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type AvatarSize = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  name: string
  src?: string | null
  size?: AvatarSize
}>(), {
  src: null,
  size: 'md',
})

const avatarColors = [
  '#165DFF', '#00B42A', '#FF7D00', '#F53F3F',
  '#722ED1', '#14C9C9', '#F7BA1E', '#3491FA',
  '#7BE188', '#FFCF8B', '#FBACA3', '#94BFFF',
]

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  return Math.abs(hash)
}

const colorIndex = computed(() => hashString(props.name || '?') % avatarColors.length)
const bgColor = computed(() => avatarColors[colorIndex.value])

const avatarStyle = computed(() => {
  if (props.src) return {}
  return { backgroundColor: bgColor.value }
})

const initial = computed(() => {
  if (!props.name) return '?'
  return props.name.charAt(0).toUpperCase()
})

const sizeMap: Record<AvatarSize, { container: string; text: string }> = {
  sm: { container: 'w-8 h-8', text: 'text-sm' },
  md: { container: 'w-10 h-10', text: 'text-base' },
  lg: { container: 'w-12 h-12', text: 'text-lg' },
}

const sizeClasses = computed(() => sizeMap[props.size].container)
const textSizeClasses = computed(() => sizeMap[props.size].text)
</script>
