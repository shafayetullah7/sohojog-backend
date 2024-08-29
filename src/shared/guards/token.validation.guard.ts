// src/auth/guards/token-validation.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { UserService } from 'src/modules/user-module/user/user.service';
import * as dayjs from 'dayjs';

@Injectable()
export class TokenValidationGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const { user: jwtUser } = request;

    if (!jwtUser || !jwtUser.iat) {
      throw new UnauthorizedException('Unauthorized access');
    }
    console.log('jwtUser', jwtUser);

    const user = await this.userService.findUserById(jwtUser.userId);

    if (!user) {
      throw new UnauthorizedException('Unauthorized access');
    }

    if (user.hasPassword) {
      if (!jwtUser.iat) {
        throw new UnauthorizedException('Unauthorizded');
      }

      // console.log(dayjs.unix(1724428387));

      if (user.hasPassword && user.passwordChangedAt) {
        const tokenCreatedAt = dayjs.unix(jwtUser.iat);
        const passwordChangedAt = dayjs(user.passwordChangedAt);

        console.log('Token Created At:', tokenCreatedAt.format());
        console.log('Password Changed At:', passwordChangedAt.format());
        if (tokenCreatedAt.isBefore(passwordChangedAt)) {
          throw new UnauthorizedException('Token is no longer valid');
        }
      }
    }

    return true;

    // Compare dates using Day.js
  }
}
