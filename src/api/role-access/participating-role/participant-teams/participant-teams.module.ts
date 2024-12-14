import { Module } from '@nestjs/common';
import { ParticipantTeamsService } from './participant-teams.service';
import { ParticipantTeamsController } from './participant-teams.controller';

@Module({
  controllers: [ParticipantTeamsController],
  providers: [ParticipantTeamsService],
})
export class ParticipantTeamsModule {}
