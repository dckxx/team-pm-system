import type { ChartDataItem, ChartTrendItem } from '@pm-system/shared';
import client from './client';

export function getStatusDistribution(): Promise<ChartDataItem[]> {
  return client
    .get<{ data: ChartDataItem[] }>('/reports/status-distribution')
    .then((r) => r.data.data);
}

export function getPriorityDistribution(): Promise<ChartDataItem[]> {
  return client
    .get<{ data: ChartDataItem[] }>('/reports/priority-distribution')
    .then((r) => r.data.data);
}

export function getTrend(): Promise<ChartTrendItem[]> {
  return client
    .get<{ data: ChartTrendItem[] }>('/reports/trend')
    .then((r) => r.data.data);
}
