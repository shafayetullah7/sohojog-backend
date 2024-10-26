import { Module } from '@nestjs/common';
import { LeaderTasksService } from './leader-tasks.service';
import { LeaderTasksController } from './leader-tasks.controller';

@Module({
  controllers: [LeaderTasksController],
  providers: [LeaderTasksService],
})
export class LeaderTasksModule {}
