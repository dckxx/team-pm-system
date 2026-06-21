import type { DashboardStats, UpcomingItem } from '@pm-system/shared';
import client from './client';

export function getDashboardStats(): Promise<DashboardStats> {
  return getStats();
}

export function getStats(): Promise<DashboardStats> {
  return client.get<DashboardStats>('/dashboard/stats').then((r) => r.data);
}

export function getUpcoming(): Promise<UpcomingItem[]> {
  return client
    .get<{ data: UpcomingItem[] }>('/dashboard/upcoming')
    .then((r) => r.data.data);
}
