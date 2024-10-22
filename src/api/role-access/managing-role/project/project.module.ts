import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { UserModule } from 'src/api/user-module/user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseBuilderModule } from 'src/shared/shared-modules/response-builder/response.builder.module';

@Module({
  imports: [ResponseBuilderModule, PrismaModule, UserModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
