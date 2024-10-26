import { Module } from '@nestjs/common';
import { LeaderTeamService } from './leader-team.service';
import { LeaderTeamController } from './leader-team.controller';

@Module({
  controllers: [LeaderTeamController],
  providers: [LeaderTeamService],
})
export class LeaderTeamModule {}
