import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtUtilsModule } from 'src/shared/modules/jwt/jwt-utils.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { ResponseBuilderModule } from 'src/shared/modules/response-builder/response.builder.module';
import { EnvConfigModule } from 'src/env-config/env.config.module';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtAuthGaurd],
  imports: [JwtUtilsModule, ResponseBuilderModule,EnvConfigModule],
  exports: [UserService],
})
export class UserModule {}
