import type {
  Requirement,
  StatusTransition,
  KanbanData,
  UpcomingItem,
  CreateRequirementDto,
  UpdateRequirementDto,
  TransitionDto,
} from '@pm-system/shared';
import client from './client';

export function getRequirements(
  query?: Record<string, unknown>,
): Promise<Requirement[]> {
  return client
    .get<{ data: Requirement[] }>('/requirements', { params: query })
    .then((r) => r.data.data);
}

export function getRequirementById(id: string): Promise<Requirement> {
  return client
    .get<{ data: Requirement }>(`/requirements/${id}`)
    .then((r) => r.data.data);
}

export function createRequirement(
  data: CreateRequirementDto,
): Promise<Requirement> {
  return client
    .post<{ data: Requirement }>('/requirements', data)
    .then((r) => r.data.data);
}

export function updateRequirement(
  id: string,
  data: UpdateRequirementDto,
): Promise<Requirement> {
  return client
    .patch<{ data: Requirement }>(`/requirements/${id}`, data)
    .then((r) => r.data.data);
}

export function transitionRequirement(
  id: string,
  data: TransitionDto,
): Promise<Requirement> {
  return client
    .patch<{ data: Requirement }>(`/requirements/${id}/transition`, data)
    .then((r) => r.data.data);
}

export function getKanbanData(): Promise<KanbanData> {
  return client
    .get<{ data: KanbanData }>('/requirements/kanban')
    .then((r) => r.data.data);
}

export function getUpcoming(): Promise<UpcomingItem[]> {
  return client
    .get<{ data: UpcomingItem[] }>('/requirements/upcoming')
    .then((r) => r.data.data);
}

export function getTransitions(id: string): Promise<StatusTransition[]> {
  return client
    .get<{ data: StatusTransition[] }>(`/requirements/${id}/transitions`)
    .then((r) => r.data.data);
}

export function deleteRequirement(id: string): Promise<void> {
  return client.patch(`/requirements/${id}/archive`);
}

export function exportCsv(params?: Record<string, any>): Promise<Blob> {
  return client
    .get('/requirements/export', { params, responseType: 'blob' })
    .then((r) => r.data);
}
