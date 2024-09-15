import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { UserModule } from '../user/user.module';
import { ResponseBuilderModule } from 'src/modules/common/response-builder/response.builder.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [UserModule, ResponseBuilderModule, PrismaModule],
  providers: [ProjectService],
  controllers: [ProjectController],
})
export class ProjectModule {}
