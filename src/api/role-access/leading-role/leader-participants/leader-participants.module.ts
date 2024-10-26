import { Module } from '@nestjs/common';
import { LeaderParticipantsService } from './leader-participants.service';
import { LeaderParticipantsController } from './leader-participants.controller';

@Module({
  controllers: [LeaderParticipantsController],
  providers: [LeaderParticipantsService],
})
export class LeaderParticipantsModule {}
