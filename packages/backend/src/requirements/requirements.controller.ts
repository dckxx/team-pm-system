import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirementsService } from './requirements.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
import { TransitionDto } from './dto/transition.dto';
import { RequirementQueryDto } from './dto/requirement-query.dto';

@Controller('api/requirements')
@UseGuards(RolesGuard)
export class RequirementsController {
  constructor(
    private readonly requirementsService: RequirementsService,
  ) {}

  @Get('export')
  async exportCSV(
    @Query() query: RequirementQueryDto,
    @Res() res: Response,
  ) {
    const csv = await this.requirementsService.exportCSV(query);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="requirements.csv"',
    );
    res.send(csv);
  }

  @Get('kanban')
  async getKanban() {
    return this.requirementsService.getKanban();
  }

  @Get('upcoming')
  async getUpcoming() {
    return this.requirementsService.getUpcoming();
  }

  @Get()
  async findAll(@Query() query: RequirementQueryDto) {
    return this.requirementsService.findAll(query);
  }

  @Get(':id/transitions')
  async getTransitions(@Param('id') id: string) {
    return this.requirementsService.getTransitions(id);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.requirementsService.findById(id);
  }

  @Post()
  @Roles('pm')
  async create(
    @Body() dto: CreateRequirementDto,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string };
    return this.requirementsService.create(dto, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRequirementDto,
  ) {
    return this.requirementsService.update(id, dto);
  }

  @Patch(':id/archive')
  async archive(@Param('id') id: string) {
    return this.requirementsService.archive(id);
  }

  @Post(':id/transition')
  async transition(
    @Param('id') id: string,
    @Body() dto: TransitionDto,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string };
    return this.requirementsService.transition(id, dto, user.id);
  }

}
