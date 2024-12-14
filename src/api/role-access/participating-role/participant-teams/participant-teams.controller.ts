import { Controller } from '@nestjs/common';
import { ParticipantTeamsService } from './participant-teams.service';

@Controller('participant-teams')
export class ParticipantTeamsController {
  constructor(private readonly participantTeamsService: ParticipantTeamsService) {}
}
