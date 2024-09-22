import { Module } from '@nestjs/common';
import { ProjectModule } from './project/project.module';
import { InvitationModule } from './invitation/invitation.module';
import { TeamModule } from './team/team.module';

@Module({
  imports: [ProjectModule, InvitationModule, TeamModule]
})
export class ManagingRoleModule {}
