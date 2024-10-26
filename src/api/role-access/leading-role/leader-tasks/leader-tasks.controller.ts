import { Controller } from '@nestjs/common';
import { LeaderTasksService } from './leader-tasks.service';

@Controller('leader-tasks')
export class LeaderTasksController {
  constructor(private readonly leaderTasksService: LeaderTasksService) {}
}
