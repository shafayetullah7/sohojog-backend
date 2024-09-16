import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';
import { EnvConfigService } from 'src/env-config/env.config.service';

@Injectable()
export class JwtOtpStrategy extends PassportStrategy(Strategy, 'jwt-otp') {
  constructor(private readonly envConfigService: EnvConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: envConfigService.otpTokenSecret,
    });
  }
  async validate(payload: JwtUser) {
    // console.log('payload', payload);
    return payload;
  }
}
