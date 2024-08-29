import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvConfigModule } from './env-config/env.config.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user-module/user/user.module';
import { AuthModule } from './modules/user-module/auth/auth.module';
import { PasswordManagerModule } from './modules/common/password-manager/password-manager.module';
import { JwtUtilsModule } from './modules/common/jwt/jwt-utils.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
// import { ResponseInterceptor } from './shared/interceptors/response.formatter.interceptor';
// import { ZodValidationPipe } from './shared/custom-pipes/zod.validation.pipe';
import { EmailModule } from './modules/common/email/email.module';
import { ZodExceptionFilter } from './shared/exception/zod.exception.filter';
import { PrismaExceptionFilter } from './shared/exception/prisma.exception.filter';
import { GlobalExceptionFilter } from './shared/exception/global.exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.formatter.interceptor';
import { HttpExceptionFilter } from './shared/exception/http.exception.filter';
import { RequestStartTimeMiddleware } from './global/middleware/startTimeStampMiddleware';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
// import { ZodValidationPipe } from './shared/validation/zod.validation.pipe';
import { OtpModule } from './modules/common/otp/otp.module';

@Module({
  imports: [
    EnvConfigModule,
    PrismaModule,
    UserModule,
    AuthModule,
    PasswordManagerModule,
    JwtUtilsModule,
    EmailModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    OtpModule,
  ],
  controllers: [AppController],
  providers: [
    // {
    //   provide: APP_PIPE,
    //   useClass: ZodValidationPipe,
    // },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
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
