import { Module } from '@nestjs/common';
import { ManagerTaskService } from './manager-task.service';
import { ManagerTaskController } from './manager-task.controller';

@Module({
  controllers: [ManagerTaskController],
  providers: [ManagerTaskService],
})
export class ManagerTaskModule {}
