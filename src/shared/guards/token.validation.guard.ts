// src/auth/guards/token-validation.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { UserService } from 'src/modules/user-module/user/user.service';
import { JwtUser } from '../interfaces/jwt.user.interface';

@Injectable()
export class TokenValidationGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const { user: jwtUser } = request;

    if (!jwtUser) {
      throw new UnauthorizedException('Unauthorized access');
    }

    const user = await this.userService.findUserById(jwtUser.userId);

    if (!user || !user.passwordChangedAt) {
      throw new UnauthorizedException('Unauthorized access');
    }

    // console.log(user.)

    // console.log(
    //   '----------',
    //   jwtUser.userId,
    //   jwtUser.iat,
    //   user.passwordChangedAt,
    // );

    // const tokenCreatedAt = moment.unix(jwtUser.iat);
    // const passwordChangedAt = moment(user.passwordChangedAt);
    const tokenCreatedAt = new Date(jwtUser.iat * 1000);
    const passwordChangedAt = new Date(user.passwordChangedAt);

    console.log(tokenCreatedAt, passwordChangedAt);

    // if (tokenCreatedAt.isBefore(passwordChangedAt)) {
    //   return false;
    // } else return true;

    if (tokenCreatedAt < passwordChangedAt) {
      throw new UnauthorizedException('Token is no longer valid');
    } else return true;
  }
}
