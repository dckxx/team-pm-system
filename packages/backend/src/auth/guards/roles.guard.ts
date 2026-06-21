import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: { role: string } }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied: no authenticated user');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied: required role(s) [${requiredRoles.join(', ')}], but user has role '${user.role}'`,
      );
    }

    return true;
  }
}
