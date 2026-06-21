import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RequirementsService } from '../requirements.service';

describe('RequirementsService', () => {
  let service: RequirementsService;
  let prisma: any;

  const mockDate = new Date('2026-06-21T10:00:00Z');

  const mockProject = {
    id: 'proj-1',
    name: 'Test Project',
    description: 'A test project',
    leadId: 'lead-1',
    isActive: true,
    createdAt: mockDate,
  };

  const mockRequirement = {
    id: 'req-1',
    code: 'REQ-2026-001',
    title: 'Test Requirement',
    description: 'A test requirement',
    projectId: 'proj-1',
    priority: 'P2',
    status: 'pending_review',
    creatorId: 'pm-1',
    plannedLaunch: null,
    plannedOnline: null,
    actualDevStart: null,
    actualDevEnd: null,
    actualTestStart: null,
    actualTestEnd: null,
    actualOnline: null,
    tags: '[]',
    isDeleted: false,
    version: 0,
    createdAt: mockDate,
    updatedAt: mockDate,
    project: { id: 'proj-1', name: 'Test Project' },
    creator: { id: 'pm-1', name: 'PM User' },
    developers: [],
  };

  const mockPrisma = {
    requirement: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    statusTransition: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    comment: {
      findMany: jest.fn(),
    },
    requirementDeveloper: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequirementsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RequirementsService>(RequirementsService);
    prisma = module.get(PrismaService);
  });

  // ── create ──────────────────────────────────────────────────────

  describe('create', () => {
    const createDto = {
      title: 'New Requirement',
      description: 'Description',
      projectId: 'proj-1',
      priority: 'P2' as const,
      tags: ['backend', 'auth'],
    };

    it('should generate code in format REQ-2026-XXX and create requirement', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      // No existing requirement → code starts at 001
      mockPrisma.requirement.findFirst.mockResolvedValue(null);
      mockPrisma.requirement.create.mockResolvedValue(mockRequirement);
      mockPrisma.statusTransition.create.mockResolvedValue({});

      const result = await service.create(createDto, 'pm-1');

      expect(result.data).toBeDefined();
      expect(result.data.code).toMatch(/^REQ-2026-\d{3}$/);
      expect(mockPrisma.requirement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            code: expect.stringMatching(/^REQ-2026-\d{3}$/),
            title: 'New Requirement',
            projectId: 'proj-1',
            status: 'pending_review',
            creatorId: 'pm-1',
            version: 0,
          }),
        }),
      );
      // Should create an initial status transition
      expect(mockPrisma.statusTransition.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            requirementId: mockRequirement.id,
            fromStatus: null,
            toStatus: 'pending_review',
            operatorId: 'pm-1',
          }),
        }),
      );
    });

    it('should increment code sequence when earlier requirements exist', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      // Last requirement has code REQ-2026-005
      mockPrisma.requirement.findFirst.mockResolvedValue({
        code: 'REQ-2026-005',
      });
      const createdReq = {
        ...mockRequirement,
        code: 'REQ-2026-006',
      };
      mockPrisma.requirement.create.mockResolvedValue(createdReq);
      mockPrisma.statusTransition.create.mockResolvedValue({});

      const result = await service.create(createDto, 'pm-1');

      expect(result.data.code).toBe('REQ-2026-006');
    });

    it('should throw BadRequestException when project not found', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(
        service.create(createDto, 'pm-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── transition ──────────────────────────────────────────────────

  describe('transition', () => {
    const transitionDto = {
      toStatus: 'developing',
      version: 0,
      comment: 'Starting development',
    };

    const pendingReq = {
      id: 'req-1',
      status: 'pending_review',
      version: 0,
      isDeleted: false,
      developers: [],
    };

    const pmUser = {
      id: 'pm-1',
      role: 'pm',
    };

    beforeEach(() => {
      // Default mocks for a valid transition
      mockPrisma.requirement.findUnique.mockResolvedValue(pendingReq);
      mockPrisma.user.findUnique.mockResolvedValue(pmUser);
    });

    it('should transition from pending_review to developing with PM role', async () => {
      const updatedReq = {
        ...mockRequirement,
        status: 'developing',
        version: 1,
      };
      mockPrisma.requirement.update.mockResolvedValue(updatedReq);
      mockPrisma.statusTransition.create.mockResolvedValue({});

      const result = await service.transition('req-1', transitionDto, 'pm-1');

      expect(result.data.status).toBe('developing');
      expect(mockPrisma.requirement.update).toHaveBeenCalledWith({
        where: { id: 'req-1', version: 0 },
        data: {
          status: 'developing',
          version: { increment: 1 },
        },
        select: expect.any(Object),
      });
      expect(mockPrisma.statusTransition.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            requirementId: 'req-1',
            fromStatus: 'pending_review',
            toStatus: 'developing',
            operatorId: 'pm-1',
          }),
        }),
      );
    });

    it('should throw BadRequestException for invalid status flow (pending_review → testing)', async () => {
      const invalidDto = { toStatus: 'testing', version: 0 };

      await expect(
        service.transition('req-1', invalidDto, 'pm-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when operator role does not match required role', async () => {
      // DEV user tries to transition from pending_review (requires PM)
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'dev-1', role: 'dev' });

      await expect(
        service.transition('req-1', transitionDto, 'dev-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException when version mismatches (optimistic locking)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(pmUser);
      // Simulate Prisma P2025 error (record not found → version conflict)
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '5.22.0' },
      );
      mockPrisma.requirement.update.mockRejectedValue(prismaError);

      await expect(
        service.transition('req-1', { toStatus: 'developing', version: 1 }, 'pm-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when requirement does not exist', async () => {
      mockPrisma.requirement.findUnique.mockResolvedValue(null);

      await expect(
        service.transition('req-1', transitionDto, 'pm-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
