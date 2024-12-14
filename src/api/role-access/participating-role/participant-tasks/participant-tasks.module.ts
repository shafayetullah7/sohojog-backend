import { Module } from '@nestjs/common';
import { ParticipantTasksService } from './participant-tasks.service';
import { ParticipantTasksController } from './participant-tasks.controller';

@Module({
  controllers: [ParticipantTasksController],
  providers: [ParticipantTasksService],
})
export class ParticipantTasksModule {}
