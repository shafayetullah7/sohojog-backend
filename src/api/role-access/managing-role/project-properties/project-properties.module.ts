import { Module } from '@nestjs/common';
import { ProjectPropertiesService } from './project-properties.service';
import { ProjectPropertiesController } from './project-properties.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ProjectPropertiesController],
  providers: [ProjectPropertiesService],
  imports: [PrismaModule],
})
export class ProjectPropertiesModule {}
