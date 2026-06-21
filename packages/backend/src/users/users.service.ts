import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    devRoles: true,
    avatarUrl: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
    _count: {
      select: { requirementsAsDev: true },
    },
  };

  private parseUser(user: any) {
    if (!user) return null;
    const { _count, ...rest } = user;
    return {
      ...rest,
      devRoles: JSON.parse(rest.devRoles),
      requirementCount: _count?.requirementsAsDev ?? 0,
    };
  }

  async findAll() {
    const users = await this.prismaService.user.findMany({
      select: this.userSelect,
    });
    return users.map((u) => this.parseUser(u));
  }

  async findById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: this.userSelect,
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.parseUser(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const data: Record<string, unknown> = {};
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.devRoles !== undefined) data.devRoles = JSON.stringify(dto.devRoles);
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;

    const updated = await this.prismaService.user.update({
      where: { id },
      data,
      select: this.userSelect,
    });
    return this.parseUser(updated);
  }
}
