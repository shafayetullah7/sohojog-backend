import { Module } from '@nestjs/common';
import { ProjectModule } from './project/project.module';
import { InvitationModule } from './invitation/invitation.module';
import { TeamModule } from './team/team.module';
import { TeamMembershipModule } from './team-membership/team-membership.module';

@Module({
  imports: [ProjectModule, InvitationModule, TeamModule, TeamMembershipModule],
})
export class ManagingRoleModule {}
