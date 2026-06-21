<template>
  <span
    class="app-tag inline-flex items-center rounded-sm font-medium select-none"
    :class="[tagClasses, sizeClasses]"
  >
    {{ displayLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  type: 'priority-P0' | 'priority-P1' | 'priority-P2' | 'priority-P3'
    | 'status-pending_review' | 'status-developing' | 'status-testing' | 'status-launched'
    | 'role-pm' | 'role-dev' | 'role-frontend' | 'role-backend' | 'role-data'
}>(), {
  type: 'priority-P3',
})

const category = computed(() => props.type.split('-')[0])
const subValue = computed(() => {
  const idx = props.type.indexOf('-')
  return props.type.substring(idx + 1)
})

const styleDefs: Record<string, Record<string, { bg: string; text: string }>> = {
  priority: {
    P0: { bg: 'bg-danger-100', text: 'text-danger-600' },
    P1: { bg: 'bg-warning-100', text: 'text-warning-600' },
    P2: { bg: 'bg-primary-100', text: 'text-primary-600' },
    P3: { bg: 'bg-gray-100', text: 'text-gray-600' },
  },
  status: {
    pending_review: { bg: 'bg-warning-100', text: 'text-warning-600' },
    developing: { bg: 'bg-primary-100', text: 'text-primary-600' },
    testing: { bg: 'bg-amber-100', text: 'text-amber-600' },
    launched: { bg: 'bg-success-100', text: 'text-success-600' },
  },
  role: {
    pm: { bg: 'bg-primary-100', text: 'text-primary-600' },
    dev: { bg: 'bg-success-100', text: 'text-success-600' },
    frontend: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
    backend: { bg: 'bg-purple-100', text: 'text-purple-600' },
    data: { bg: 'bg-warning-100', text: 'text-warning-600' },
  },
}

const labelMap: Record<string, Record<string, string>> = {
  priority: { P0: 'P0 紧急', P1: 'P1 重要', P2: 'P2 一般', P3: 'P3 较低' },
  status: { pending_review: '待评审', developing: '开发中', testing: '测试中', launched: '已上线' },
  role: { pm: '产品经理', dev: '开发人员', frontend: '前端', backend: '后端', data: '数据' },
}

const displayLabel = computed(() => {
  return labelMap[category.value]?.[subValue.value] || props.type
})

const tagClasses = computed(() => {
  const entry = styleDefs[category.value]?.[subValue.value]
  if (entry) return `${entry.bg} ${entry.text}`
  return 'bg-gray-100 text-gray-600'
})

const sizeClasses = 'px-2.5 py-0.5 text-xs'
</script>
