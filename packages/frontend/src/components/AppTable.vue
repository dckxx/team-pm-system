<template>
  <div class="app-table relative">
    <div
      v-if="loading"
      class="app-table__loading absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded"
    >
      <i class="fas fa-spinner fa-spin text-primary-500 text-xl" aria-hidden="true"></i>
    </div>
    <div class="app-table__wrapper overflow-x-auto rounded border border-gray-200">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-50">
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 text-label font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap text-left"
              :class="col.sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''"
              @click="handleSort(col)"
            >
              <span class="inline-flex items-center gap-1">
                {{ col.label }}
                <span
                  v-if="col.sortable"
                  class="inline-flex flex-col text-[10px] leading-none text-gray-300"
                >
                  <i
                    class="fas fa-sort-up -mb-0.5"
                    :class="{ 'text-primary-500': sortState?.key === col.key && sortState.order === 'asc' }"
                  ></i>
                  <i
                    class="fas fa-sort-down -mt-0.5"
                    :class="{ 'text-primary-500': sortState?.key === col.key && sortState.order === 'desc' }"
                  ></i>
                </span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody v-if="!loading && data.length > 0">
          <tr
            v-for="(row, rowIdx) in data"
            :key="rowIdx"
            class="border-t border-gray-100 transition-colors hover:bg-gray-50"
            :class="rowIdx % 2 === 1 ? 'bg-gray-50/50' : ''"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 text-body text-gray-700"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="!loading && data.length === 0">
          <tr>
            <td
              :colspan="columns.length"
              class="px-4 py-12 text-center text-gray-400 text-body"
            >
              {{ emptyText }}
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="i in 3" :key="i">
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3"
            >
              <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface ColumnDef {
  key: string
  label: string
  sortable?: boolean
}

type SortOrder = 'asc' | 'desc'

interface SortState {
  key: string
  order: SortOrder
}

const props = withDefaults(defineProps<{
  columns: ColumnDef[]
  data: Record<string, unknown>[]
  loading?: boolean
  emptyText?: string
}>(), {
  loading: false,
  emptyText: '暂无数据',
})

const emit = defineEmits<{
  (e: 'sort', sortKey: string, sortOrder: SortOrder): void
}>()

const sortState = ref<SortState | null>(null)

function handleSort(col: ColumnDef) {
  if (!col.sortable) return
  if (sortState.value?.key === col.key) {
    sortState.value = {
      key: col.key,
      order: sortState.value.order === 'asc' ? 'desc' : 'asc',
    }
  } else {
    sortState.value = { key: col.key, order: 'asc' }
  }
  emit('sort', sortState.value.key, sortState.value.order)
}
</script>
