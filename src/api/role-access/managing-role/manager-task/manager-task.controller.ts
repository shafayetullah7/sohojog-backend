import { Controller } from '@nestjs/common';
import { ManagerTaskService } from './manager-task.service';

@Controller('manager-task')
export class ManagerTaskController {
  constructor(private readonly managerTaskService: ManagerTaskService) {}
}
