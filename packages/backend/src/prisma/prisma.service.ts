import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
    this.$use(async (params, next) => {
      const { model, action, args } = params;

      // Only apply soft-delete to models with isDeleted field
      const softDeleteModels = ['Requirement'];

      if (model && softDeleteModels.includes(model)) {
        // Convert delete to update (soft delete)
        if (action === 'delete') {
          return next({
            ...params,
            action: 'update',
            args: { ...args, data: { isDeleted: true } },
          });
        }

        if (action === 'deleteMany') {
          return next({
            ...params,
            action: 'updateMany',
            args: { ...args, data: { isDeleted: true } },
          });
        }

        // Automatically filter out soft-deleted records on read operations
        if (action === 'findUnique' || action === 'findFirst' || action === 'findMany' || action === 'count') {
          if (!args.where) {
            args.where = {};
          }
          if (args.where.isDeleted === undefined) {
            args.where.isDeleted = { not: true };
          }
        }
      }

      return next(params);
    });
  }

  async softDelete(requirementId: string) {
    return this.requirement.update({
      where: { id: requirementId },
      data: { isDeleted: true },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
