import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Project } from '@pm-system/shared'
import {
  getProjects,
  getProjectById,
  createProject as apiCreateProject,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
} from '@/api/projects'

export interface CreateProjectData {
  name: string
  description?: string
  leadId: string
}

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)

  async function fetchProjects(): Promise<Project[]> {
    loading.value = true
    try {
      const res = await getProjects()
      projects.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  async function fetchProject(id: string): Promise<Project> {
    loading.value = true
    try {
      const res = await getProjectById(id)
      currentProject.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  async function createProject(data: CreateProjectData): Promise<Project> {
    loading.value = true
    try {
      const res = await apiCreateProject(data)
      projects.value.push(res)
      return res
    } finally {
      loading.value = false
    }
  }

  async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
    loading.value = true
    try {
      const res = await apiUpdateProject(id, data)
      const index = projects.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        projects.value[index] = res
      }
      if (currentProject.value?.id === id) {
        currentProject.value = res
      }
      return res
    } finally {
      loading.value = false
    }
  }

  async function deleteProject(id: string): Promise<void> {
    loading.value = true
    try {
      await apiDeleteProject(id)
      projects.value = projects.value.filter((p) => p.id !== id)
      if (currentProject.value?.id === id) {
        currentProject.value = null
      }
    } finally {
      loading.value = false
    }
  }

  return {
    projects,
    currentProject,
    loading,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
  }
})
