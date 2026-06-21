import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { STATUS_FLOW, PRIORITY_LABELS, STATUS_LABELS } from '@pm-system/shared';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
import { TransitionDto } from './dto/transition.dto';
import { RequirementQueryDto } from './dto/requirement-query.dto';

@Injectable()
export class RequirementsService {
  constructor(private readonly prismaService: PrismaService) {}

  /** Base select for list responses */
  private readonly requirementSelect = {
    id: true,
    code: true,
    title: true,
    description: true,
    projectId: true,
    priority: true,
    status: true,
    creatorId: true,
    plannedLaunch: true,
    plannedOnline: true,
    actualDevStart: true,
    actualDevEnd: true,
    actualTestStart: true,
    actualTestEnd: true,
    actualOnline: true,
    tags: true,
    isDeleted: true,
    version: true,
    createdAt: true,
    updatedAt: true,
    project: {
      select: { id: true, name: true },
    },
    creator: {
      select: { id: true, name: true },
    },
    developers: {
      include: {
        user: { select: { id: true, name: true } },
      },
    },
  };

  private parseRequirement(req: any) {
    const { project, creator, developers, tags, ...rest } = req;
    return {
      ...rest,
      projectName: project?.name ?? null,
      creatorName: creator?.name ?? null,
      tags:
        typeof tags === 'string'
          ? JSON.parse(tags)
          : Array.isArray(tags)
            ? tags
            : [],
      developers: (developers ?? []).map((dev: any) => ({
        id: dev.id,
        requirementId: dev.requirementId,
        userId: dev.userId,
        userName: dev.user?.name ?? null,
        userEmail: dev.user?.email ?? null,
        role: dev.role,
      })),
    };
  }

  private async generateCode(): Promise<string> {
    const year = new Date().getFullYear().toString();
    const last = await this.prismaService.requirement.findFirst({
      where: { code: { startsWith: `REQ-${year}-` } },
      orderBy: { code: 'desc' },
      select: { code: true },
    });

    let seq = 1;
    if (last) {
      const parts = last.code.split('-');
      const num = parseInt(parts[2], 10);
      if (!isNaN(num)) {
        seq = num + 1;
      }
    }

    return `REQ-${year}-${String(seq).padStart(3, '0')}`;
  }

  async findAll(query: RequirementQueryDto) {
    const { projectId, status, priority, search } = query;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Record<string, unknown> = { isDeleted: false };

    if (projectId) {
      where.projectId = projectId;
    }
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { code: { contains: search } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prismaService.requirement.count({ where } as any),
      this.prismaService.requirement.findMany({
        where: where as any,
        select: this.requirementSelect,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: items.map((item) => this.parseRequirement(item)),
      pagination: { page, pageSize, total },
    };
  }

  async findById(id: string) {
    const req = await this.prismaService.requirement.findUnique({
      where: { id },
      select: this.requirementSelect,
    });

    if (!req || req.isDeleted) {
      throw new NotFoundException(`Requirement with id ${id} not found`);
    }

    // Fetch comments and transitions separately (relations with ordering)
    const [comments, transitions] = await Promise.all([
      this.prismaService.comment.findMany({
        where: { requirementId: id },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'asc' as const },
      }),
      this.prismaService.statusTransition.findMany({
        where: { requirementId: id },
        include: {
          operator: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'asc' as const },
      }),
    ]);

    const result = this.parseRequirement(req);
    return {
      data: {
        ...result,
        comments: comments.map((c) => ({
          id: c.id,
          requirementId: c.requirementId,
          authorId: c.authorId,
          authorName: c.author?.name ?? null,
          authorEmail: c.author?.email ?? null,
          content: c.content,
          mentions: (() => {
            try { return JSON.parse(c.mentions); } catch { return []; }
          })(),
          createdAt: c.createdAt,
        })),
        transitions: transitions.map((t) => ({
          id: t.id,
          requirementId: t.requirementId,
          fromStatus: t.fromStatus,
          toStatus: t.toStatus,
          operatorId: t.operatorId,
          operatorName: t.operator?.name ?? null,
          comment: t.comment,
          createdAt: t.createdAt,
        })),
      },
    };
  }

  async create(dto: CreateRequirementDto, creatorId: string) {
    // Validate project exists
    const project = await this.prismaService.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project || !project.isActive) {
      throw new BadRequestException(
        `Project with id ${dto.projectId} not found`,
      );
    }

    // Validate developer user IDs exist
    if (dto.developerIds && dto.developerIds.length > 0) {
      const devUserIds = dto.developerIds.map((d) => d.userId);
      const existingUsers = await this.prismaService.user.findMany({
        where: { id: { in: devUserIds }, isActive: true },
        select: { id: true },
      });
      const existingIds = new Set(existingUsers.map((u) => u.id));
      for (const uid of devUserIds) {
        if (!existingIds.has(uid)) {
          throw new BadRequestException(`User with id ${uid} not found`);
        }
      }
    }

    const code = await this.generateCode();

    const req = await this.prismaService.requirement.create({
      data: {
        code,
        title: dto.title,
        description: dto.description ?? '',
        projectId: dto.projectId,
        priority: dto.priority ?? 'P2',
        status: 'pending_review',
        creatorId,
        plannedLaunch: dto.plannedLaunch ?? null,
        plannedOnline: dto.plannedOnline ?? null,
        tags: JSON.stringify(dto.tags ?? []),
        version: 0,
        developers: dto.developerIds
          ? {
              create: dto.developerIds.map((dev) => ({
                userId: dev.userId,
                role: dev.role,
              })),
            }
          : undefined,
      },
      select: this.requirementSelect,
    });

    // Create initial status transition
    await this.prismaService.statusTransition.create({
      data: {
        requirementId: req.id,
        fromStatus: null,
        toStatus: 'pending_review',
        operatorId: creatorId,
        comment: '创建需求',
      },
    });

    return { data: this.parseRequirement(req) };
  }

  async update(id: string, dto: UpdateRequirementDto) {
    const existing = await this.prismaService.requirement.findUnique({
      where: { id },
      select: { id: true, isDeleted: true, version: true },
    });

    if (!existing || existing.isDeleted) {
      throw new NotFoundException(`Requirement with id ${id} not found`);
    }

    // Validate developer user IDs exist
    if (dto.developerIds && dto.developerIds.length > 0) {
      const devUserIds = dto.developerIds.map((d) => d.userId);
      const existingUsers = await this.prismaService.user.findMany({
        where: { id: { in: devUserIds }, isActive: true },
        select: { id: true },
      });
      const existingIds = new Set(existingUsers.map((u) => u.id));
      for (const uid of devUserIds) {
        if (!existingIds.has(uid)) {
          throw new BadRequestException(`User with id ${uid} not found`);
        }
      }
    }

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.plannedLaunch !== undefined) data.plannedLaunch = dto.plannedLaunch;
    if (dto.plannedOnline !== undefined) data.plannedOnline = dto.plannedOnline;
    if (dto.actualDevStart !== undefined) data.actualDevStart = dto.actualDevStart;
    if (dto.actualDevEnd !== undefined) data.actualDevEnd = dto.actualDevEnd;
    if (dto.actualTestStart !== undefined) data.actualTestStart = dto.actualTestStart;
    if (dto.actualTestEnd !== undefined) data.actualTestEnd = dto.actualTestEnd;
    if (dto.actualOnline !== undefined) data.actualOnline = dto.actualOnline;
    if (dto.tags !== undefined) data.tags = JSON.stringify(dto.tags);

    // Build where clause — include version for optimistic locking if provided
    const where: any = { id };
    if (dto.version !== undefined) {
      where.version = dto.version;
    }

    // Increment version for optimistic locking
    data.version = { increment: 1 };

    // Execute update and developer reassignment in a transaction
    try {
      await this.prismaService.$transaction(async (tx) => {
        // Update requirement record with optimistic locking
        await tx.requirement.update({ where, data });

        // Handle developer reassignment
        if (dto.developerIds !== undefined) {
          await tx.requirementDeveloper.deleteMany({
            where: { requirementId: id },
          });

          if (dto.developerIds.length > 0) {
            await tx.requirementDeveloper.createMany({
              data: dto.developerIds.map((dev) => ({
                requirementId: id,
                userId: dev.userId,
                role: dev.role,
              })),
            });
          }
        }
      });
    } catch (err) {
      if (
        dto.version !== undefined &&
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new ConflictException(
          `Requirement has been modified by another user. Please refresh and retry.`,
        );
      }
      throw err;
    }

    // Re-fetch with all relations for the response
    const updated = await this.prismaService.requirement.findUnique({
      where: { id },
      select: this.requirementSelect,
    });

    return { data: this.parseRequirement(updated) };
  }

  async archive(id: string) {
    const existing = await this.prismaService.requirement.findUnique({
      where: { id },
      select: { id: true, isDeleted: true },
    });

    if (!existing) {
      throw new NotFoundException(`Requirement with id ${id} not found`);
    }

    const updated = await this.prismaService.requirement.update({
      where: { id },
      data: { isDeleted: true },
      select: this.requirementSelect,
    });

    return { data: this.parseRequirement(updated) };
  }

  async transition(id: string, dto: TransitionDto, operatorId: string) {
    const existing = await this.prismaService.requirement.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        version: true,
        isDeleted: true,
        developers: {
          select: { userId: true },
        },
      },
    });

    if (!existing || existing.isDeleted) {
      throw new NotFoundException(`Requirement with id ${id} not found`);
    }

    // Validate transition against state machine
    const currentStatus = existing.status;
    const flowEntries = (STATUS_FLOW as Record<string, any[]>)[currentStatus];
    if (!flowEntries) {
      throw new BadRequestException(
        `No allowed transitions from status "${currentStatus}"`,
      );
    }

    // Find the specific flow entry matching the target status
    const flowEntry = flowEntries.find((e) => e.toStatus === dto.toStatus);
    if (!flowEntry) {
      const allowedToStatuses = flowEntries.map((e) => e.toStatus);
      throw new BadRequestException(
        `Cannot transition from "${currentStatus}" to "${dto.toStatus}". Allowed: ${allowedToStatuses.join(', ') || 'none'}`,
      );
    }

    // RBAC check: validate operator's role against the transition's required role
    const operator = await this.prismaService.user.findUnique({
      where: { id: operatorId },
      select: { id: true, role: true },
    });

    if (!operator) {
      throw new NotFoundException(`Operator user with id ${operatorId} not found`);
    }

    if (operator.role !== flowEntry.requiredRole) {
      throw new ForbiddenException(
        `Transition from "${currentStatus}" to "${dto.toStatus}" requires role "${flowEntry.requiredRole}". Your role is "${operator.role}".`,
      );
    }

    // requireDeveloper check: if the transition requires the operator to be an assigned developer
    if (flowEntry.requireDeveloper) {
      const assignedUserIds = (existing.developers ?? []).map((d) => d.userId);
      if (assignedUserIds.length === 0) {
        throw new BadRequestException(
          `Cannot transition from "${currentStatus}" to "${dto.toStatus}": no developers assigned to this requirement.`,
        );
      }
      if (!assignedUserIds.includes(operatorId)) {
        throw new ForbiddenException(
          `You must be an assigned developer to perform this transition.`,
        );
      }
    }

    // Atomic optimistic locking: use where clause with version
    try {
      const updated = await this.prismaService.requirement.update({
        where: { id, version: dto.version },
        data: {
          status: dto.toStatus,
          version: { increment: 1 },
        },
        select: this.requirementSelect,
      });

      // Create status transition record after successful update
      await this.prismaService.statusTransition.create({
        data: {
          requirementId: id,
          fromStatus: currentStatus,
          toStatus: dto.toStatus,
          operatorId,
          comment: dto.comment ?? null,
        },
      });

      return { data: this.parseRequirement(updated) };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new ConflictException(
          `Requirement has been modified by another user. Expected version ${dto.version}. Please refresh and retry.`,
        );
      }
      throw err;
    }
  }

  async getKanban() {
    const requirements = await this.prismaService.requirement.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        code: true,
        title: true,
        projectId: true,
        priority: true,
        status: true,
        plannedLaunch: true,
        plannedOnline: true,
        version: true,
        createdAt: true,
        project: { select: { id: true, name: true } },
        developers: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by status
    const columns: Record<string, any[]> = {
      pending_review: [],
      developing: [],
      testing: [],
      launched: [],
    };

    // Group by developer
    const byDeveloper: Record<string, { user: { id: string; name: string }; requirements: any[] }> = {};

    for (const req of requirements) {
      const item = {
        id: req.id,
        code: req.code,
        title: req.title,
        projectId: req.projectId,
        projectName: req.project?.name ?? null,
        priority: req.priority,
        status: req.status,
        plannedLaunch: req.plannedLaunch,
        plannedOnline: req.plannedOnline,
        version: req.version,
        createdAt: req.createdAt,
        developers: (req.developers ?? []).map((d) => ({
          id: d.id,
          userId: d.userId,
          userName: d.user?.name ?? null,
          role: d.role,
        })),
      };

      // Add to status column
      const statusKey = req.status as string;
      if (columns[statusKey]) {
        columns[statusKey].push(item);
      } else {
        columns[statusKey] = [item];
      }

      // Add to developer grouping
      for (const dev of req.developers ?? []) {
        if (!byDeveloper[dev.userId]) {
          byDeveloper[dev.userId] = {
            user: { id: dev.userId, name: dev.user?.name ?? 'Unknown' },
            requirements: [],
          };
        }
        byDeveloper[dev.userId].requirements.push(item);
      }
    }

    return {
      columns,
      byDeveloper: Object.values(byDeveloper),
    };
  }

  async getUpcoming() {
    const items = await this.prismaService.requirement.findMany({
      where: {
        isDeleted: false,
        status: { in: ['pending_review', 'developing'] },
      },
      select: {
        id: true,
        code: true,
        title: true,
        projectId: true,
        priority: true,
        status: true,
        plannedLaunch: true,
        plannedOnline: true,
        version: true,
        createdAt: true,
        project: { select: { id: true, name: true } },
        developers: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: [
        { plannedOnline: { sort: 'asc', nulls: 'last' } },
        { plannedLaunch: { sort: 'asc', nulls: 'last' } },
      ],
    });

    return {
      data: items.map((req) => ({
        id: req.id,
        code: req.code,
        title: req.title,
        projectId: req.projectId,
        projectName: req.project?.name ?? null,
        priority: req.priority,
        status: req.status,
        plannedLaunch: req.plannedLaunch,
        plannedOnline: req.plannedOnline,
        version: req.version,
        createdAt: req.createdAt,
        developers: (req.developers ?? []).map((d) => ({
          id: d.id,
          userId: d.userId,
          userName: d.user?.name ?? null,
          role: d.role,
        })),
      })),
    };
  }

  async getTransitions(id: string) {
    const existing = await this.prismaService.requirement.findUnique({
      where: { id },
      select: { id: true, isDeleted: true },
    });

    if (!existing || existing.isDeleted) {
      throw new NotFoundException(`Requirement with id ${id} not found`);
    }

    const transitions = await this.prismaService.statusTransition.findMany({
      where: { requirementId: id },
      include: {
        operator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      data: transitions.map((t) => ({
        id: t.id,
        requirementId: t.requirementId,
        fromStatus: t.fromStatus,
        toStatus: t.toStatus,
        operatorId: t.operatorId,
        operatorName: t.operator?.name ?? null,
        comment: t.comment,
        createdAt: t.createdAt,
      })),
    };
  }

  async exportCSV(query: RequirementQueryDto): Promise<string> {
    const { projectId, status, priority, search } = query;

    const where: Record<string, unknown> = { isDeleted: false };

    if (projectId) {
      where.projectId = projectId;
    }
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { code: { contains: search } },
      ];
    }

    const items = await this.prismaService.requirement.findMany({
      where: where as any,
      select: {
        code: true,
        title: true,
        priority: true,
        status: true,
        plannedLaunch: true,
        plannedOnline: true,
        actualOnline: true,
        tags: true,
        project: { select: { name: true } },
        creator: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // BOM for Excel Chinese compatibility
    const BOM = '\uFEFF';
    const headers = [
      '编号',
      '标题',
      '状态',
      '优先级',
      '项目',
      '创建人',
      '计划上线',
      '实际上线',
      '标签',
    ];

    const rows = items.map((item) => {
      const priorityLabel =
        (PRIORITY_LABELS as Record<string, string>)[item.priority] ??
        item.priority;
      const statusLabel =
        (STATUS_LABELS as Record<string, string>)[item.status] ??
        item.status;

      // Parse tags from JSON string to array
      const tags: string[] = (() => {
        try {
          const parsed = JSON.parse(item.tags as string);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })();

      return [
        this.escapeCSV(item.code),
        this.escapeCSV(item.title),
        this.escapeCSV(statusLabel),
        this.escapeCSV(priorityLabel),
        this.escapeCSV(item.project?.name ?? ''),
        this.escapeCSV(item.creator?.name ?? ''),
        this.escapeCSV(item.plannedOnline ?? item.plannedLaunch ?? ''),
        this.escapeCSV(item.actualOnline ?? ''),
        this.escapeCSV(tags.join(';')),
      ].join(',');
    });

    return BOM + headers.join(',') + '\n' + rows.join('\n');
  }

  private escapeCSV(value: string): string {
    if (!value) return '';
    // Escape double quotes and wrap in quotes if contains comma, quote, or newline
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
