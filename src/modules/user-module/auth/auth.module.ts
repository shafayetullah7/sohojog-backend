import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PasswordManagerModule } from 'src/modules/common/password-manager/password-manager.module';
import { JwtUtilsModule } from 'src/modules/common/jwt/jwt-utils.module';
import { JwtStrategy } from './auth-strategies/jwt.strategy';
import { EnvConfigModule } from 'src/env-config/env.config.module';
import { ResponseBuilderModule } from 'src/modules/common/response-builder/response.builder.module';
import { UserService } from '../user/user.service';
import { GoogleStrategy } from './auth-strategies/google.strategy';
import { LocalAuthService } from './services/local/local.auth.service';
import { GoogleAuthService } from './services/google/google.auth.service';
import { JwtRefreshStrategy } from './auth-strategies/jwt.refresh.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/modules/common/email/email.service';
import { EmailModule } from 'src/modules/common/email/email.module';
import { OtpModule } from 'src/modules/common/otp/otp.module';

@Module({
  imports: [
    PasswordManagerModule,
    PrismaModule,
    JwtUtilsModule,
    EnvConfigModule,
    ResponseBuilderModule,
    EmailModule,
    OtpModule,
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
