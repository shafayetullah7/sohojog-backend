import { Controller } from '@nestjs/common';
import { ParticipantTasksService } from './participant-tasks.service';

@Controller('participant-tasks')
export class ParticipantTasksController {
  constructor(private readonly participantTasksService: ParticipantTasksService) {}
}
