import { Module } from '@nestjs/common';
import { ParticipantProjectService } from './participant-project.service';
import { ParticipantProjectController } from './participant-project.controller';

@Module({
  controllers: [ParticipantProjectController],
  providers: [ParticipantProjectService],
})
export class ParticipantProjectModule {}
