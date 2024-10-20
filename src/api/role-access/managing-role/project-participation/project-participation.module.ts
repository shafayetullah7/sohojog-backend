import { Module } from '@nestjs/common';
import { ProjectParticipationService } from './project-participation.service';
import { ProjectParticipationController } from './project-participation.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseBuilderModule } from 'src/shared/modules/response-builder/response.builder.module';
import { UserModule } from 'src/api/user-module/user/user.module';

@Module({
  imports: [PrismaModule,ResponseBuilderModule,UserModule],
  controllers: [ProjectParticipationController],
  providers: [ProjectParticipationService],
})
export class ProjectParticipationModule {}
