import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PasswordManagerModule } from 'src/shared/utils/password-manager/password-manager.module';
import { JwtUtilsModule } from 'src/shared/utils/jwt-utils/jwt-utils.module';
import { JwtStrategy } from './auth-strategies/jwt.strategy';
import { EnvConfigModule } from 'src/env-config/env.config.module';
import { ResponseBuilderModule } from 'src/shared/utils/response-builder/response.builder.module';
import { UserService } from '../user/user.service';
import { GoogleStrategy } from './auth-strategies/google.strategy';
import { LocalAuthService } from './services/local/local.auth.service';
import { GoogleAuthService } from './services/google/google.auth.service';
import { JwtRefreshStrategy } from './auth-strategies/jwt.refresh.strategy';

@Module({
  imports: [
    PasswordManagerModule,
    PrismaModule,
    JwtUtilsModule,
    EnvConfigModule,
    ResponseBuilderModule,
  ],
  providers: [
    LocalAuthService,
    JwtStrategy,
    UserService,
    GoogleStrategy,
    GoogleAuthService,
    JwtRefreshStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
