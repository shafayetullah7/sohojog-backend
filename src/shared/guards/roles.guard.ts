import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../custom-decorator/roles.decorator';
import { Role } from '../enums/user.roles';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Retrieve required roles from the handler or class metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      // If no roles are required, allow access
      return true;
    }

    // Retrieve the request object from the execution context
    const { user } = context.switchToHttp().getRequest<Request>();
    console.log('user 1', user);

    if (!user) {
      // If no user is found, throw an unauthorized exception
      throw new UnauthorizedException('Unauthorized access.');
    }

    console.log('user', user);

    // Ensure `user.roles` is defined and check if the user has any of the required roles
    return requiredRoles.some((role) => user?.roles?.includes(role));
    // return false;
  }
}
