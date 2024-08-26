import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../../../constants/interfaces/jwt.payload';
import { JwtService } from '@nestjs/jwt';
import { EnvConfigService } from 'src/env-config/env.config.service';

@Injectable()
export class JwtUtilsService {
  constructor(
    private jwtService: JwtService,
    private readonly envConfig: EnvConfigService,
  ) {}
  generateToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  generateRefreshToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      secret: this.envConfig.refreshTokenSecret,
      expiresIn: '10d',
    });
  }

  async validateAccessToken(token: string): Promise<any> {
    return await this.jwtService.verify(token, {
      secret: this.envConfig.jwtSecret,
    });
  }

  async validateRefreshToken(token: string): Promise<any> {
    return await this.jwtService.verify(token, {
      secret: this.envConfig.refreshTokenSecret,
    });
  }
}
