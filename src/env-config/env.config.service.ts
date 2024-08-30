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
      REFRESH_TOKEN_SECRET: this.configService.get<string>(
        'REFRESH_TOKEN_SECRET',
      ),
      OTP_TOKEN_SECRET: this.configService.get<string>('OTP_TOKEN_SECRET'),
      GOOGLE_CLIENT_ID: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      GOOGLE_CLIENT_SECRET: this.configService.get<string>(
        'GOOGLE_CLIENT_SECRET',
      ),
      GOOGLE_CALLBACK_URL: this.configService.get<string>(
        'GOOGLE_CALLBACK_URL',
      ),
      EMAIL_HOST: this.configService.get<string>('EMAIL_HOST'),
      EMAIL_PORT: this.configService.get<string>('EMAIL_PORT'),
      EMAIL_USER: this.configService.get<string>('EMAIL_USER'),
      EMAIL_PASS: this.configService.get<string>('EMAIL_PASS'),
      QEV_API: this.configService.get<string>('QEV_API'),
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
  get refreshTokenSecret(): string {
    return this.envConfig.REFRESH_TOKEN_SECRET;
  }
  get otpTokenSecret(): string {
    return this.envConfig.OTP_TOKEN_SECRET;
  }
  get nodeEnv(): string {
    return this.envConfig.NODE_ENV;
  }
  get googleClientId(): string {
    return this.envConfig.GOOGLE_CLIENT_ID;
  }
  get googleClientSecret(): string {
    return this.envConfig.GOOGLE_CLIENT_SECRET;
  }
  get googleCallbackUrl(): string {
    return this.envConfig.GOOGLE_CALLBACK_URL;
  }
  get emailHost(): string {
    return this.envConfig.EMAIL_HOST;
  }
  get emailPort(): number {
    return this.envConfig.EMAIL_PORT;
  }
  get emailUser(): string {
    return this.envConfig.EMAIL_USER;
  }
  get emailPass(): string {
    return this.envConfig.EMAIL_PASS;
  }
  get qevApi(): string {
    return this.envConfig.QEV_API;
  }
}
