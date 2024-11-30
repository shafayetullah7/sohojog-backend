import { Controller } from '@nestjs/common';
import { ProjectPropertiesService } from './project-properties.service';

@Controller('project-properties')
export class ProjectPropertiesController {
  constructor(private readonly projectPropertiesService: ProjectPropertiesService) {}
}
