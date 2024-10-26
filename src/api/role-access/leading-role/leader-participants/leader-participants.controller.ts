import { Controller } from '@nestjs/common';
import { LeaderParticipantsService } from './leader-participants.service';

@Controller('leader-participants')
export class LeaderParticipantsController {
  constructor(private readonly leaderParticipantsService: LeaderParticipantsService) {}
}
