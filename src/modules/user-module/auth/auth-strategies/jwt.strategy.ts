import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvConfigService } from 'src/env-config/env.config.service';
import { JwtUser } from 'src/shared/interfaces/jwt.user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly envConfigService: EnvConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: envConfigService.jwtSecret,
    });
  }
  async validate(payload: JwtUser) {
    console.log('payload', payload);
    return payload;
  }
}
