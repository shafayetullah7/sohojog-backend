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

    console.log('user', user);

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

        // const differenceInSeconds = tokenCreatedAt.diff(
        //   passwordChangedAt,
        //   'milliseconds',
        // );

        // // Check the difference

        // console.log(`Difference in seconds: ${differenceInSeconds}`);

        // console.log('Token Created At:', tokenCreatedAt.unix());
        // console.log('Password Changed At:', passwordChangedAt.unix());
        // console.log(tokenCreatedAt.isBefore(passwordChangedAt));
        // console.log(tokenCreatedAt.isAfter(passwordChangedAt));
        if (tokenCreatedAt.isBefore(passwordChangedAt)) {
          throw new UnauthorizedException('Token is no longer valid');
        }
      }
    }

    return true;

    // Compare dates using Day.js
  }
}
