import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PasswordManagerModule } from 'src/shared/shared-modules/password-manager/password-manager.module';
import { JwtUtilsModule } from 'src/shared/shared-modules/jwt/jwt-utils.module';
import { JwtStrategy } from './auth-strategies/jwt.strategy';
import { EnvConfigModule } from 'src/env-config/env.config.module';
import { ResponseBuilderModule } from 'src/shared/shared-modules/response-builder/response.builder.module';
import { UserService } from '../user/user.service';
import { GoogleStrategy } from './auth-strategies/google.strategy';
import { LocalAuthService } from './services/local/local.auth.service';
import { GoogleAuthService } from './services/google/google.auth.service';
import { JwtRefreshStrategy } from './auth-strategies/jwt.refresh.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/shared/shared-modules/email/email.service';
import { EmailModule } from 'src/shared/shared-modules/email/email.module';
import { OtpModule } from 'src/shared/shared-modules/otp/otp.module';
import { EmailVerificationModule } from 'src/shared/shared-modules/email-verification/email-verification.module';
import { JwtOtpStrategy } from './auth-strategies/jwt.otp.strategy';
import { FileModule } from 'src/shared/shared-modules/file/file.module';

@Module({
  imports: [
    PasswordManagerModule,
    PrismaModule,
    JwtUtilsModule,
    EnvConfigModule,
    ResponseBuilderModule,
    EmailModule,
    OtpModule,
    EmailVerificationModule,
    forwardRef(() => FileModule),
  ],
  providers: [
    LocalAuthService,
    JwtStrategy,
    UserService,
    GoogleStrategy,
    GoogleAuthService,
    JwtRefreshStrategy,
    JwtOtpStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
