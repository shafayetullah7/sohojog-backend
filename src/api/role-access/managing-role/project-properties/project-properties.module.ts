import { Module } from '@nestjs/common';
import { ProjectPropertiesService } from './project-properties.service';
import { ProjectPropertiesController } from './project-properties.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseBuilderModule } from 'src/shared/shared-modules/response-builder/response.builder.module';
import { UserModule } from 'src/api/user-module/user/user.module';

@Module({
  controllers: [ProjectPropertiesController],
  providers: [ProjectPropertiesService],
  imports: [PrismaModule, ResponseBuilderModule, UserModule],
})
export class ProjectPropertiesModule {}
