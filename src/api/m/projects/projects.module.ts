import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ResponseBuilderModule } from 'src/shared/modules/response-builder/response.builder.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from '../../user-module/user/user.module';

@Module({
  imports: [ResponseBuilderModule, PrismaModule, UserModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
