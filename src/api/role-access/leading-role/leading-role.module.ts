import { Module } from '@nestjs/common';
import { LeaderParticipantsModule } from './leader-participants/leader-participants.module';
import { LeaderTasksModule } from './leader-tasks/leader-tasks.module';

@Module({
  imports: [LeaderParticipantsModule, LeaderTasksModule],
})
export class LeadingRoleModule {}
