import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('status-distribution')
  async getStatusDistribution() {
    const data = await this.reportsService.getStatusDistribution();
    return { data };
  }

  @Get('priority-distribution')
  async getPriorityDistribution() {
    const data = await this.reportsService.getPriorityDistribution();
    return { data };
  }

  @Get('trend')
  async getTrend() {
    const data = await this.reportsService.getTrend();
    return { data };
  }
}
