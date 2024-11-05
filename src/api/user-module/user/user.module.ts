import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtUtilsModule } from 'src/shared/shared-modules/jwt/jwt-utils.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { ResponseBuilderModule } from 'src/shared/shared-modules/response-builder/response.builder.module';
import { EnvConfigModule } from 'src/env-config/env.config.module';
import { FileModule } from 'src/shared/shared-modules/file/file.module';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtAuthGaurd],
  imports: [JwtUtilsModule, ResponseBuilderModule, EnvConfigModule, FileModule],
  exports: [UserService],
})
export class UserModule {}
