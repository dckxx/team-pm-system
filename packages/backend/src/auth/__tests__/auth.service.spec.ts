import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';

// bcryptjs has non-configurable properties — mock the entire module
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: jest.Mocked<Pick<PrismaService, 'user'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed_password_123',
    role: 'pm',
    devRoles: '["frontend"]',
    avatarUrl: null,
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-06-01'),
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-jwt-token'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  // ── validateUser ────────────────────────────────────────────────

  describe('validateUser', () => {
    it('should return user without password field when valid userId', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser('user-1');

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id', 'user-1');
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).toHaveProperty('role', 'pm');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent-id');

      expect(result).toBeNull();
    });

    it('should return null when user is inactive', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      const result = await service.validateUser('user-1');

      expect(result).toBeNull();
    });
  });

  // ── login ───────────────────────────────────────────────────────

  describe('login', () => {
    it('should return accessToken and user object for correct credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'correct-password',
      });

      expect(result).toHaveProperty('accessToken', 'test-jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toMatchObject({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'pm',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'test@example.com',
        role: 'pm',
      });
    });

    it('should throw UnauthorizedException when email not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@example.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive during login', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
