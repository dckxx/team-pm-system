import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Req() req: Request) {
    const userId = (req.user as { id: string }).id;
    return this.dashboardService.getStats(userId);
  }

  @Get('upcoming')
  async getUpcoming(@Req() req: Request) {
    const userId = (req.user as { id: string }).id;
    const data = await this.dashboardService.getUpcoming(userId);
    return { data };
  }
}
