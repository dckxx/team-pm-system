<template>
  <div class="app-card bg-white rounded-lg shadow-sm p-4 hover:shadow-card-hover transition-shadow ease-standard">
    <div
      v-if="$slots.title"
      class="app-card__header pb-3 mb-3 border-b border-gray-100"
    >
      <slot name="title" />
    </div>
    <div class="app-card__body">
      <slot />
    </div>
    <div
      v-if="$slots.actions"
      class="app-card__footer mt-3 pt-3 border-t border-gray-100 flex items-center justify-end gap-2"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineSlots<{
  default: void
  title: void
  actions: void
}>()
</script>
