import { Controller } from '@nestjs/common';
import { LeaderTeamService } from './leader-team.service';

@Controller('leader-team')
export class LeaderTeamController {
  constructor(private readonly leaderTeamService: LeaderTeamService) {}
}
