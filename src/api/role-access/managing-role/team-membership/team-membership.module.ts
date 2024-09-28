import { Module } from '@nestjs/common';
import { TeamMembershipService } from './team-membership.service';
import { TeamMembershipController } from './team-membership.controller';

@Module({
  controllers: [TeamMembershipController],
  providers: [TeamMembershipService],
})
export class TeamMembershipModule {}
