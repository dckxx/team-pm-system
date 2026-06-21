import type { Project } from '@pm-system/shared';
import client from './client';

export function getProjects(): Promise<Project[]> {
  return client.get<{ data: Project[] }>('/projects').then((r) => r.data.data);
}

export function getProjectById(id: string): Promise<Project> {
  return client
    .get<{ data: Project }>(`/projects/${id}`)
    .then((r) => r.data.data);
}

export function createProject(data: {
  name: string;
  description?: string;
  leadId: string;
}): Promise<Project> {
  return client
    .post<{ data: Project }>('/projects', data)
    .then((r) => r.data.data);
}

export function updateProject(
  id: string,
  data: Partial<Project>,
): Promise<Project> {
  return client
    .patch<{ data: Project }>(`/projects/${id}`, data)
    .then((r) => r.data.data);
}

export function deleteProject(id: string): Promise<void> {
  return client.delete(`/projects/${id}`);
}
