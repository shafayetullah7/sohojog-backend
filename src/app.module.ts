import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvConfigModule } from './env-config/env.config.module';
import { PrismaModule } from './prisma/prisma.module';
import { PasswordManagerModule } from './shared/shared-modules/password-manager/password-manager.module';
import { JwtUtilsModule } from './shared/shared-modules/jwt/jwt-utils.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
// import { ResponseInterceptor } from './shared/interceptors/response.formatter.interceptor';
import { EmailModule } from './shared/shared-modules/email/email.module';
import { ZodExceptionFilter } from './shared/exception/zod.exception.filter';
import { PrismaExceptionFilter } from './shared/exception/prisma.exception.filter';
import { GlobalExceptionFilter } from './shared/exception/global.exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.formatter.interceptor';
import { HttpExceptionFilter } from './shared/exception/http.exception.filter';
import { RequestStartTimeMiddleware } from './global/middleware/startTimeStampMiddleware';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { OtpModule } from './shared/shared-modules/otp/otp.module';
import { EmailVerificationModule } from './shared/shared-modules/email-verification/email-verification.module';
import { AuthModule } from './api/user-module/auth/auth.module';
import { UserModule } from './api/user-module/user/user.module';
import { LeadingRoleModule } from './api/role-access/leading-role/leading-role.module';
import { ManagingRoleModule } from './api/role-access/managing-role/managing-role.module';
import { ParticipatingRoleModule } from './api/role-access/participating-role/participating-role.module';
import { FileModule } from './shared/shared-modules/file/file.module';

@Module({
  imports: [
    EnvConfigModule,
    PrismaModule,
    PasswordManagerModule,
    JwtUtilsModule,
    EmailModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    OtpModule,
    EmailVerificationModule,
    AuthModule,
    UserModule,
    LeadingRoleModule,
    ManagingRoleModule,
    ParticipatingRoleModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ZodExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter, // Register the Prisma filter
    },
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestStartTimeMiddleware).forRoutes('*');
  }
}
