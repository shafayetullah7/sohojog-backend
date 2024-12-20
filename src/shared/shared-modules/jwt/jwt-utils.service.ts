import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../../../constants/interfaces/jwt.payload';
import { JwtService } from '@nestjs/jwt';
import { EnvConfigService } from 'src/env-config/env.config.service';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';

@Injectable()
export class JwtUtilsService {
  constructor(
    private jwtService: JwtService,
    private readonly envConfig: EnvConfigService,
  ) {}
  generateToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async validateAccessToken(token: string): Promise<JwtUser> {
    return await this.jwtService.verify(token, {
      secret: this.envConfig.jwtSecret,
    });
  }

  generateRefreshToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      secret: this.envConfig.refreshTokenSecret,
      expiresIn: '30d',
    });
  }

  async validateRefreshToken(token: string): Promise<any> {
    return await this.jwtService.verify(token, {
      secret: this.envConfig.refreshTokenSecret,
    });
  }

  generateOtpToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      secret: this.envConfig.otpTokenSecret,
      expiresIn: '3m',
    });
  }

  async validateOtpToken(token: string): Promise<any> {
    return await this.jwtService.verify(token, {
      secret: this.envConfig.otpTokenSecret,
    });
  }
}
