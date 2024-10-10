import { Module } from '@nestjs/common';
import { ProjectParticipationService } from './project-participation.service';
import { ProjectParticipationController } from './project-participation.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectParticipationController],
  providers: [ProjectParticipationService],
})
export class ProjectParticipationModule {}
