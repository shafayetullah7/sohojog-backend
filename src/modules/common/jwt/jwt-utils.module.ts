import { Module } from '@nestjs/common';
import { JwtUtilsService } from './jwt-utils.service';
import { EnvConfigModule } from 'src/env-config/env.config.module';
import { JwtModule } from '@nestjs/jwt';
import { EnvConfigService } from 'src/env-config/env.config.service';
import { JwtAuthGaurd } from '../../../shared/guards/jwt.auth.gaurd';

@Module({
  providers: [JwtUtilsService, JwtAuthGaurd],
  imports: [
    EnvConfigModule,
    JwtModule.registerAsync({
      imports: [EnvConfigModule],
      inject: [EnvConfigService],
      useFactory: async (EnvConfigService: EnvConfigService) => ({
        secret: EnvConfigService.jwtSecret,
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],
  exports: [JwtUtilsService, JwtAuthGaurd],
})
export class JwtUtilsModule {}
