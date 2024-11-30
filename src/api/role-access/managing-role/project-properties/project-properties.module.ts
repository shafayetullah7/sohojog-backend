import { Module } from '@nestjs/common';
import { ProjectPropertiesService } from './project-properties.service';
import { ProjectPropertiesController } from './project-properties.controller';

@Module({
  controllers: [ProjectPropertiesController],
  providers: [ProjectPropertiesService],
})
export class ProjectPropertiesModule {}
