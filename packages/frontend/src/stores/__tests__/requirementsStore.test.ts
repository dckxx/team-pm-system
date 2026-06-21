import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { Priority, RequirementStatus } from '@pm-system/shared'
import { useRequirementsStore } from '@/stores/requirements'

// Mock all API modules
vi.mock('@/api/requirements', () => ({
  getRequirements: vi.fn(),
  getRequirementById: vi.fn(),
  createRequirement: vi.fn(),
  updateRequirement: vi.fn(),
  deleteRequirement: vi.fn(),
  transitionRequirement: vi.fn(),
  getKanbanData: vi.fn(),
  getUpcoming: vi.fn(),
  getTransitions: vi.fn(),
  exportCsv: vi.fn(),
}))

import * as reqApi from '@/api/requirements'

describe('requirementsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchRequirements updates list and total', async () => {
    const mockRequirements = [
      {
        id: '1',
        code: 'REQ-001',
        title: '需求一',
        description: '测试需求一',
        projectId: 'p1',
        priority: Priority.P1,
        status: RequirementStatus.DEVELOPING,
        creatorId: 'u1',
        creatorName: '张明',
        plannedLaunch: null,
        plannedOnline: null,
        actualDevStart: null,
        actualDevEnd: null,
        actualTestStart: null,
        actualTestEnd: null,
        actualOnline: null,
        tags: [],
        developers: [],
        version: 1,
        isDeleted: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        code: 'REQ-002',
        title: '需求二',
        description: '测试需求二',
        projectId: 'p2',
        priority: Priority.P2,
        status: RequirementStatus.PENDING_REVIEW,
        creatorId: 'u1',
        creatorName: '张明',
        plannedLaunch: null,
        plannedOnline: null,
        actualDevStart: null,
        actualDevEnd: null,
        actualTestStart: null,
        actualTestEnd: null,
        actualOnline: null,
        tags: [],
        developers: [],
        version: 1,
        isDeleted: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]

    vi.mocked(reqApi.getRequirements).mockResolvedValue(mockRequirements)

    const store = useRequirementsStore()
    await store.fetchRequirements()

    expect(store.requirements).toEqual(mockRequirements)
    expect(store.total).toBe(2)
    expect(reqApi.getRequirements).toHaveBeenCalledTimes(1)
  })
})
