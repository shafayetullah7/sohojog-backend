import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtUtilsModule } from 'src/modules/common/jwt/jwt-utils.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { ResponseBuilderModule } from 'src/modules/common/response-builder/response.builder.module';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtAuthGaurd],
  imports: [JwtUtilsModule, ResponseBuilderModule],
  exports: [UserService],
})
export class UserModule {}
