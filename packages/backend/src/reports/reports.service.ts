import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getStatusDistribution() {
    const groups = await this.prismaService.requirement.groupBy({
      by: ['status'],
      where: { isDeleted: { not: true } },
      _count: { id: true },
    });

    const statusConfig: Record<string, { name: string; color: string }> = {
      pending_review: { name: '待评审', color: '#f59e0b' },
      developing: { name: '开发中', color: '#3b82f6' },
      testing: { name: '测试中', color: '#8b5cf6' },
      launched: { name: '已上线', color: '#10b981' },
    };

    return groups.map((g) => ({
      name: statusConfig[g.status]?.name ?? g.status,
      value: g._count.id,
      color: statusConfig[g.status]?.color ?? '#9ca3af',
    }));
  }

  async getPriorityDistribution() {
    const groups = await this.prismaService.requirement.groupBy({
      by: ['priority'],
      where: { isDeleted: { not: true } },
      _count: { id: true },
    });

    const priorityConfig: Record<string, { name: string; color: string }> = {
      P0: { name: '紧急', color: '#ef4444' },
      P1: { name: '高', color: '#f97316' },
      P2: { name: '中', color: '#3b82f6' },
      P3: { name: '低', color: '#9ca3af' },
    };

    return groups.map((g) => ({
      name: priorityConfig[g.priority]?.name ?? g.priority,
      value: g._count.id,
      color: priorityConfig[g.priority]?.color ?? '#9ca3af',
    }));
  }

  async getTrend() {
    const now = new Date();
    const twelveWeeksAgo = new Date(now);
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 12 * 7);

    // Get Monday 00:00:00 of a given date
    const getMonday = (d: Date): Date => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      date.setDate(diff);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    const requirements = await this.prismaService.requirement.findMany({
      where: {
        isDeleted: { not: true },
        createdAt: { gte: twelveWeeksAgo },
      },
      select: { createdAt: true, status: true },
    });

    // Group by week (Monday key)
    const weekMap = new Map<string, { created: number; launched: number }>();

    for (const req of requirements) {
      const monday = getMonday(req.createdAt);
      const key = monday.toISOString().slice(0, 10); // YYYY-MM-DD

      const entry = weekMap.get(key) ?? { created: 0, launched: 0 };
      entry.created++;
      if (req.status === 'launched') {
        entry.launched++;
      }
      weekMap.set(key, entry);
    }

    // Build 12-week array (all weeks, even empty ones)
    const startMonday = getMonday(twelveWeeksAgo);
    const result: Array<{ period: string; created: number; launched: number }> = [];
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(startMonday);
      weekStart.setDate(weekStart.getDate() + i * 7);
      const key = weekStart.toISOString().slice(0, 10);
      const data = weekMap.get(key) ?? { created: 0, launched: 0 };
      result.push({
        period: key,
        created: data.created,
        launched: data.launched,
      });
    }

    return result;
  }
}
