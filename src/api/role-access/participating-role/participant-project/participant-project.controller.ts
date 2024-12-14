import { Controller } from '@nestjs/common';
import { ParticipantProjectService } from './participant-project.service';

@Controller('participant-project')
export class ParticipantProjectController {
  constructor(private readonly participantProjectService: ParticipantProjectService) {}
}
