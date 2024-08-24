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
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    console.log(requiredRoles);
    console.log('00000000');

    const { user } = context.switchToHttp().getRequest<Request>();
    console.log(user);
    if (!user) {
      throw new UnauthorizedException('Unauthorized access.');
    }
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
