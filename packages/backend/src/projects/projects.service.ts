import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    const projects = await this.prismaService.project.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { requirements: true } },
        lead: { select: { id: true, name: true, email: true } },
      },
    });

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      leadId: project.leadId,
      leadName: project.lead?.name ?? null,
      isActive: project.isActive,
      createdAt: project.createdAt,
      requirementCount: project._count?.requirements ?? 0,
    }));
  }

  async findById(id: string) {
    const project = await this.prismaService.project.findUnique({
      where: { id },
      include: {
        _count: { select: { requirements: true } },
        lead: { select: { id: true, name: true, email: true } },
      },
    });

    if (!project || !project.isActive) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      leadId: project.leadId,
      lead: project.lead ?? null,
      isActive: project.isActive,
      createdAt: project.createdAt,
      requirementCount: project._count?.requirements ?? 0,
    };
  }

  async create(dto: CreateProjectDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: dto.leadId },
    });

    if (!user) {
      throw new BadRequestException(`User with id ${dto.leadId} not found`);
    }

    const project = await this.prismaService.project.create({
      data: {
        name: dto.name,
        description: dto.description ?? '',
        leadId: dto.leadId,
      },
      include: {
        lead: { select: { id: true, name: true, email: true } },
      },
    });

    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    const existing = await this.prismaService.project.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    if (dto.leadId !== undefined) {
      const user = await this.prismaService.user.findUnique({
        where: { id: dto.leadId },
      });
      if (!user) {
        throw new BadRequestException(`User with id ${dto.leadId} not found`);
      }
    }

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.leadId !== undefined) data.leadId = dto.leadId;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    const project = await this.prismaService.project.update({
      where: { id },
      data,
      include: {
        _count: { select: { requirements: true } },
        lead: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      leadId: project.leadId,
      lead: project.lead ?? null,
      isActive: project.isActive,
      createdAt: project.createdAt,
      requirementCount: project._count?.requirements ?? 0,
    };
  }
}
