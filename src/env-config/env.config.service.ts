import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { EnvConfigSchema } from './dto/env.config.dto';

@Injectable()
export class EnvConfigService {
  private envConfig: z.infer<typeof EnvConfigSchema>;

  constructor(private configService: ConfigService) {
    this.envConfig = this.validateEnv();
    // console.log(this.envConfig);
  }

  private getConfig(): Record<string, any> {
    return {
      NODE_ENV: this.configService.get<string>('NODE_ENV'),
      PORT: this.configService.get<string>('PORT'),
      DATABASE_URL: this.configService.get<string>('DATABASE_URL'),
      BCRYPT_SALT_ROUND: this.configService.get<string>('BCRYPT_SALT_ROUND'),
      JWT_SECRET: this.configService.get<string>('JWT_SECRET'),
    };
  }

  private validateEnv(): z.infer<typeof EnvConfigSchema> {
    const rawConfig = this.getConfig();

    // Parse and validate the config
    const parsedConfig = EnvConfigSchema.parse(rawConfig);

    return parsedConfig;
  }

  get port(): number {
    return this.envConfig.PORT;
  }
  get dbUrl(): string {
    return this.envConfig.DATABASE_URL;
  }
  get bcryptSaltRound(): number {
    return this.envConfig.BCRYPT_SALT_ROUND;
  }
  get jwtSecret(): string {
    return this.envConfig.JWT_SECRET;
  }
  get nodeEnv(): string {
    return this.envConfig.NODE_ENV;
  }
}
