import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { DashboardStats, UpcomingItem } from '@pm-system/shared';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(userId: string): Promise<DashboardStats> {
    const [
      totalRequirements,
      pendingReview,
      developing,
      testing,
      launched,
      myTasks,
    ] = await Promise.all([
      this.prisma.requirement.count({ where: { isDeleted: false } }),
      this.prisma.requirement.count({
        where: { isDeleted: false, status: 'pending_review' },
      }),
      this.prisma.requirement.count({
        where: { isDeleted: false, status: 'developing' },
      }),
      this.prisma.requirement.count({
        where: { isDeleted: false, status: 'testing' },
      }),
      this.prisma.requirement.count({
        where: { isDeleted: false, status: 'launched' },
      }),
      this.prisma.requirementDeveloper
        .findMany({
          where: {
            userId,
            requirement: { isDeleted: false },
          },
          select: { requirementId: true },
          distinct: ['requirementId'],
        })
        .then((rows) => rows.length),
    ]);

    // Average cycle time: days from plannedLaunch → actualOnline for launched requirements
    const launchedReqs = await this.prisma.requirement.findMany({
      where: {
        isDeleted: false,
        status: 'launched',
        plannedLaunch: { not: null },
        actualOnline: { not: null },
      },
      select: { plannedLaunch: true, actualOnline: true },
    });

    let avgCycleTime: number | null = null;
    if (launchedReqs.length > 0) {
      const totalDays = launchedReqs.reduce((sum, req) => {
        const planned = new Date(req.plannedLaunch!).getTime();
        const online = new Date(req.actualOnline!).getTime();
        return sum + (online - planned) / (1000 * 60 * 60 * 24);
      }, 0);
      avgCycleTime = Math.round((totalDays / launchedReqs.length) * 10) / 10;
    }

    return {
      totalRequirements,
      pendingReview,
      developing,
      testing,
      launched,
      myTasks,
      avgCycleTime,
    };
  }

  async getUpcoming(userId: string): Promise<UpcomingItem[]> {
    const now = new Date();

    const requirements = await this.prisma.requirement.findMany({
      where: {
        isDeleted: false,
        status: { not: 'launched' },
        OR: [
          { plannedLaunch: { not: null } },
          { plannedOnline: { not: null } },
        ],
      },
      select: {
        id: true,
        code: true,
        title: true,
        status: true,
        plannedLaunch: true,
        plannedOnline: true,
      },
      take: 20,
    });

    const items: UpcomingItem[] = requirements
      .map((req) => {
        // Use plannedLaunch as primary date, fall back to plannedOnline
        const dateStr = req.plannedLaunch || req.plannedOnline!;
        const date = new Date(dateStr);
        return {
          id: req.id,
          code: req.code,
          title: req.title,
          status: req.status as UpcomingItem['status'],
          plannedLaunch: dateStr,
          overdue: date < now,
        };
      })
      .sort(
        (a, b) =>
          new Date(a.plannedLaunch).getTime() -
          new Date(b.plannedLaunch).getTime(),
      )
      .slice(0, 10);

    return items;
  }
}
