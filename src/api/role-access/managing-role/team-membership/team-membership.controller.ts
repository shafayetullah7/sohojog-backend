import { Controller } from '@nestjs/common';
import { TeamMembershipService } from './team-membership.service';

@Controller('team-membership')
export class TeamMembershipController {
  constructor(private readonly teamMembershipService: TeamMembershipService) {}
}
