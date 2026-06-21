<template>
  <div class="app-select">
    <label
      v-if="label"
      class="app-select__label block text-body text-gray-700 mb-1.5 font-medium"
    >
      {{ label }}
    </label>
    <div class="relative">
      <select
        :value="modelValue"
        :disabled="disabled"
        class="app-select__field w-full rounded border bg-white px-3 py-2 pr-8 text-body text-gray-800 transition-all ease-standard focus:outline-none appearance-none cursor-pointer"
        :class="selectClasses"
        @change="handleChange"
      >
        <option
          v-if="placeholder"
          value=""
          disabled
        >
          {{ placeholder }}
        </option>
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
      <i
        class="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"
        aria-hidden="true"
      ></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface SelectOption {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  modelValue?: string
  options?: SelectOption[]
  placeholder?: string
  disabled?: boolean
  label?: string
}>(), {
  modelValue: '',
  options: () => [],
  placeholder: '请选择',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const selectClasses = computed(() => {
  if (props.disabled) return 'bg-gray-100 opacity-60 cursor-not-allowed border-gray-200'
  return 'border-gray-300 hover:border-primary-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
})

function handleChange(e: Event) {
  const target = e.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>
