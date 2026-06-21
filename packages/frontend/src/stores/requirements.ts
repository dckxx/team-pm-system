import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Requirement,
  StatusTransition,
  KanbanData,
  UpcomingItem,
} from '@pm-system/shared'
import type { CreateRequirementDto, UpdateRequirementDto, TransitionDto } from '@pm-system/shared'
import {
  getRequirements,
  getRequirementById,
  createRequirement as apiCreateRequirement,
  updateRequirement as apiUpdateRequirement,
  deleteRequirement as apiDeleteRequirement,
  transitionRequirement as apiTransitionStatus,
  getKanbanData as apiGetKanbanData,
  getUpcoming as apiGetUpcoming,
  getTransitions,
  exportCsv,
} from '@/api/requirements'

interface RequirementFilters {
  projectId: string | null
  status: string | null
  priority: string | null
  search: string
  page: number
  pageSize: number
}

export const useRequirementsStore = defineStore('requirements', () => {
  const requirements = ref<Requirement[]>([])
  const currentRequirement = ref<Requirement | null>(null)
  const total = ref(0)
  const loading = ref(false)
  const transitions = ref<StatusTransition[]>([])
  const kanbanData = ref<KanbanData | null>(null)
  const upcoming = ref<UpcomingItem[]>([])
  const filters = ref<RequirementFilters>({
    projectId: null,
    status: null,
    priority: null,
    search: '',
    page: 1,
    pageSize: 20,
  })

  const filteredRequirements = computed(() => {
    return requirements.value.filter((req) => {
      if (filters.value.projectId && req.projectId !== filters.value.projectId) {
        return false
      }
      if (filters.value.status && req.status !== filters.value.status) {
        return false
      }
      if (filters.value.priority && req.priority !== filters.value.priority) {
        return false
      }
      if (filters.value.search) {
        const q = filters.value.search.toLowerCase()
        if (
          !req.title.toLowerCase().includes(q) &&
          !req.code.toLowerCase().includes(q) &&
          !req.description.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  })

  async function fetchRequirements(params?: Record<string, unknown>): Promise<Requirement[]> {
    loading.value = true
    try {
      // Clean null values → undefined for Partial<RequirementQueryDto> compatibility
      const queryParams: Record<string, unknown> = {}
      for (const [key, value] of Object.entries({ ...filters.value, ...params })) {
        if (value !== null && value !== undefined) {
          queryParams[key] = value
        }
      }
      const res = await getRequirements(queryParams)
      requirements.value = res
      total.value = res.length
      return res
    } finally {
      loading.value = false
    }
  }

  async function fetchRequirement(id: string): Promise<Requirement> {
    loading.value = true
    try {
      const res = await getRequirementById(id)
      currentRequirement.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  async function createRequirement(data: CreateRequirementDto): Promise<Requirement> {
    loading.value = true
    try {
      const res = await apiCreateRequirement(data)
      requirements.value.push(res)
      return res
    } finally {
      loading.value = false
    }
  }

  async function updateRequirement(id: string, data: UpdateRequirementDto): Promise<Requirement> {
    loading.value = true
    try {
      const res = await apiUpdateRequirement(id, data)
      const index = requirements.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        requirements.value[index] = res
      }
      if (currentRequirement.value?.id === id) {
        currentRequirement.value = res
      }
      return res
    } finally {
      loading.value = false
    }
  }

  async function deleteRequirement(id: string): Promise<void> {
    loading.value = true
    try {
      await apiDeleteRequirement(id)
      requirements.value = requirements.value.filter((r) => r.id !== id)
      if (currentRequirement.value?.id === id) {
        currentRequirement.value = null
      }
    } finally {
      loading.value = false
    }
  }

  async function transitionStatus(id: string, data: { toStatus: string; comment?: string }): Promise<Requirement> {
    loading.value = true
    try {
      const req = requirements.value.find((r) => r.id === id) ?? currentRequirement.value
      const payload: TransitionDto = {
        toStatus: data.toStatus as TransitionDto['toStatus'],
        version: req?.version ?? 0,
        comment: data.comment,
      }
      const res = await apiTransitionStatus(id, payload)
      const index = requirements.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        requirements.value[index] = res
      }
      if (currentRequirement.value?.id === id) {
        currentRequirement.value = res
      }
      return res
    } finally {
      loading.value = false
    }
  }

  // Alias to match the task spec name
  const transitionRequirement = transitionStatus

  async function fetchKanbanData(): Promise<KanbanData> {
    loading.value = true
    try {
      const res = await apiGetKanbanData()
      kanbanData.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  async function fetchUpcoming(): Promise<UpcomingItem[]> {
    loading.value = true
    try {
      const res = await apiGetUpcoming()
      upcoming.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  async function fetchTransitions(id: string): Promise<StatusTransition[]>{
    loading.value = true
    try {
      const res = await getTransitions(id)
      transitions.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  async function exportCSV(): Promise<void> {
    loading.value = true
    try {
      const blob = await exportCsv()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `requirements-${Date.now()}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } finally {
      loading.value = false
    }
  }

  return {
    requirements,
    currentRequirement,
    total,
    loading,
    transitions,
    kanbanData,
    upcoming,
    filters,
    filteredRequirements,
    fetchRequirements,
    fetchRequirement,
    createRequirement,
    updateRequirement,
    deleteRequirement,
    transitionStatus,
    transitionRequirement,
    fetchKanbanData,
    fetchUpcoming,
    fetchTransitions,
    exportCSV,
  }
})
