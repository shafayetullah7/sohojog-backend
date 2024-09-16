import { Module } from '@nestjs/common';
import { ResponseBuilderModule } from 'src/shared/modules/response-builder/response.builder.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from '../../user-module/user/user.module';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';

@Module({
  imports: [ResponseBuilderModule, PrismaModule, UserModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectsModule {}
