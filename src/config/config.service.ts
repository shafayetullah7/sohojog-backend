import { Injectable } from '@nestjs/common';
import { EnvConfigService } from 'src/env-config/env.config.service';

@Injectable()
export class ConfigService {
  constructor(private readonly envConfig: EnvConfigService) {}

  get(key: string): string {
    return this.envConfig[key] || '';
  }

  get websocketConfig() {
    return {
      namespace: '/chat',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    };
  }

  get jwtConfig() {
    return {
      secret: this.get('JWT_SECRET') || 'default_secret',
      expiresIn: '1h',
    };
  }

  get appPort(): number {
    return parseInt(this.get('APP_PORT') || '3000', 10);
  }
}
