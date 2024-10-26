import { Module } from '@nestjs/common';
import { LeaderProjectModule } from './leader-project/leader-project.module';
import { LeaderTeamModule } from './leader-team/leader-team.module';
import { LeaderParticipantsModule } from './leader-participants/leader-participants.module';
import { LeaderTasksModule } from './leader-tasks/leader-tasks.module';

@Module({
  imports: [LeaderProjectModule, LeaderTeamModule, LeaderParticipantsModule, LeaderTasksModule]
})
export class LeadingRoleModule {}
