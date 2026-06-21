import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma.service';

describe('PrismaService soft-delete middleware', () => {
  let middlewareFn: (params: any, next: any) => Promise<any>;

  beforeAll(() => {
    // Spy on $use to capture the middleware function registered in constructor
    const $useSpy = jest.spyOn(PrismaClient.prototype, '$use');
    // Creating the instance triggers constructor → this.$use(middleware)
    new PrismaService();
    // Capture the middleware function (first argument to $use)
    middlewareFn = $useSpy.mock.calls[0][0];
    $useSpy.mockRestore();
  });

  describe('Requirement model', () => {
    it('should convert delete → update with isDeleted:true', async () => {
      const params = {
        model: 'Requirement',
        action: 'delete',
        args: { where: { id: 'req-1' } },
      };
      const next = jest.fn().mockResolvedValue({ id: 'req-1', isDeleted: true });

      await middlewareFn(params, next);

      expect(next).toHaveBeenCalledWith({
        model: 'Requirement',
        action: 'update',
        args: { where: { id: 'req-1' }, data: { isDeleted: true } },
      });
    });

    it('should convert deleteMany → updateMany with isDeleted:true', async () => {
      const params = {
        model: 'Requirement',
        action: 'deleteMany',
        args: { where: { projectId: 'proj-1' } },
      };
      const next = jest.fn().mockResolvedValue({ count: 3 });

      await middlewareFn(params, next);

      expect(next).toHaveBeenCalledWith({
        model: 'Requirement',
        action: 'updateMany',
        args: { where: { projectId: 'proj-1' }, data: { isDeleted: true } },
      });
    });

    it('should inject isDeleted filter on findUnique when not specified', async () => {
      const params = {
        model: 'Requirement',
        action: 'findUnique',
        args: { where: { id: 'req-1' } },
      };
      const next = jest.fn().mockResolvedValue(null);

      await middlewareFn(params, next);

      expect(next).toHaveBeenCalledWith({
        model: 'Requirement',
        action: 'findUnique',
        args: {
          where: { id: 'req-1', isDeleted: { not: true } },
        },
      });
    });

    it('should NOT inject isDeleted filter on findUnique when already specified', async () => {
      const params = {
        model: 'Requirement',
        action: 'findUnique',
        args: { where: { id: 'req-1', isDeleted: true } },
      };
      const next = jest.fn().mockResolvedValue(null);

      await middlewareFn(params, next);

      // Should pass through unchanged when isDeleted is explicitly set
      expect(next).toHaveBeenCalledWith(params);
    });

    it('should inject isDeleted filter on findMany', async () => {
      const params = {
        model: 'Requirement',
        action: 'findMany',
        args: { where: { projectId: 'proj-1' } },
      };
      const next = jest.fn().mockResolvedValue([]);

      await middlewareFn(params, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'findMany',
          args: {
            where: { projectId: 'proj-1', isDeleted: { not: true } },
          },
        }),
      );
    });
  });

  describe('Non-Requirement model', () => {
    it('should pass delete through unchanged for User model', async () => {
      const params = {
        model: 'User',
        action: 'delete',
        args: { where: { id: 'user-1' } },
      };
      const next = jest.fn().mockResolvedValue({ id: 'user-1' });

      await middlewareFn(params, next);

      // Should pass through unchanged (no conversion)
      expect(next).toHaveBeenCalledWith(params);
    });

    it('should pass findMany through unchanged for Comment model', async () => {
      const params = {
        model: 'Comment',
        action: 'findMany',
        args: { where: { requirementId: 'req-1' } },
      };
      const next = jest.fn().mockResolvedValue([]);

      await middlewareFn(params, next);

      expect(next).toHaveBeenCalledWith(params);
    });

    it('should pass create through unchanged for Requirement model', async () => {
      // create does not need soft-delete filtering
      const params = {
        model: 'Requirement',
        action: 'create',
        args: { data: { title: 'New' } },
      };
      const next = jest.fn().mockResolvedValue({ id: 'new-req' });

      await middlewareFn(params, next);

      expect(next).toHaveBeenCalledWith(params);
    });
  });
});
