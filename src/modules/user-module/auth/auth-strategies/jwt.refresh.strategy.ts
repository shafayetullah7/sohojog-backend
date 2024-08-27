import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';
import { EnvConfigService } from 'src/env-config/env.config.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly envConfig: EnvConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        const token = req.cookies?.sohojogRefreshToken;
        if (!token) {
          return null;
        }
        return token;
      },
      secretOrKey: envConfig.refreshTokenSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtUser) {
    const refreshToken = req.cookies?.refreshToken;
    const user = await this.prismaService.user.findFirst({
      where: { id: payload.userId },
    });

    // console.log(payload, user);
    return payload;
  }
}
