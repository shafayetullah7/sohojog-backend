import { Module } from '@nestjs/common';
import { InvitationModule } from './invitation/invitation.module';
import { ParticipantProjectModule } from './participant-project/participant-project.module';
import { ParticipantTeamsModule } from './participant-teams/participant-teams.module';
import { ParticipantTasksModule } from './participant-tasks/participant-tasks.module';

@Module({
  imports: [InvitationModule, ParticipantProjectModule, ParticipantTeamsModule, ParticipantTasksModule]
})
export class ParticipatingRoleModule {}
