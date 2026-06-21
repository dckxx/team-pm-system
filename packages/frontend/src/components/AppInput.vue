<template>
  <div class="app-input">
    <label
      v-if="label"
      class="app-input__label block text-body text-gray-700 mb-1.5 font-medium"
    >
      {{ label }}
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="app-input__field w-full rounded border bg-white px-3 py-2 text-body text-gray-800 placeholder-gray-400 transition-all ease-standard focus:outline-none"
      :class="inputClasses"
      @input="handleInput"
    />
    <p
      v-if="error"
      class="app-input__error text-xs text-danger-500 mt-1"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type InputType = 'text' | 'password' | 'email'

const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  placeholder?: string
  error?: string
  type?: InputType
  disabled?: boolean
}>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputClasses = computed(() => {
  if (props.disabled) return 'bg-gray-100 opacity-60 cursor-not-allowed border-gray-200'
  if (props.error) return 'border-danger-500 focus:border-danger-500 focus:ring-1 focus:ring-danger-500'
  return 'border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
})

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>
